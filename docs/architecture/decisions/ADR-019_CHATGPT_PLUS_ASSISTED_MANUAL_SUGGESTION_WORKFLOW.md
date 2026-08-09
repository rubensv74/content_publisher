# ADR-019 — Suggestion Engine asistido mediante ChatGPT Plus

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-016  
**Decisión:** no contratar consumo adicional de API; utilizar ChatGPT Plus mediante un flujo manual asistido.

## Contexto

La integración anterior contemplaba llamadas server-side a la API de OpenAI. La suscripción ChatGPT Plus y la API son servicios con facturación separada. Para este producto personal se establece como restricción que Suggestion Engine no debe generar un coste adicional de IA.

## Decisión

Content Publisher no invocará una API de IA en V1. La aplicación prepara un paquete de contexto estructurado y sanitizado; el usuario lo procesa manualmente en ChatGPT Plus y devuelve a Content Publisher únicamente el JSON estructurado con las propuestas.

```text
Content Publisher
      ↓
refresco de señales
      ↓
contexto efímero y sanitizado
      ↓
TXT de handoff
      ↓
ChatGPT Plus — interacción humana
      ↓
JSON de Suggestions
      ↓
validación server-side
      ↓
suggestions
      ↓
revisión humana → Idea
```

## Contrato de intercambio

El TXT incluye:

- instrucciones editoriales;
- valores admitidos por el dominio;
- esquema de respuesta esperado;
- hasta 20 señales;
- enriquecimiento acotado según ADR-017.

ChatGPT debe devolver un objeto `{"suggestions":[...]}`. Content Publisher valida tipos, enums, confianza, arquetipo e IDs de señales antes de persistir nada.

## Seguridad

- no existe `OPENAI_API_KEY` en el runtime;
- no se guardan prompts completos ni respuestas crudas;
- el contexto profundo continúa siendo efímero;
- las fuentes se siguen tratando como contenido no confiable;
- la aplicación rechaza IDs de señales que no existan para el usuario;
- ninguna Suggestion publica contenido automáticamente.

## Consecuencias

- cero coste adicional de API de IA;
- una intervención manual explícita por lote;
- no existe telemetría de tokens ni necesidad de `ai_runs` en V1;
- se mantiene la persistencia y trazabilidad de Suggestions ya aprobada;
- el flujo puede migrar en el futuro a una API solo mediante un nuevo gate.

## Decisiones sustituidas

ADR-015 queda **supersedido para la ejecución V1**: se conserva como registro histórico de la alternativa evaluada, pero su adapter OpenAI y sus variables de entorno se retiran del runtime.

ADR-018 continúa vigente en su principio principal: la generación es exclusivamente bajo demanda.

## Operación

1. En `Sugerencias`, descargar el paquete TXT.
2. Abrir ChatGPT Plus y adjuntar el archivo.
3. Pedir que siga exactamente las instrucciones del paquete.
4. Copiar el JSON resultante.
5. Pegar el JSON en Content Publisher.
6. Importar y revisar las Suggestions.
7. Aceptar o descartar cada propuesta; solo una aceptación explícita puede terminar en Idea.
