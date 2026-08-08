# ADR-009 — Almacenamiento público de renders publicables

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher genera PNG y PDF finales desde el mismo renderer React utilizado en preview. El proveedor de publicación de V1, Buffer, necesita una URL pública, directa, HTTPS y estable para recuperar esos archivos en el momento real de publicación.

Los screenshots, imágenes fuente y demás recursos de trabajo no deben exponerse públicamente.

## Decisión

Se utilizarán dos buckets de Supabase Storage con responsabilidades distintas:

```text
content-publisher
└── privado
    └── assets fuente y recursos de trabajo

content-publisher-published
└── público para lectura
    └── únicamente renders finales PNG/PDF
```

La ruta de cada render final será inmutable:

```text
{user_id}/{publication_id}/{render_id}.png
{user_id}/{publication_id}/{render_id}.pdf
```

La lectura pública del segundo bucket permite entregar a Buffer una URL estable sin usar URLs firmadas. Las operaciones de subida, actualización y borrado permanecen restringidas mediante políticas de Storage al usuario autenticado y a su propio prefijo UUID.

## Trazabilidad

Cada exportación final crea una nueva fila en `renders` y un archivo nuevo. No se sobrescribirá un render que pueda estar asociado a un trabajo de publicación.

`render_context` conservará la instantánea necesaria para explicar qué produjo el archivo, incluyendo:

- contenido estructurado y versión de esquema;
- formato;
- arquetipo, versión y variante;
- identidad aplicada;
- versión/estrategia del exportador.

`publishing_jobs.render_id` será la referencia al archivo exacto entregado al proveedor.

## Retención

En V1 no habrá borrado automático de renders públicos. El volumen esperado es pequeño y conservarlos evita romper publicaciones programadas, reintentos e historial.

## Alternativas descartadas

### URLs firmadas sobre Storage privado

No garantizan disponibilidad durante toda la vida de una publicación programada.

### Proxy público mediante Next.js

Añade runtime, streaming y autorización propia sin aportar valor suficiente en V1.

### Segundo proveedor de media

Añadiría otra dependencia operativa cuando Supabase Storage ya cubre el requisito.

## Consecuencias

- Los recursos fuente y los recursos publicables quedan físicamente separados.
- Los renders finales pasan a ser realmente públicos una vez promovidos.
- El flujo puede avanzar desde `PREVIEW` a `RENDER READY`.
- La integración con Buffer no necesitará mecanismos de renovación de URL.
- Cualquier futura necesidad de revocación, CDN específica o política de retención avanzada podrá abrir una nueva decisión sin cambiar el contrato de `renders`.

## Fuentes

- Buffer — Hosting Media: https://developers.buffer.com/guides/hosting-media.html
- Supabase Storage — Buckets: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage — Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase JavaScript — getPublicUrl: https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl
