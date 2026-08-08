# Arquitectura de Content Publisher

## Estado

Arquitectura base acordada. Existen decisiones de implementación todavía abiertas que deberán resolverse antes de iniciar el código.

## Objetivo arquitectónico

Construir una aplicación web personal, modular y extensible, capaz de gestionar contenido, generar recursos visuales y publicar en LinkedIn sin acoplar el producto a un proveedor concreto más de lo necesario.

## Arquitectura acordada

### Aplicación

- Next.js
- React
- TypeScript

### Datos y almacenamiento

- Supabase
- PostgreSQL
- Supabase Storage

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

### 4. Identidad centralizada

Firma, tipografías, paletas, series y reglas visuales deben vivir en una configuración central y no duplicarse dentro de cada plantilla.

### 5. Historial desde el principio

Ideas, borradores y publicaciones deben conservar suficiente información para que, más adelante, el motor de sugerencias pueda evitar repetición y razonar sobre el historial editorial.

### 6. IA como capa sustituible

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

Convierte una composición en un recurso final, como imagen o documento.

### Publicación

Recibe texto y recursos ya terminados. No debe decidir cómo se diseñan.

### Suggestion Engine

Será un productor de ideas y recomendaciones, no un publicador autónomo.

## Decisiones todavía abiertas

Antes de inicializar el código deben resolverse explícitamente, al menos:

1. estrategia de estilos y componentes visuales;
2. mecanismo de autenticación para la V1 personal;
3. estrategia técnica de renderizado de imágenes y PDF;
4. estructura inicial del modelo de datos;
5. gestión de estado del cliente, si fuera necesaria más allá de las capacidades nativas de React/Next.js;
6. librerías concretas para formularios y validación, si se decide utilizarlas.

Estas decisiones no deben introducirse de manera accidental mediante un generador de proyecto o una plantilla de terceros.
