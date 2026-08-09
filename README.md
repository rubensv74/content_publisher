# Content Publisher

Aplicación web personal para convertir ideas, aprendizajes y desarrollos reales en contenido profesional para LinkedIn, con una identidad visual reconocible y un flujo completo desde la idea hasta la publicación.

## Objetivo de la V1

La V1 permite recorrer sin depender de Canva, PowerPoint u otra herramienta intermedia:

**Idea → contenido → diseño → previsualización → generación → publicación/programación en LinkedIn**

## Estado actual

Content Publisher está en **Release Candidate de V1**.

El flujo técnico operativo alcanza:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

Entre las capacidades implementadas se encuentran:

- acceso privado con Supabase Auth;
- bandeja de Ideas con persistencia real;
- Content Studio;
- selección de formato, arquetipo y variante;
- identidad visual centralizada;
- biblioteca privada de recursos;
- configuración visual especializada por arquetipo;
- 12/12 arquetipos objetivo de V1 implementados, más Build Note;
- preview mediante el renderer React propio;
- exportación PNG y PDF;
- persistencia de renders finales en Supabase Storage;
- protección frente a renders obsoletos;
- integración server-side con Buffer;
- descubrimiento real del canal LinkedIn;
- drafts reales validados en Buffer;
- programación y publicación inmediata implementadas con confirmación explícita;
- reconciliación bajo demanda de estados de Buffer;
- Publishing Jobs e historial editorial;
- workflow de calidad en GitHub.

La única validación funcional de extremo a extremo que sigue pendiente es realizar deliberadamente una publicación pública real en LinkedIn y comprobar su resultado. Esta acción no forma parte de las pruebas automáticas.

El estado técnico detallado vive en `docs/development/IMPLEMENTATION_STATUS.md` y el cierre de V1 se controla en `docs/development/V1_RELEASE_CHECKLIST.md`.

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

Content Publisher también se utiliza como proyecto práctico para consolidar React, TypeScript, Next.js, Supabase y Git sin separar el aprendizaje del desarrollo real.

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

- `docs/product/`: visión, alcance, roadmap y guía de uso.
- `docs/architecture/`: arquitectura, gates y ADR.
- `docs/design/`: sistema visual, arquetipos y reglas de diseño.
- `docs/research/`: investigación y fuentes externas.
- `docs/development/`: estado de implementación, checklist de cierre, método de trabajo y aprendizaje.
- `docs/operations/`: puesta en marcha, integraciones y política de Storage.
- `docs/knowledge/candidates/`: conocimiento reutilizable candidato a trasladarse a la base de conocimiento general.
