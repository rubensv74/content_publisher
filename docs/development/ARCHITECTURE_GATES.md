# Gates de arquitectura

## Propósito

Evitar decisiones técnicas importantes implícitas. El desarrollo continúa de forma autónoma mientras derive de decisiones aprobadas; una nueva frontera relevante abre un gate.

## Gates aprobados

- AG-001 — Tailwind CSS + shadcn/ui y renderer React propio.
- AG-002 — Supabase Auth personal.
- AG-003 — React/DOM + `html-to-image` + `pdf-lib`.
- AG-004 — PostgreSQL relacional + JSONB, UUID, FK y RLS.
- AG-005 — Next.js App Router + `src/`.
- AG-006 — assets privados + renders finales públicos.
- AG-007 — Buffer server-side.
- AG-008 — `publications.visual_config JSONB`.
- AG-009 — reconciliación Buffer bajo demanda.
- AG-010 — source adapters + `source_signals`.
- AG-011 — GitHub fine-grained PAT read-only + allowlist.
- AG-012 — decisión histórica de OpenAI API; **supersedida para V1 por AG-016 / ADR-019**.
- AG-013 — Suggestions persistentes + trazabilidad a señales.
- AG-014 — `SourceContextResolver` efímero, acotado y sanitizado.
- AG-015 — generación exclusivamente bajo demanda.
- **AG-016 — no usar API de IA de pago; flujo asistido/manual con ChatGPT Plus. `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`.**

## Suggestion Engine vigente

```text
acción explícita
      ↓
refresco de fuentes
      ↓
source_signals
      ↓
prefiltro
      ↓
contexto efímero
      ↓
paquete TXT
      ↓
ChatGPT Plus — interacción humana
      ↓
JSON estructurado
      ↓
validación server-side
      ↓
suggestions
      ↓
revisión humana
      ↓
Idea
```

Reglas vigentes:

- cero llamadas de IA desde Content Publisher;
- ninguna `OPENAI_API_KEY`;
- hasta 20 señales y hasta 6 enriquecidas por paquete;
- máximo 5 Suggestions importadas por lote;
- contexto limitado y sanitizado;
- IDs y enums validados antes de persistir;
- Suggestions persistentes con deduplicación y RLS;
- ninguna generación recurrente;
- ninguna publicación automática.

## Estado global

**No existe un gate abierto.** El desarrollo puede continuar de forma autónoma hasta la siguiente decisión arquitectónica real.

## Regla

No se abre un gate por decisiones locales y reversibles. Si una necesidad cambia una frontera, proveedor, seguridad, persistencia, renderizado o despliegue, se documenta antes de implementar.
