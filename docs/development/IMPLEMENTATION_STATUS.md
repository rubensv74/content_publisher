# Estado de implementación

Fecha de actualización: 2026-08-08

## Arquitectura

Los gates aprobados hasta ahora son:

- AG-001 — Tailwind CSS + shadcn/ui para la aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — renderizado React/DOM con `html-to-image` y PDF con `pdf-lib` detrás de adaptador propio.
- AG-004 — modelo relacional PostgreSQL + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público separado para renders finales.
- AG-007 — API key personal de Buffer exclusivamente server-side.

AG-007 está registrado definitivamente como `ADR-010_BUFFER_PERSONAL_API_KEY_SERVER_SIDE.md`.

**No existe un gate de arquitectura abierto en este momento.**

## Cimentación implementada

La base ejecutable del producto contiene:

- Next.js + React + TypeScript;
- Tailwind CSS;
- estructura por responsabilidades bajo `src/`;
- clientes Supabase para navegador y servidor;
- renovación de sesión mediante `proxy.ts`;
- login privado con email + contraseña;
- shell principal de navegación;
- frontera independiente del renderer de publicaciones;
- adaptador de exportación PNG/PDF;
- modelo PostgreSQL V1 con RLS;
- Storage privado para fuentes;
- Storage público separado para renders finales;
- frontera de Publishing con adaptador Buffer server-side;
- historial editorial derivado de datos reales;
- workflow de calidad en GitHub para `push`, `pull_request` y ejecución manual.

## Supabase dedicado

Existe un proyecto Supabase independiente para Content Publisher:

- nombre: `Content Publisher`;
- región: `eu-west-1`;
- proyecto activo y sano.

Migraciones aplicadas:

1. `initial_schema` — tablas, relaciones, restricciones, triggers, RLS y Storage privado;
2. `add_fk_indexes` — índices de cobertura recomendados para claves foráneas;
3. `public_publishable_renders` — bucket público de renders finales y políticas de escritura/borrado por usuario.

La validación posterior confirma:

- `content-publisher` sigue siendo privado;
- `content-publisher-published` es público para lectura;
- el bucket público admite únicamente `image/png` y `application/pdf`;
- el límite configurado es 100 MB;
- existen políticas `INSERT`, `UPDATE` y `DELETE` restringidas al usuario autenticado y a su prefijo UUID.

Los avisos de rendimiento actuales son índices todavía sin uso, algo esperado en una base con poco tráfico. El advisor de seguridad no detecta problemas de RLS/Storage; sí informa que la protección contra contraseñas filtradas de Supabase Auth está desactivada. Esta mejora de configuración queda pendiente y su referencia oficial es:

https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Autenticación validada

Existe una única cuenta personal autorizada en Supabase Auth.

La comprobación del backend confirma:

- la cuenta está confirmada;
- las políticas RLS permiten trabajar únicamente con datos propios;
- se han ejecutado pruebas transaccionales autenticadas sin dejar registros de prueba.

La contraseña del usuario no se almacena ni se comparte con el repositorio.

## Ideas

La bandeja de Ideas dispone de persistencia real y operaciones básicas:

- crear;
- listar;
- editar;
- archivar;
- eliminar;
- distinguir una idea convertida;
- iniciar la conversión de una Idea en Publication.

Las operaciones se ejecutan mediante Server Actions y respetan sesión y RLS.

## Content Studio

El flujo funcional implementado alcanza técnicamente:

`IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → PUBLISH`

Desde una Idea se puede crear una publicación y definir:

- título de trabajo;
- tema;
- tipo de historia;
- problema o contexto;
- intentos previos;
- decisión o solución;
- aprendizaje;
- idea transferible;
- formato: imagen única o carrusel;
- diseño compatible;
- identidad visual;
- caption de LinkedIn.

Content Studio permite guardar la historia estructurada, seleccionar el diseño, generar un render final trazable y, cuando Buffer esté configurado, seleccionar canal/render y ejecutar:

- publicar ahora;
- programar para una fecha concreta;
- guardar como draft en Buffer.

La creación real de posts no se considera validada todavía porque falta configurar `BUFFER_API_KEY` en un entorno de ejecución.

## Renderer visual

El renderer permanece aislado de la UI de aplicación conforme a ADR-004.

### Build Note v1

- familia `editorial`;
- formato `single-image`;
- variante `editorial-light`;
- canvas 1080 × 1350, relación 4:5;
- exportación PNG mediante `html-to-image` desde el mismo árbol React del preview.

### Step by Step v1

- familia `carousel`;
- formato `carousel`;
- variante `editorial-light`;
- páginas 1080 × 1350, relación 4:5;
- exportación PDF mediante `pdf-lib` ensamblando las páginas del mismo preview React.

## Identidad

La pantalla `/settings` permite persistir una identidad en `identity_profiles`.

Los previews cargan la identidad central y aplican:

- firma;
- paleta;
- tipografía;
- dirección visual seleccionada.

La identidad ya no está acoplada a cada arquetipo.

## Persistencia de Design

La selección de diseño se guarda en `publications` mediante:

- `archetype_key`;
- `archetype_version`;
- `variant_key`.

La Server Action valida existencia, versión, variante, formato y tipo de historia contra el registro activo del renderer.

## Persistencia de renders finales

Una vez guardado el diseño, Content Studio habilita **Crear render final**.

El flujo implementado es:

```text
Preview React
  ↓
PNG / PDF
  ↓
crear renders.status = pending
  ↓
subir a content-publisher-published
  ↓
marcar renders.status = ready
  ↓
URL pública estable
```

La ruta es inmutable:

```text
{user_id}/{publication_id}/{render_id}.png
{user_id}/{publication_id}/{render_id}.pdf
```

`render_context` guarda la instantánea de contenido, versión de esquema, diseño, identidad y datos técnicos del exportador.

Si la subida falla, el render queda `failed`. Si falla el cambio final a `ready`, se intenta retirar el archivo subido y marcar el registro como fallido.

El renderer no importa Supabase: la persistencia se conecta desde `features/renders`, manteniendo la frontera arquitectónica.

### Miniatura de documentos para Buffer

La documentación actual de Buffer define `DocumentAssetInput` con tres campos obligatorios: URL del documento, URL de miniatura y título.

Por ese motivo, al crear un render final de carrusel se generan dos recursos relacionados pero independientes:

1. el PDF principal;
2. un PNG de la primera página utilizado como miniatura del documento.

Cada archivo conserva su propia fila `renders` y su propia ruta inmutable. El PDF referencia el `thumbnailRenderId` en `render_context`, de forma que no se rompe la regla de un archivo por render.

Los renders PDF creados antes de esta mejora se muestran como no aptos para Buffer y deben regenerarse.

## Integración Buffer

AG-007 aprobó una API key personal almacenada únicamente como variable de entorno server-side:

```text
BUFFER_API_KEY
```

`.env.example` declara el nombre, pero nunca contiene un valor.

La integración implementada incluye:

### Cliente GraphQL server-side

Ruta: `src/lib/publishing/buffer/`.

Responsabilidades:

- endpoint `https://api.buffer.com`;
- autenticación Bearer con `BUFFER_API_KEY`;
- manejo explícito de clave ausente o revocada;
- normalización de errores HTTP/GraphQL;
- ninguna exposición de la credencial al cliente.

### Descubrimiento de cuenta y canales

La aplicación consulta:

1. cuenta y organizaciones;
2. canales de cada organización;
3. filtra únicamente canales `linkedin`.

Settings muestra el estado de conexión, cuenta, organizaciones y canales disponibles. También distingue canales desconectados o bloqueados.

### Creación de posts

El adaptador utiliza `createPost` conforme al API GraphQL de Buffer:

- `shareNow` para publicar ahora;
- `customScheduled` + `dueAt` para programar;
- `addToQueue` + `saveToDraft: true` para guardar draft;
- `schedulingType: automatic`.

Medios:

- imagen: `image.url`;
- documento: `document.url`, `document.thumbnailUrl`, `document.title`.

Antes de enviar un trabajo, Content Publisher comprueba que el render y, cuando aplica, la miniatura sean URLs HTTPS públicas accesibles.

Fuentes oficiales utilizadas para verificar el contrato actual:

- https://developers.buffer.com/guides/authentication.html
- https://developers.buffer.com/examples/get-organizations.html
- https://developers.buffer.com/examples/get-channels.html
- https://developers.buffer.com/guides/posts-and-scheduling.html
- https://developers.buffer.com/types/CreatePostInput.html
- https://developers.buffer.com/types/DocumentAssetInput.html

## Publishing Jobs

Antes de llamar a Buffer se crea un `publishing_job` con estado `pending`.

Si Buffer acepta la operación se guardan:

- `render_id` exacto;
- canal y organización utilizados;
- `external_id` devuelto por Buffer;
- `external_url` cuando esté disponible;
- estado devuelto por Buffer;
- modo de publicación;
- fecha programada;
- URLs del render y miniatura utilizadas.

Nunca se persiste la API key.

Si la llamada falla, el job queda en `failed` con un mensaje de error saneado.

Para `publish-now`, una Publication solo se marca como `published` inmediatamente si Buffer ya responde con estado `sent`; estados asíncronos como `sending` se conservan en el payload del job y no se interpretan falsamente como publicación completada.

## Historial editorial

`/history` ya es funcional.

La vista se deriva de:

- `publications`;
- `renders`;
- `publishing_jobs`.

No se ha creado una tabla duplicada de historial.

La vista muestra publicación, tema, render, diseño, acción, estado, fecha de creación/programación, Buffer ID, enlace externo y error cuando exista.

## Calidad técnica

El workflow `Quality` valida:

- instalación de dependencias;
- ESLint;
- TypeScript;
- build de Next.js.

Durante la implementación de Buffer CI detectó un problema de estrechamiento de tipos en la respuesta polimórfica de `createPost`. Se corrigió y la mutación se alineó además con el fragmento oficial `MutationError` utilizado en la documentación de Buffer.

El estado funcional completo anterior a esta actualización documental ya pasó correctamente lint, TypeScript y build. El último commit de integración se valida igualmente mediante el workflow automático de `main`.

## Vercel

La integración de despliegue ha generado previews, pero todavía no existe una validación estable del recorrido navegador → login → Content Studio → Buffer.

La conexión Git continua entre GitHub y un proyecto Vercel estable sigue pendiente como tarea operativa.

El secreto `BUFFER_API_KEY` no puede configurarse mediante las herramientas actuales del conector utilizado para el desarrollo. Debe añadirse manualmente al entorno de Vercel o a `.env.local` para una ejecución local.

## Bloqueo operativo actual

La arquitectura y la implementación de `RENDER READY → PUBLISH` están preparadas. Falta un dato operativo externo: una API key real de Buffer configurada en el servidor.

La clave debe crearse en Buffer desde **Settings → API** y añadirse como:

```text
BUFFER_API_KEY=<valor secreto>
```

No debe pegarse en código, PostgreSQL ni en un archivo versionado.

Una vez configurada, el siguiente procedimiento será:

1. validar la conexión mediante una consulta de solo lectura;
2. descubrir las organizaciones y canales LinkedIn reales;
3. comprobar que el canal objetivo está operativo;
4. generar un render final real desde navegador;
5. probar primero una operación no pública si se desea validar el ciclo completo con mínimo riesgo;
6. realizar una publicación real únicamente con una acción explícita del usuario;
7. revisar `publishing_jobs` e Historial.

## Próximos temas posteriores

Después de la primera integración real con Buffer será necesario decidir cómo reconciliar estados asíncronos posteriores a `createPost` —por ejemplo `sending → sent` o `scheduled → sent`— si se quiere actualizar automáticamente el estado local sin intervención manual. Si la solución exige escoger entre polling, webhooks u otra estrategia persistente, se abrirá un nuevo gate de arquitectura antes de implementarla.
