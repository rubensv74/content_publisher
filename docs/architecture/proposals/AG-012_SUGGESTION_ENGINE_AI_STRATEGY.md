# AG-012 — Estrategia de IA para Suggestion Engine

**Estado:** Aprobado — Opción B  
**Fecha:** 2026-08-09  
**ADR:** `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md`

## Decisión

Suggestion Engine utilizará inicialmente OpenAI detrás de un contrato propio `SuggestionModel`.

La integración se realizará desde servidor mediante Responses API y Structured Outputs con JSON Schema estricto. El modelo concreto permanecerá configurable y no se fijará como decisión arquitectónica.

```text
source_signals
      ↓
preselección determinista
      ↓
Suggestion Engine
      ↓
SuggestionModel
      ↓
OpenAI adapter
      ↓
SuggestionCandidate[]
      ↓
revisión humana
```

## Configuración derivada

```text
OPENAI_API_KEY
OPENAI_SUGGESTION_MODEL
```

`OPENAI_API_KEY` será un secreto server-side. No se almacenará en Supabase, GitHub ni se expondrá al navegador.

Las llamadas usarán `store: false`, enviarán primero señales ligeras y limitarán tanto el número de señales como el número de candidatos devueltos.

## Reglas

- OpenAI no se importa directamente desde lógica editorial ajena al adapter.
- La salida se valida contra un esquema estructurado.
- Las referencias a señales se validan contra los IDs realmente enviados.
- No se redactan publicaciones completas en esta capa.
- Ninguna sugerencia crea una Publication ni publica contenido automáticamente.
- El usuario mantiene la decisión final de convertir una propuesta en Idea.

## Alternativas descartadas

### A — Motor exclusivamente determinista

Se conserva como técnica de prefiltrado, pero no como motor principal porque interpreta mal el valor narrativo y los matices técnicos.

### C — Multi-provider desde el inicio

Se pospone hasta que exista una necesidad real. El contrato propio permite incorporar otro proveedor después sin contaminar las entidades editoriales.

## Fuera de alcance

AG-012 no decide:

- persistencia y ciclo de vida de Suggestions;
- embeddings o base vectorial;
- RAG persistente;
- scheduler;
- tendencias externas;
- publicación automática;
- modelo exacto permanente;
- generación de imágenes con IA.

La persistencia de Suggestions pasa a **AG-013**.
