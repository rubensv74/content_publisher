# Selección propuesta de arquetipos para V1

Estado: selección de diseño para implementación posterior.

La selección busca cubrir la mayoría de publicaciones profesionales previsibles sin duplicar composiciones. Se priorizan arquetipos reutilizables, legibles en móvil y compatibles con contenido técnico real.

## 12 arquetipos candidatos

### 1. ED-01 — Bold Statement

Uso: idea fuerte, aprendizaje, reflexión, opinión técnica.

Estructura:

- etiqueta de dominio;
- titular dominante;
- apoyo breve opcional;
- serie + firma.

Variantes: light, dark, accent.

### 2. ED-03 — Metric Hero

Uso: resultados, rendimiento, cifras, comparaciones.

Estructura:

- cifra principal;
- contexto;
- explicación;
- micrográfico opcional;
- firma.

Variantes: single metric, metric + delta, metric + mini chart.

### 3. PR-01 — Hero Screenshot

Uso: mostrar una aplicación, pantalla o prototipo.

Estructura:

- titular corto;
- screenshot grande;
- una línea de contexto;
- firma.

Variantes: framed, edge-to-edge, floating.

### 4. PR-02 — Split Screenshot

Uso: explicar una interfaz sin sacrificar contexto.

Estructura:

- bloque de texto;
- screenshot;
- etiqueta de serie;
- firma.

Variantes: left/right, top/bottom.

### 5. PR-03 — Annotated Screenshot

Uso: explicar decisiones de interfaz o funcionalidades.

Estructura:

- screenshot protagonista;
- 2–4 marcadores;
- leyenda breve;
- firma.

Variantes: numbered, focus zones, zoom detail.

### 6. PR-04 — Before / After

Uso: evolución de interfaz, arquitectura, código o proceso.

Estructura:

- estado anterior;
- estado actual;
- cambio principal;
- aprendizaje.

Variantes: split, stacked, carousel reveal.

### 7. TE-01 — Architecture Flow

Uso: explicar cómo se conectan varias piezas.

Estructura:

- pregunta o titular;
- 3–6 nodos;
- relaciones;
- explicación breve;
- firma.

Variantes: vertical flow, layered, hub-and-spoke.

### 8. TE-02 — Code Focus

Uso: SQL, Power Fx, TypeScript, React, Kotlin u otro código.

Estructura:

- problema;
- fragmento corto de código;
- traducción en lenguaje natural;
- aprendizaje.

Variantes: code first, explanation first, before/after code.

### 9. TE-03 — Process Steps

Uso: método de trabajo, proceso, checklist técnico.

Estructura:

- objetivo;
- 3–6 pasos;
- resultado;
- firma.

Variantes: vertical, horizontal, timeline.

### 10. DA-01 — Data Story

Uso: Power BI, análisis, métricas, rendimiento.

Estructura:

- insight principal;
- cifra o gráfico;
- significado;
- decisión o consecuencia.

Variantes: KPI, bar/line, comparison.

### 11. CA-01 — Tutorial Sequence

Uso: explicar cómo hacer algo en varias páginas.

Secuencia típica:

1. portada;
2. problema o resultado esperado;
3. pasos;
4. validación;
5. cierre.

Variantes: short 5-page, standard 7-page, deep 9-page.

### 12. CA-02 — Case Study

Uso: contar un proyecto completo.

Secuencia típica:

1. portada;
2. contexto;
3. problema;
4. restricciones;
5. decisión;
6. solución;
7. resultado;
8. aprendizaje.

Variantes: product, architecture, data.

---

## Familia Data añadida formalmente

La investigación inicial demuestra que datos, Power BI, SQL, métricas de rendimiento y resultados necesitan un tratamiento específico. Por ello se incorpora `Data` como quinta familia de diseño de V1.

Familias de V1:

1. Editorial
2. Product / Screenshot
3. Technical
4. Data
5. Carousel

## Cobertura editorial

| Necesidad | Arquetipo principal |
|---|---|
| reflexión | ED-01 |
| cifra o resultado | ED-03 / DA-01 |
| mostrar app | PR-01 |
| explicar pantalla | PR-02 / PR-03 |
| evolución | PR-04 |
| arquitectura | TE-01 |
| código | TE-02 |
| proceso | TE-03 |
| Power BI / datos | DA-01 |
| tutorial | CA-01 |
| proyecto completo | CA-02 |

## Variación esperada

Con una media de 2–3 variantes útiles por arquetipo, esta selección puede proporcionar aproximadamente 30–40 apariencias sin mantener 40 plantillas completamente independientes.

## Criterio de implementación

No se implementarán los 12 a la vez. Se construirán por bloques y cada uno debe validarse con contenido real antes de considerarse aprobado.

La primera publicación real debería probar, como mínimo:

- una composición editorial;
- una composición con screenshot;
- una composición técnica;
- un carrusel.
