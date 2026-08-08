# ADR-004 — Estrategia de UI y frontera con el renderer

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher necesita una interfaz de aplicación rápida de construir y mantener, pero las publicaciones generadas deben tener una identidad propia y no heredar la estética de una biblioteca de componentes de terceros.

## Decisión

La interfaz de la aplicación utilizará:

- Tailwind CSS;
- shadcn/ui para controles y componentes comunes.

El motor de publicaciones utilizará:

- componentes React propios;
- tokens visuales propios;
- assets y definiciones de arquetipo propias.

## Regla de frontera

Los componentes de `shadcn/ui` no podrán formar parte del árbol de componentes utilizado para renderizar una publicación final.

La relación será:

```text
Application UI
└── Tailwind CSS + shadcn/ui

Publication Renderer
└── React propio + tokens visuales propios
```

## Motivos

- Acelera el desarrollo de la aplicación sin invertir esfuerzo innecesario en controles comunes.
- Mantiene independencia visual para las publicaciones.
- Reduce el riesgo de que cambios en la interfaz alteren recursos ya diseñados.
- Permite sustituir o evolucionar la UI sin rehacer el motor visual.

## Alternativas descartadas

### UI completamente artesanal

Ofrece control total, pero consume demasiado tiempo en elementos que no diferencian el producto.

### Biblioteca visual completa para toda la solución

Se descarta porque aumentaría el acoplamiento estético y técnico entre la aplicación y los contenidos generados.

## Consecuencias

La estructura del código deberá hacer visible esta separación. Cualquier dependencia desde el renderer hacia componentes de aplicación se considerará una violación arquitectónica.
