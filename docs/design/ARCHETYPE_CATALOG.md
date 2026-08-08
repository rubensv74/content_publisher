# Catálogo de arquetipos

Este documento es el índice funcional de los diseños que Content Publisher podrá implementar. No describe todavía el estilo visual definitivo; define qué problema editorial resuelve cada composición.

## Convención

Cada arquetipo deberá documentar:

- código;
- familia;
- objetivo;
- contenido obligatorio;
- contenido opcional;
- formatos compatibles;
- variantes;
- limitaciones;
- referencias de investigación relacionadas;
- estado: `research`, `candidate`, `approved`, `implemented`, `deprecated`.

---

## Editorial

### ED-01 — Bold Statement

**Objetivo:** presentar una idea fuerte con muy pocos elementos.

Contenido principal:

- categoría o serie;
- titular;
- apoyo breve opcional;
- firma.

Variantes previstas:

- light;
- dark;
- accent block.

Estado: `research`.

### ED-02 — Minimal Editorial

**Objetivo:** reflexión o aprendizaje con mayor espacio en blanco y jerarquía tipográfica.

Estado: `research`.

### ED-03 — Metric Hero

**Objetivo:** utilizar una cifra o dato como puerta de entrada a la historia.

Estado: `research`.

---

## Product / Screenshot

### PR-01 — Hero Screenshot

**Objetivo:** hacer que la pantalla o producto sea el protagonista.

Estado: `research`.

### PR-02 — Split Screenshot

**Objetivo:** combinar captura y explicación en zonas claramente separadas.

Estado: `research`.

### PR-03 — Annotated Screenshot

**Objetivo:** explicar varios puntos de una interfaz mediante marcadores y anotaciones controladas.

Estado: `research`.

### PR-04 — Before / After

**Objetivo:** mostrar de forma inmediata la evolución de una interfaz, arquitectura o resultado.

Estado: `research`.

---

## Technical

### TE-01 — Architecture Flow

**Objetivo:** explicar componentes y relaciones de una solución.

Estado: `research`.

### TE-02 — Code Focus

**Objetivo:** mostrar una pequeña pieza de código con contexto y explicación, evitando capturas ilegibles del IDE.

Estado: `research`.

### TE-03 — Process Steps

**Objetivo:** explicar una secuencia de decisiones o pasos técnicos.

Estado: `research`.

---

## Carousel

### CA-01 — Tutorial Sequence

**Objetivo:** enseñar un procedimiento de forma progresiva.

Estructura típica:

1. portada;
2. contexto;
3. pasos;
4. resultado;
5. aprendizaje o cierre.

Estado: `research`.

### CA-02 — Case Study

**Objetivo:** contar problema, contexto, decisiones, solución y resultado.

Estado: `research`.

### CA-03 — Checklist / Lessons

**Objetivo:** presentar una lista de aprendizajes o recomendaciones en varias páginas.

Estado: `research`.

---

## Criterio para pasar de `research` a `candidate`

Un arquetipo debe demostrar que:

- aporta una composición distinta;
- responde a un caso real de publicación;
- puede reutilizarse con varios temas;
- funciona bien en móvil;
- puede convivir con la identidad global;
- es razonable de implementar de forma paramétrica.

## Nota

La lista puede crecer durante la investigación. El objetivo de la V1 no es implementar todo el catálogo posible, sino seleccionar aproximadamente 12 arquetipos con cobertura editorial suficiente.
