# ADR-022 — Opportunity como entidad persistente propia

**Estado:** Aceptado  
**Fecha:** 2026-08-10  
**Gate:** AG-017  
**Decisión:** representar `Opportunity` como entidad persistente propia, relacionada many-to-many con `source_signals`.

## Contexto

Opportunity Radar ya puede registrar señales tecnológicas externas como `source_signals`. El siguiente paso exige separar un hecho observado de una posibilidad profesional que merece evaluación, seguimiento o trabajo.

Una Opportunity puede permanecer activa durante días o semanas, agrupar varias señales, cambiar de prioridad, entrar en investigación, convertirse en candidato a proyecto, iniciar trabajo real y producir posteriormente un caso de estudio. Por ello no debe ser un cálculo efímero ni reutilizar la entidad editorial `suggestions`.

## Decisión

```text
source_signals
      ↓ N:M
opportunity_source_signals
      ↓
opportunities
      ↓
research / project / evidence
      ↓
future case study
      ↓
suggestion
      ↓
idea
```

```text
Signal      = hecho observado
Opportunity = posibilidad profesional accionable
Suggestion  = propuesta editorial
Idea        = decisión humana de crear contenido
```

## Persistencia

Se crean dos entidades persistentes:

- `opportunities`: identidad, estado, evaluación, prioridad explicable, notas y ciclo de vida;
- `opportunity_source_signals`: relación many-to-many con las señales que justifican una oportunidad.

Ambas conservan `user_id` para aislamiento, RLS e integridad entre entidades pertenecientes al mismo usuario.

## Ciclo de vida

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

`active` y `case_study` representan hechos reales, no intención.

## Evaluación y scoring

OR-03 no utiliza API de IA. Cada Opportunity conserva dimensiones independientes en escala 1–5: relevancia profesional, accionabilidad, aprendizaje, potencial de proyecto, potencial de caso de estudio, potencial editorial, novedad y esfuerzo.

La prioridad se deriva mediante una regla determinista y explicable. No se usan embeddings, ML, vector database ni ranking opaco.

## Integridad

1. SourceSignal no se transforma físicamente en Opportunity.
2. Una Opportunity puede agrupar varias señales.
3. Una señal puede justificar varias Opportunities.
4. Descartar una Opportunity no elimina señales.
5. Opportunity no crea automáticamente Suggestion ni Idea.
6. Las relaciones impiden cruces entre usuarios.
7. RLS se aplica tanto a entidad como a tabla puente.
8. La aplicación filtra explícitamente por `user_id` además de RLS.

## Coste

Cumple `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`: usa el PostgreSQL/Supabase ya existente, no necesita API de IA, no introduce proveedores ni suscripciones y mantiene **0 EUR de coste adicional**.

## Alcance inmediato

OR-03 implementa persistencia y RLS, `src/features/opportunities/`, alta desde señales, backlog `/opportunities`, scoring explicable y cambios de estado manuales.

La futura entidad `CaseStudy` queda fuera de este ADR y deberá evaluarse cuando OR-04 la necesite.