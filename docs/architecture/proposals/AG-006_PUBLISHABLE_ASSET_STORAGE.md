# AG-006 — Almacenamiento de renders publicables y URL estable

- Estado: Aprobada — Opción A
- Fecha: 2026-08-08
- Gate: cerrado

## Decisión

Se aprueba **Opción A — dos niveles de almacenamiento en Supabase**:

```text
PRIVADO
content-publisher
screenshots / imágenes fuente / recursos

PÚBLICO
content-publisher-published
solo renders finales aprobados
```

## Motivo

Buffer necesita recuperar el medio mediante una URL pública, directa, HTTPS y estable hasta el momento real de publicación. Los recursos fuente de Content Publisher, en cambio, deben permanecer privados.

Separar ambos tipos de archivo hace explícita una frontera del producto:

> un recurso de trabajo no es publicable; un render final sí lo es.

## Reglas aprobadas

1. Los assets fuente continúan en el bucket privado `content-publisher`.
2. Solo PNG/PDF finales generados desde un diseño y contenido aprobados pueden entrar en `content-publisher-published`.
3. El bucket público permite lectura anónima del archivo final, pero escritura, sustitución y borrado siguen restringidos mediante políticas de Storage.
4. La ruta de un render será inmutable y tendrá la forma:

```text
{user_id}/{publication_id}/{render_id}.png
{user_id}/{publication_id}/{render_id}.pdf
```

5. Cada nueva exportación final crea un nuevo `render_id`; no se sobrescribe un render utilizado por un trabajo de publicación.
6. `renders` conserva la trazabilidad del archivo generado y su `render_context`.
7. `publishing_jobs.render_id` identificará exactamente qué render se entregó al proveedor.
8. No habrá borrado automático de renders públicos en V1.
9. Antes de crear un trabajo de publicación se deberá verificar que la URL pública es recuperable sin autenticación y no tiene caducidad.

## Persistencia

La tabla `renders` existente es suficiente para V1. Un render final `ready` utilizará `storage_path` dentro de `content-publisher-published` y conservará en `render_context` al menos:

- arquetipo y versión;
- variante;
- contenido estructurado y versión de esquema;
- identidad visual aplicada;
- formato;
- datos técnicos del exportador.

No se añade una tabla adicional para esta separación.

## Seguridad

El carácter público del bucket afecta a la descarga del archivo final. Las operaciones de escritura continúan restringidas al usuario autenticado y a rutas cuyo primer segmento coincide con su UUID.

Los assets originales no se copian al bucket público; solo el resultado compuesto que está destinado a publicación.

## Alternativas descartadas

### B — Signed URLs sobre bucket privado

Se descarta porque una URL con caducidad puede dejar de funcionar antes de que Buffer ejecute una publicación programada.

### C — Proxy público de Next.js

Se descarta porque añade autorización propia, streaming y dependencia de runtime sin necesidad en V1.

### D — Segundo proveedor de media

Se descarta porque Supabase Storage ya resuelve el requisito y otro proveedor añadiría configuración y mantenimiento sin una ventaja actual.

## Consecuencias

- Se crea `content-publisher-published` mediante migración.
- Se habilita una operación de promoción/persistencia del render final.
- El render final obtiene URL pública estable mediante Supabase.
- El tramo `PREVIEW → RENDER READY` puede implementarse.
- El siguiente gate de arquitectura solo aparecerá si la integración real con Buffer requiere decidir cómo persistir o proteger credenciales dinámicas.

## Fuentes revisadas

- Buffer API — Hosting Media: https://developers.buffer.com/guides/hosting-media.html
- Supabase Storage — Buckets / access model: https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase Storage — Serving assets / public URL: https://supabase.com/docs/guides/storage/serving/downloads
- Supabase Storage — Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase JavaScript — getPublicUrl: https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl

## Registro definitivo

La decisión se registra como `ADR-009_PUBLIC_PUBLISHABLE_RENDER_STORAGE.md`.
