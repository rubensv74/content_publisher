# AG-006 — Almacenamiento de renders publicables y URL estable

- Estado: Propuesta
- Fecha: 2026-08-08
- Gate: abierto

## Por qué aparece esta decisión ahora

Content Publisher ya alcanza `IDEA → STORY → FORMAT → DESIGN → PREVIEW` y puede generar PNG y PDF en el navegador.

El siguiente paso es `PUBLISH`. Buffer no recibe el archivo binario directamente: para una imagen, vídeo o documento necesita una URL pública, directa, HTTPS y estable. La documentación de Buffer advierte expresamente que la URL debe seguir disponible hasta el momento real de publicación y recomienda evitar URLs firmadas o con caducidad.

Al mismo tiempo, los screenshots, imágenes fuente y demás recursos de trabajo de Content Publisher no deben hacerse públicos. Actualmente viven en un bucket privado de Supabase protegido mediante RLS.

Por tanto hay que decidir cómo separar **recursos privados de trabajo** y **renders finales que deben ser accesibles por Buffer**.

## Requisitos

La solución debe cumplir simultáneamente:

1. los assets fuente permanecen privados;
2. solo un render final aprobado se hace público;
3. Buffer puede acceder sin autenticación;
4. la URL no caduca mientras una publicación esté programada o pendiente;
5. una nueva versión del diseño no modifica un render que ya fue enviado a Buffer;
6. la subida sigue restringida al usuario autenticado;
7. la solución no introduce infraestructura innecesaria para V1;
8. el historial puede saber exactamente qué render se utilizó para cada publicación.

---

## Opción A — Bucket público separado en Supabase para renders finales

### Esquema

```text
ASSETS FUENTE
Supabase Storage
bucket privado: content-publisher
        │
        ▼
RENDERER
React → PNG / PDF
        │
        ▼
RENDER FINAL APROBADO
Supabase Storage
bucket público: content-publisher-published
        │
        ▼
URL HTTPS estable
        │
        ▼
Buffer
        │
        ▼
LinkedIn
```

### Funcionamiento

El bucket privado actual sigue siendo la única ubicación para screenshots, imágenes originales y recursos de edición.

Cuando una publicación tenga diseño y contenido aprobados, el renderer genera un archivo final. Ese archivo se sube al bucket público `content-publisher-published`.

El bucket será público únicamente para lectura. La creación, sustitución y eliminación de objetos seguirá protegida mediante políticas de Storage para usuarios autenticados y restringida a una carpeta cuyo primer segmento sea el UUID del usuario.

Ruta propuesta:

```text
{user_id}/{publication_id}/{render_id}.png
{user_id}/{publication_id}/{render_id}.pdf
```

Cada render obtiene un nombre nuevo e inmutable. Si cambia el texto, diseño, identidad o contenido, se crea un nuevo `render_id` y un nuevo archivo; nunca se sobrescribe el archivo asociado a un trabajo de publicación existente.

### Persistencia

La tabla `renders` ya dispone de:

- `publication_id`;
- `render_type`;
- `storage_path`;
- `status`;
- `render_context`;
- dimensiones / páginas;
- fecha de creación.

En V1 se aplicaría una convención simple:

- `assets.storage_path` pertenece al bucket privado `content-publisher`;
- un `renders.storage_path` con estado `ready` pertenece al bucket público `content-publisher-published`.

No es necesario añadir otra tabla solo para esta separación.

`render_context` debe conservar la instantánea suficiente para saber qué combinación produjo el archivo:

- arquetipo y versión;
- variante;
- identidad visual aplicada;
- versión de contenido;
- datos técnicos del exportador.

`publishing_jobs` conservará la referencia al `render_id` que se entregó a Buffer.

### Seguridad

Que un bucket sea público en Supabase significa que cualquiera que posea la URL puede descargar el archivo. Esto es adecuado únicamente para el **resultado final destinado a una red social pública**.

La visibilidad pública no elimina las políticas necesarias para subir, actualizar o eliminar archivos. Esas operaciones pueden seguir limitadas mediante RLS.

Los assets fuente nunca se copiarán automáticamente al bucket público: solo el archivo final ya compuesto.

### Retención V1

No habrá borrado automático de renders públicos en V1.

Mientras una publicación esté programada, la URL debe permanecer disponible. Después de publicar, mantener el archivo evita romper reintentos, historial o reutilización y el volumen esperado de una aplicación personal es pequeño. Una política de limpieza podrá añadirse posteriormente si existe una necesidad real.

### Validación antes de publicar

Antes de crear un `publishing_job`, el adaptador de Buffer deberá comprobar que la URL final:

- responde sin autenticación;
- apunta directamente al archivo;
- utiliza HTTPS;
- no es una URL firmada con caducidad.

### Ventajas

- reutiliza el proveedor de almacenamiento ya aprobado;
- no introduce un segundo sistema de ficheros;
- URL pública estable compatible con Buffer;
- separación muy clara entre fuentes privadas y renders publicables;
- CDN de Supabase para servir los archivos;
- RLS sigue protegiendo escritura y borrado;
- encaja con las tablas `renders` y `publishing_jobs` ya existentes.

### Inconveniente principal

El archivo final es realmente público. No debe utilizarse para borradores sensibles ni assets originales.

**Recomendación: esta es la opción propuesta para V1.**

---

## Opción B — Mantener renders en bucket privado y usar Signed URLs

Supabase permite descargar objetos privados mediante URLs firmadas con una duración determinada.

Esto evita crear un bucket público, pero choca directamente con el contrato operativo de Buffer. Una publicación programada puede ejecutarse horas o días después y la URL podría haber caducado cuando Buffer intente recuperar el archivo.

Sería necesario calcular vencimientos muy largos, renovar URLs y sincronizarlas con trabajos ya enviados. Añade fragilidad sin ofrecer una ventaja real para contenido que finalmente será público.

**No recomendada.**

---

## Opción C — Endpoint público de Content Publisher que haga proxy del Storage privado

Ejemplo conceptual:

```text
https://content-publisher.../media/{opaque_token}
        │
        ▼
Next.js
        │
        ▼
Supabase Storage privado
```

El endpoint podría validar un token opaco y transmitir el archivo privado.

Permite mantener el bucket privado, pero en la práctica el endpoint se convierte en una capa pública de publicación. Introduce dependencia del runtime de Next.js, autorización propia, streaming de archivos, disponibilidad adicional y más puntos de fallo justo cuando Buffer necesita recuperar el medio.

Puede ser útil en un producto con reglas avanzadas de distribución, pero no aporta valor suficiente en V1.

**No recomendada para V1.**

---

## Opción D — Segundo proveedor de media pública

Cloudinary, Cloudflare R2 o Vercel Blob podrían alojar los renders finales.

Es técnicamente válido y Buffer cita hosts públicos como solución. Sin embargo Content Publisher ya utiliza Supabase Storage y no necesita todavía transformación avanzada de medios, un dominio CDN específico ni una nueva dependencia operativa.

Introducir otro proveedor aumentaría configuración, credenciales, mantenimiento y posibles costes sin resolver un problema que Supabase Storage ya cubre.

**No recomendada mientras no exista una necesidad concreta.**

---

## Recomendación

**Opción A — dos niveles de almacenamiento en Supabase:**

```text
PRIVADO
content-publisher
screenshots / imágenes fuente / recursos

PÚBLICO
content-publisher-published
solo renders finales aprobados
```

Esta separación hace explícita una frontera importante del producto:

> un recurso de trabajo no es publicable; un render final sí lo es.

Además mantiene la arquitectura simple y proporciona a Buffer exactamente el tipo de URL que exige.

## Consecuencias si se aprueba

1. crear el bucket público `content-publisher-published` mediante migración;
2. limitar uploads/updates/deletes del bucket al usuario autenticado y a su prefijo UUID;
3. añadir la operación de promoción/subida del render final;
4. crear una fila `renders` con snapshot técnico y visual;
5. obtener la URL pública estable mediante Supabase;
6. validar públicamente la URL antes de entregar el medio a Buffer;
7. vincular `publishing_jobs.render_id` al render exacto enviado;
8. mantener los assets fuente en el bucket privado actual.

## Fuentes revisadas

- Buffer API — Hosting Media: https://developers.buffer.com/guides/hosting-media.html
- Supabase Storage — Buckets / access model: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage — Serving assets / public URL: https://supabase.com/docs/guides/storage/serving/downloads
- Supabase Storage — Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Storage — Ownership: https://supabase.com/docs/guides/storage/security/ownership
- Supabase JavaScript — getPublicUrl: https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl

## Decisión pendiente

Si se aprueba la opción A, la decisión se registrará como el siguiente ADR y comenzará la implementación del tramo `PREVIEW → RENDER READY → PUBLISH`.
