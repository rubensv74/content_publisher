# ADR-018 — Generación de Suggestions exclusivamente bajo demanda

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-015  
**Decisión aprobada:** Opción A

## Contexto

Suggestion Engine ya puede adquirir señales, enriquecer de forma efímera un subconjunto desde GitHub/Knowledge Base, generar candidatos mediante `SuggestionModel` y persistir Suggestions para revisión humana.

Faltaba decidir si ese proceso debía ejecutarse automáticamente o únicamente cuando el usuario quisiera analizar oportunidades editoriales.

## Decisión

Durante V1, la generación será exclusivamente **on-demand**.

```text
acción explícita del usuario
      ↓
refresco de señales
      ↓
prefiltro
      ↓
SourceContextResolver
      ↓
SuggestionModel
      ↓
suggestions
```

No se desplegarán cron jobs, workers recurrentes ni webhooks de generación automática.

## Frontera de la decisión

Una única acción manual puede orquestar varias operaciones —por ejemplo refrescar señales y generar Suggestions— sin dejar de ser bajo demanda. La frontera es que ninguna de esas operaciones arranca sin una acción explícita del usuario.

## Motivos

- aplicación personal y de bajo volumen;
- coste de OpenAI fácil de controlar;
- GitHub/OpenAI no se consumen mientras la aplicación no se usa;
- todavía hay que evaluar la utilidad editorial real de las Suggestions;
- no existe evidencia que justifique infraestructura de scheduling o eventos;
- el servicio de generación ya está desacoplado y podría ser invocado por otro trigger en el futuro.

## Comportamiento V1

1. El usuario pulsa `Generar sugerencias`.
2. La aplicación refresca señales locales.
3. Intenta refrescar las fuentes GitHub configuradas.
4. Si el refresco externo falla, puede continuar con señales previamente disponibles y muestra una advertencia.
5. Selecciona únicamente señales elegibles.
6. Enriquecerá como máximo el subconjunto definido en ADR-017.
7. Llama a `SuggestionModel` una sola vez por acción.
8. Persiste las Suggestions y vuelve a la bandeja de revisión.

## Coste y control

La cadencia manual se suma a las protecciones ya aprobadas:

- hasta 20 señales ligeras por ejecución;
- hasta 6 señales enriquecidas;
- hasta 5 Suggestions;
- contexto acotado;
- modelo configurable;
- ninguna generación recurrente.

La política de observabilidad histórica y control económico se decide separadamente.

## Consecuencias positivas

- infraestructura mínima;
- comportamiento fácil de entender y depurar;
- gasto ligado a una acción consciente;
- ausencia de ruido editorial generado en segundo plano;
- no se introducen endpoints o procesos adicionales.

## Costes aceptados

- el usuario debe iniciar el análisis;
- las oportunidades no aparecen automáticamente;
- puede existir retraso entre un cambio técnico y su revisión editorial.

## Evolución futura

Pasar a scheduler o eventos requerirá un nuevo gate porque modifica ejecución, coste, seguridad y operación. La lógica interna de generación no debería necesitar reescritura.

## Fuera de alcance

Este ADR no decide:

- modelo OpenAI concreto;
- presupuesto monetario;
- persistencia de métricas de uso de IA;
- tendencias externas;
- notificaciones;
- publicación automática.
