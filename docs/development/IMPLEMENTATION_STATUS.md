# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher ya dispone de un recorrido V1 ejecutable en producción:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER DRAFT
```

La integración real con Supabase, Vercel, Buffer y un canal personal de LinkedIn ha sido validada.

Todavía **no se ha realizado una publicación pública real en LinkedIn** durante la validación. La prueba de extremo a extremo se ha detenido deliberadamente en un draft de Buffer.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui para la aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — renderizado React/DOM con `html-to-image` y PDF con `pdf-lib` detrás de adaptador propio.
- AG-004 — modelo relacional PostgreSQL + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público separado para renders finales.
- AG-007 — API key personal de Buffer exclusivamente server-side.

Decisiones registradas hasta ADR-010.

**No existe un gate de arquitectura abierto en este momento.**

## Infraestructura operativa

### Supabase

Proyecto dedicado:

- nombre: `Content Publisher`;
- región: `eu-west-1`;
- estado: activo y sano.

Migraciones principales:

1. `initial_schema` — tablas, relaciones, restricciones, triggers, RLS y Storage privado;
2. `add_fk_indexes` — índices de cobertura para claves foráneas;
3. `public_publishable_renders` — bucket público separado para renders finales.

Buckets:

- `content-publisher`: privado, usado para recursos fuente;
- `content-publisher-published`: público para lectura de renders finales que deben consumir servicios externos como Buffer.

El modelo mantiene RLS por `user_id` y rutas de Storage con prefijo UUID del usuario.

### Vercel

Existe un proyecto de producción conectado continuamente con:

```text
rubensv74/content_publisher → Vercel → content-publisher-nu.vercel.app
```

Variables de producción configuradas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
BUFFER_API_KEY
```

`BUFFER_API_KEY` se mantiene como secreto server-side y no utiliza el prefijo `NEXT_PUBLIC_`.

GitHub → Vercel está operativo y cada cambio de `main` genera un nuevo deployment de Production.

## Autenticación

Existe una única cuenta personal autorizada en Supabase Auth.

Validado:

- login desde producción;
- sesión persistente;
- acceso privado a workspace;
- RLS sobre datos propios;
- cierre de sesión.

No existe signup público.

## Ideas

La bandeja de Ideas permite:

- crear;
- listar;
- editar;
- archivar;
- eliminar;
- distinguir ideas convertidas;
- convertir una Idea en Publication.

Las operaciones se ejecutan mediante Server Actions y respetan sesión y RLS.

## Content Studio

Desde una publicación se puede persistir:

- título de trabajo;
- tema;
- tipo de historia;
- problema o contexto;
- intentos previos;
- decisión o solución;
- aprendizaje;
- idea transferible;
- formato;
- diseño;
- identidad visual;
- caption de LinkedIn.

El botón de guardado dispone ya de feedback visible de progreso y confirmación.

La selección de diseño también ofrece confirmación explícita.

## Renderer visual

El renderer sigue aislado de la UI de aplicación conforme a ADR-004.

### Build Note v1

- familia `editorial`;
- formato `single-image`;
- variante `editorial-light`;
- canvas 1080 × 1350;
- relación 4:5;
- exportación PNG mediante `html-to-image` desde el mismo árbol React del preview.

### Step by Step v1

- familia `carousel`;
- formato `carousel`;
- variante `editorial-light`;
- páginas 1080 × 1350;
- relación 4:5;
- exportación PDF mediante `pdf-lib`.

Los carruseles generan también una miniatura PNG de la primera página porque Buffer exige `thumbnailUrl` para documentos.

## Identidad

`/settings` permite persistir una identidad central en `identity_profiles`.

Los previews aplican:

- nombre visible;
- firma corta;
- dirección visual;
- paleta;
- tipografía.

La identidad se comparte entre arquetipos y no está duplicada dentro de cada diseño.

## Persistencia de renders

Flujo operativo:

```text
Preview React
  ↓
PNG / PDF
  ↓
renders.status = pending
  ↓
content-publisher-published
  ↓
renders.status = ready
  ↓
URL HTTPS pública estable
```

Ruta inmutable:

```text
{user_id}/{publication_id}/{render_id}.png
{user_id}/{publication_id}/{render_id}.pdf
```

`render_context` conserva la instantánea necesaria para trazabilidad.

La demo real generó correctamente un render PNG `ready`, accesible desde Buffer.

## Integración Buffer → LinkedIn

La API key personal de Buffer está configurada en Vercel como:

```text
BUFFER_API_KEY
```

La aplicación ha validado en producción:

- autenticación con Buffer;
- descubrimiento de cuenta;
- descubrimiento de organización;
- descubrimiento de canal LinkedIn;
- perfil LinkedIn disponible;
- lectura del render público;
- creación real de drafts mediante la API GraphQL de Buffer.

El canal detectado durante la prueba corresponde al perfil personal conectado en Buffer.

El adaptador utiliza:

- `shareNow` para publicar ahora;
- `customScheduled` + `dueAt` para programar;
- `addToQueue` + `saveToDraft: true` para guardar draft;
- `schedulingType: automatic`.

Medios:

- imagen: `image.url`;
- documento: `document.url`, `document.thumbnailUrl`, `document.title`.

Fuentes oficiales de referencia:

- https://developers.buffer.com/guides/getting-started.html
- https://developers.buffer.com/examples/create-draft-post.html
- https://developers.buffer.com/examples/create-scheduled-post.html
- https://developers.buffer.com/types/CreatePostInput.html
- https://developers.buffer.com/types/DocumentAssetInput.html
- https://developers.buffer.com/types/DeletePostInput.html

## Primera validación end-to-end

Caso utilizado:

**“De una idea técnica a una publicación sin pasar por Canva”**

Validado:

```text
Idea ✅
Story ✅
Caption ✅
Design ✅
Preview ✅
Render PNG final ✅
Buffer conectado ✅
LinkedIn detectado ✅
Draft real en Buffer ✅
Publicación pública en LinkedIn ⏳
```

La base de datos confirmó que Buffer devolvió identificadores externos con `bufferStatus = draft`.

## Incidencia descubierta durante la demo

El primer botón **Guardar draft en Buffer** sí funcionaba, pero no mostraba progreso ni confirmación visual.

Como consecuencia se pulsó repetidamente y Buffer recibió varios drafts válidos en pocos segundos.

La incidencia produjo información útil para endurecer la UX antes de una publicación real.

Correcciones implementadas:

1. indicador `Guardando draft…`;
2. bloqueo de controles mientras la operación está en curso;
3. confirmación verde al finalizar;
4. el botón queda como `Draft guardado ✓` durante la sesión para impedir una repetición accidental inmediata;
5. Historial detecta cuando existen varios drafts activos;
6. cada draft puede eliminarse de Buffer desde Historial mediante una acción explícita y confirmada;
7. la eliminación usa la mutación oficial `deletePost` de Buffer y marca el `publishing_job` local como `cancelled`.

No se elimina automáticamente ningún draft externo: la eliminación siempre requiere una acción explícita del usuario.

## Publishing Jobs

Antes de llamar a Buffer se crea un `publishing_job` con estado `pending`.

Si Buffer acepta la operación se guardan:

- `render_id` exacto;
- canal y organización utilizados;
- `external_id` devuelto por Buffer;
- `external_url` cuando existe;
- estado devuelto por Buffer;
- modo de publicación;
- fecha programada;
- URLs de render/miniatura usadas.

Nunca se persiste la API key.

Si falla la llamada, el job queda `failed` con mensaje de error.

Los drafts eliminados desde Historial quedan `cancelled`, preservando la trazabilidad sin fingir que nunca existieron.

## Historial editorial

`/history` se deriva de:

- `publications`;
- `renders`;
- `publishing_jobs`.

No existe una tabla duplicada de historial.

La vista muestra:

- publicación;
- tema;
- render;
- diseño;
- acción;
- estado comprensible para usuario;
- fecha;
- programación;
- Buffer ID;
- enlace externo cuando existe;
- errores;
- eliminación explícita de drafts de Buffer.

## Calidad técnica

El workflow `Quality` valida en cada cambio relevante:

- instalación de dependencias;
- ESLint;
- TypeScript;
- build de Next.js.

La última mejora de protección contra drafts duplicados ha superado completamente el workflow de calidad y se encuentra desplegada en Vercel Production.

## Estado operativo actual

No existe ya un bloqueo de infraestructura para V1.

Pendientes inmediatos de validación:

1. abrir `/history` en producción;
2. conservar un solo draft de la demo y eliminar los duplicados mediante la nueva acción;
3. abrir Buffer y comprobar visualmente que el draft conservado contiene caption + PNG correctos;
4. comprobar que Historial refleja los drafts eliminados como `cancelled`;
5. después probar programación o publicación real únicamente mediante acción explícita del usuario.

## Próximo gate de arquitectura

Después de validar el draft y antes de considerar cerrada la automatización de Publishing, habrá que decidir cómo reconciliar estados asíncronos de Buffer con el estado local, por ejemplo:

```text
scheduled → sending → sent
```

Las alternativas previsibles son polling, webhook u otro mecanismo persistente.

Esa decisión abrirá un nuevo gate de arquitectura y no se implementará sin aprobación previa.
