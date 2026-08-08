# Arquitectura de Content Publisher

## Estado

La arquitectura base necesaria para iniciar la V1 está cerrada. Plataforma, interfaz, autenticación, renderizado, modelo de datos y organización del código fuente ya tienen decisiones registradas.

A partir de este punto el desarrollo puede avanzar de forma incremental. Solo se abrirá un nuevo gate cuando aparezca una decisión que cambie de forma relevante dependencias, contratos, fronteras, seguridad, persistencia, despliegue o mantenibilidad.

## Objetivo arquitectónico

Construir una aplicación web personal, modular y extensible, capaz de gestionar contenido, generar recursos visuales y publicar en LinkedIn sin acoplar el producto a un proveedor concreto más de lo necesario.

## Arquitectura acordada

### Aplicación

- Next.js con App Router
- React
- TypeScript
- código principal dentro de `src/`

### Organización principal

```text
src/
├── app/                    # rutas y composición
├── features/               # capacidades del producto
├── components/             # UI compartida de la aplicación
├── publication-renderer/   # motor visual publicable
├── domain/                 # contratos compartidos
├── lib/                    # integraciones y utilidades técnicas
└── config/                 # catálogos y configuración versionada
```

Reglas:

- Server Components por defecto;
- `"use client"` solo cuando exista una necesidad concreta;
- `src/app/` no alojará por defecto la lógica funcional reutilizable;
- el renderer no dependerá de la UI de la aplicación.

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
- la lógica específica de Buffer quedará detrás de una frontera propia de publicación

### Repositorio

- GitHub: `rubensv74/content_publisher`

## Principios

### 1. Separar el producto de las integraciones

La lógica de Content Publisher no debe depender directamente de Buffer o LinkedIn. La publicación se tratará como una capacidad conectable mediante una interfaz propia.

### 2. Separar contenido y presentación

Una publicación se almacenará como contenido estructurado más una elección de diseño, no únicamente como un archivo final.

### 3. Diseños controlados, no lienzo libre

El motor visual utilizará arquetipos y variantes. No se construirá un editor gráfico de posicionamiento libre.

### 4. Separar la UI del contenido publicable

La interfaz puede apoyarse en shadcn/ui, pero el renderer final no.

### 5. Separar renderizado y exportación

El arquetipo define qué se ve. El adaptador de exportación define cómo se convierte esa vista en PNG o PDF.

### 6. Modelo relacional con flexibilidad controlada

Las entidades con identidad y ciclo de vida propio se almacenan como tablas y relaciones normales. JSONB se reserva para estructuras genuinamente variables y versionadas.

### 7. Seguridad en profundidad

El acceso privado no dependerá solo de rutas protegidas. Datos y recursos deberán estar protegidos también en Supabase mediante RLS y políticas de Storage.

### 8. Identidad centralizada

Firma, tipografías, paletas, series y reglas visuales deben vivir en una configuración central y no duplicarse dentro de cada plantilla.

### 9. Historial desde el principio

Ideas, borradores y publicaciones deben conservar suficiente información para que el futuro Suggestion Engine pueda evitar repetición y razonar sobre el historial editorial.

### 10. Trazabilidad de renders

Los renders conservarán la versión del arquetipo y el contexto visual relevante con el que fueron generados.

### 11. Routing delgado

Las rutas componen capacidades. La lógica reutilizable vive en módulos funcionales y no queda enterrada en `src/app/`.

### 12. IA como capa sustituible

La IA no debe estar mezclada con las reglas básicas del producto. Las funciones de asistencia editorial se encapsularán para que proveedor o modelo puedan cambiar.

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

## ADR vigentes

- `ADR-001-WEB_PLATFORM_AND_CORE_STACK.md`
- `ADR-002_TEMPLATE_DRIVEN_VISUAL_SYSTEM.md`
- `ADR-003_PUBLISHING_ADAPTER_BUFFER.md`
- `ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`
- `ADR-005_PERSONAL_AUTHENTICATION.md`
- `ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`
- `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`
- `ADR-008_NEXTJS_APP_ROUTER_AND_SOURCE_ORGANIZATION.md`

## Regla de evolución

No se introducirán librerías globales de estado, formularios, caché, tests E2E u otras dependencias estructurales simplemente por anticipación. Se incorporarán cuando una necesidad real lo justifique. Si esa incorporación cambia de forma significativa la arquitectura, se abrirá un nuevo gate antes de implementarla.
