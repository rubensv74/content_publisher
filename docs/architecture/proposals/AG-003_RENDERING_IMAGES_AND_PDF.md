# AG-003 — Renderizado de imágenes y PDF

- Estado: Proposed
- Fecha: 2026-08-08
- Gate: requiere aprobación antes de implementar el Visual Renderer

## Por qué aparece esta decisión ahora

Content Publisher debe convertir los arquetipos React que vemos en pantalla en archivos finales reales: imágenes para publicaciones y PDF multipágina para carruseles.

Esta decisión es especialmente importante porque afecta a la fidelidad entre preview y exportación, las posibilidades visuales de los arquetipos, el despliegue en Vercel, el mantenimiento y la capacidad futura de automatizar la generación.

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

### Cómo funcionaría

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

### Tecnología propuesta

- `html-to-image` para convertir un nodo DOM en PNG;
- `pdf-lib` para crear el documento y colocar cada slide exportado como una página.

### Ventajas

- Preview y exportación utilizan el mismo árbol React y el mismo CSS.
- Podemos utilizar CSS moderno del navegador, incluido grid, sin diseñar una segunda versión limitada de cada arquetipo.
- No necesitamos ejecutar Chromium en una función del servidor.
- No añade un proveedor externo ni un coste por imagen.
- El usuario obtiene el archivo localmente antes de publicar.
- `pdf-lib` funciona tanto en navegador como en Node y permite incrustar PNG/JPEG.
- Es especialmente adecuado para una V1 personal en la que el usuario revisa siempre la publicación antes de exportarla.

### Riesgos

- La exportación depende del navegador.
- Fuentes e imágenes deben estar completamente cargadas antes de capturar.
- Recursos de otros dominios pueden provocar problemas de CORS o de canvas si no se controlan.
- Hay que probar expresamente los arquetipos con screenshots grandes, SVG, transparencias y fuentes.
- La automatización futura sin navegador de usuario requeriría otro adaptador de exportación.

### Cómo reduciremos esos riesgos

- Los recursos usados en una publicación se servirán desde ubicaciones controladas por Content Publisher/Supabase.
- El renderer tendrá un estado `readyToExport` que solo se activa cuando fuentes e imágenes estén listas.
- Cada arquetipo tendrá tests visuales de exportación.
- Las dimensiones de publicación serán fijas y explícitas.
- La exportación quedará detrás de una interfaz propia para permitir un renderer server-side futuro.

## Opción B — Headless Chromium en servidor con Puppeteer

### Cómo funcionaría

Una función del servidor abriría una página de renderizado mediante Chromium y generaría screenshot o PDF.

### Ventajas

- Resultado reproducible sin depender del navegador del usuario.
- Muy adecuado para generación automática futura.
- Utiliza un navegador real, por lo que soporta CSS moderno.
- Puppeteer puede producir directamente screenshots y PDF.

### Inconvenientes

- Vercel requiere una configuración específica para Chromium en funciones serverless.
- El paquete normal de Puppeteer es demasiado grande para el límite de bundle indicado por Vercel; su guía recomienda `puppeteer-core` y una distribución reducida de Chromium.
- Añade tiempo de arranque, memoria y complejidad operativa.
- Es más infraestructura de la necesaria para una V1 que siempre tendrá revisión humana.

### Cuándo podría ser la opción correcta

Cuando Content Publisher necesite generar contenido automáticamente en segundo plano sin tener una sesión de navegador abierta. Por ejemplo, en una evolución avanzada del Suggestion Engine.

## Opción C — Next.js ImageResponse / Satori + renderer PDF independiente

### Cómo funcionaría

Los arquetipos se transformarían en JSX compatible con Satori y el servidor generaría PNG mediante `ImageResponse`. Los carruseles necesitarían además una estrategia PDF separada.

### Ventajas

- Integración nativa con Next.js.
- Generación server-side ligera.
- Resultado determinista.
- Muy útil para imágenes sociales relativamente sencillas.

### Inconvenientes

- Next.js documenta que `ImageResponse` solo soporta flexbox y un subconjunto de CSS; `display: grid` no funciona.
- Tiene restricciones de bundle para fuentes, imágenes y código.
- Obliga a diseñar los arquetipos pensando en las limitaciones de Satori.
- El preview del navegador y el resultado de Satori serían dos entornos de renderizado distintos.
- Reduce precisamente la libertad visual que queremos conseguir con la biblioteca de arquetipos.

## Recomendación

**Opción A — exportación en navegador con `html-to-image` + `pdf-lib`, detrás de una interfaz propia de exportación.**

La razón principal no es que sea la alternativa más sencilla. Es que conserva algo que para Content Publisher es crítico: **el diseño que se revisa debe ser el diseño que se exporta**.

En la V1 siempre habrá revisión humana antes de publicar. No necesitamos pagar todavía el coste de una infraestructura de navegador server-side para resolver un problema de automatización que aún no tenemos.

La arquitectura propuesta sería:

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

## Regla propuesta

El código de los arquetipos no conocerá `html-to-image` ni `pdf-lib`.

Existirá una frontera de exportación propia, por ejemplo:

```text
exportImage(publication, options)
exportCarousel(publication, options)
```

De este modo una futura implementación con Chromium, un worker o un servicio externo podrá sustituir al exportador sin reescribir los arquetipos.

## Validación obligatoria antes de cerrar la V1

La decisión deberá validarse con un pequeño banco de pruebas visual que incluya al menos:

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

Si esta validación demostrara problemas graves de fidelidad, se reabrirá el ADR antes de ampliar la biblioteca de arquetipos.

## Fuentes revisadas

- html-to-image: https://www.npmjs.com/package/html-to-image
- pdf-lib: https://github.com/Hopding/pdf-lib
- Vercel — Deploying Puppeteer with Next.js on Vercel: https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel
- Next.js — ImageResponse: https://nextjs.org/docs/app/api-reference/functions/image-response

## Decisión pendiente

Aprobar una de las opciones antes de implementar el Visual Renderer o incorporar sus dependencias al proyecto.
