# Configuración operativa — Buffer + Vercel

Fecha: 2026-08-08

## Objetivo

Dejar Content Publisher ejecutándose en un proyecto Vercel estable y conectar la V1 con la cuenta personal de Buffer sin exponer secretos.

Este documento es operativo. No modifica la arquitectura aprobada en ADR-010.

## 1. Importar el repositorio en Vercel

Desde el dashboard de Vercel:

1. elegir **Add New → Project**;
2. importar el repositorio privado `rubensv74/content_publisher` desde GitHub;
3. confirmar que Vercel detecta **Next.js**;
4. mantener la raíz del proyecto en `/`;
5. no definir un Output Directory personalizado;
6. mantener los comandos estándar del repositorio (`npm install`, `npm run build`).

Una vez vinculado, cada cambio de `main` podrá producir un deployment siguiendo la integración Git de Vercel.

## 2. Variables de Supabase

En **Project Settings → Environment Variables** añadir:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Estas variables son necesarias para autenticación, PostgreSQL vía Supabase y Storage.

La `publishable key` está diseñada para estar disponible en cliente. La protección real de los datos se mantiene mediante RLS y políticas de Storage.

Aplicarlas, como mínimo, a los entornos donde se vaya a probar la aplicación (`Preview` y/o `Production`).

## 3. Crear la API key de Buffer

En Buffer:

1. iniciar sesión con la cuenta que contiene el canal LinkedIn;
2. abrir **Settings → API**;
3. crear una API key personal;
4. copiarla una sola vez hacia el gestor de variables de entorno.

No guardar la clave en notas del repositorio, Issues, Markdown, PostgreSQL ni código fuente.

Documentación oficial:

https://developers.buffer.com/guides/authentication.html

## 4. Guardar el secreto en Vercel

En **Project Settings → Environment Variables** crear:

```text
BUFFER_API_KEY
```

Reglas:

- valor: API key personal de Buffer;
- nunca usar `NEXT_PUBLIC_BUFFER_API_KEY`;
- tratarla como secreto;
- aplicarla únicamente a los entornos que necesiten publicar;
- después de crear o modificar la variable, generar un nuevo deployment para que el runtime la reciba.

## 5. Validación de solo lectura

Antes de crear ningún post real:

1. abrir Content Publisher;
2. iniciar sesión;
3. entrar en **Settings**;
4. localizar **Buffer → LinkedIn**;
5. comprobar que el estado es **Conectado**;
6. verificar que aparece la cuenta de Buffer;
7. verificar que aparece al menos un canal LinkedIn disponible y no bloqueado/desconectado.

Esta validación solo consulta cuenta, organizaciones y canales; no crea publicaciones.

## 6. Validación del render final

En Content Studio:

1. crear o abrir una publicación;
2. completar Story y Caption;
3. seleccionar el diseño;
4. revisar Preview;
5. pulsar **Crear render final**.

Para imagen única se guarda un PNG público final.

Para carrusel se guardan:

- PDF final;
- PNG de portada como miniatura requerida por `DocumentAssetInput` de Buffer.

Ambos utilizan rutas inmutables en `content-publisher-published`.

## 7. Prueba de integración sin publicación pública

Para validar el contrato completo con mínimo riesgo, utilizar primero:

**Guardar draft en Buffer**

El resultado esperado es:

1. Content Publisher crea `publishing_jobs.status = pending`;
2. Buffer recibe `createPost` con `saveToDraft: true`;
3. se guarda el ID devuelto por Buffer;
4. el trabajo queda registrado en `/history`;
5. no se publica contenido en LinkedIn.

No realizar **Publicar ahora** como prueba técnica automática. Una publicación pública debe ser una acción consciente del usuario.

## 8. Programación

Para programar:

1. seleccionar el render;
2. seleccionar el canal LinkedIn;
3. elegir fecha y hora local en Content Studio;
4. pulsar **Programar**.

El navegador convierte la fecha a ISO 8601 y el servidor utiliza:

```text
mode = customScheduled
schedulingType = automatic
dueAt = <fecha ISO>
```

## 9. Publicación inmediata

**Publicar ahora** utiliza:

```text
mode = shareNow
schedulingType = automatic
```

Esta acción puede producir una publicación pública real en LinkedIn. Debe utilizarse únicamente cuando contenido, caption, render y canal hayan sido revisados.

## 10. Diagnóstico

### Settings muestra “Sin configurar”

`BUFFER_API_KEY` no está disponible en ese deployment. Revisar la variable y volver a desplegar.

### Settings muestra “Error de conexión”

La clave puede ser incorrecta/revocada o Buffer puede estar devolviendo un error. Rotar la API key si procede.

### Buffer conectado pero no hay LinkedIn

Conectar el perfil o página LinkedIn desde Buffer y volver a cargar Settings.

### Un PDF aparece como no apto

Es probablemente un render generado antes de incorporar la miniatura obligatoria. Volver a pulsar **Crear render final** para generar PDF + thumbnail.

### El recurso público no está disponible

Content Publisher valida la URL antes de enviar el trabajo. Revisar el estado del render, el bucket `content-publisher-published` y las políticas de Storage.

## Referencias

- Buffer Authentication: https://developers.buffer.com/guides/authentication.html
- Buffer Get Organizations: https://developers.buffer.com/examples/get-organizations.html
- Buffer Get Channels: https://developers.buffer.com/examples/get-channels.html
- Buffer Posts & Scheduling: https://developers.buffer.com/guides/posts-and-scheduling.html
- Buffer DocumentAssetInput: https://developers.buffer.com/types/DocumentAssetInput.html
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel project management: https://vercel.com/docs/projects/managing-projects
