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
- rutas iniciales del workspace;
- bandeja de Ideas conectada a la capa de persistencia;
- frontera del renderer y adaptador de exportación;
- primera migración SQL del modelo V1;
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

La revisión posterior a la migración inicial no devolvió avisos de seguridad.

### Rendimiento

La primera revisión detectó claves foráneas sin índice de cobertura. Se añadió una segunda migración con los índices correspondientes.

Los avisos de índices todavía no utilizados son esperables en una base recién creada y sin tráfico real; no se eliminarán antes de disponer de uso representativo.

## Tipos TypeScript

La generación de tipos desde el esquema real de Supabase funciona y refleja las entidades principales de V1: `identity_profiles`, `ideas`, `publications`, `assets`, `publication_assets`, `renders` y `publishing_jobs`.

## Validación técnica de aplicación

El primer ciclo de CI detectó una incompatibilidad de tipos al construir el `Blob` final del PDF. El defecto fue corregido normalizando los bytes devueltos por `pdf-lib` antes de crear el `Blob`.

Los runs anteriores a esa corrección permanecen en rojo como histórico. La validación de CI debe confirmarse de nuevo sobre un commit posterior que incluya la corrección.

## Próximo bloqueo operativo

Para validar autenticación y persistencia de extremo a extremo falta crear el usuario personal autorizado en Supabase Auth y configurar localmente las variables:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Estas credenciales de entorno no se guardarán en el repositorio. `.env.example` conserva únicamente los nombres de las variables.

## Próximo objetivo funcional

1. crear el usuario personal autorizado;
2. comprobar login y protección de rutas/datos;
3. completar CRUD real de Ideas;
4. convertir una Idea en Publication;
5. iniciar el primer flujo vertical de Content Studio;
6. comenzar la primera publicación real de prueba.

No se añadirá una nueva dependencia estructural ni se modificará la arquitectura sin abrir un nuevo gate si la decisión tiene impacto relevante.
