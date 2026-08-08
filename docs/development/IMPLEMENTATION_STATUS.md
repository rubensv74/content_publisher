# Estado de implementación

Fecha de actualización: 2026-08-08

## Arquitectura cerrada

Los gates iniciales de arquitectura están aprobados y registrados:

- AG-001 — Tailwind CSS + shadcn/ui para la aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — renderizado React/DOM con `html-to-image` y PDF con `pdf-lib` detrás de adaptador propio.
- AG-004 — modelo relacional PostgreSQL + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.

## Cimentación implementada en el repositorio

Ya existe una primera base ejecutable del producto con:

- configuración Next.js + React + TypeScript;
- Tailwind CSS;
- estructura `src/app`, `src/features`, `src/components`, `src/domain`, `src/lib`, `src/config` y `src/publication-renderer`;
- clientes Supabase para navegador y servidor;
- renovación de sesión mediante `proxy.ts`;
- login por email + contraseña;
- rutas privadas del workspace;
- bandeja de Ideas conectada a persistencia real;
- creación, edición, archivado y eliminación de Ideas;
- acceso desde una Idea al inicio del flujo de conversión a Publication;
- frontera del renderer y adaptador de exportación;
- migraciones SQL del modelo V1;
- políticas RLS sobre las tablas de usuario;
- bucket privado de Storage con políticas por usuario;
- workflow de calidad para lint, TypeScript y build.

## Supabase dedicado

Se ha creado un proyecto Supabase independiente para Content Publisher:

- nombre: `Content Publisher`;
- región: `eu-west-1`;
- coste confirmado al crearlo: 0 al mes;
- estado al finalizar la creación: `ACTIVE_HEALTHY`.

No se reutiliza el proyecto `QuizMillionApp`.

## Migraciones aplicadas

Se han aplicado correctamente en el proyecto Supabase:

1. `initial_schema` — tablas V1, relaciones, restricciones, triggers, RLS y Storage privado;
2. `add_fk_indexes` — índices de cobertura recomendados por los advisors para claves foráneas.

Los mismos cambios se conservan versionados en `supabase/migrations/` dentro del repositorio.

## Advisors de Supabase

### Seguridad

La revisión posterior a la migración no devolvió avisos de seguridad.

### Rendimiento

La primera revisión detectó claves foráneas sin índice de cobertura. Se añadió una segunda migración con los índices correspondientes.

Los avisos de índices todavía no utilizados son esperables en una base recién creada y sin tráfico real; no se eliminarán antes de disponer de uso representativo.

## Usuario de autenticación

Existe exactamente un usuario en Supabase Auth y está confirmado.

Esto coincide con la decisión de V1 de utilizar una única cuenta personal y mantener el registro público desactivado.

## Validación RLS

Se ejecutó una prueba transaccional con el rol `authenticated` y el `sub` del usuario real:

- inserción temporal en `public.ideas` permitida para el propio usuario;
- lectura de esa fila permitida;
- rollback posterior para no dejar datos de prueba.

La prueba confirma que la política RLS principal de Ideas funciona para una sesión autenticada.

## Tipos TypeScript

La generación de tipos desde el esquema real de Supabase funciona y refleja las entidades principales de V1: `identity_profiles`, `ideas`, `publications`, `assets`, `publication_assets`, `renders` y `publishing_jobs`.

## Validación técnica de aplicación

El primer ciclo de CI detectó una incompatibilidad de tipos al construir el `Blob` final del PDF. El defecto fue corregido normalizando los bytes devueltos por `pdf-lib` antes de crear el `Blob`.

Los runs anteriores a esa corrección permanecen en rojo como histórico. Los commits posteriores realizados mediante la integración de GitHub no han generado nuevos runs automáticos, por lo que el CI verde aún debe confirmarse desde un checkout normal o un nuevo push convencional.

## Entorno de ejecución pendiente

La aplicación necesita estas variables de entorno fuera del repositorio:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

El proyecto y la clave publicable existen y han sido recuperados desde Supabase, pero no se guardarán en GitHub. Deben configurarse en `.env.local` para desarrollo local y, cuando exista el proyecto Vercel, como variables de entorno de Vercel.

La contraseña del usuario tampoco se almacena ni se comparte con el repositorio.

## Estado del despliegue

La conexión a Vercel está disponible, pero todavía no existe un proyecto Vercel asociado a `content_publisher`. El conector de despliegue disponible requiere recibir los archivos del proyecto y no puede importar directamente este repositorio privado de GitHub ni configurar variables de entorno por sí solo.

Por tanto, el despliegue real queda pendiente de vincular el repositorio con Vercel o ejecutar el proyecto localmente con sus variables de entorno.

## Próximo objetivo funcional

1. validar login real desde una instancia ejecutándose con las variables de entorno;
2. verificar CRUD de Ideas desde la interfaz;
3. completar la conversión de Idea a Publication;
4. iniciar el primer flujo vertical de Content Studio;
5. generar el primer preview y PNG real;
6. comenzar una publicación de prueba de extremo a extremo.

No se añadirá una nueva dependencia estructural ni se modificará la arquitectura sin abrir un nuevo gate si la decisión tiene impacto relevante.
