# Arquitectura de Content Publisher

## Estado

Arquitectura base acordada. La estrategia de interfaz, la separación respecto al renderer visual y la autenticación personal de la V1 ya están aprobadas. Continúan abiertos varios gates antes de inicializar el código de producto.

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

### Datos y almacenamiento

- Supabase
- PostgreSQL
- Supabase Storage

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

### 5. Seguridad en profundidad

El acceso privado no dependerá solo de rutas protegidas. Datos y recursos deberán estar protegidos también en Supabase mediante RLS y políticas de Storage.

### 6. Identidad centralizada

Firma, tipografías, paletas, series y reglas visuales deben vivir en una configuración central y no duplicarse dentro de cada plantilla.

### 7. Historial desde el principio

Ideas, borradores y publicaciones deben conservar suficiente información para que, más adelante, el motor de sugerencias pueda evitar repetición y razonar sobre el historial editorial.

### 8. IA como capa sustituible

La IA no debe estar mezclada con las reglas básicas del producto. Las funciones de asistencia editorial se encapsularán para que el proveedor o modelo pueda cambiar sin rehacer el flujo principal.

## Módulos conceptuales

```text
Content Publisher
│
├── Ideas
├── Content Studio
├── Design Library
├── Visual Renderer
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

Convierte una composición en un recurso final, como imagen o documento. No puede depender de componentes de shadcn/ui.

### Publicación

Recibe texto y recursos ya terminados. No debe decidir cómo se diseñan.

### Suggestion Engine

Será un productor de ideas y recomendaciones, no un publicador autónomo.

## Decisiones todavía abiertas

Antes de inicializar el código deben resolverse explícitamente:

1. **AG-003:** estrategia técnica de renderizado de imágenes y PDF;
2. **AG-004:** estructura inicial del modelo de datos.

La gestión de estado y las librerías de formularios se decidirán solo si el desarrollo demuestra que hacen falta; no se introducirán por defecto.

Estas decisiones no deben aparecer de manera accidental mediante un generador de proyecto o una plantilla de terceros.
