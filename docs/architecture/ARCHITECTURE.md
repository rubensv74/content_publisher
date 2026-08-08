# Arquitectura de Content Publisher

## Estado

La arquitectura base de la V1 ya tiene cerradas las decisiones sobre plataforma, interfaz, autenticación, renderizado y modelo de datos. Antes de generar el esqueleto Next.js queda por decidir explícitamente cómo organizaremos el routing y el código fuente para no introducir esa estructura de forma accidental.

## Objetivo arquitectónico

Construir una aplicación web personal, modular y extensible, capaz de gestionar contenido, generar recursos visuales y publicar en LinkedIn sin acoplar el producto a un proveedor concreto más de lo necesario.

## Arquitectura acordada

### Aplicación

- Next.js
- React
- TypeScript

### Interfaz de la aplicación

- Tailwind CSS
- shadcn/ui para componentes comunes

### Motor visual de publicaciones

- componentes React propios
- tokens visuales propios
- sin dependencia de shadcn/ui dentro del árbol de renderizado final

### Exportación visual

- preview y archivo final parten del mismo renderer React
- `html-to-image` para PNG
- `pdf-lib` para carruseles PDF a partir de las páginas PNG
- adaptador de exportación propio que aísla las librerías de los arquetipos
- estado `readyToExport` antes de permitir la generación final

### Datos y almacenamiento

- Supabase
- PostgreSQL
- Supabase Storage
- núcleo relacional para entidades estables
- JSONB únicamente para contenido y configuraciones genuinamente variables

Entidades principales de la V1:

- `identity_profiles`
- `ideas`
- `publications`
- `assets`
- `publication_assets`
- `renders`
- `publishing_jobs`

Reglas de persistencia:

- UUID para entidades principales
- `timestamptz` para fechas persistidas
- claves foráneas para relaciones reales
- versionado explícito de `structured_content`
- contexto de render suficiente para trazabilidad histórica

### Autenticación

- Supabase Auth
- email + contraseña
- un único usuario autorizado en V1
- registro público desactivado
- RLS y políticas de Storage obligatorias

### Despliegue

- Vercel

### Publicación

- Buffer como primera capa de integración con LinkedIn

### Repositorio

- GitHub: `rubensv74/content_publisher`

## Principios

### 1. Separar el producto de las integraciones

La lógica de Content Publisher no debe depender directamente de Buffer o LinkedIn. La publicación se tratará como una capacidad conectable mediante una interfaz propia.

Esto permitirá sustituir Buffer, añadir publicación directa o incorporar otros destinos sin modificar el núcleo editorial.

### 2. Separar contenido y presentación

Una publicación no debe almacenarse como una imagen terminada. Se almacenará como contenido estructurado más una elección de diseño.

De este modo el mismo contenido podrá cambiar de arquetipo, formato o variante sin reescribirse.

### 3. Diseños controlados, no lienzo libre

El motor visual utilizará arquetipos y variantes. No se construirá un editor gráfico de posicionamiento libre.

### 4. Separar la UI del producto del contenido publicable

La interfaz puede apoyarse en shadcn/ui, pero el renderer final no. Esta frontera evita que una actualización visual de la aplicación modifique accidentalmente la apariencia de las publicaciones.

### 5. Separar renderizado y exportación

El arquetipo define qué se ve. El adaptador de exportación define cómo se convierte esa vista en PNG o PDF. Los arquetipos no conocerán `html-to-image` ni `pdf-lib`.

### 6. Modelo relacional con flexibilidad controlada

Las entidades con identidad y ciclo de vida propio se almacenan como tablas y relaciones normales. JSONB se reserva para estructuras genuinamente variables y versionadas.

### 7. Seguridad en profundidad

El acceso privado no dependerá solo de rutas protegidas. Datos y recursos deberán estar protegidos también en Supabase mediante RLS y políticas de Storage.

### 8. Identidad centralizada

Firma, tipografías, paletas, series y reglas visuales deben vivir en una configuración central y no duplicarse dentro de cada plantilla.

### 9. Historial desde el principio

Ideas, borradores y publicaciones deben conservar suficiente información para que, más adelante, el motor de sugerencias pueda evitar repetición y razonar sobre el historial editorial.

### 10. Trazabilidad de renders

Un cambio futuro de tipografía, paleta o arquetipo no debe borrar el contexto de una publicación anterior. Los renders conservarán la configuración relevante con la que fueron generados.

### 11. IA como capa sustituible

La IA no debe estar mezclada con las reglas básicas del producto. Las funciones de asistencia editorial se encapsularán para que el proveedor o modelo pueda cambiar sin rehacer el flujo principal.

## Módulos conceptuales

```text
Content Publisher
│
├── Ideas
├── Content Studio
├── Design Library
├── Visual Renderer
├── Export Adapter
├── Asset Library
├── Preview
├── Publishing
├── Editorial History
├── Settings / Identity
└── Future: Suggestion Engine
```

## Flujo principal

```text
Idea
  ↓
Contenido estructurado
  ↓
Formato
  ↓
Arquetipo + variante
  ↓
Preview
  ↓
Generación de recurso
  ↓
Publicación / programación
  ↓
Historial
```

## Fronteras importantes

### Contenido

Debe poder existir sin diseño.

### Diseño

Consume contenido estructurado y configuración visual, pero no modifica el significado editorial.

### Renderizado

Convierte contenido + diseño + identidad + assets en una representación visual React. No puede depender de componentes de shadcn/ui.

### Exportación

Convierte el resultado visual a PNG o PDF. En V1 usa `html-to-image` y `pdf-lib`, pero esas dependencias quedan aisladas detrás de una interfaz propia.

### Persistencia

Conserva entidades, relaciones, contenido versionado y trazabilidad. No debe decidir cómo se representa visualmente una publicación.

### Publicación

Recibe texto y recursos ya terminados. No debe decidir cómo se diseñan.

### Suggestion Engine

Será un productor de ideas y recomendaciones, no un publicador autónomo.

## Decisiones abiertas antes de generar el esqueleto de aplicación

1. **AG-005:** estrategia de routing y organización inicial del código Next.js.

La gestión de estado y las librerías de formularios se decidirán solo si el desarrollo demuestra que hacen falta; no se introducirán por defecto.

Las elecciones posteriores que cambien dependencias, contratos o fronteras relevantes deberán abrir un nuevo gate antes de implementarse.
