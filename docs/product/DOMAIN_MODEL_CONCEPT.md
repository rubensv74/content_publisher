# Modelo conceptual del dominio

Este documento describe los conceptos del producto en lenguaje funcional. No es todavía un esquema de base de datos ni fija tablas, claves o tipos físicos.

## Idea

Una oportunidad de contenido que todavía puede estar incompleta.

Información conceptual:

- título;
- notas;
- tema;
- origen;
- prioridad;
- estado;
- fecha de creación;
- proyecto relacionado opcional.

Una idea puede convertirse en una publicación.

## Publication

La unidad principal de trabajo editorial.

Contiene:

- tipo de historia;
- contenido estructurado;
- texto de LinkedIn;
- formato;
- selección visual;
- recursos asociados;
- estado editorial;
- información de publicación/programación.

## Structured Content

Representación del contenido independiente del diseño.

Puede incluir conceptos como:

- hook;
- contexto;
- problema;
- decisión;
- solución;
- resultado;
- aprendizaje;
- cierre;
- pasos;
- métricas;
- bloques de código.

La estructura concreta depende del tipo de historia.

## Story Type

Define qué clase de relato se quiere construir y qué preguntas tienen sentido.

Tipos iniciales:

- Build;
- Problem / Solution;
- Architecture;
- Tutorial;
- Lesson Learned;
- Comparison;
- Data Story;
- Professional Insight.

## Format

Forma de salida editorial.

V1:

- Single Image;
- Carousel.

## Design Family

Agrupación amplia de arquetipos visuales.

V1:

- Editorial;
- Product / Screenshot;
- Technical;
- Data;
- Carousel.

## Archetype

Composición visual reutilizable que define cómo distribuir el contenido.

No contiene la identidad personal de forma duplicada; la consume desde la configuración global.

## Variant

Modificación controlada de un arquetipo.

Ejemplos:

- light / dark;
- left / right;
- framed / edge-to-edge;
- compact / spacious.

## Identity

Configuración visual propia que se aplica transversalmente.

Conceptos:

- firma;
- tipografía;
- paleta;
- sistema de series;
- etiquetas de dominio;
- recursos gráficos recurrentes.

## Asset

Recurso utilizado por una publicación.

Ejemplos:

- screenshot;
- imagen;
- logo autorizado;
- icono;
- gráfico generado;
- archivo final generado.

## Render

Resultado generado a partir de contenido + diseño + identidad + recursos.

Puede ser:

- preview;
- PNG final;
- PDF de carrusel.

## Publishing Destination

Destino externo al que puede enviarse una publicación.

En V1 el destino funcional es LinkedIn, inicialmente a través de Buffer.

El concepto debe mantenerse independiente del proveedor técnico.

## Publishing Job

Intento de publicar o programar un contenido.

Debe poder distinguir:

- pendiente;
- enviado;
- programado;
- publicado;
- fallido;
- cancelado si aplica.

## Editorial History

Vista histórica de publicaciones y estados que servirá tanto al usuario como al futuro Suggestion Engine.

## Suggestion

Concepto reservado para después de V1.

Representa una propuesta generada por el motor de sugerencias y puede contener:

- fuente;
- oportunidad detectada;
- motivo;
- enfoque sugerido;
- formato;
- familia visual;
- prioridad o potencial.

Una sugerencia aceptada se convierte en idea, no directamente en publicación.

## Relaciones conceptuales principales

```text
Idea
 └── puede convertirse en → Publication

Publication
 ├── tiene → Story Type
 ├── contiene → Structured Content
 ├── usa → Format
 ├── usa → Archetype + Variant
 ├── usa → Assets
 ├── consume → Identity
 ├── genera → Render(s)
 └── puede producir → Publishing Job(s)

Suggestion
 └── puede convertirse en → Idea
```

## Límite de este documento

La traducción de estos conceptos a PostgreSQL forma parte del gate arquitectónico AG-004 y no debe darse por decidida a partir de este documento.
