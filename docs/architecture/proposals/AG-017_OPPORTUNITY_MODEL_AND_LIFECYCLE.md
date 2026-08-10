# AG-017 — Modelo y ciclo de vida de Opportunity

**Estado:** Aprobado — Opción B  
**Fecha:** 2026-08-10  
**Afecta a:** Opportunity Radar, modelo de dominio, Supabase/PostgreSQL, RLS, trazabilidad y futuros casos de estudio  
**ADR resultante:** `ADR-022_PERSISTENT_OPPORTUNITY_DOMAIN_MODEL.md`

## Decisión

El usuario aprueba explícitamente **Opción B — Opportunity como entidad persistente propia + relación many-to-many con Source Signals**.

```text
source_signals
      ↓ N:M
opportunity_source_signals
      ↓
opportunities
      ↓
revisión / investigación / proyecto
      ↓
future case study
      ↓
suggestion
```

La separación semántica queda fijada así:

```text
Signal      = hecho observado
Opportunity = posibilidad profesional accionable
Suggestion  = propuesta editorial
Idea        = decisión humana de crear contenido
```

## Entidades aprobadas

### `opportunities`

Entidad estable propiedad del usuario. Conserva:

- identidad;
- título y resumen;
- motivo de relevancia;
- estado;
- dimensiones de evaluación;
- prioridad derivada de forma explicable;
- notas de investigación;
- motivo de descarte cuando proceda;
- marcas temporales.

### `opportunity_source_signals`

Relación many-to-many entre Opportunities y señales. Conserva `user_id` para reforzar aislamiento, RLS e integridad entre propietarios.

## Ciclo de vida aprobado

```text
new
shortlisted
researching
project_candidate
active
case_study
dismissed
archived
```

`active` implica trabajo realmente iniciado. `case_study` exige evidencia real y no puede utilizarse como sinónimo de “buena idea”.

## Evaluación

OR-03 no dependerá de ninguna API de IA. Las dimensiones se conservarán por separado en escala 1–5:

- relevancia profesional;
- accionabilidad;
- aprendizaje;
- potencial de proyecto;
- potencial de caso de estudio;
- potencial editorial;
- novedad;
- esfuerzo.

La prioridad será derivada mediante una regla determinista y visible. No se utilizarán ML, embeddings, vector database ni ranking opaco.

## Reglas de integridad

1. SourceSignal nunca se convierte físicamente en Opportunity; se relacionan.
2. Una Opportunity puede tener una o varias señales fuente.
3. Una señal puede justificar más de una Opportunity.
4. Opportunity no crea automáticamente Suggestion ni Idea.
5. Descartar una Opportunity no borra las señales originales.
6. RLS debe aislar por usuario tanto entidad como relaciones.
7. No se almacenarán artículos completos ni contenido duplicado de las fuentes.
8. Todo el modelo queda subordinado a `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.

## Coste

La opción aprobada utiliza exclusivamente el Supabase/PostgreSQL ya existente y mantiene el invariante de **0 EUR de coste adicional**.

## Cierre

AG-017 queda cerrado. OR-03 puede implementar tablas, migraciones, RLS, módulo `src/features/opportunities`, backlog y acciones de usuario conforme a `ADR-022`.