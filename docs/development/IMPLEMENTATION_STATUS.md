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
- workflow de calidad para lint, TypeScript y build.

## Validación técnica

El primer ciclo de CI detectó una incompatibilidad de tipos al construir el `Blob` final del PDF. El defecto fue corregido normalizando los bytes devueltos por `pdf-lib` a un `ArrayBuffer` antes de crear el `Blob`.

La validación de CI debe seguir considerándose abierta hasta confirmar un run verde posterior a esa corrección.

## Bloqueo operativo actual

Para validar la persistencia de extremo a extremo hace falta un proyecto Supabase dedicado a Content Publisher.

La cuenta conectada contiene actualmente un proyecto llamado `QuizMillionApp`, que no debe reutilizarse para Content Publisher.

Por tanto, el siguiente paso operativo es crear un proyecto Supabase independiente, aplicar las migraciones y revisar los advisors de seguridad y rendimiento.

La creación de un proyecto Supabase puede tener coste y requiere confirmación explícita de la organización y del coste antes de ejecutarse.

## Próximo objetivo funcional

Una vez disponible Supabase:

1. aplicar y validar migraciones;
2. crear el usuario personal autorizado;
3. comprobar login y protección de rutas/datos;
4. completar CRUD real de Ideas;
5. convertir una Idea en Publication;
6. iniciar el primer flujo vertical de Content Studio.

No se añadirá una nueva dependencia estructural ni se modificará la arquitectura sin abrir un nuevo gate si la decisión tiene impacto relevante.
