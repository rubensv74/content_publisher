# AG-015 — Cadencia de generación de Suggestions

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

Con AG-014, Suggestion Engine ya puede trabajar con señales ligeras y enriquecer bajo demanda un conjunto pequeño con contexto efímero de GitHub/Knowledge Base.

La implementación actual genera Suggestions solo cuando el usuario pulsa `Generar sugerencias`. La siguiente decisión arquitectónica es si esta generación debe seguir siendo manual o pasar a ejecutarse automáticamente.

La decisión afecta a infraestructura de ejecución, consumo de APIs, control de costes, observabilidad y riesgo de producir ruido editorial sin interacción humana.

## Opción A — Generación exclusivamente bajo demanda — RECOMENDADA PARA V1

El usuario refresca señales y decide cuándo ejecutar Suggestion Engine.

```text
Refrescar señales
      ↓
revisar disponibilidad
      ↓
Generar sugerencias
      ↓
OpenAI solo en ese momento
```

### Ventajas

- coste de OpenAI totalmente controlable;
- no requiere cron, workers ni webhooks;
- no consume GitHub/OpenAI cuando la aplicación no se usa;
- la acción humana mantiene contexto e intención editorial;
- operación y depuración muy simples;
- ya encaja con la UI existente.

### Inconvenientes

- hay que recordar ejecutar el motor;
- las oportunidades no aparecen solas;
- puede pasar tiempo entre un cambio técnico y su revisión editorial.

**Valoración:** suficiente para una aplicación personal y el volumen actual.

## Opción B — Generación periódica programada

Un job, por ejemplo diario, refresca señales y genera Suggestions automáticamente.

### Ventajas

- bandeja siempre alimentada;
- menor dependencia de recordar el proceso;
- útil si aumenta mucho la actividad de fuentes.

### Inconvenientes

- infraestructura programada adicional;
- consumo recurrente de GitHub y OpenAI aunque no se revise la bandeja;
- requiere autenticación/aislamiento del job y observabilidad;
- más coste y riesgo de generar ruido;
- hay que definir horarios, reintentos y política ante fallos.

## Opción C — Generación event-driven

GitHub u otras fuentes notifican cambios y disparan análisis cerca del momento en que ocurren.

### Ventajas

- baja latencia;
- evita polling periódico;
- escalable para un producto multiusuario o con muchas fuentes.

### Inconvenientes

- webhooks, validación de firmas y endpoints públicos;
- deduplicación/reintentos más complejos;
- mayor superficie de seguridad;
- acoplamiento operativo con cada fuente;
- sobredimensionado para el uso personal actual.

## Recomendación

**Opción A — generación exclusivamente bajo demanda durante V1.**

Mantener el motor manual permite validar primero calidad, utilidad y coste real de las Suggestions. Si el volumen demuestra que existe una necesidad, el servicio de generación ya está desacoplado y podrá invocarse posteriormente desde un scheduler o webhook sin rehacer el modelo de datos.

## Lo que AG-015 no decide

- modelo OpenAI concreto;
- RAG/embeddings;
- tendencias externas;
- publicación automática;
- frecuencia futura si posteriormente se aprueba automatización;
- notificaciones.

## Decisión solicitada

- **A** — generación bajo demanda **(recomendada)**;
- **B** — generación periódica programada;
- **C** — generación event-driven.

La implementación de cron, webhooks o generación automática queda detenida en este gate.
