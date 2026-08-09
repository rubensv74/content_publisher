# Operación — Suggestion Engine con ChatGPT Plus

Fecha: 2026-08-09

## Estado

La configuración anterior de OpenAI API queda retirada. Content Publisher V1 no necesita `OPENAI_API_KEY`, `OPENAI_SUGGESTION_MODEL` ni facturación API adicional.

La decisión vigente es `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`.

## Procedimiento

1. Abrir **Sugerencias** en Content Publisher.
2. Pulsar **Descargar paquete para ChatGPT**.
3. Guardar el archivo TXT generado.
4. Abrir ChatGPT Plus y adjuntar ese TXT a una conversación.
5. Pedir que siga las instrucciones incluidas en el archivo.
6. Copiar el JSON que devuelve ChatGPT.
7. Volver a Content Publisher, pegarlo en **JSON devuelto por ChatGPT** y pulsar **Importar sugerencias**.
8. Revisar cada propuesta antes de aceptarla o descartarla.

## Contenido del paquete

- señales elegibles;
- contexto GitHub/Knowledge Base limitado cuando existe;
- exclusión/redacción de información sensible;
- valores admitidos por el dominio;
- formato JSON obligatorio.

## Límites

- hasta 20 señales por paquete;
- hasta 6 señales enriquecidas;
- máximo 5 Suggestions por importación;
- ningún repositorio completo;
- el contexto profundo no se persiste en Supabase.

## Qué no ocurre

- Content Publisher no inicia sesión en ChatGPT;
- no existe integración automática entre ChatGPT y la aplicación;
- no se almacena ninguna clave de OpenAI;
- no se realizan llamadas a una API de IA;
- no se importan respuestas sin validación;
- no se publica nada automáticamente.

## Nota histórica

ADR-015 documenta la alternativa API evaluada inicialmente, pero está supersedida para V1. Reintroducir una API en el futuro requerirá un nuevo gate de arquitectura.
