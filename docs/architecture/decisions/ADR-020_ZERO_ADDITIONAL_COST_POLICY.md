# ADR-020 — Política de coste adicional cero

**Estado:** Aceptado  
**Fecha:** 2026-08-10  
**Decisión:** Content Publisher no generará ningún coste económico adicional al usuario.

## Contexto

Content Publisher es un producto personal. El usuario ya dispone de ChatGPT Plus y ha establecido una restricción económica rígida: el desarrollo y la operación de Content Publisher no pueden exigir pagos adicionales, consumo facturado por uso, suscripciones nuevas ni ampliaciones de planes de pago.

Esta restricción prevalece sobre comodidad, automatización, cobertura de fuentes y calidad incremental. Si una capacidad no puede ofrecerse dentro de esta restricción, se reduce, se ejecuta manualmente o se descarta.

## Decisión

Se establece como invariante arquitectónica permanente:

> **Coste adicional permitido para Content Publisher: 0 EUR.**

La regla se aplica a todo el producto, incluyendo:

- APIs;
- modelos de IA;
- fuentes externas;
- agregadores de noticias;
- crawling y scraping gestionado;
- bases de datos;
- almacenamiento;
- hosting;
- ejecución serverless;
- scheduler y cron;
- colas y workers;
- observabilidad;
- analítica;
- publicación;
- servicios SaaS;
- librerías o componentes con licencia de pago.

## Reglas obligatorias

1. No se incorporará ninguna API de pago ni de pago por uso.
2. No se incorporará ningún servicio que requiera tarjeta, crédito prepago o facturación habilitada para funcionar.
3. Se permiten servicios y planes gratuitos únicamente mientras puedan operar sin generar cargos.
4. Si un límite gratuito se alcanza, el sistema debe **fallar cerrado**: detener, degradar o requerir intervención manual; nunca activar capacidad facturable automáticamente.
5. Una fuente que pase de gratuita a pagada se desactiva o sustituye.
6. Una funcionalidad que solo sea viable mediante pago queda fuera de alcance hasta que exista una alternativa gratuita.
7. La automatización nunca tiene prioridad sobre el coste cero. Un paso manual es aceptable si evita gasto.
8. Toda nueva dependencia externa debe incluir una comprobación explícita de coste antes de aprobarse.
9. Ningún gate futuro puede aprobar una excepción económica a esta política sin sustituir formalmente este ADR mediante una decisión explícita del usuario. La intención actual es que esta regla sea permanente.

## ChatGPT Plus e IA

ChatGPT Plus y la API de OpenAI son productos con facturación separada. Por tanto, la suscripción Plus no autoriza a Content Publisher a realizar llamadas programáticas a la API de OpenAI sin coste adicional.

En consecuencia:

- no habrá `OPENAI_API_KEY` en el runtime;
- Content Publisher no dependerá de llamadas de pago a modelos externos;
- cuando sea necesaria capacidad de IA, se utilizará el flujo manual asistido mediante ChatGPT Plus definido en `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`;
- el producto preparará handoffs/contexto estructurado y recibirá resultados estructurados de vuelta cuando sea necesario.

## Consecuencias

### Positivas

- coste operativo adicional predecible: cero;
- ausencia de facturas inesperadas;
- menor dependencia de proveedores;
- arquitectura más disciplinada;
- se priorizan fuentes oficiales, formatos abiertos y capacidades locales.

### Trade-offs aceptados

- algunas tareas requerirán intervención manual;
- habrá menos cobertura que con agregadores comerciales;
- ciertos procesos no podrán ejecutarse en tiempo real;
- algunas fuentes o integraciones quedarán excluidas;
- los límites de los planes gratuitos pueden reducir temporalmente capacidades.

## Patrón de decisión para nuevas capacidades

Antes de incorporar una dependencia externa se comprobará:

```text
¿Puede generar coste adicional?
  ├─ Sí → DESCARTAR / buscar alternativa gratuita
  └─ No
      ↓
¿Puede empezar a cobrar automáticamente al superar un límite?
  ├─ Sí → DESCARTAR o configurar fail-closed verificable
  └─ No
      ↓
¿Es necesaria y sostenible?
  ├─ No → no incorporar
  └─ Sí → puede evaluarse técnicamente
```

## Relación con decisiones anteriores

- `ADR-019` ya cumple esta política para Suggestion Engine mediante ChatGPT Plus y flujo manual.
- Cualquier referencia histórica a una API de IA de pago queda subordinada a `ADR-019` y a este ADR.
- `AG-014` sobre Opportunity Radar debe cerrarse bajo esta política.

## Criterio de cumplimiento

Una implementación incumple este ADR si puede producir siquiera un cargo adicional sin una modificación arquitectónica deliberada. La respuesta correcta ante falta de cuota gratuita es detener o degradar la funcionalidad, no pagar.