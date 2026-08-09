# Selección de arquetipos para V1

Estado: **selección cerrada — 12/12 con implementación base runtime**.

La selección cubre la mayoría de publicaciones profesionales previsibles sin duplicar composiciones. Se priorizan arquetipos reutilizables, legibles en móvil y compatibles con contenido técnico real.

> `implemented` en V1 significa que existe al menos una variante funcional integrada en Content Studio, con preview y exportación final. Las variantes adicionales previstas siguen siendo trabajo de refinamiento, no nuevos arquetipos.

## 12 arquetipos V1

| Código | Arquetipo | Familia | Runtime | Variante base V1 | Estado |
|---|---|---|---|---|---|
| ED-01 | Bold Statement | Editorial | `bold-statement` | `light` | Implementado |
| ED-03 | Metric Hero | Editorial | `metric-hero` | `single-metric` | Implementado |
| PR-01 | Hero Screenshot | Product | `hero-screenshot` | `framed` | Implementado |
| PR-02 | Split Screenshot | Product | `split-screenshot` | `left-right` | Implementado |
| PR-03 | Annotated Screenshot | Product | `annotated-screenshot` | `numbered` | Implementado |
| PR-04 | Before / After | Product | `before-after` | `split` | Implementado |
| TE-01 | Architecture Flow | Technical | `architecture-flow` | base | Implementado |
| TE-02 | Code Focus | Technical | `code-focus` | `code-first` | Implementado |
| TE-03 | Process Steps | Technical | `process-steps` | base | Implementado |
| DA-01 | Data Story | Data | `data-story` | `bars` | Implementado |
| CA-01 | Tutorial Sequence | Carousel | `step-by-step` | base | Implementado |
| CA-02 | Case Study | Carousel | `case-study` | base | Implementado |

Además existe `build-note` como arquetipo editorial adicional operativo utilizado en la primera demo end-to-end.

## Uso editorial

### ED-01 — Bold Statement

Idea fuerte, aprendizaje, reflexión u opinión técnica. El titular es el elemento dominante.

### ED-03 — Metric Hero

Resultados, rendimiento, cifras y comparaciones. La métrica abre la historia y el texto explica su significado.

### PR-01 — Hero Screenshot

Mostrar una aplicación, pantalla o prototipo. Requiere un asset principal con rol `hero`.

### PR-02 — Split Screenshot

Explicar una interfaz sin sacrificar contexto. Combina explicación y screenshot en una sola composición.

### PR-03 — Annotated Screenshot

Explicar decisiones de interfaz o funcionalidades mediante marcadores posicionados sobre un screenshot.

### PR-04 — Before / After

Mostrar evolución de interfaz, arquitectura visual o resultado mediante dos estados explícitos.

### TE-01 — Architecture Flow

Explicar cómo se conectan piezas o decisiones de una solución.

### TE-02 — Code Focus

Mostrar SQL, Power Fx, TypeScript, React, Kotlin u otro fragmento de código con contexto, líneas destacadas y explicación.

### TE-03 — Process Steps

Métodos de trabajo, procesos o secuencias técnicas.

### DA-01 — Data Story

Power BI, análisis, métricas, rendimiento y decisiones basadas en datos.

### CA-01 — Tutorial Sequence

Explicar cómo hacer algo mediante una secuencia de páginas. Exportación PDF con miniatura de portada.

### CA-02 — Case Study

Contar un proyecto completo desde contexto y problema hasta decisión, resultado y aprendizaje.

## Familias V1

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

## Modelo de inputs

Los arquetipos reutilizan tres fuentes separadas:

```text
structured_content   → narrativa
publication_assets   → screenshots e imágenes
visual_config        → métricas, anotaciones, código y parámetros especializados
```

El modelo especializado quedó aprobado en AG-008 / ADR-011.

## Próxima fase de diseño

La cobertura estructural de V1 está cerrada. El trabajo visual posterior debe centrarse en:

- validar cada arquetipo con contenido real;
- corregir composición y legibilidad en móvil;
- incorporar variantes adicionales cuando aporten una diferencia visual real;
- mantener identidad coherente entre familias;
- evitar aumentar el catálogo solo por variedad estética.

La meta de 30–40 apariencias se alcanzará principalmente mediante variantes de estos arquetipos, no mediante decenas de templates independientes.
