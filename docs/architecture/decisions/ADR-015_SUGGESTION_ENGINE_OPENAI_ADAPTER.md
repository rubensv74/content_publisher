# ADR-015 — OpenAI como primer motor de Suggestion Engine detrás de un adaptador propio

**Estado:** Supersedido por `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`  
**Fecha original:** 2026-08-09  
**Gate original:** AG-012

## Registro histórico

Esta decisión propuso utilizar la API de OpenAI server-side mediante un contrato propio `SuggestionModel`, Structured Outputs y una credencial `OPENAI_API_KEY`.

Posteriormente se fijó una restricción de producto más importante: **Content Publisher no debe requerir pagos adicionales de IA y debe aprovechar ChatGPT Plus mediante un flujo asistido/manual**.

Por ello, la ejecución V1 ya no utiliza la API de OpenAI. El cliente, adapter y variables `OPENAI_API_KEY` / `OPENAI_SUGGESTION_MODEL` se retiran del runtime.

La parte conceptual que sigue siendo válida es la salida estructurada y validable: ChatGPT Plus devuelve manualmente un JSON que Content Publisher valida antes de persistir Suggestions.

La decisión vigente está en **ADR-019**.
