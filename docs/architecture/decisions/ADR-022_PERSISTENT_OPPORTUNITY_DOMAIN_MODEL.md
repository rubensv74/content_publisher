# ADR-022 — Opportunity como entidad persistente propia

**Estado:** Aceptado  
**Fecha:** 2026-08-10  
**Gate:** AG-017  
**Decisión:** representar `Opportunity` como entidad persistente propia, relacionada many-to-many con `source_signals`.

## Contexto

Opportunity Radar ya puede registrar señales tecnológicas externas como `source_signals`. El siguiente paso exige separar un hecho observado de una posibilidad profesional que merece evaluación, seguimiento o trabajo.

Una Opportunity puede permanecer activa durante días o semanas, agrupar varias señales, cambiar de prioridad, entrar en investigación, convertirse en candidato a proyecto, iniciar trabajo real y producir posteriormente un caso de estudio.

Por ello no debe ser un cálculo efímero ni reutilizar la entidad editorial `suggestions`.

## Decisión

Se adopta el siguiente modelo conceptual:

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

Principios semánticos:

```text
Signal      = hecho observado
Opportunity = posibilidad profesional accionable
Suggestion  = propuesta editorial
Idea        = decisión humana de crear contenido
```

## Persistencia

Se crearán dos tablas:

- `opportunities`: identidad, estado, evaluación, prioridad explicable, notas y ciclo de vida;
- `opportunity_source_signals`: relación many-to-many con las señales que justifican una oportunidad.

Ambas conservan `user_id` para aislamiento, RLS e integridad entre entidades pertenecientes al mismo usuario.

## Ciclo de vida

Estados aprobados:

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

Reglas:

- `new`: pendiente de evaluación;
- `shortlisted`: merece atención;
- `researching`: existe investigación real en curso;
- `project_candidate`: existe una propuesta concreta de experimento/proyecto;
- `active`: el trabajo ya ha comenzado;
- `case_study`: existe evidencia suficiente para pasar al futuro dominio de casos de estudio;
- `dismissed`: descartada explícitamente;
- `archived`: conservada como histórico sin trabajo activo.

`active` y `case_study` representan hechos reales, no intención.

## Evaluación y scoring

OR-03 no utilizará API de IA.

Cada Opportunity conservará dimensiones independientes, en escala 1–5:

- relevancia profesional;
- accionabilidad;
- aprendizaje;
- potencial de proyecto;
- potencial de caso de estudio;
- potencial editorial;
- novedad;
- esfuerzo.

La prioridad se derivará mediante una regla determinista y explicable. Las dimensiones se conservan separadas para poder cambiar pesos en el futuro sin perder la evaluación original.

No se usarán embeddings, ML, vector database ni ranking opaco.

## Integridad

1. Una SourceSignal no se transforma físicamente en Opportunity.
2. Una Opportunity puede agrupar varias señales.
3. Una señal puede justificar varias Opportunities.
4. Descartar una Opportunity no elimina señales.
5. Opportunity no crea automáticamente Suggestion ni Idea.
6. Las relaciones deben impedir cruces entre usuarios.
7. RLS se aplica tanto a entidad como a tabla puente.
8. La aplicación filtrará explícitamente por `user_id` además de RLS.

## Coste

Esta decisión cumple `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`:

- usa el PostgreSQL/Supabase ya existente;
- no necesita una API de IA;
- no introduce proveedores nuevos;
- no introduce suscripciones nuevas;
- coste adicional permitido y esperado: **0 EUR**.

## Consecuencias

### Positivas

- historial estable de oportunidades;
- decisiones humanas persistentes;
- trazabilidad completa a las señales originales;
- separación limpia respecto de Suggestion Engine;
- base adecuada para investigación, proyectos y futuros casos de estudio.

### Trade-offs aceptados

- dos tablas adicionales;
- UI y acciones propias;
- mayor disciplina de ciclo de vida.

## Alcance inmediato

OR-03 implementará:

- persistencia y RLS;
- frontera `src/features/opportunities/`;
- alta de Opportunity desde una señal;
- backlog `/opportunities`;
- scoring explicable;
- cambios de estado manuales.

La definición de la futura entidad `CaseStudy` queda fuera de este ADR y requerirá evaluación independiente cuando OR-04 la necesite.