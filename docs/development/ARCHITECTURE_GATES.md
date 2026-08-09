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
- **AG-012, opción B** — OpenAI como primer motor detrás de `SuggestionModel`, Responses API, Structured Outputs y revisión humana. `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md`.
- **AG-013, opción B** — `suggestions` persistentes + `suggestion_source_signals`, ciclo `new → accepted → converted` o `dismissed`, con conversión explícita a Idea. `ADR-016_SUGGESTION_PERSISTENCE_AND_LIFECYCLE.md`.
- **AG-014, opción B** — `SourceContextResolver` bajo demanda, acotado, sanitizado y no persistente. `ADR-017_SUGGESTION_EPHEMERAL_CONTEXT_RESOLVER.md`.

## Suggestion Engine implementado hasta AG-014

```text
Fuente original
      ↓
Source Adapter
      ↓
source_signals
      ↓
prefiltro determinista
      ↓
SourceContextResolver
      ↓
contexto efímero (cuando aplica)
      ↓
SuggestionModel
      ↓
suggestions
      ↓
revisión humana
      ↓
Idea
```

Consecuencias ya implementadas:

- hasta 20 señales por ejecución;
- hasta 6 señales enriquecidas;
- hasta 5 propuestas;
- contexto GitHub/Knowledge Base limitado a metadatos de commit, rutas seguras y pequeños fragmentos Markdown;
- exclusión de rutas sensibles y redacción defensiva de secretos;
- tratamiento del contenido fuente como no confiable frente a prompt injection;
- Structured Outputs;
- persistencia y deduplicación por fingerprint;
- relación relacional con señales fuente;
- RLS por usuario;
- estados `new`, `accepted`, `dismissed`, `converted`;
- conversión humana explícita a Idea;
- ninguna publicación automática.

## AG-015 — Cadencia de generación de Suggestions

**Estado: Abierto — pendiente de decisión.**

La generación funciona actualmente bajo demanda. Debe decidirse si V1 mantiene ese comportamiento o incorpora ejecución automática.

Alternativas:

- **A** — generación exclusivamente bajo demanda **(recomendada para V1)**;
- **B** — generación periódica programada;
- **C** — generación event-driven mediante eventos/webhooks de las fuentes.

Propuesta completa:

`docs/architecture/proposals/AG-015_SUGGESTION_GENERATION_CADENCE.md`

La implementación de cron, workers, webhooks o generación automática queda detenida en este gate.

## Estado global

**Existe un gate abierto: AG-015.**

La generación manual puede seguir utilizando toda la arquitectura aprobada hasta AG-014.

## Regla

No se abre un gate por decisiones locales y reversibles. Si una necesidad cambia una frontera, proveedor, seguridad, persistencia, renderizado o despliegue, se documenta antes de implementar.
