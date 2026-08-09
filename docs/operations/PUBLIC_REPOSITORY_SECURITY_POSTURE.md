# Postura de seguridad — repositorio público

Fecha: 2026-08-09

## Decisión operativa

`rubensv74/content_publisher` se mantiene **público de forma intencionada** para aprovechar el régimen de ejecución de GitHub Actions aplicable a repositorios públicos y evitar consumir la cuota privada del plan personal.

Esta es una decisión operativa de CI, no un cambio de arquitectura de Content Publisher.

## Principio de seguridad

El repositorio puede ser público porque **el código no es el almacén de secretos ni de datos personales de producción**.

La separación obligatoria es:

```text
GitHub público
  código + documentación + migraciones + placeholders

Vercel / proveedores
  secretos de runtime

Supabase
  datos personales/editoriales protegidos por Auth + RLS
```

## Secretos que nunca deben entrar en GitHub

Entre otros:

- `BUFFER_API_KEY`;
- `GITHUB_SOURCE_TOKEN`;
- `OPENAI_API_KEY`;
- contraseñas;
- recovery codes;
- secretos 2FA;
- claves privadas;
- credenciales de Supabase con privilegios de servicio;
- cualquier token temporal o permanente de terceros.

Los valores reales se configuran exclusivamente en los servicios de runtime correspondientes. Los archivos versionados solo documentan nombres de variables y placeholders vacíos.

## Protección local

`.gitignore` excluye actualmente:

```text
.env
.env.local
.env.*.local
*.pem
.vercel
```

`.env.example` puede permanecer público porque debe contener únicamente nombres de variables y valores vacíos/documentales, nunca credenciales reales.

## Datos de Content Publisher

El repositorio público no convierte en públicos los datos almacenados en Supabase.

Las entidades editoriales y operativas utilizan autenticación y RLS por `user_id`. Los assets fuente permanecen en el bucket privado definido por la arquitectura. Solo los renders finales destinados a publicación utilizan el bucket de lectura pública ya aprobado para Buffer/LinkedIn.

## Lectura de repositorios fuente

Aunque el código de Content Publisher sea público, el acceso runtime a otros repositorios privados sigue sujeto a `GITHUB_SOURCE_TOKEN` y a una allowlist de aplicación. El token no se versiona.

Los contenidos de repositorios privados tampoco deben copiarse a este repositorio como fixtures, ejemplos o documentación salvo que hayan sido expresamente desclasificados.

## Revisiones recomendadas

- búsqueda periódica de patrones de secretos antes de releases importantes;
- revisar siempre cambios de `.env.example` y documentación operativa;
- no usar datos reales sensibles en screenshots de documentación pública;
- no registrar payloads completos de proveedores externos;
- mantener los logs de errores sin credenciales ni contenido sensible innecesario.

## Incidente de secreto

Si una credencial real llega a un commit público, eliminar el texto del commit posterior **no es suficiente** porque puede permanecer en el historial y clones.

Procedimiento mínimo:

1. revocar/rotar inmediatamente la credencial;
2. sustituirla en el runtime;
3. verificar que la nueva credencial funciona;
4. evaluar limpieza del historial si el contenido sensible lo justifica;
5. documentar el incidente sin volver a incluir el secreto.

La rotación de la credencial tiene prioridad sobre la reescritura del historial.

## Revisión de esta decisión

Reevaluar el carácter público del repositorio si Content Publisher empieza a contener:

- lógica propietaria que se quiera mantener privada;
- muestras o fixtures con datos no publicables;
- contratos corporativos o integraciones internas;
- información de terceros que no deba divulgarse.

Mientras esas condiciones no existan, el repositorio público es compatible con la arquitectura siempre que se mantenga estrictamente la separación de secretos y datos descrita en este documento.
