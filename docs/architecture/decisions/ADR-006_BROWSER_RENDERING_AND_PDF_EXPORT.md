# ADR-006 — Renderizado en navegador y exportación PDF

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher necesita generar imágenes individuales y carruseles PDF a partir de los mismos arquetipos React que el usuario revisa en pantalla.

La V1 prioriza dos cosas: fidelidad entre preview y resultado final, y libertad visual para construir composiciones ricas sin introducir infraestructura innecesaria.

## Decisión

La V1 utilizará:

- componentes React propios como fuente visual;
- `html-to-image` para exportar un componente renderizado a PNG;
- `pdf-lib` para construir carruseles PDF a partir de las páginas PNG generadas;
- una interfaz propia de exportación que aísle estas librerías del renderer de arquetipos.

## Arquitectura

```text
Publication Model
       │
       ▼
React Publication Renderer
       │
       ├────────────► Preview
       │
       ▼
Export Adapter
       │
       ├── exportImage() ─────► html-to-image ─────► PNG
       └── exportCarousel() ──► PNG pages ──► pdf-lib ──► PDF
```

## Regla principal

Los arquetipos no podrán importar ni depender directamente de `html-to-image` o `pdf-lib`.

El renderer deberá limitarse a representar contenido, identidad, recursos y selección visual. La conversión a archivo pertenece al adaptador de exportación.

## Motivos

- El preview y la exportación usan el mismo DOM y CSS.
- Se mantiene soporte para CSS moderno del navegador.
- No se introduce Chromium server-side en la V1.
- No se añade un proveedor externo de generación de imágenes.
- La capa de exportación podrá ser reemplazada en el futuro sin rehacer los arquetipos.

## Consecuencias

- Los assets y fuentes deben estar cargados antes de permitir exportar.
- Se definirá un estado explícito `readyToExport`.
- Los recursos visuales deben proceder de ubicaciones controladas para evitar problemas de CORS.
- Cada arquetipo tendrá que superar una prueba real de exportación, no solo verse correctamente en navegador.
- Una futura generación automática en segundo plano probablemente requerirá otro adaptador, por ejemplo Chromium server-side.

## Alternativas descartadas para V1

### Headless Chromium / Puppeteer

Se considera una opción futura válida para automatización, pero añade complejidad operativa que la V1 no necesita.

### Next.js ImageResponse / Satori

Se descarta porque limita CSS y crearía un entorno de renderizado distinto al preview, reduciendo la libertad visual.

## Criterio de re-apertura

Este ADR se reabrirá si las pruebas con fuentes, screenshots, SVG, transparencias, grid o exportación de alta resolución muestran diferencias graves entre preview y archivo final.
