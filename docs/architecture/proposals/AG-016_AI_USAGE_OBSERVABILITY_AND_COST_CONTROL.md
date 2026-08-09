# AG-016 — Ejecución y coste de IA para Suggestion Engine

**Estado:** Aprobado — flujo asistido/manual con ChatGPT Plus  
**Fecha:** 2026-08-09  
**ADR:** `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`

## Decisión

Content Publisher no contratará ni consumirá una API de IA adicional en V1. La aplicación aprovechará ChatGPT Plus mediante un handoff manual.

```text
Content Publisher → paquete TXT → ChatGPT Plus → JSON → Content Publisher
```

## Consecuencias

- no existe coste adicional de API de IA;
- no se requiere `OPENAI_API_KEY` ni `OPENAI_SUGGESTION_MODEL`;
- no se crea `ai_runs`, porque no hay consumo de tokens API que medir dentro de la aplicación;
- el usuario inicia y controla cada análisis;
- Content Publisher sigue validando la estructura y las señales citadas antes de persistir Suggestions;
- el contexto de GitHub/Knowledge Base sigue limitado, sanitizado y efímero según ADR-017.

## Flujo V1

1. Descargar desde `Sugerencias` un TXT preparado por Content Publisher.
2. Adjuntarlo manualmente a una conversación de ChatGPT Plus.
3. ChatGPT devuelve exclusivamente JSON según el contrato incluido.
4. Pegar ese JSON en Content Publisher.
5. La aplicación valida y persiste Suggestions.
6. El usuario acepta, descarta o convierte explícitamente una Suggestion en Idea.

## Decisión previa de observabilidad

Las opciones de telemetría `ai_runs` dejan de ser necesarias en V1 porque partían de la premisa de una integración API de pago. Si en el futuro se reconsidera una API, el coste y su observabilidad requerirán un nuevo gate.
