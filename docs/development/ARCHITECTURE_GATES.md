# Gates de arquitectura

## Propósito

Evitar que una decisión técnica importante aparezca de forma accidental durante la implementación.

El desarrollo puede avanzar de manera autónoma mientras el trabajo sea una consecuencia directa de decisiones ya aceptadas. Cuando aparezca una elección de arquitectura con impacto relevante, el avance debe detenerse y la decisión debe presentarse antes de implementar.

## Qué se considera una decisión de arquitectura

Una elección pasa por gate cuando afecta de forma significativa a estructura del sistema, dependencia fuerte de tecnología/proveedor, modelo de datos, autenticación o seguridad, renderizado, integración externa, despliegue, costes recurrentes relevantes o mantenibilidad a largo plazo.

No requiere gate una decisión local y reversible: nombres, pequeños componentes, textos, refactor interno sin cambio de contrato, tests, documentación o correcciones que no cambien arquitectura.

## Procedimiento

Cuando aparezca un gate:

1. describir la decisión en lenguaje natural;
2. explicar por qué aparece ahora;
3. presentar alternativas razonables;
4. recomendar una opción;
5. indicar consecuencias;
6. esperar aprobación;
7. registrar ADR;
8. continuar.

## Estado de gates

### AG-001 — Estrategia de estilos y componentes visuales

**Aprobado.** Tailwind CSS + shadcn/ui para la interfaz y renderer React propio para publicaciones. `ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`.

### AG-002 — Autenticación personal de V1

**Aprobado.** Supabase Auth email + contraseña, usuario personal, sin registro público. `ADR-005_PERSONAL_AUTHENTICATION.md`.

### AG-003 — Renderizado de imágenes y PDF

**Aprobado.** React/DOM + `html-to-image` + `pdf-lib` detrás de adaptador propio. `ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`.

### AG-004 — Modelo de datos inicial

**Aprobado.** PostgreSQL relacional + JSONB, UUID, `timestamptz`, FK, RLS y versionado de contenido. `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`.

### AG-005 — Routing y organización de código

**Aprobado.** Next.js App Router + `src/` + separación por responsabilidades. `ADR-008_NEXTJS_APP_ROUTER_AND_SOURCE_ORGANIZATION.md`.

### AG-006 — Almacenamiento de renders publicables

**Aprobado.** Assets fuente privados y bucket público separado para renders finales. `ADR-009_PUBLIC_PUBLISHABLE_RENDER_STORAGE.md`.

### AG-007 — Autenticación Buffer

**Aprobado.** `BUFFER_API_KEY` personal exclusivamente server-side. `ADR-010_BUFFER_PERSONAL_API_KEY_SERVER_SIDE.md`.

### AG-008 — Datos especializados de arquetipos

**Aprobado — Opción B.** `publications.visual_config JSONB` por namespace de arquetipo. `ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`.

### AG-009 — Reconciliación de estados Buffer

**Aprobado — Opción A.** Reconciliación bajo demanda al abrir Historial y actualización manual. `ADR-012_BUFFER_STATUS_RECONCILIATION_ON_DEMAND.md`.

### AG-010 — Fuentes para Suggestion Engine

**Aprobado — Opción C.** Adaptadores server-side + memoria ligera `source_signals`, sin replicar fuentes completas. `ADR-013_SUGGESTION_SOURCE_SIGNALS.md`.

### AG-011 — Autenticación runtime GitHub

**Aprobado — Opción A.** Fine-grained PAT read-only, repositorios seleccionados, server-side y con allowlist adicional de aplicación. `ADR-014_GITHUB_FINE_GRAINED_PAT_SOURCE_READER.md`.

Implementación derivada:

- `GITHUB_SOURCE_TOKEN` sensible y solo servidor;
- `GITHUB_SOURCE_REPOSITORIES` como allowlist;
- `GITHUB_KNOWLEDGE_BASE_REPOSITORY` para distinguir la fuente funcional Knowledge Base;
- cliente GitHub exclusivamente GET;
- adapters GitHub y Knowledge Base producen señales ligeras basadas inicialmente en commits recientes.

### AG-012 — Estrategia de IA para convertir señales en sugerencias

**Estado: Abierto — pendiente de decisión.**

Con la adquisición de señales desacoplada de las fuentes, la siguiente frontera es decidir cómo se evalúan y transforman esas señales en propuestas editoriales.

Alternativas:

- **A** — motor determinista sin LLM;
- **B** — proveedor inicial de IA detrás de un adaptador propio, con salida estructurada y revisión humana **(recomendada)**;
- **C** — abstracción multi-provider desde el primer día.

Propuesta completa:

`docs/architecture/proposals/AG-012_SUGGESTION_ENGINE_AI_STRATEGY.md`

Este gate no decide embeddings, búsqueda vectorial, scheduler ni publicación automática.

## Estado global

**Existe un gate de arquitectura abierto: AG-012.**

La infraestructura de lectura GitHub puede quedar preparada sin introducir todavía una credencial real. La configuración manual del PAT en GitHub/Vercel es un paso operativo posterior y no debe compartir el secreto en el chat.

## Regla

No se abrirán gates por decisiones locales y reversibles. Si una nueva necesidad cambia una frontera, proveedor, estrategia de seguridad, persistencia, renderizado o despliegue, se documentará un nuevo AG antes de implementar.