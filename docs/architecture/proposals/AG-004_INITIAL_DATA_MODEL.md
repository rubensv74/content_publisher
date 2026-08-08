# AG-004 — Modelo de datos inicial

- Estado: Proposed
- Fecha: 2026-08-08
- Gate: requiere aprobación antes de crear migraciones de Supabase/PostgreSQL

## Por qué aparece esta decisión ahora

Ya conocemos el flujo funcional de la V1 y las fronteras principales del sistema. El siguiente paso sería crear la aplicación y sus primeras migraciones.

Antes debemos decidir cómo traducir el modelo conceptual a PostgreSQL, porque una mala elección aquí puede provocar dos problemas opuestos:

- un esquema excesivamente rígido que obligue a migrar tablas cada vez que aparezca un nuevo tipo de historia;
- un esquema excesivamente libre basado en JSON que pierda relaciones, integridad y capacidad de consulta.

Content Publisher necesita ambas cosas: estructura estable para ideas, publicaciones, assets y trabajos de publicación, y flexibilidad para contenidos editoriales que cambian según el tipo de historia.

## Opción A — Modelo híbrido: núcleo relacional + JSONB para contenido variable — recomendada

### Idea principal

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

### Tablas principales propuestas

#### `identity_profiles`

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

#### `ideas`

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

#### `publications`

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

Ejemplo conceptual:

```json
{
  "hook": "...",
  "context": "...",
  "problem": "...",
  "decision": "...",
  "result": "...",
  "lesson": "..."
}
```

Un tutorial podría usar otra forma:

```json
{
  "hook": "...",
  "intro": "...",
  "steps": [
    { "title": "...", "body": "..." }
  ],
  "closing": "..."
}
```

Por eso se propone JSONB para esta parte, pero no para toda la publicación.

#### `assets`

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

#### `publication_assets`

Relación entre publicación y asset.

Permite indicar:

- `publication_id`
- `asset_id`
- `role`
- `sort_order`
- `usage_config jsonb` opcional

Esto permite reutilizar un asset y saber si actúa como portada, screenshot, imagen de una slide, etc.

#### `renders`

Registro de los archivos finales generados.

Campos conceptuales:

- `id`
- `user_id`
- `publication_id`
- `render_type` (`png`, `pdf`...)
- `storage_path` opcional
- `status`
- `width` opcional
- `height` opcional
- `page_count` opcional
- `render_context jsonb`
- `created_at`

### Por qué `render_context` es importante

La identidad y los arquetipos evolucionarán. Si dentro de seis meses cambiamos una tipografía, una paleta o el arquetipo `technical-03`, no queremos perder la capacidad de saber con qué configuración se creó una publicación antigua.

Por eso cada render final debe guardar una instantánea suficiente de:

- versión del arquetipo;
- variante;
- identidad aplicada;
- dimensiones;
- configuración relevante de exportación.

No necesitamos duplicar todo el HTML ni el PNG dentro de la base de datos: guardamos el archivo en Storage y su contexto reproducible en PostgreSQL.

#### `publishing_jobs`

Cada intento de publicar o programar.

Campos conceptuales:

- `id`
- `user_id`
- `publication_id`
- `render_id` opcional
- `destination`
- `provider`
- `action` (`publish_now`, `schedule`, `draft`...)
- `status`
- `scheduled_for` opcional
- `external_id` opcional
- `external_url` opcional
- `provider_payload jsonb` opcional
- `error_message` opcional
- `created_at`
- `updated_at`
- `completed_at` opcional

Buffer queda registrado como proveedor técnico, mientras `destination` seguirá siendo LinkedIn. Esto mantiene la separación acordada entre destino y proveedor.

## Qué no sería tabla en la V1

### Story Types

Los tipos de historia serán catálogo de aplicación, versionado en código.

### Design Families

Serán catálogo de diseño en código/documentación.

### Archetypes y Variants

Serán componentes y definiciones versionadas en el repositorio, no registros editables de base de datos.

Una publicación guardará sus claves y versiones para saber qué renderer utilizar.

### Editorial History

No necesita inicialmente una tabla independiente. Se obtiene a partir de publicaciones, renders y publishing jobs. Si más adelante necesitamos un log completo de eventos, se añadirá deliberadamente.

### Suggestions

El Suggestion Engine está fuera de V1. Su tabla se diseñará cuando ese módulo se implemente, pero las ideas ya incorporarán `source_type` y `source_ref` para recibir futuras sugerencias sin rehacer el núcleo.

## Reglas transversales propuestas

### Propiedad y RLS

Todas las entidades de usuario tendrán `user_id` y políticas RLS basadas en `auth.uid()`, aunque la V1 tenga un único usuario.

Esto evita construir un esquema inseguro que solo funcione porque hoy hay una sola cuenta.

### IDs

Se usarán identificadores UUID para las entidades principales.

### Fechas

Las fechas persistidas se almacenarán con zona horaria (`timestamptz`) y la interfaz realizará la presentación en hora local.

### JSONB con límites

JSONB se usará cuando la estructura sea genuinamente variable:

- contenido estructurado;
- configuración visual flexible;
- metadatos de assets;
- snapshots de render;
- payloads de proveedores externos.

No se utilizará como sustituto general de tablas, claves foráneas o columnas que necesitamos consultar frecuentemente.

### Versionado de contenido

`structured_content` tendrá un `content_schema_version` explícito.

De ese modo un cambio futuro en la forma de representar un tutorial o una arquitectura podrá migrarse de manera controlada.

### Integridad

Las relaciones importantes se implementarán mediante claves foráneas. No se guardarán IDs importantes dentro de JSON cuando exista una relación real entre entidades.

## Opción B — Modelo completamente normalizado

Cada parte del contenido tendría tablas específicas, por ejemplo:

```text
publication_hooks
publication_steps
publication_metrics
publication_lessons
publication_code_blocks
...
```

### Ventajas

- máxima estructura relacional;
- restricciones fuertes en base de datos;
- consultas SQL muy explícitas.

### Problemas

- cada nuevo Story Type puede necesitar nuevas tablas y migraciones;
- un mismo concepto editorial puede adoptar estructuras distintas;
- añade muchas relaciones para datos que normalmente se cargan y guardan como una unidad;
- ralentiza la evolución de la biblioteca editorial sin una ventaja proporcional para la V1.

## Opción C — Modelo predominantemente documental / JSONB

Una tabla principal guardaría casi todo el estado de la publicación como un documento JSON grande.

### Ventajas

- enorme flexibilidad inicial;
- pocas migraciones;
- rápido para prototipar.

### Problemas

- debilita integridad referencial;
- dificulta consultas de historial, filtros y analítica;
- mezcla conceptos con ciclos de vida diferentes;
- hace más difícil aplicar relaciones claras entre publicación, assets, renders y publishing jobs;
- desperdicia parte del valor de PostgreSQL.

## Recomendación

**Opción A — núcleo relacional + JSONB solo donde la estructura realmente cambia.**

Es el punto de equilibrio adecuado para Content Publisher.

El producto tiene entidades muy claras —idea, publicación, asset, render, trabajo de publicación— que merecen relaciones reales. Pero el contenido editorial y ciertas configuraciones visuales van a evolucionar y no deberían obligarnos a rediseñar tablas cada vez que añadamos un arquetipo o Story Type.

Supabase recomienda JSONB para datos con esquema variable, pero también advierte que no debe sustituir indiscriminadamente las ventajas relacionales de PostgreSQL. Esta propuesta sigue exactamente esa separación.

## Modelo resumido propuesto

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

## Decisión pendiente

Aprobar una de las tres estrategias antes de crear tablas, políticas RLS o migraciones en `supabase/`.
