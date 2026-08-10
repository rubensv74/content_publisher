# Opportunity Radar — Plan incremental

## Estado

Plan preparado el 2026-08-10.

Opportunity Radar se planifica mientras Content Publisher cierra su V1.

**OR-00, OR-01 y OR-02 completados.** El sistema ya dispone de un primer lote de fuentes tecnológicas externas RSS/Atom de coste adicional cero integrado en `source_signals` y ejecutable bajo demanda.

## Objetivo

Construir de forma incremental una cadena que transforme señales tecnológicas externas en oportunidades profesionales accionables y, cuando proceda, en casos de estudio y Suggestions basadas en experiencia real.

```text
External Source
  ↓
Source Signal
  ↓
Opportunity Evaluation
  ↓
Opportunity Backlog
  ↓
Research / Prototype / Project
  ↓
Case Study
  ↓
Suggestion Engine
  ↓
Idea / Publication
```

## Reglas de implementación

- No alterar la arquitectura base aprobada sin gate.
- Coste adicional obligatorio = 0 EUR según `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.
- Reutilizar `src/features/source-signals` para adquisición y normalización de señales.
- Reutilizar `src/features/suggestions` para propuestas editoriales.
- Introducir `opportunities` como frontera funcional propia solo cuando el modelo esté cerrado.
- No mezclar una noticia con una Suggestion ni con una Idea.
- No crear scheduler en el primer incremento.
- No construir un crawler web genérico.
- Cada incremento debe dejar una capacidad utilizable y verificable.
- Las fuentes externas se incorporarán de forma curada y medible.
- Toda experiencia comunicada como propia debe derivar de trabajo realmente realizado.

# Incrementos

## OR-00 — Preparación y gate de arquitectura — COMPLETADO

Se cerró `AG-014` con la opción B: catálogo curado + adaptadores por tipo de fuente bajo política de coste cero.

---

## OR-01 — Catálogo de fuentes y criterios de relevancia — COMPLETADO

Catálogo inicial documentado en `docs/research/OPPORTUNITY_RADAR_SOURCE_CATALOG_V1.md`.

Primer lote aprobado:

- GitHub Changelog;
- Supabase Changelog;
- OpenAI Product Release Notes.

---

## OR-02 — Primeras señales tecnológicas externas — COMPLETADO

### Implementado

- tipo de señal `technology`;
- catálogo técnico versionado de fuentes P0;
- lector propio RSS/Atom sin dependencia npm nueva;
- adaptador de fuentes tecnológicas;
- normalización de título, resumen, fecha, URL y metadatos;
- fingerprint estable y deduplicación mediante la infraestructura existente;
- tolerancia a fallos por fuente: una fuente que falla no impide procesar las demás;
- refresco manual/bajo demanda;
- botón `Refrescar tecnología` en `/signals`;
- visualización diferenciada de señales tecnológicas;
- migración del constraint de `source_signals` aplicada al Supabase real;
- validación de GitHub Actions: lint, typecheck y build correctos.

### Invariantes

- ninguna API comercial;
- ninguna API de IA;
- ninguna dependencia facturable;
- no se almacenan artículos completos;
- fuente original conservada como referencia;
- ejecución manual, sin scheduler.

---

## OR-03 — Opportunity Engine y Opportunity Backlog — SIGUIENTE / BLOQUEADO POR GATE

### Objetivo

Separar `señal interesante` de `oportunidad que merece acción`.

### Alcance previsto

- modelo funcional definitivo de Opportunity;
- persistencia y RLS;
- relación con `source_signals`;
- evaluación inicial;
- prioridad;
- explicación de relevancia;
- estados del backlog;
- acciones humanas: seleccionar, investigar, descartar y archivar;
- vista de backlog.

### Dimensiones iniciales

- relevancia profesional;
- accionabilidad;
- aprendizaje;
- proyecto;
- caso de estudio;
- valor editorial;
- esfuerzo;
- novedad respecto al historial.

### Gate obligatorio

OR-03 introduce una entidad con identidad, persistencia y ciclo de vida propios. Antes de crear tablas o código productivo debe cerrarse el gate arquitectónico específico del modelo de Opportunity.

---

## OR-04 — De oportunidad a caso de estudio

Objetivo: convertir una oportunidad seleccionada en trabajo concreto mediante investigación, experimento, prototipo o proyecto, conservando evidencias y trazabilidad.

---

## OR-05 — Integración con Suggestion Engine

Objetivo: transformar oportunidades y casos reales en propuestas editoriales sin duplicar el motor existente y manteniendo `Suggestion → Idea` como decisión humana explícita.

---

## OR-06 — Radar operativo

Objetivo: consolidar fuentes, señales, oportunidades y casos de estudio en una experiencia coherente, priorizando oportunidades sobre volumen de noticias.

---

## OR-07 — Automatización programada

Solo podrá plantearse tras demostrar valor y mediante un gate específico. Cualquier solución deberá cumplir coste adicional 0 EUR; si no existe una alternativa gratuita segura, el refresco seguirá siendo manual.

# Orden actual

```text
COMPLETADO
  OR-00  arquitectura de fuentes
  OR-01  catálogo
  OR-02  señales externas

GATE ACTUAL
  OR-03  modelo + ciclo de vida de Opportunity

DESPUÉS
  OR-04  casos de estudio
  OR-05  integración editorial
  OR-06  radar consolidado

SOLO SI ES GRATUITO Y APORTA VALOR
  OR-07  scheduler
```

## Criterio de producto

Si el sistema genera muchas señales pero pocas acciones útiles, el problema no se resuelve añadiendo más fuentes. Se reduce ruido, se mejora relevancia y se revisa el scoring.
