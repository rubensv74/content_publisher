# Opportunity Radar — Plan incremental

## Estado

Plan preparado el 2026-08-10.

Opportunity Radar se planifica mientras Content Publisher cierra su V1. La preparación documental y el backlog pueden avanzar ahora, pero la implementación del rastreo externo queda bloqueada hasta cerrar `AG-014_OPPORTUNITY_RADAR_EXTERNAL_SOURCES.md`.

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

## OR-00 — Preparación y gate de arquitectura

### Objetivo

Cerrar el terreno antes de implementar.

### Incluye

- concepto funcional de Opportunity Radar;
- relación con Source Signals y Suggestion Engine;
- AG-014 sobre estrategia de fuentes externas;
- backlog inicial;
- criterios de aceptación globales.

### Salida

Arquitectura propuesta y trabajo ordenado sin contaminar la V1.

### Gate

`AG-014` debe estar aprobado antes de OR-02.

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
- criterios para dar de alta o retirar una fuente;
- reglas de relevancia profesional.

### Salida

Un catálogo pequeño y de alta calidad suficiente para probar el radar.

### Criterio

No comenzar con decenas de fuentes. El primer lote debe permitir validar el flujo, no maximizar cobertura.

---

## OR-02 — Primeras señales tecnológicas externas

### Objetivo

Hacer que fuentes externas produzcan `source_signals` compatibles con el sistema existente.

### Incluye

- extensión controlada de tipos de fuente;
- catálogo de fuentes en configuración o persistencia según decisión final;
- primer adaptador estructurado;
- normalización;
- fingerprint y deduplicación;
- refresco manual/bajo demanda;
- trazabilidad a fuente original;
- manejo básico de errores.

### Fuera de alcance

- scheduler;
- scraping generalista;
- scoring de oportunidades;
- creación automática de Suggestions.

### Salida

Una actualización real de una fuente tecnológica puede aparecer en `/signals` como señal externa explicable y deduplicada.

---

## OR-03 — Opportunity Engine y Opportunity Backlog

### Objetivo

Separar `señal interesante` de `oportunidad que merece acción`.

### Incluye

- modelo funcional definitivo de Opportunity;
- persistencia y RLS;
- relación many-to-many con `source_signals` si procede;
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

### Salida

El usuario puede revisar pocas oportunidades priorizadas y decidir cuáles merecen tiempo.

### Gate posible

Si la persistencia propuesta introduce un cambio relevante en el modelo de dominio, registrar ADR antes de la migración.

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
- conversión normal `Suggestion → Idea` ya existente.

### Salida

Suggestion Engine puede explicar que una propuesta nace de una oportunidad detectada y, cuando corresponda, de un proyecto/caso realizado.

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

Eliminar el refresco manual solo cuando el radar ya haya demostrado utilidad.

### Requiere nuevo gate

Antes de implementar se decidirá:

- mecanismo de scheduler;
- frecuencia por fuente;
- límites de ejecución;
- timeouts;
- reintentos;
- observabilidad;
- alertas;
- costes;
- comportamiento ante fallos repetidos.

### Salida

Las fuentes se revisan automáticamente con una frecuencia controlada.

# Orden recomendado

```text
AHORA
  OR-00  documentación + gate
  OR-01  catálogo e investigación

TRAS APROBAR AG-014
  OR-02  señales externas
  OR-03  oportunidades
  OR-04  casos de estudio
  OR-05  integración editorial
  OR-06  radar consolidado

DESPUÉS DE VALIDAR EL VALOR
  OR-07  scheduler
```

## Dependencias con V1

Content Publisher está en Release Candidate de V1. Opportunity Radar no debe introducir cambios que retrasen el cierre de la V1.

Por tanto:

- documentación, investigación e issues pueden prepararse ahora;
- cualquier cambio de código se desarrollará como trabajo posterior a V1 o de forma aislada sin comprometer el checklist de release;
- la validación pública final de V1 mantiene prioridad sobre nuevas capacidades.

## Criterios de éxito del primer ciclo

El primer ciclo de Opportunity Radar se considerará validado cuando:

1. al menos una fuente tecnológica externa produzca señales reales y deduplicadas;
2. una señal pueda convertirse en una Opportunity explicable;
3. una Opportunity pueda transformarse en un caso de estudio concreto;
4. el caso pueda alimentar Suggestion Engine sin crear contenido ficticio;
5. el usuario pueda rechazar cualquier paso sin que el sistema fuerce la cadena;
6. exista trazabilidad completa desde la fuente hasta la Suggestion/Idea resultante.

## Criterio de producto

Si el sistema genera muchas señales pero pocas acciones útiles, el problema no se resuelve añadiendo más fuentes. Se reduce ruido, se mejora relevancia y se revisa el scoring.