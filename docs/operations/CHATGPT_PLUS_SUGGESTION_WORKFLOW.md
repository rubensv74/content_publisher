# Operación — Suggestion Engine con ChatGPT Plus

Fecha: 2026-08-09

## Estado

Content Publisher V1 no necesita `OPENAI_API_KEY`, `OPENAI_SUGGESTION_MODEL` ni facturación API adicional.

La decisión vigente es `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`.

## Procedimiento

1. Abrir **Sugerencias** en Content Publisher.
2. Pulsar **Descargar paquete para ChatGPT**.
3. Guardar el archivo TXT generado.
4. Abrir ChatGPT Plus y adjuntar ese TXT a una conversación.
5. Pedir que siga exactamente las instrucciones incluidas en el archivo.
6. Obtener el JSON estructurado de Suggestions.
7. Volver a Content Publisher.
8. Importar la respuesta mediante una de estas rutas:
   - pegar directamente el JSON;
   - seleccionar un archivo `.json` o `.txt` con la respuesta.
9. Pulsar **Importar sugerencias**.
10. Revisar cada propuesta antes de aceptarla o descartarla.

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
- archivo de respuesta máximo 256 KB;
- archivos de importación admitidos: `.json` y `.txt`;
- ningún repositorio completo;
- el contexto profundo no se persiste en Supabase.

## Validación de importación

Content Publisher valida antes de persistir:

- JSON interpretable;
- forma `{"suggestions":[...]}`;
- IDs de señales existentes para el usuario;
- `storyType`;
- `format`;
- `designFamily`;
- `archetypeKey`;
- `priority`;
- `confidence` entre 0 y 1.

Si la importación falla, la pantalla muestra el motivo y permite corregir el JSON o utilizar el archivo de respuesta.

## Qué no ocurre

- Content Publisher no inicia sesión en ChatGPT;
- no existe integración automática entre ChatGPT y la aplicación;
- no se almacena ninguna clave de OpenAI;
- no se realizan llamadas a una API de IA;
- no se importan respuestas sin validación;
- no se publica nada automáticamente.

## Validación de Release Candidate

El procedimiento completo de aceptación de V1 está documentado en:

`docs/operations/V1_RELEASE_VALIDATION.md`

La primera prueba obligatoria es **RC-01 — Flujo ChatGPT Plus**.

## Nota histórica

ADR-015 documenta la alternativa API evaluada inicialmente, pero está supersedida para V1. Reintroducir una API en el futuro requerirá un nuevo gate de arquitectura.
