# AG-018 — Modelo de Case Study y evidencias

**Estado:** Pendiente de decisión  
**Fecha:** 2026-08-10  
**Afecta a:** Opportunity Radar, modelo de dominio, Supabase/PostgreSQL, evidencias profesionales, portfolio y futura integración con Suggestion Engine

## Contexto

OR-03 ya separa una señal observada de una Opportunity accionable y permite llevar una Opportunity desde `new` hasta `case_study` únicamente mediante decisiones humanas y trabajo real.

OR-04 debe dar el siguiente paso: representar el trabajo concreto que nace de una Opportunity y conservar evidencias suficientes para distinguir entre:

- una propuesta o intención;
- investigación/trabajo en curso;
- un resultado realmente completado;
- un caso de estudio listo para reutilizar en portfolio o contenido.

Esta decisión afecta al modelo de datos y a la trazabilidad profesional, por lo que no se crearán tablas ni código productivo de Case Study hasta cerrar este gate.

## Objetivo

Elegir un modelo que permita convertir una Opportunity en uno o varios trabajos demostrables sin confundir el plan con la evidencia real y manteniendo coste adicional 0 EUR.

# Alternativa A — Extender `opportunities` con campos de Case Study

Añadir a `opportunities` campos como hipótesis, experimento, resultado, tecnologías, repositorio y evidencias.

### Ventajas

- pocas tablas;
- implementación inicial rápida;
- una sola pantalla/entidad.

### Problemas

- mezcla evaluación de oportunidad con ejecución y evidencia;
- una Opportunity solo podría representar cómodamente un único trabajo;
- el registro crecería con campos que no aplican a todas las oportunidades;
- dificulta reutilizar un mismo caso en portfolio y contenido;
- complica conservar varios experimentos derivados de una misma oportunidad;
- aumenta el acoplamiento de OR-03 con OR-04.

**Valoración:** no recomendada.

---

# Alternativa B — `case_studies` persistente + `case_study_evidence` — RECOMENDADA

Crear un dominio Case Study propio.

```text
source_signals
      ↓
opportunity
      ↓ 1:N
case_studies
      ↓ 1:N
case_study_evidence
```

Una Opportunity puede no producir ningún caso, producir uno o producir varios trabajos independientes.

## `case_studies`

Entidad persistente con identidad y ciclo de vida propios.

Campos conceptuales:

- `id`;
- `user_id`;
- `opportunity_id`;
- `title`;
- `problem_statement`;
- `hypothesis`;
- `proposed_work`;
- `technologies`;
- `demonstrated_skills`;
- `expected_outcome`;
- `actual_outcome`;
- `lessons_learned`;
- `repository_url` opcional;
- `project_url` opcional;
- `status`;
- marcas temporales.

### Relación Opportunity → Case Study

Se propone **1:N**:

```text
1 Opportunity → 0..N Case Studies
1 Case Study  → exactamente 1 Opportunity
```

Motivo: una misma oportunidad tecnológica puede generar más de un experimento o proyecto claramente independiente. No obliga a hacerlo; el caso normal seguirá siendo uno.

## `case_study_evidence`

Cada evidencia se registra por separado y enlaza a un Case Study.

Tipos iniciales propuestos:

- `repository`;
- `commit`;
- `pull_request`;
- `issue`;
- `document`;
- `screenshot`;
- `demo`;
- `deployment`;
- `result`;
- `external_link`.

Campos conceptuales:

- `id`;
- `user_id`;
- `case_study_id`;
- `evidence_type`;
- `label`;
- `url` opcional;
- `notes` opcional;
- `verified_at` opcional;
- marcas temporales.

La evidencia no necesita copiar el contenido original. Conserva referencia y contexto mínimo.

### Ventajas

- separación clara entre oportunidad, trabajo y evidencia;
- una Opportunity puede originar varios casos;
- un caso puede acumular evidencias gradualmente;
- evita un JSONB opaco para elementos con identidad propia;
- facilita portfolio y futuras Suggestions basadas en trabajo real;
- permite definir criterios de finalización comprobables;
- trazabilidad clara hasta Source Signals mediante Opportunity.

### Costes técnicos

- dos tablas nuevas;
- RLS, índices y acciones propias;
- nueva interfaz de Case Studies.

No introduce coste económico adicional: usa exclusivamente el Supabase/PostgreSQL existente.

**Valoración:** recomendada.

---

# Alternativa C — `case_studies` persistente + evidencias embebidas en JSONB

Crear `case_studies` como entidad propia pero guardar todas las evidencias dentro de una columna JSONB.

### Ventajas

- una tabla menos;
- formato flexible;
- implementación sencilla para pocas evidencias.

### Problemas

- cada evidencia deja de tener identidad propia;
- actualización y validación más difíciles;
- peor consulta por tipo de evidencia;
- más difícil enlazar una evidencia posteriormente con publicaciones, portfolio o procesos de verificación;
- el JSONB terminaría representando una colección relacional estable.

**Valoración:** válida para un prototipo muy pequeño, pero menos coherente con la arquitectura relacional ya aprobada.

---

# Ciclo de vida propuesto para Case Study

```text
planned
   ↓
in_progress
   ↓
completed
   ↓
validated
   ↓
publishable
   ↓
archived

planned / in_progress → cancelled
```

Interpretación:

- `planned`: existe un plan concreto, pero el trabajo todavía no ha comenzado;
- `in_progress`: existe trabajo real iniciado;
- `completed`: el trabajo previsto ha terminado y existe un resultado;
- `validated`: resultado y evidencias han sido revisados como suficientes;
- `publishable`: puede alimentar portfolio o Suggestion Engine sin presentar intención como experiencia realizada;
- `cancelled`: se decidió no continuar;
- `archived`: conservado como histórico.

## Regla de verdad profesional

El estado debe controlar qué afirmaciones puede realizar después Content Publisher:

```text
planned      → "quiero explorar / voy a probar"
in_progress  → "estoy trabajando / estoy probando"
completed    → "he realizado"
validated    → "he realizado y puedo demostrarlo"
publishable  → "apto para portfolio/contenido basado en experiencia real"
```

Suggestion Engine no debe tratar `planned` ni `in_progress` como experiencia completada.

# Evidencia y validación

## Criterio propuesto

Un Case Study no puede pasar a `validated` si no cumple simultáneamente:

1. `actual_outcome` no está vacío;
2. existe al menos una evidencia registrada;
3. el usuario realiza una confirmación explícita de validación.

No se requiere una IA para validar.

`publishable` añade una confirmación humana posterior de que el caso puede utilizarse en portfolio o contenido profesional.

# Tecnologías y skills

En OR-04 se propone mantener `technologies` y `demonstrated_skills` como arrays JSONB de strings normalizados, no como tablas maestras todavía.

Justificación:

- son atributos descriptivos variables;
- no necesitan aún identidad, relaciones ni administración propias;
- crear catálogos maestros ahora añadiría complejidad sin una necesidad demostrada.

Si en el futuro se necesitan taxonomías compartidas, filtros globales o skill graph, se abrirá un gate específico.

# Integridad propuesta

1. Cada Case Study pertenece exactamente a una Opportunity y al mismo usuario.
2. Una Opportunity puede tener 0..N Case Studies.
3. Una evidencia pertenece exactamente a un Case Study y al mismo usuario.
4. Eliminar/archivar un Case Study no elimina la Opportunity ni sus Source Signals.
5. Una Opportunity no pasa automáticamente a `case_study` por crear un Case Study; el ciclo de vida debe reflejar hechos reales.
6. `validated` requiere resultado + evidencia + confirmación humana.
7. `publishable` requiere `validated` previo.
8. Case Study no crea automáticamente Suggestion ni Idea.
9. RLS e integridad compuesta por `user_id` se aplican a ambas tablas.
10. Las URLs externas son referencias; no se copiarán repositorios, documentos o páginas completas.

# Coste

Todas las alternativas deben cumplir `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.

La opción B recomendada utiliza:

- Supabase/PostgreSQL ya existente;
- enlaces a GitHub, demos o documentación ya disponible;
- almacenamiento solo si ya está cubierto por el plan gratuito actual y es necesario;
- ninguna API de IA;
- ningún servicio de verificación de pago.

**Coste adicional: 0 EUR.**

# Consecuencias si se aprueba B

OR-04 podrá implementar:

- `case_studies`;
- `case_study_evidence`;
- RLS e integridad por usuario;
- `src/features/case-studies/`;
- creación desde Opportunity;
- workspace `/case-studies`;
- estados controlados;
- registro de evidencias;
- validación explícita;
- preparación para OR-05 sin acoplarse todavía a Suggestion Engine.

# Recomendación

**Opción B — Case Study persistente + evidencias persistentes separadas, con relación Opportunity 1:N.**

Es la opción que conserva mejor la cadena de verdad:

```text
Signal = ocurrió algo
Opportunity = merece investigar/actuar
Case Study = trabajo concreto realizado o en ejecución
Evidence = prueba/referencia del trabajo
Suggestion = historia potencial que podría contarse
```

# Criterio de cierre

AG-018 queda cerrado cuando el usuario apruebe A, B o C —o una variante explícita—. Hasta entonces OR-04 queda limitado a documentación y no se crearán tablas ni código productivo de Case Study.