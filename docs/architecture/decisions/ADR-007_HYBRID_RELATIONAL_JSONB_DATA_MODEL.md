# ADR-007 — Modelo de datos híbrido relacional + JSONB

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher necesita combinar dos tipos de información muy diferentes:

1. entidades estables con relaciones claras, como ideas, publicaciones, assets, renders y trabajos de publicación;
2. contenido editorial y configuración visual cuya estructura puede variar según el tipo de historia, el arquetipo o el proveedor externo.

Un modelo completamente normalizado introduciría demasiadas tablas y migraciones para datos editoriales cambiantes. Un modelo basado casi por completo en JSON perdería integridad, relaciones y capacidad de consulta.

## Decisión

Utilizar PostgreSQL con un núcleo relacional y reservar `jsonb` para estructuras genuinamente variables.

Entidades principales de la V1:

- `identity_profiles`
- `ideas`
- `publications`
- `assets`
- `publication_assets`
- `renders`
- `publishing_jobs`

Campos variables que usarán JSONB cuando corresponda:

- contenido estructurado de publicaciones;
- configuración de identidad;
- metadatos de assets;
- contexto reproducible de renders;
- payloads específicos de proveedores externos.

## Reglas

- Todas las entidades de usuario tendrán `user_id` y políticas RLS basadas en `auth.uid()`.
- Las entidades principales utilizarán UUID.
- Las fechas persistidas utilizarán `timestamptz`.
- Las relaciones reales se implementarán con claves foráneas, no mediante IDs embebidos en JSON.
- `structured_content` tendrá una versión de esquema explícita.
- Los archivos físicos vivirán en Supabase Storage, no dentro de PostgreSQL.
- Story Types, Design Families, Archetypes y Variants permanecerán versionados en código/documentación durante la V1.

## Trazabilidad visual

Cada render final conservará contexto suficiente para saber qué produjo el archivo:

- clave y versión del arquetipo;
- variante;
- configuración de identidad aplicada;
- dimensiones;
- opciones relevantes de exportación.

Esto evita que cambios futuros de identidad o diseño hagan imposible explicar o reproducir una publicación histórica.

## Preparación para el Suggestion Engine

`ideas` incorporará `source_type` y `source_ref` desde la V1. De este modo futuras sugerencias procedentes de GitHub, una base de conocimiento u otras fuentes podrán convertirse en ideas sin rehacer el núcleo del modelo.

## Alternativas descartadas

### Normalización completa

Demasiado rígida para contenido editorial que evoluciona y varía según el Story Type.

### Modelo predominantemente documental

Demasiado débil para relaciones, integridad, historial, filtros y futura analítica.

## Consecuencias

- Las primeras migraciones pueden construirse sobre un conjunto pequeño de tablas estables.
- Añadir nuevos Story Types no debería exigir cambios físicos en la base de datos salvo que aparezca un concepto realmente nuevo.
- Será necesario validar el contenido JSONB en la capa de aplicación y versionar sus esquemas.
- Las consultas relevantes seguirán apoyándose en columnas relacionales normales.
