# Opportunity Radar — Plan incremental

## Estado

Plan preparado el 2026-08-10.

**OR-00, OR-01, OR-02 y OR-03 completados.** El sistema ya puede observar señales tecnológicas externas, convertirlas en Opportunities persistentes, agrupar varias señales bajo una misma oportunidad, evaluarlas con scoring explicable y gestionar su ciclo de vida en un backlog propio.

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
- `opportunities` es una frontera funcional propia según `ADR-022_PERSISTENT_OPPORTUNITY_DOMAIN_MODEL.md`.
- No mezclar una noticia con una Opportunity, Suggestion ni Idea.
- No crear scheduler antes de demostrar valor.
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

Primer lote aprobado: GitHub Changelog, Supabase Changelog y OpenAI Product Release Notes.

---

## OR-02 — Primeras señales tecnológicas externas — COMPLETADO

Implementado el tipo `technology`, catálogo técnico P0, lector RSS/Atom propio, adaptador de fuentes tecnológicas, normalización, fingerprint/deduplicación, tolerancia a fallos, refresco manual y visualización en `/signals`.

Invariantes: sin API comercial, sin API de IA, sin dependencia facturable, sin scheduler y sin almacenar artículos completos.

---

## OR-03 — Opportunity Engine y Opportunity Backlog — COMPLETADO

### Decisión arquitectónica

`AG-017` cerrado con opción B y registrado en `ADR-022_PERSISTENT_OPPORTUNITY_DOMAIN_MODEL.md`.

### Implementado

- tabla `opportunities` con identidad y ciclo de vida propios;
- tabla puente `opportunity_source_signals` many-to-many;
- RLS e integridad por usuario;
- índices de consulta y cobertura de claves foráneas;
- dimensiones 1–5 persistidas por separado;
- `priority_score` y `priority` calculados de forma determinista en PostgreSQL;
- frontera `src/features/opportunities/`;
- creación de Opportunity desde una Source Signal;
- vinculación de señales adicionales a Opportunities existentes;
- backlog `/opportunities`;
- edición de evaluación, motivo de relevancia y notas de investigación;
- transiciones de estado controladas por dominio;
- navegación propia dentro de Content Publisher.

### Ciclo de vida

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

### Validación

- migraciones aplicadas al Supabase real;
- RLS verificado en ambas tablas;
- columnas calculadas verificadas;
- Supabase Advisor sin nuevos avisos de seguridad atribuibles a OR-03;
- avisos de claves foráneas introducidos por OR-03 corregidos con índices específicos;
- GitHub Actions `Quality`: lint, typecheck y build correctos.

### Coste

0 EUR adicionales. No se utiliza IA, embeddings, vector database ni servicio externo nuevo.

---

## OR-04 — De oportunidad a caso de estudio — SIGUIENTE / BLOQUEADO POR GATE

Objetivo: convertir una oportunidad seleccionada en trabajo concreto mediante investigación, experimento, prototipo o proyecto, conservando evidencias y trazabilidad.

OR-04 introduce el concepto de Case Study con identidad y evidencias propias, por lo que requiere cerrar un gate arquitectónico antes de crear nuevas tablas o código productivo.

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
  OR-03  Opportunity Engine + Backlog

GATE ACTUAL
  OR-04  modelo de Case Study y evidencias

DESPUÉS
  OR-05  integración editorial
  OR-06  radar consolidado

SOLO SI ES GRATUITO Y APORTA VALOR
  OR-07  scheduler
```

## Criterio de producto

Si el sistema genera muchas señales pero pocas acciones útiles, el problema no se resuelve añadiendo más fuentes. Se reduce ruido, se mejora relevancia y se revisa el scoring.