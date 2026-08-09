# Catálogo de arquetipos

Este documento es el índice funcional de las composiciones visuales de Content Publisher.

Estados posibles:

- `research` — idea todavía exploratoria;
- `candidate` — candidata para una versión futura;
- `implemented` — existe una implementación base en el runtime;
- `deprecated` — retirada.

## Estado V1

Los 12 arquetipos seleccionados para V1 disponen ya de una implementación base. Esto no significa que todas sus variantes previstas estén terminadas: V1 prioriza una variante funcional por arquetipo y deja el refinamiento visual para iteraciones posteriores.

Build Note existe además como arquetipo editorial operativo fuera de los 12 seleccionados originalmente.

---

## Editorial

### ED-01 — Bold Statement

**Objetivo:** presentar una idea fuerte con muy pocos elementos.

Contenido principal:

- titular;
- apoyo breve;
- insight/aprendizaje;
- firma.

Implementación runtime: `bold-statement`.  
Variante base: `light`.  
Estado: `implemented`.

### ED-02 — Minimal Editorial

**Objetivo:** reflexión o aprendizaje con mayor espacio en blanco y jerarquía tipográfica.

No forma parte de la selección V1 de 12 arquetipos.  
Estado: `research`.

### ED-03 — Metric Hero

**Objetivo:** utilizar una cifra o dato como puerta de entrada a la historia.

Inputs especializados:

- valor principal;
- etiqueta;
- delta opcional;
- contexto opcional.

Implementación runtime: `metric-hero`.  
Variante base: `single-metric`.  
Estado: `implemented`.

---

## Product / Screenshot

### PR-01 — Hero Screenshot

**Objetivo:** hacer que la pantalla o producto sea el protagonista.

Requiere asset `hero`.

Implementación runtime: `hero-screenshot`.  
Variante base: `framed`.  
Estado: `implemented`.

### PR-02 — Split Screenshot

**Objetivo:** combinar captura y explicación en zonas claramente separadas.

Requiere asset `hero`.

Implementación runtime: `split-screenshot`.  
Variante base: `left-right`.  
Estado: `implemented`.

### PR-03 — Annotated Screenshot

**Objetivo:** explicar varios puntos de una interfaz mediante marcadores y anotaciones controladas.

Requiere:

- asset `hero`;
- una o más anotaciones con etiqueta y coordenadas porcentuales.

Implementación runtime: `annotated-screenshot`.  
Variante base: `numbered`.  
Estado: `implemented`.

### PR-04 — Before / After

**Objetivo:** mostrar de forma inmediata la evolución de una interfaz, arquitectura o resultado.

Requiere:

- asset `before`;
- asset `after`;
- etiquetas de ambos estados;
- resumen opcional del cambio.

Implementación runtime: `before-after`.  
Variante base: `split`.  
Estado: `implemented`.

---

## Technical

### TE-01 — Architecture Flow

**Objetivo:** explicar componentes, etapas o relaciones de una solución.

Implementación runtime: `architecture-flow`.  
Variante base implementada: flujo estructurado.  
Estado: `implemented`.

### TE-02 — Code Focus

**Objetivo:** mostrar una pequeña pieza de código con contexto y explicación, evitando capturas ilegibles del IDE.

Inputs especializados:

- lenguaje;
- snippet;
- líneas destacadas opcionales;
- explicación breve.

Implementación runtime: `code-focus`.  
Variante base: `code-first`.  
Estado: `implemented`.

### TE-03 — Process Steps

**Objetivo:** explicar una secuencia de decisiones o pasos técnicos.

Implementación runtime: `process-steps`.  
Variante base implementada: secuencia estructurada.  
Estado: `implemented`.

---

## Data

### DA-01 — Data Story

**Objetivo:** convertir métricas en una historia visual orientada a significado y decisión.

Inputs especializados:

- título;
- unidad opcional;
- serie de 2–5 categorías y valores;
- insight/takeaway.

Implementación runtime: `data-story`.  
Variante base: `bars`.  
Estado: `implemented`.

---

## Carousel

### CA-01 — Tutorial Sequence

**Objetivo:** enseñar un procedimiento de forma progresiva.

Estructura típica:

1. portada;
2. contexto;
3. exploración;
4. decisión;
5. aprendizaje;
6. cierre.

Implementación runtime: `step-by-step`.  
Salida: PDF + miniatura PNG.  
Estado: `implemented`.

### CA-02 — Case Study

**Objetivo:** contar un proyecto completo desde el contexto hasta el aprendizaje.

Implementación runtime: `case-study`.  
Salida: PDF + miniatura PNG.  
Estado: `implemented`.

### CA-03 — Checklist / Lessons

**Objetivo:** presentar una lista de aprendizajes o recomendaciones en varias páginas.

No forma parte de la selección V1 de 12 arquetipos.  
Estado: `research`.

---

## Arquetipo adicional — Build Note

**Objetivo:** explicar una construcción, decisión y aprendizaje de forma editorial compacta.

Implementación runtime: `build-note`.  
Formato: imagen única 1080 × 1350.  
Estado: `implemented`.

Fue el diseño utilizado en la primera validación end-to-end de Content Publisher.

## Criterio de evolución

Que un arquetipo esté `implemented` significa que existe una composición base funcional, exportable y compatible con el flujo de publicación. Las variantes adicionales, ajustes tipográficos, densidades, paletas y refinamientos de composición seguirán iterándose con contenido real sin modificar la arquitectura del catálogo.
