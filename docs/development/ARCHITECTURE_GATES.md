# Gates de arquitectura

## Propósito

Evitar decisiones técnicas importantes implícitas. El desarrollo puede continuar de forma autónoma mientras sea consecuencia directa de decisiones ya aceptadas. Si aparece una elección con impacto relevante en estructura, proveedor, modelo de datos, seguridad, integración, despliegue, coste o mantenibilidad, debe abrirse un gate y detenerse la implementación afectada.

## Gates aprobados

- **AG-001** — Tailwind CSS + shadcn/ui y renderer React propio. `ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`.
- **AG-002** — Supabase Auth personal, sin registro público. `ADR-005_PERSONAL_AUTHENTICATION.md`.
- **AG-003** — React/DOM + `html-to-image` + `pdf-lib`. `ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`.
- **AG-004** — PostgreSQL relacional + JSONB, UUID, FK y RLS. `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`.
- **AG-005** — Next.js App Router + `src/` + separación por responsabilidades. `ADR-008_NEXTJS_APP_ROUTER_AND_SOURCE_ORGANIZATION.md`.
- **AG-006** — assets fuente privados y bucket público separado para renders finales. `ADR-009_PUBLIC_PUBLISHABLE_RENDER_STORAGE.md`.
- **AG-007** — credencial personal de Buffer exclusivamente server-side. `ADR-010_BUFFER_PERSONAL_API_KEY_SERVER_SIDE.md`.
- **AG-008, opción B** — `publications.visual_config JSONB`. `ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`.
- **AG-009, opción A** — reconciliación Buffer bajo demanda. `ADR-012_BUFFER_STATUS_RECONCILIATION_ON_DEMAND.md`.
- **AG-010, opción C** — adaptadores de fuentes + memoria ligera `source_signals`. `ADR-013_SUGGESTION_SOURCE_SIGNALS.md`.
- **AG-011, opción A** — fine-grained PAT GitHub read-only, repo-scoped, server-side y allowlist adicional. `ADR-014_GITHUB_FINE_GRAINED_PAT_SOURCE_READER.md`.
- **AG-012, opción B** — OpenAI como primer motor detrás del contrato propio `SuggestionModel`, Responses API, Structured Outputs y revisión humana. `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md`.

## Consecuencias derivadas de AG-012

- proveedor encapsulado detrás de `SuggestionModel`;
- modelo concreto configurable;
- credencial exclusivamente server-side;
- requests sin estado remoto persistente solicitado;
- contexto inicial limitado a señales normalizadas;
- salida JSON Schema estricta;
- validación de referencias contra señales realmente enviadas;
- límite inicial de 20 señales y 5 propuestas por ejecución;
- ninguna publicación automática.

## AG-013 — Persistencia y ciclo de vida de Suggestions

**Estado: Abierto — pendiente de decisión.**

Ahora debe decidirse si `Suggestion` será un resultado temporal o una entidad persistente distinta de `Idea`.

Alternativas:

- **A** — Suggestions efímeras;
- **B** — `suggestions` + relación `suggestion_source_signals` **(recomendada)**;
- **C** — guardar directamente las propuestas como Ideas.

Propuesta completa:

`docs/architecture/proposals/AG-013_SUGGESTION_PERSISTENCE_AND_LIFECYCLE.md`

La implementación se detiene antes de crear las tablas o activar generación real en la interfaz.

## Estado global

**Existe un gate abierto: AG-013.**

## Regla

No se abre un gate por decisiones locales y reversibles. Si una necesidad cambia una frontera, proveedor, seguridad, persistencia, renderizado o despliegue, se documenta antes de implementar.
