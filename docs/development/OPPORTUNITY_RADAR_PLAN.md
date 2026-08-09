# Opportunity Radar — Plan incremental

## Estado

Plan preparado el 2026-08-10.

`AG-014` está cerrado con **Opción B — catálogo curado + adaptadores por tipo de fuente**. La implementación queda sometida a `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`: **Content Publisher debe funcionar con 0 EUR de coste adicional**.

## Restricción económica permanente

Esta regla tiene prioridad sobre cobertura, automatización y comodidad:

> **Ningún incremento de Opportunity Radar puede requerir pagos adicionales, consumo facturado por uso, ampliaciones de plan o APIs comerciales.**

Consecuencias prácticas:

- solo fuentes gratuitas;
- no OpenAI API ni otras APIs de IA facturables;
- ChatGPT Plus se utiliza mediante handoff manual cuando se necesite IA;
- no agregadores comerciales;
- no billing habilitado para ampliar cuotas;
- al alcanzar un límite gratuito, el sistema se detiene o degrada;
- si una fuente deja de ser gratuita, se elimina o sustituye;
- un proceso manual es preferible a una automatización de pago.

## Objetivo

Construir de forma incremental una cadena que transforme señales tecnológicas externas en oportunidades profesionales accionables y, cuando proceda, en casos de estudio y Suggestions basadas en experiencia real.

```text
External Source gratuita
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
- Cumplir siempre `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.
- Reutilizar `src/features/source-signals` para adquisición y normalización de señales.
- Reutilizar `src/features/suggestions` para propuestas editoriales.
- Reutilizar `ADR-019` para cualquier razonamiento de IA mediante ChatGPT Plus y flujo manual.
- Introducir `opportunities` como frontera funcional propia solo cuando el modelo esté cerrado.
- No mezclar una noticia con una Suggestion ni con una Idea.
- No crear scheduler en el primer incremento.
- No construir un crawler web genérico.
- Cada incremento debe dejar una capacidad utilizable y verificable.
- Las fuentes externas se incorporarán de forma curada y medible.
- Toda experiencia comunicada como propia debe derivar de trabajo realmente realizado.

# Incrementos

## OR-00 — Preparación y gate de arquitectura — COMPLETADO

Incluye:

- concepto funcional de Opportunity Radar;
- relación con Source Signals y Suggestion Engine;
- AG-014 cerrado con Opción B;
- ADR-020 de coste adicional cero;
- ADR-021 de fuentes externas curadas y gratuitas;
- backlog inicial.

### Salida

Arquitectura aprobada para avanzar sin introducir costes adicionales.

---

## OR-01 — Catálogo de fuentes y criterios de relevancia

### Objetivo

Definir qué merece ser observado antes de construir adaptadores.

### Incluye

- catálogo inicial de fuentes candidatas;
- clasificación por área profesional;
- tipo técnico de acceso disponible;
- prioridad;
- frecuencia razonable de cambio;
- calidad y autoridad de la fuente;
- condiciones de uso relevantes;
- verificación explícita de coste adicional cero;
- verificación de que no exige billing habilitado;
- criterios para dar de alta o retirar una fuente;
- reglas de relevancia profesional.

### Criterio obligatorio

Una fuente con coste, riesgo de cobro o necesidad de ampliar plan queda fuera del catálogo.

### Salida

Un catálogo pequeño, gratuito y de alta calidad suficiente para probar el radar.

---

## OR-02 — Primeras señales tecnológicas externas

### Objetivo

Hacer que fuentes externas gratuitas produzcan `source_signals` compatibles con el sistema existente.

### Incluye

- extensión controlada de tipos de fuente;
- catálogo de fuentes;
- primer adaptador estructurado gratuito;
- normalización;
- fingerprint y deduplicación;
- refresco manual/bajo demanda;
- trazabilidad a fuente original;
- manejo básico de errores;
- comportamiento fail-closed ante límites gratuitos.

### Fuera de alcance

- scheduler;
- scraping generalista;
- scoring con APIs de IA;
- creación automática de Suggestions.

### Salida

Una actualización real de una fuente tecnológica gratuita puede aparecer en `/signals` como señal externa explicable y deduplicada.

---

## OR-03 — Opportunity Engine y Opportunity Backlog

### Objetivo

Separar `señal interesante` de `oportunidad que merece acción`.

### Incluye

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

La evaluación determinista se prioriza. Si se necesita interpretación avanzada, se usa el handoff manual de ChatGPT Plus, nunca una API facturable.

### Salida

El usuario puede revisar pocas oportunidades priorizadas y decidir cuáles merecen tiempo.

---

## OR-04 — De oportunidad a caso de estudio

### Objetivo

Convertir una oportunidad seleccionada en trabajo concreto.

### Incluye

- propuesta de investigación/experimento;
- problema;
- hipótesis o pregunta;
- alcance del prototipo;
- tecnología implicada;
- conocimientos demostrables;
- evidencias de finalización;
- posible repositorio destino;
- estado del caso de estudio;
- enlace bidireccional entre oportunidad y caso.

### Salida

Una oportunidad deja de ser consumo pasivo y se convierte en una acción profesional concreta.

---

## OR-05 — Integración con Suggestion Engine

### Objetivo

Transformar oportunidades y casos reales en propuestas editoriales sin duplicar el motor existente.

### Incluye

- contexto adicional para Suggestion Engine;
- distinguir contenido de análisis frente a contenido de experiencia propia;
- priorizar casos de estudio completados;
- mantener referencias a señales y oportunidad original;
- deduplicar contra historial editorial;
- conversión normal `Suggestion → Idea`;
- reutilización del flujo manual ChatGPT Plus de ADR-019.

### Salida

Suggestion Engine puede explicar que una propuesta nace de una oportunidad detectada y, cuando corresponda, de un proyecto/caso realizado sin consumir una API de pago.

---

## OR-06 — Radar operativo

### Objetivo

Consolidar la experiencia de uso.

### Incluye

- dashboard/resumen del radar;
- fuentes activas y salud básica;
- señales recientes;
- oportunidades nuevas;
- backlog;
- casos de estudio en curso;
- filtros por área;
- explicación del scoring;
- métricas de utilidad.

### Salida

Opportunity Radar funciona como una capacidad coherente y no como varias pantallas aisladas.

---

## OR-07 — Automatización programada

### Objetivo

Eliminar parte del refresco manual **solo si existe una solución gratuita y verificablemente incapaz de generar cargos**.

### Requiere nuevo gate

Antes de implementar se decidirá:

- mecanismo gratuito de scheduler;
- frecuencia compatible con límites gratuitos;
- límites de ejecución;
- timeouts;
- reintentos;
- observabilidad sin coste;
- comportamiento ante fallos repetidos;
- protección frente a cobro o ampliación automática.

### Regla de descarte

Si no existe una opción sostenible con coste adicional cero, **OR-07 no se implementa y el refresco permanece manual**.

# Orden recomendado

```text
COMPLETADO
  OR-00  documentación + gate + política 0 EUR

SIGUIENTE
  OR-01  catálogo gratuito e investigación

DESPUÉS
  OR-02  señales externas gratuitas
  OR-03  oportunidades
  OR-04  casos de estudio
  OR-05  integración editorial con ChatGPT Plus manual
  OR-06  radar consolidado

SOLO SI ES GRATIS
  OR-07  scheduler
```

## Dependencias con V1

Content Publisher está en Release Candidate de V1. Opportunity Radar no debe introducir cambios que retrasen el cierre de la V1.

## Criterios de éxito del primer ciclo

El primer ciclo se considera validado cuando:

1. al menos una fuente tecnológica gratuita produce señales reales y deduplicadas;
2. una señal puede convertirse en una Opportunity explicable;
3. una Opportunity puede transformarse en un caso de estudio concreto;
4. el caso puede alimentar Suggestion Engine mediante el flujo sin API de pago;
5. el usuario puede rechazar cualquier paso;
6. existe trazabilidad completa desde la fuente hasta la Suggestion/Idea;
7. el coste económico adicional observado y potencial es 0 EUR.

## Criterio de producto

Si el sistema genera muchas señales pero pocas acciones útiles, no se resuelve comprando mejores fuentes ni más capacidad. Se reduce ruido, se mejora relevancia y se revisa el diseño dentro de la restricción de coste cero.