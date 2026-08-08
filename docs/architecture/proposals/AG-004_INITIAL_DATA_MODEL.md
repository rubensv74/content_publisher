# AG-004 — Modelo de datos inicial

- Estado: Aprobado
- Fecha: 2026-08-08
- Decisión: Opción A — núcleo relacional + JSONB donde la estructura sea genuinamente variable

## Por qué aparece esta decisión ahora

Ya conocemos el flujo funcional de la V1 y las fronteras principales del sistema. El siguiente paso será crear la aplicación y sus primeras migraciones.

Antes debíamos decidir cómo traducir el modelo conceptual a PostgreSQL, porque una mala elección aquí puede provocar dos problemas opuestos:

- un esquema excesivamente rígido que obligue a migrar tablas cada vez que aparezca un nuevo tipo de historia;
- un esquema excesivamente libre basado en JSON que pierda relaciones, integridad y capacidad de consulta.

Content Publisher necesita ambas cosas: estructura estable para ideas, publicaciones, assets y trabajos de publicación, y flexibilidad para contenidos editoriales que cambian según el tipo de historia.

## Decisión aprobada

Usar tablas y relaciones normales para aquello que tiene una identidad y un ciclo de vida estable, y `jsonb` para estructuras que varían según el tipo de publicación o proveedor.

```text
auth.users
    │
    ├── identity_profiles
    ├── ideas
    │      │
    │      └──── source_idea_id
    │                │
    ├──────────── publications
    │                │
    │                ├── publication_assets ── assets
    │                ├── renders
    │                └── publishing_jobs
    │
    └── user-owned data protected by RLS
```

## Tablas principales aprobadas

### `identity_profiles`

Configuración de identidad del usuario.

Campos conceptuales:

- `id`
- `user_id`
- `display_name`
- `signature_label`
- `identity_config jsonb`
- `created_at`
- `updated_at`

`identity_config` contendrá elementos que todavía pueden evolucionar, por ejemplo paletas, tipografías, series y pequeños tokens visuales.

### `ideas`

Bandeja de oportunidades de contenido.

Campos conceptuales:

- `id`
- `user_id`
- `title`
- `notes`
- `topic`
- `source_type`
- `source_ref` opcional
- `priority`
- `status`
- `created_at`
- `updated_at`
- `archived_at` opcional

Una idea no se transforma físicamente en una publicación. Cuando se acepta, se crea una publicación con referencia `source_idea_id`. De esta forma se conserva el origen y la trazabilidad.

### `publications`

Unidad principal de trabajo editorial.

Campos conceptuales:

- `id`
- `user_id`
- `source_idea_id` opcional
- `title`
- `topic`
- `story_type`
- `format`
- `status`
- `structured_content jsonb`
- `content_schema_version`
- `linkedin_text`
- `archetype_key`
- `archetype_version`
- `variant_key`
- `series_key` opcional
- `series_number` opcional
- `created_at`
- `updated_at`
- `scheduled_at` opcional
- `published_at` opcional

La parte variable del relato vive en `structured_content`.

### `assets`

Metadatos de recursos almacenados en Supabase Storage.

Campos conceptuales:

- `id`
- `user_id`
- `storage_path`
- `asset_type`
- `mime_type`
- `original_filename`
- `width` opcional
- `height` opcional
- `file_size` opcional
- `metadata jsonb`
- `created_at`

Los archivos físicos no se almacenarán dentro de PostgreSQL.

### `publication_assets`

Relación entre publicación y asset.

Campos conceptuales:

- `publication_id`
- `asset_id`
- `role`
- `sort_order`
- `usage_config jsonb` opcional

### `renders`

Registro de los archivos finales generados.

Campos conceptuales:

- `id`
- `user_id`
- `publication_id`
- `render_type`
- `storage_path` opcional
- `status`
- `width` opcional
- `height` opcional
- `page_count` opcional
- `render_context jsonb`
- `created_at`

`render_context` conservará una instantánea suficiente de la versión del arquetipo, variante, identidad aplicada, dimensiones y configuración de exportación para mantener trazabilidad histórica.

### `publishing_jobs`

Cada intento de publicar o programar.

Campos conceptuales:

- `id`
- `user_id`
- `publication_id`
- `render_id` opcional
- `destination`
- `provider`
- `action`
- `status`
- `scheduled_for` opcional
- `external_id` opcional
- `external_url` opcional
- `provider_payload jsonb` opcional
- `error_message` opcional
- `created_at`
- `updated_at`
- `completed_at` opcional

Buffer queda registrado como proveedor técnico, mientras `destination` seguirá siendo LinkedIn.

## Qué no será tabla en la V1

### Story Types

Catálogo de aplicación versionado en código.

### Design Families

Catálogo de diseño versionado en código y documentación.

### Archetypes y Variants

Componentes y definiciones versionadas en el repositorio. Una publicación guardará sus claves y versiones para saber qué renderer utilizar.

### Editorial History

Se obtendrá inicialmente a partir de publicaciones, renders y publishing jobs.

### Suggestions

El Suggestion Engine está fuera de V1. Su tabla se diseñará cuando ese módulo se implemente, pero las ideas ya incorporarán `source_type` y `source_ref`.

## Reglas transversales aprobadas

### Propiedad y RLS

Todas las entidades de usuario tendrán `user_id` y políticas RLS basadas en `auth.uid()`.

### IDs

Se usarán UUID para las entidades principales.

### Fechas

Las fechas persistidas se almacenarán con zona horaria (`timestamptz`) y la interfaz realizará la presentación en hora local.

### JSONB con límites

JSONB se usará para:

- contenido estructurado;
- configuración visual flexible;
- metadatos de assets;
- snapshots de render;
- payloads de proveedores externos.

No sustituirá tablas, claves foráneas o columnas que necesitemos consultar frecuentemente.

### Versionado de contenido

`structured_content` tendrá un `content_schema_version` explícito.

### Integridad

Las relaciones importantes se implementarán mediante claves foráneas. No se guardarán IDs importantes dentro de JSON cuando exista una relación real entre entidades.

## Alternativas descartadas

### Opción B — Modelo completamente normalizado

Se descarta porque cada nuevo Story Type podría necesitar nuevas tablas y migraciones, ralentizando la evolución editorial sin una ventaja proporcional para la V1.

### Opción C — Modelo predominantemente documental / JSONB

Se descarta porque debilita integridad referencial, dificulta historial y filtros y mezcla conceptos con ciclos de vida diferentes.

## Modelo resumido aprobado

```text
auth.users
   │
   ├── 1:N ideas
   │       └── 0..1 publication
   │
   ├── 1:N publications
   │       ├── N:M assets
   │       ├── 1:N renders
   │       └── 1:N publishing_jobs
   │
   ├── 1:N assets
   │
   └── 1:1 identity_profile   (V1 funcional)
```

Aunque funcionalmente V1 use un solo perfil de identidad, no se codificará como una única fila global sin propietario.

## Fuentes revisadas

- Supabase — Managing JSON and unstructured data: https://supabase.com/docs/guides/database/json
- Supabase — Auth and Row Level Security: https://supabase.com/docs/guides/auth
- PostgreSQL — JSON Types: https://www.postgresql.org/docs/current/datatype-json.html
- PostgreSQL — JSON Functions and Operators: https://www.postgresql.org/docs/current/functions-json.html

## Resultado

Gate cerrado. Esta decisión se registra de forma estable en `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`.
