# AG-001 — Estrategia de estilos y componentes visuales

- Estado: Aprobada
- Fecha: 2026-08-08
- Opción elegida: A

## Decisión

La interfaz de Content Publisher utilizará **Tailwind CSS + shadcn/ui**.

El motor que genera publicaciones utilizará **componentes React propios y tokens visuales propios**, sin depender de shadcn/ui.

## Por qué aparece esta decisión ahora

La plataforma base ya está acordada: Next.js + React + TypeScript. El generador y las librerías elegidas podían fijar de forma implícita cómo se construye toda la interfaz.

Content Publisher tiene dos necesidades visuales distintas:

1. la interfaz de la aplicación —botones, formularios, paneles, modales y navegación—;
2. las publicaciones que la aplicación genera —arquetipos, screenshots, carruseles, diagramas y piezas de identidad—.

Se decide mantenerlas separadas.

## Opción A — Tailwind CSS + shadcn/ui para la aplicación + renderer visual propio

### Cómo funcionará

- Tailwind CSS para estilos y tokens de la interfaz.
- shadcn/ui para componentes básicos de la aplicación.
- componentes de publicación propios y aislados del aspecto de shadcn.
- variables y tokens propios para la identidad visual de las publicaciones.

### Ventajas

- acelera formularios, modales, menús y controles;
- los componentes de shadcn se incorporan como código editable;
- encaja con Next.js y Tailwind actuales;
- permite personalizar la interfaz sin aceptar una estética fija;
- evita invertir tiempo en controles que no aportan valor diferencial;
- mantiene libertad total para el motor de publicaciones.

### Riesgos y mitigación

- Riesgo: que la aplicación parezca un proyecto shadcn genérico.
  - Mitigación: definir tokens y acabados propios para la interfaz.
- Riesgo: mezclar componentes de aplicación con componentes publicables.
  - Mitigación: frontera explícita en la estructura del código y regla de dependencia.

## Alternativas descartadas

### Opción B — Tailwind CSS + componentes completamente propios

Se descarta para la V1 porque obliga a construir y mantener controles comunes sin mejorar el valor diferencial del producto.

### Opción C — Biblioteca visual completa como MUI, Mantine o similar

Se descarta porque introduce una huella visual y conceptual mayor y aumenta el riesgo de acoplar la estética del producto a una biblioteca externa.

## Regla arquitectónica

```text
Content Publisher UI
└── Tailwind CSS + shadcn/ui

Publication Renderer
└── Componentes React propios + tokens de identidad propios
```

Los componentes de `shadcn/ui` **no podrán utilizarse dentro del árbol encargado de renderizar una publicación final**.

El renderer consumirá únicamente:

- contenido estructurado;
- tokens de identidad;
- assets;
- definición de arquetipo;
- variante.

## Fuentes revisadas

- shadcn/ui — instalación para Next.js: https://ui.shadcn.com/docs/installation/next
- shadcn/ui — soporte Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui — CLI: https://ui.shadcn.com/docs/cli

## Registro

La decisión definitiva queda registrada en `docs/architecture/decisions/ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`.
