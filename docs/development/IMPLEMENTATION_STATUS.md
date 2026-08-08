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

Está abierto **AG-007 — autenticación de Buffer y almacenamiento del secreto** antes de implementar la conexión real con el proveedor.

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

Los avisos de rendimiento actuales son índices todavía sin uso, algo esperado en una base con poco tráfico. El advisor de seguridad no detecta problemas de RLS/Storage; sí informa que la protección contra contraseñas filtradas de Supabase Auth está desactivada, una mejora de configuración independiente de este desarrollo.

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

El flujo funcional implementado alcanza:

`IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY`

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
- identidad visual.

Content Studio permite guardar la historia estructurada, editar el caption de LinkedIn, seleccionar el diseño y generar un render final trazable.

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

La pantalla `/settings` ya permite persistir una identidad en `identity_profiles`.

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

La comprobación runtime completa de subida desde navegador sigue pendiente hasta disponer de un preview Vercel estable o ejecutar la aplicación localmente con sesión real.

## Calidad técnica

El workflow `Quality` valida:

- instalación de dependencias;
- ESLint;
- TypeScript;
- build de Next.js.

El commit que conecta Content Studio con la persistencia de renders finales terminó correctamente en las cuatro etapas.

## Vercel

La integración de despliegue ha generado previews, pero el conector de Vercel no está devolviendo después esos deployments en el listado del equipo aunque sí entrega URL e Inspector al crearlos. Por ese motivo el recorrido navegador → login → Content Studio → render final todavía requiere validación manual.

La conexión Git continua entre GitHub y un proyecto Vercel estable sigue pendiente como tarea operativa.

## Siguiente gate — AG-007

La documentación oficial actual de Buffer distingue entre:

- API key personal para automatizaciones sobre la propia cuenta;
- OAuth 2.0 + PKCE para aplicaciones que actúan en nombre de otros usuarios.

Para la V1 personal se propone **API key personal almacenada exclusivamente como variable de entorno server-side**. El navegador y PostgreSQL no recibirían el secreto.

Propuesta completa: `docs/architecture/proposals/AG-007_BUFFER_AUTHENTICATION_AND_SECRET_STORAGE.md`.

La integración real `RENDER READY → PUBLISH → BUFFER → LINKEDIN` queda detenida hasta resolver este gate.
