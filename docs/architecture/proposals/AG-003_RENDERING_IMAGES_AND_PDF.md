# AG-003 — Renderizado de imágenes y PDF

- Estado: Aprobado — Opción A
- Fecha: 2026-08-08
- Gate: cerrado

## Decisión

Se aprueba la **Opción A: captura del componente React en el navegador mediante `html-to-image` y generación de carruseles PDF mediante `pdf-lib`**, siempre detrás de una interfaz propia de exportación.

## Por qué aparece esta decisión

Content Publisher debe convertir los arquetipos React que vemos en pantalla en archivos finales reales: imágenes para publicaciones y PDF multipágina para carruseles.

Esta decisión afecta a la fidelidad entre preview y exportación, las posibilidades visuales de los arquetipos, el despliegue en Vercel, el mantenimiento y la capacidad futura de automatizar la generación.

## Qué necesitamos

La V1 necesita:

- que el preview y el resultado final sean prácticamente iguales;
- soportar diseños ricos con texto, screenshots, iconos, fondos, overlays, flex y grid;
- generar PNG de alta calidad;
- generar un PDF multipágina para carruseles;
- utilizar fuentes propias de forma controlada;
- no introducir un servicio externo de pago si no es necesario;
- mantener una frontera que permita cambiar el motor de exportación en el futuro.

## Opción A — Captura del componente React en el navegador + pdf-lib

### Cómo funcionará

El mismo componente React que se usa para el preview se renderiza en un contenedor con dimensiones finales conocidas.

Para una imagen:

```text
React Publication Component
          │
          ▼
      DOM + CSS
          │
          ▼
    html-to-image
          │
          ▼
         PNG
```

Para un carrusel:

```text
Slide React 01 ──► PNG 01 ──┐
Slide React 02 ──► PNG 02 ──┤
Slide React 03 ──► PNG 03 ──┤──► pdf-lib ──► PDF
...                          │
Slide React NN ──► PNG NN ──┘
```

### Tecnología aprobada

- `html-to-image` para convertir un nodo DOM en PNG;
- `pdf-lib` para crear el documento y colocar cada slide exportado como una página.

### Motivos

- Preview y exportación utilizan el mismo árbol React y el mismo CSS.
- Podemos utilizar CSS moderno del navegador, incluido grid, sin diseñar una segunda versión limitada de cada arquetipo.
- No necesitamos ejecutar Chromium en una función del servidor.
- No añade un proveedor externo ni un coste por imagen.
- El usuario obtiene el archivo localmente antes de publicar.
- `pdf-lib` funciona tanto en navegador como en Node y permite incrustar PNG/JPEG.
- Es adecuado para una V1 personal en la que el usuario revisa siempre la publicación antes de exportarla.

### Riesgos aceptados

- La exportación depende del navegador.
- Fuentes e imágenes deben estar completamente cargadas antes de capturar.
- Recursos de otros dominios pueden provocar problemas de CORS o de canvas si no se controlan.
- Hay que probar expresamente los arquetipos con screenshots grandes, SVG, transparencias y fuentes.
- La automatización futura sin navegador de usuario requerirá otro adaptador de exportación.

### Medidas obligatorias

- Los recursos usados en una publicación se servirán desde ubicaciones controladas por Content Publisher/Supabase.
- El renderer tendrá un estado `readyToExport` que solo se activa cuando fuentes e imágenes estén listas.
- Cada arquetipo tendrá tests visuales de exportación.
- Las dimensiones de publicación serán fijas y explícitas.
- La exportación quedará detrás de una interfaz propia para permitir un renderer server-side futuro.

## Alternativas descartadas para V1

### Opción B — Headless Chromium en servidor con Puppeteer

Es una opción sólida para generación automática futura, pero añade infraestructura, tamaño de dependencias y complejidad operativa que la V1 no necesita.

### Opción C — Next.js ImageResponse / Satori

Es útil para imágenes sociales relativamente sencillas, pero obliga a trabajar con un subconjunto de CSS y separaría el entorno de preview del entorno de renderizado. Reduce la libertad visual de los arquetipos.

## Arquitectura resultante

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
       ├── PNG: html-to-image
       └── PDF: PNG pages + pdf-lib
```

## Regla arquitectónica

El código de los arquetipos no conocerá `html-to-image` ni `pdf-lib`.

Existirá una frontera de exportación propia, por ejemplo:

```text
exportImage(publication, options)
exportCarousel(publication, options)
```

Una futura implementación con Chromium, un worker o un servicio externo podrá sustituir al exportador sin reescribir los arquetipos.

## Validación obligatoria antes de cerrar la V1

El banco de pruebas visual incluirá al menos:

- texto corto y largo;
- tipografía personalizada;
- screenshot grande;
- SVG e iconos;
- transparencias;
- fondos y gradientes;
- layouts con grid;
- varias páginas de carrusel;
- exportación a PNG de alta resolución;
- generación de PDF y revisión del resultado en LinkedIn.

Si esta validación demuestra problemas graves de fidelidad, se reabrirá el ADR antes de ampliar la biblioteca de arquetipos.

## Fuentes revisadas

- html-to-image: https://www.npmjs.com/package/html-to-image
- pdf-lib: https://github.com/Hopding/pdf-lib
- Vercel — Deploying Puppeteer with Next.js on Vercel: https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel
- Next.js — ImageResponse: https://nextjs.org/docs/app/api-reference/functions/image-response

## Registro

La decisión definitiva se registra en `docs/architecture/decisions/ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`.
