# AG-017 — Modelo y ciclo de vida de Opportunity

**Estado:** Pendiente de decisión  
**Fecha:** 2026-08-10  
**Afecta a:** Opportunity Radar, modelo de dominio, Supabase/PostgreSQL, RLS, trazabilidad y futuros casos de estudio

## Contexto

OR-02 ya permite observar señales tecnológicas externas como `source_signals`.

El siguiente incremento, OR-03, debe distinguir entre:

- una **señal**, que representa un hecho observado;
- una **Opportunity**, que representa una posibilidad profesional que merece evaluación o acción;
- una **Suggestion**, que representa una propuesta editorial;
- una **Idea**, que representa una decisión humana de trabajar contenido.

Una Opportunity puede vivir durante días o semanas, cambiar de prioridad, entrar en investigación, descartarse, convertirse en proyecto o terminar originando un caso de estudio. Por ello, decidir cómo se representa afecta al modelo de dominio y a la persistencia.

No se creará ninguna tabla ni código productivo de OR-03 hasta cerrar este gate.

## Objetivo

Elegir cómo representar y conservar Opportunities sin contaminar `source_signals`, `suggestions` ni `ideas`, manteniendo trazabilidad completa y coste adicional 0 EUR.

## Alternativa A — Opportunity calculada y efímera

No crear una entidad persistente. Cada vez que se abre el radar se calculan oportunidades a partir de señales disponibles.

### Ventajas

- modelo de datos mínimo;
- ninguna tabla nueva;
- implementación inicial rápida.

### Problemas

- se pierde la decisión humana entre sesiones;
- difícil mantener estados de investigación;
- no hay historial estable de oportunidades descartadas;
- el scoring puede cambiar sin trazabilidad;
- complica enlazar después proyectos y casos de estudio;
- obliga a recalcular continuamente.

**Valoración:** insuficiente para el objetivo de Opportunity Radar.

## Alternativa B — Opportunity como entidad persistente propia — RECOMENDADA

Crear una entidad `opportunities` con identidad y ciclo de vida propios y una relación many-to-many con `source_signals` mediante una tabla puente.

```text
source_signals
      ↓ N:M
opportunity_source_signals
      ↓
opportunities
      ↓
revisión / investigación / proyecto
      ↓
case study
      ↓
suggestion
```

### Ventajas

- separación semántica clara;
- una oportunidad puede agrupar varias señales relacionadas;
- conserva decisiones humanas e historial;
- permite priorización y explicación estables;
- facilita investigación y seguimiento;
- prepara OR-04 sin acoplarse a Suggestions;
- trazabilidad completa hasta la fuente original.

### Costes técnicos

- dos tablas nuevas;
- RLS e índices;
- acciones y UI propias;
- reglas explícitas de ciclo de vida.

No introduce ningún coste económico adicional: utiliza el Supabase/PostgreSQL existente y no necesita APIs externas ni IA de pago.

**Valoración:** recomendada.

## Alternativa C — Reutilizar `suggestions` como Opportunities

Representar las oportunidades dentro de la entidad editorial `suggestions`, añadiendo estados y campos adicionales.

### Ventajas

- reutiliza persistencia y UI ya existentes;
- menos tablas.

### Problemas

- mezcla oportunidad profesional con propuesta editorial;
- una oportunidad puede existir aunque nunca vaya a publicarse;
- complica el flujo `Suggestion → Idea` ya aprobado;
- haría más difícil distinguir trabajo, investigación y contenido;
- aumenta acoplamiento entre Opportunity Radar y Content Engine.

**Valoración:** no recomendada.

# Propuesta para la opción B

## Entidades

### `opportunities`

Entidad estable propiedad del usuario.

Campos conceptuales mínimos:

- `id`;
- `user_id`;
- `title`;
- `summary`;
- `relevance_reason`;
- `status`;
- `priority`;
- dimensiones de evaluación;
- notas de investigación;
- marcas temporales;
- motivo de descarte/archivo cuando proceda.

### `opportunity_source_signals`

Relación many-to-many entre Opportunities y señales.

Debe conservar `user_id` también en la relación para reforzar aislamiento y facilitar RLS/integridad entre propietarios.

## Evaluación inicial

Para mantener coste cero, OR-03 no dependerá de una API de IA.

Las dimensiones pueden calcularse o registrarse de forma determinista/manual:

- relevancia profesional;
- accionabilidad;
- potencial de aprendizaje;
- potencial de proyecto;
- potencial de caso de estudio;
- potencial editorial;
- esfuerzo aproximado;
- novedad frente al historial.

La prioridad debe ser explicable. Un único número opaco no será suficiente.

Si en el futuro se quiere asistencia de IA para evaluar, deberá usar el flujo manual mediante ChatGPT Plus establecido en ADR-019 y nunca una API facturable.

## Ciclo de vida propuesto

```text
new
 ├── shortlisted
 │     └── researching
 │            └── project_candidate
 │                    └── active
 │                           └── case_study
 ├── dismissed
 └── archived
```

Interpretación:

- `new`: detectada/creada y pendiente de decisión;
- `shortlisted`: merece atención;
- `researching`: se está investigando;
- `project_candidate`: existe una propuesta concreta de experimento/proyecto;
- `active`: el trabajo ya está en marcha;
- `case_study`: ha producido trabajo/evidencia suficiente para pasar a OR-04;
- `dismissed`: descartada de forma explícita;
- `archived`: conservada históricamente sin trabajo activo.

Los nombres exactos pueden ajustarse al cerrar el gate, pero la separación entre **intención**, **trabajo real** y **resultado demostrable** debe mantenerse.

## Reglas de integridad

1. SourceSignal nunca se convierte físicamente en Opportunity; se relacionan.
2. Una Opportunity puede tener una o varias señales fuente.
3. Una señal puede justificar más de una Opportunity.
4. Opportunity no crea automáticamente Suggestion ni Idea.
5. `active` implica que existe trabajo realmente iniciado.
6. `case_study` no puede significar simplemente “buena idea”; debe existir evidencia real.
7. Descartar una Opportunity no borra las señales originales.
8. RLS debe aislar por usuario tanto entidad como relaciones.
9. No se almacenarán artículos completos ni contenido duplicado de las fuentes.
10. Todo el modelo queda subordinado a `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.

## Scoring propuesto

No se aprueba todavía una fórmula rígida.

Primera aproximación: conservar cada dimensión por separado en una escala pequeña y derivar una prioridad explicable. Esto permite cambiar pesos después sin perder el razonamiento original.

Evitar en esta fase:

- modelos ML;
- embeddings;
- vector database;
- API de IA;
- ranking opaco.

## Consecuencias si se aprueba B

- crear ADR específico;
- crear migración `opportunities` + `opportunity_source_signals`;
- RLS e índices;
- crear `src/features/opportunities/`;
- crear vista `/opportunities` o equivalente dentro del Radar;
- permitir alta desde señales y gestión del backlog;
- OR-04 podrá enlazar después casos de estudio a una Opportunity sin alterar `suggestions`.

## Recomendación

**Opción B — Opportunity como entidad persistente propia + relación many-to-many con Source Signals.**

Es la opción que mejor conserva la separación ya aprobada:

```text
Signal = hecho observado
Opportunity = posibilidad profesional accionable
Suggestion = propuesta editorial
Idea = decisión humana de crear contenido
```

## Criterio de cierre

AG-017 queda cerrado cuando se apruebe A, B o C —o una variante explícita— y se registre el ADR correspondiente.

Hasta entonces OR-03 queda limitado a documentación. No se crearán tablas, migraciones ni código productivo de Opportunities.
