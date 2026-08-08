# AG-001 — Estrategia de estilos y componentes visuales

- Estado: Proposed
- Fecha: 2026-08-08
- Gate: requiere aprobación antes de inicializar el código

## Por qué aparece esta decisión ahora

La plataforma base ya está acordada: Next.js + React + TypeScript. El siguiente paso natural sería crear el proyecto.

Sin embargo, el generador y las librerías que elijamos pueden fijar de forma implícita cómo se construye toda la interfaz. Content Publisher tiene además dos necesidades visuales distintas:

1. la interfaz de la aplicación —botones, formularios, paneles, modales, navegación—;
2. las publicaciones que la aplicación genera —arquetipos, screenshots, carruseles, diagramas y piezas de identidad—.

No conviene tratarlas como si fueran el mismo sistema.

## Opción A — Tailwind CSS + shadcn/ui para la aplicación + renderer visual propio

### Cómo funcionaría

- Tailwind CSS para estilos y tokens de la interfaz.
- shadcn/ui para componentes básicos de la aplicación.
- componentes de publicación propios y aislados del aspecto de shadcn.
- variables/tokens propios para la identidad visual de las publicaciones.

### Ventajas

- acelera mucho formularios, modales, menús y controles;
- los componentes de shadcn se incorporan como código editable, no como una caja negra cerrada;
- encaja de forma directa con Next.js y Tailwind actuales;
- permite personalizar la interfaz sin obligarnos a aceptar una estética fija;
- evita perder tiempo construyendo botones, diálogos, inputs o dropdowns desde cero;
- mantiene la libertad total para el motor de publicaciones.

### Riesgos

- si se utilizan los componentes sin personalización, la aplicación puede parecer un proyecto shadcn genérico;
- hay que mantener una frontera clara entre UI de aplicación y diseños publicables;
- Tailwind introduce una forma de trabajar que hay que aprender.

## Opción B — Tailwind CSS + componentes completamente propios

### Ventajas

- control completo;
- menos componentes de terceros;
- sistema extremadamente coherente si se ejecuta bien.

### Riesgos

- mucho más trabajo para controles que no aportan valor diferencial;
- más responsabilidad de accesibilidad y comportamiento;
- ralentiza la V1 sin mejorar el motor de contenido.

## Opción C — Biblioteca visual completa como MUI, Mantine o similar

### Ventajas

- gran cantidad de componentes preparados;
- rapidez para construir pantallas de aplicación.

### Riesgos

- mayor huella visual y conceptual de la biblioteca;
- más esfuerzo para evitar que el producto herede una estética reconocible de terceros;
- menos alineado con la intención de construir una identidad muy controlada;
- puede acabar mezclándose con el renderer de publicaciones.

## Recomendación

**Opción A.**

La interfaz de administración y edición no es donde Content Publisher debe invertir la mayor cantidad de trabajo artesanal. Debe ser buena, clara y consistente, pero el valor diferencial está en el flujo editorial y en el sistema visual de las publicaciones.

Por eso se recomienda:

```text
Content Publisher UI
└── Tailwind CSS + shadcn/ui

Publication Renderer
└── Componentes React propios + tokens de identidad propios
```

La frontera entre ambos sistemas debe estar explícita en la estructura del código.

## Regla propuesta

Los componentes de `shadcn/ui` no podrán utilizarse dentro del árbol de componentes encargado de renderizar una publicación final.

El renderer consumirá únicamente:

- contenido estructurado;
- tokens de identidad;
- assets;
- definición de arquetipo;
- variante.

Esto evita que una futura actualización de la interfaz de la aplicación cambie accidentalmente la apariencia de los contenidos generados.

## Fuentes revisadas

- shadcn/ui — instalación actual para Next.js: https://ui.shadcn.com/docs/installation/next
- shadcn/ui — soporte Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui — CLI y componentes incorporados como código: https://ui.shadcn.com/docs/cli

## Decisión pendiente

Aprobar una de estas opciones antes de generar el proyecto Next.js.
