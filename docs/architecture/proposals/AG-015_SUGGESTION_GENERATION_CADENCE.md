# AG-015 — Cadencia de generación de Suggestions

**Estado:** Aprobado — Opción A  
**Fecha:** 2026-08-09  
**ADR:** `ADR-018_SUGGESTION_GENERATION_ON_DEMAND.md`

## Decisión

Suggestion Engine continuará ejecutándose **exclusivamente bajo demanda durante V1**.

La aplicación no incorporará cron, workers recurrentes ni webhooks que generen Suggestions sin una acción explícita del usuario.

```text
Usuario pulsa Generar sugerencias
      ↓
refresco de fuentes
      ↓
prefiltro
      ↓
contexto efímero cuando aplica
      ↓
SuggestionModel
      ↓
Suggestions persistentes
      ↓
revisión humana
```

El refresco de señales puede formar parte de la misma acción manual. Esto no convierte el motor en automático: GitHub/OpenAI solo se consumen cuando el usuario inicia expresamente la ejecución.

## Motivo

Para una aplicación personal y el volumen actual, la generación bajo demanda ofrece el mejor equilibrio entre utilidad, coste y simplicidad operativa. Antes de introducir automatización conviene observar la calidad de las Suggestions, la frecuencia real de uso y el consumo de API.

## Consecuencias

- coste de OpenAI controlado por acción humana;
- sin infraestructura de scheduling;
- sin consumo recurrente cuando la aplicación no se utiliza;
- sin endpoints de webhook adicionales;
- el servicio de generación permanece desacoplado para permitir automatización futura si aparece una necesidad real;
- la revisión humana continúa siendo obligatoria.

## Implementación derivada

La acción `Generar sugerencias` puede refrescar primero las fuentes locales y externas y, a continuación, analizar las señales elegibles. Si el refresco externo falla, el motor puede degradar de forma segura a las señales ya disponibles y advertirlo en la interfaz.

## Alternativas descartadas para V1

### B — Generación periódica programada

Se pospone porque introduciría scheduler, autenticación de jobs, reintentos, observabilidad y consumo recurrente sin evidencia de necesidad.

### C — Event-driven mediante webhooks

Se pospone porque añade endpoints públicos, firmas, reintentos y acoplamiento operativo a las fuentes, sobredimensionado para el uso personal actual.

## Fuera de alcance

AG-015 no decide:

- modelo OpenAI concreto;
- RAG/embeddings;
- tendencias externas;
- publicación automática;
- frecuencia futura si posteriormente se aprueba automatización;
- notificaciones;
- política de observabilidad y control económico de las ejecuciones de IA.

La observabilidad/coste pasa a evaluarse por separado en AG-016.
