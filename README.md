# Content Publisher

Aplicación web personal para convertir ideas, aprendizajes y desarrollos reales en contenido profesional para LinkedIn, con una identidad visual reconocible y un flujo completo desde la idea hasta la publicación.

## Objetivo de la V1

La V1 debe permitir completar este recorrido sin depender de Canva, PowerPoint u otra herramienta intermedia:

**Idea → contenido → diseño → previsualización → generación → publicación/programación en LinkedIn**

## Estado actual

La cimentación y las decisiones de arquitectura necesarias para la V1 están cerradas. El producto ya dispone de una base ejecutable y el flujo técnico alcanza:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → PUBLISH
```

Entre las capacidades implementadas se encuentran:

- acceso privado con Supabase Auth;
- bandeja de Ideas con persistencia real;
- Content Studio;
- selección de formato, arquetipo y variante;
- identidad visual centralizada;
- preview mediante el renderer React propio;
- exportación PNG y PDF;
- persistencia de renders finales en Supabase Storage;
- integración server-side con Buffer;
- Publishing Jobs e historial editorial;
- workflow de calidad en GitHub.

La creación real de publicaciones mediante Buffer necesita configurar `BUFFER_API_KEY` en el entorno de ejecución y completar la validación operativa de extremo a extremo. El estado técnico detallado vive en `docs/development/IMPLEMENTATION_STATUS.md`.

## Plataforma

- Next.js con App Router
- React
- TypeScript
- Tailwind CSS + shadcn/ui para la interfaz de la aplicación
- renderer React propio para las publicaciones
- Supabase / PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel
- Buffer como primera capa de publicación hacia LinkedIn

Las decisiones detalladas se documentan en `docs/architecture/`.

## Organización principal

```text
src/
├── app/                    # rutas y composición
├── features/               # capacidades del producto
├── components/             # UI compartida
├── publication-renderer/   # motor visual publicable
├── domain/                 # contratos compartidos
├── lib/                    # integraciones y utilidades
└── config/                 # catálogos y configuración
```

## Desarrollo local

### Requisitos

- Node.js 22 o superior
- npm
- Git
- Visual Studio Code recomendado

### Instalación

```bash
npm install
```

Crear `.env.local` a partir de `.env.example` y completar las variables del entorno personal.

Arrancar el entorno de desarrollo:

```bash
npm run dev
```

Comprobaciones locales:

```bash
npm run check
npm run build
```

`BUFFER_API_KEY` es un secreto server-side. Nunca debe almacenarse en GitHub, PostgreSQL ni exponerse como variable `NEXT_PUBLIC_*`.

## Aprender mientras construimos

Content Publisher también se utilizará como proyecto práctico para consolidar React, TypeScript, Next.js, Supabase y Git sin separar el aprendizaje del desarrollo real.

La metodología está documentada en:

`docs/development/LEARNING_PATH_VSCODE.md`

El principio básico es:

```text
entender → implementar → ejecutar → revisar
```

La IA puede acelerar el trabajo, pero no debe introducir cambios que no podamos explicar y revisar.

## Principios del producto

- La identidad visual debe ser consistente, pero no repetitiva.
- La variedad se consigue mediante una biblioteca de arquetipos y variantes, no mediante un editor libre tipo Canva.
- La aplicación debe ser más rápida de usar que construir una publicación manualmente.
- La IA debe ayudar a estructurar y editar ideas reales, no inventar experiencia profesional.
- Las decisiones importantes deben quedar documentadas con su contexto y alternativas.
- El conocimiento reutilizable generado durante el proyecto se registrará para su posterior incorporación a la base de conocimiento profesional.

## Documentación

- `docs/product/`: visión, alcance y roadmap.
- `docs/architecture/`: arquitectura, gates y ADR.
- `docs/design/`: sistema visual, arquetipos y reglas de diseño.
- `docs/research/`: investigación y fuentes externas.
- `docs/development/`: estado de implementación, método de trabajo y aprendizaje.
- `docs/operations/`: puesta en marcha e integraciones operativas.
- `docs/knowledge/candidates/`: conocimiento reutilizable candidato a trasladarse a la base de conocimiento general.
