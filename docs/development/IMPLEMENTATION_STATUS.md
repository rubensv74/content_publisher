# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher ya dispone de un recorrido V1 ejecutable en producción:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER DRAFT
```

La integración real con Supabase, Vercel, Buffer y un canal personal de LinkedIn está validada. La prueba pública se ha detenido deliberadamente antes de publicar en LinkedIn.

Después de validar el primer draft se ha seguido avanzando de forma autónoma hasta el siguiente gate de arquitectura. El producto incorpora ahora biblioteca privada de recursos visuales, asociación de screenshots a publicaciones, protección frente a renders obsoletos y una biblioteca de renderer sensiblemente más amplia.

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

### Gate abierto

**AG-008 — Datos especializados de arquetipos visuales.**

Los cinco arquetipos V1 todavía pendientes necesitan parámetros que no son historia narrativa ni archivos: métricas, anotaciones, configuración before/after, snippets de código o series de datos.

La propuesta está en:

`docs/architecture/proposals/AG-008_SPECIALIZED_ARCHETYPE_INPUT_MODEL.md`

La implementación de esos cinco arquetipos queda detenida hasta resolver el gate.

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

Producción conectada continuamente:

```text
rubensv74/content_publisher → Vercel → content-publisher-nu.vercel.app
```

Variables de producción:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
BUFFER_API_KEY
```

`BUFFER_API_KEY` permanece exclusivamente server-side.

GitHub → Vercel está operativo y los cambios en `main` producen deployments de Production.

## Autenticación

Existe una única cuenta personal autorizada en Supabase Auth.

Validado:

- login desde producción;
- sesión persistente;
- acceso privado a workspace;
- RLS sobre datos propios;
- cierre de sesión;
- ausencia de signup público.

## Ideas

La bandeja de Ideas permite:

- crear;
- listar;
- editar;
- archivar;
- eliminar;
- distinguir ideas convertidas;
- convertir una Idea en Publication.

Las operaciones respetan sesión y RLS.

## Content Studio

Desde una publicación se puede persistir:

- título de trabajo;
- tema;
- tipo de historia;
- problema o contexto;
- intentos previos;
- decisión o solución;
- resultado;
- aprendizaje;
- idea transferible;
- cierre o CTA;
- formato;
- diseño;
- identidad visual;
- caption de LinkedIn.

El guardado de contenido y la selección de diseño muestran progreso y confirmación explícitos.

Studio descubre dinámicamente los arquetipos compatibles con el formato y tipo de historia. Es posible previsualizar un diseño diferente antes de seleccionarlo definitivamente.

## Biblioteca de recursos visuales

`/assets` ya no es un placeholder.

La aplicación permite:

- subir PNG, JPEG y WebP;
- límite de 10 MB por imagen;
- almacenar originales en `content-publisher`, que sigue siendo privado;
- registrar MIME, dimensiones, tamaño y nombre original en `assets`;
- visualizar originales mediante signed URLs temporales;
- eliminar un recurso y su objeto de Storage.

Los assets fuente nunca necesitan convertirse en públicos para poder formar parte de una publicación: el renderer los incorpora al PNG/PDF final y únicamente ese resultado se guarda en el bucket público.

## Asociación de recursos a publicaciones

Existe una primera implementación de `publication_assets` dentro de Content Studio.

Rol operativo actual:

```text
hero
```

Studio permite:

- asignar una imagen/screenshot como recurso principal;
- reemplazarla;
- retirarla de la publicación;
- reutilizar recursos ya guardados sin volver a cargarlos.

Cambiar un recurso toca `publications.updated_at`, de forma que cualquier render generado antes del cambio se considera anterior y deja de estar habilitado para publicar.

## Renderer visual

El renderer continúa aislado de la UI de aplicación conforme a ADR-004.

### Diseños operativos registrados

El registro runtime contiene actualmente **8 arquetipos operativos**:

1. Build Note — editorial adicional;
2. Bold Statement — ED-01;
3. Hero Screenshot — PR-01;
4. Split Screenshot — PR-02;
5. Architecture Flow — TE-01;
6. Process Steps — TE-03;
7. Step by Step / Tutorial Sequence — CA-01;
8. Case Study — CA-02.

Por tanto, la cobertura del catálogo objetivo es:

```text
V1 plan: 7 / 12 arquetipos implementados
+ Build Note como arquetipo editorial adicional operativo
```

### Build Note

- single-image;
- 1080 × 1350;
- composición editorial para decisiones y aprendizajes.

### Bold Statement — ED-01

- single-image;
- 1080 × 1350;
- prioriza insight, aprendizaje o resultado como mensaje principal.

### Hero Screenshot — PR-01

- single-image;
- 1080 × 1350;
- requiere un asset con rol `hero`;
- screenshot como evidencia principal del producto.

### Split Screenshot — PR-02

- single-image;
- 1080 × 1350;
- requiere un asset `hero`;
- combina screenshot con explicación/resultado en una sola pieza.

### Architecture Flow — TE-01

- single-image;
- 1080 × 1350;
- deriva un flujo técnico de problema → decisión → resultado.

### Process Steps — TE-03

- single-image;
- 1080 × 1350;
- convierte la historia en una secuencia visual de pasos/decisiones.

### Step by Step / Tutorial Sequence — CA-01

- carousel;
- páginas 1080 × 1350;
- PDF mediante `pdf-lib`;
- miniatura PNG de la portada para Buffer.

### Case Study — CA-02

- carousel;
- páginas 1080 × 1350;
- estructura problema → fricción → decisión → resultado → aprendizaje → cierre;
- puede integrar el asset `hero` en la página de resultado cuando existe;
- PDF + miniatura PNG para Buffer.

## Biblioteca de diseños

`/designs` es funcional y muestra dos niveles:

1. arquetipos realmente operativos en el runtime;
2. catálogo objetivo de 12 arquetipos V1 con estado Implementado/Pendiente.

Esto evita presentar como disponibles diseños que aún solo existen como planificación documental.

## Requisitos de assets declarativos

El contrato `ArchetypeDefinition` admite:

```text
requiredAssetRoles
```

Actualmente Hero Screenshot y Split Screenshot declaran `hero` como obligatorio.

El preview puede mostrarse sin el asset para explicar qué falta, pero no recibe la capacidad de crear un render final hasta cumplir los requisitos declarados.

## Identidad

`/settings` persiste una identidad central en `identity_profiles`.

Los previews aplican:

- nombre visible;
- firma corta;
- dirección visual;
- paleta;
- tipografía.

Cuando cambia la identidad, todas las publicaciones todavía editables (`draft` o `ready`) actualizan su marca temporal. Esto invalida de forma segura renders generados con una identidad anterior sin modificar publicaciones ya programadas, publicadas o archivadas.

## Persistencia y trazabilidad de renders

Flujo:

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

`render_context` conserva:

- publicación y contenido utilizados;
- versión de esquema;
- diseño y variante;
- identidad;
- IDs, roles y metadatos de assets fuente;
- datos técnicos de exportación;
- referencias a miniaturas de documento cuando aplica.

No se guardan signed URLs temporales en el snapshot.

## Protección contra renders obsoletos

Content Studio ya no ofrece para publicar cualquier render histórico `ready`.

Un render se considera publicable solo cuando:

- su arquetipo coincide con el diseño guardado actualmente;
- su variante coincide;
- fue generado después de la última edición relevante de la publicación.

Cambiar historia, diseño, asset o identidad provoca que el render anterior permanezca trazable pero aparezca como obsoleto y no alcance el panel Publish.

Esta protección reduce el riesgo de publicar una imagen que ya no corresponde con el contenido visible en Studio.

## Integración Buffer → LinkedIn

Validado en producción:

- API key server-side;
- autenticación con Buffer;
- cuenta y organización;
- canal LinkedIn personal;
- lectura del render público;
- creación real de drafts mediante GraphQL.

Modos implementados:

- `shareNow` — publicar ahora;
- `customScheduled` + `dueAt` — programar;
- `addToQueue` + `saveToDraft: true` — draft.

Medios:

- imagen: `image.url`;
- documento: `document.url`, `document.thumbnailUrl`, `document.title`.

No se ha realizado todavía una publicación pública real durante las pruebas.

## Protección contra drafts duplicados

La primera demo reveló que un botón sin feedback podía provocar varias pulsaciones válidas.

Correcciones implantadas:

- progreso visible;
- bloqueo mientras la acción está en curso;
- mensaje de resultado;
- bloqueo inmediato del botón después del éxito en la sesión;
- guardia server-side: si ya existe un draft activo para la misma publicación + render + canal, se devuelve el draft existente en lugar de crear otro;
- Historial permite eliminar drafts de Buffer de forma explícita;
- el job eliminado queda `cancelled` para conservar trazabilidad.

## Publishing Jobs e Historial

Cada envío crea un `publishing_job` con trazabilidad de:

- publicación;
- render exacto;
- canal y organización;
- acción;
- estado;
- identificador externo;
- URL externa cuando existe;
- fechas;
- error saneado cuando aplica.

`/history` se deriva de `publications`, `renders` y `publishing_jobs`; no existe una tabla duplicada de historial.

## Primera validación end-to-end

Caso:

**“De una idea técnica a una publicación sin pasar por Canva”**

Resultado:

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

## Calidad y despliegue

El workflow `Quality` ejecuta:

- instalación de dependencias;
- ESLint;
- TypeScript;
- build de Next.js.

La última tanda completa del desarrollo de la biblioteca visual ha superado lint, typecheck y build, y Vercel ha desplegado correctamente la rama `main` en Production.

Durante esta fase CI detectó un error de TypeScript en la construcción de `PublicationAsset`; se corrigió antes de continuar.

## Cobertura pendiente de V1

Quedan cinco arquetipos del catálogo objetivo:

```text
ED-03 Metric Hero
PR-03 Annotated Screenshot
PR-04 Before / After
TE-02 Code Focus
DA-01 Data Story
```

Todos ellos requieren inputs especializados que no encajan limpiamente en `structured_content` ni en la relación de archivos existente.

Por ello el desarrollo ha alcanzado **AG-008** y se detiene en esta frontera hasta resolver el modelo de persistencia de `visual_config`.

## Próximo tema arquitectónico posterior

Una vez resuelto AG-008 y cerrada la cobertura visual de V1, seguirá pendiente decidir cómo reconciliar estados asíncronos de Buffer con el estado local, por ejemplo:

```text
scheduled → sending → sent
```

Polling, webhooks u otro mecanismo persistente deberán evaluarse en un gate posterior. No se anticipa esa decisión mientras AG-008 siga abierto.
