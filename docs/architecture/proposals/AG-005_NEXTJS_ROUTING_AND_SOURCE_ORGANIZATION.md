# AG-005 — Routing y organización inicial del código Next.js

- Estado: Proposed
- Fecha: 2026-08-08
- Gate: requiere aprobación antes de generar el esqueleto de la aplicación

## Por qué aparece esta decisión ahora

Los cuatro gates previos ya están cerrados. Podemos empezar a generar código, pero `create-next-app` puede decidir de forma implícita dos cosas que afectan a toda la estructura futura:

1. si usamos **App Router** o **Pages Router**;
2. si dejamos el código mezclado en la raíz o lo organizamos dentro de `src/` con fronteras claras entre rutas, módulos del producto, UI y renderer de publicaciones.

Para Content Publisher esta separación importa especialmente porque ya hemos decidido que la interfaz de la aplicación y el motor de publicaciones deben evolucionar de manera independiente.

## Opción A — App Router + `src/` + organización por responsabilidades — recomendada

### Estructura conceptual

```text
content_publisher/
│
├── src/
│   ├── app/                     # rutas, layouts y composición de páginas
│   │
│   ├── features/                # capacidades del producto
│   │   ├── ideas/
│   │   ├── publications/
│   │   ├── assets/
│   │   ├── publishing/
│   │   └── identity/
│   │
│   ├── publication-renderer/    # motor visual aislado de la UI shadcn
│   │   ├── archetypes/
│   │   ├── identity/
│   │   ├── primitives/
│   │   └── export/
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui y componentes genéricos
│   │   └── application/         # componentes compartidos de la app
│   │
│   ├── lib/                     # clientes y utilidades técnicas
│   │   ├── supabase/
│   │   └── publishing/
│   │
│   ├── domain/                  # tipos y contratos compartidos del dominio
│   └── config/                  # catálogos y configuración versionada
│
├── public/
├── supabase/
├── docs/
└── archivos de configuración
```

La estructura física podrá ajustarse localmente mientras se mantengan estas fronteras. No se busca crear carpetas por crear, sino evitar que routing, dominio, UI y renderer terminen mezclados.

### Por qué App Router

La documentación actual de Next.js presenta App Router como el router basado en archivos que utiliza las capacidades actuales de React, incluyendo Server Components, Suspense y Server Functions.

Para Content Publisher esto encaja con el reparto natural de responsabilidades:

- páginas y layouts pueden ejecutarse en servidor por defecto;
- interactividad se añade solo en componentes cliente cuando haga falta;
- credenciales y operaciones sensibles pueden permanecer en servidor;
- la aplicación puede combinar lectura de datos server-side con editores interactivos en cliente.

### Por qué `src/`

Next.js soporta oficialmente `src/app` y recomienda esta organización cuando se quiere separar el código de aplicación de archivos de configuración que viven en la raíz.

En este proyecto además deja la raíz limpia para:

- `docs/`;
- `supabase/`;
- `public/`;
- configuración de Next.js, TypeScript, ESLint y dependencias.

### Regla de routing

`src/app/` será principalmente una capa de rutas y composición.

No deberá convertirse en el lugar donde vive toda la lógica del producto.

Una página podrá importar una capacidad desde `features/`, pero la lógica reutilizable de Ideas, Publications, Assets o Publishing no deberá quedar enterrada dentro de carpetas de rutas.

### Regla del renderer

`src/publication-renderer/` tendrá una frontera explícita:

- no importará componentes desde `src/components/ui/`;
- no dependerá de shadcn/ui;
- consumirá contratos del dominio, assets y tokens propios;
- será el mismo sistema usado por preview y exportación.

Esto aplica directamente ADR-004 y ADR-006.

## Opción B — App Router con estructura mínima en raíz

Ejemplo:

```text
app/
components/
lib/
public/
```

### Ventajas

- arranque muy sencillo;
- menos carpetas al principio;
- coincide con muchos ejemplos básicos de Next.js.

### Problemas para este proyecto

- `components/` tendería a mezclar UI de aplicación y renderer;
- `lib/` puede convertirse rápidamente en un cajón de sastre;
- la lógica del producto puede acabar dentro de rutas;
- más adelante habría que reorganizar cuando Ideas, Content Studio y Publication Renderer crezcan.

Es viable para una aplicación pequeña, pero Content Publisher ya tiene suficientes módulos definidos como para justificar fronteras desde el inicio.

## Opción C — Pages Router

### Ventajas

- modelo conocido y estable;
- abundante documentación histórica;
- válido para aplicaciones Next.js existentes que ya lo utilicen.

### Problemas para un proyecto nuevo

- no aprovecha el modelo actual de App Router y Server Components;
- introduciríamos una arquitectura anterior sin tener una necesidad de compatibilidad;
- una futura migración a App Router aportaría trabajo sin valor funcional.

No se recomienda para un proyecto nuevo en 2026.

## Recomendación

**Opción A — App Router + `src/` + organización por responsabilidades.**

No queremos diseñar una arquitectura de carpetas compleja antes de tener código. Queremos únicamente fijar cuatro fronteras que ya sabemos que son importantes:

```text
Routing / composición        → src/app
Capacidades del producto     → src/features
UI de la aplicación          → src/components
Motor visual publicable      → src/publication-renderer
```

El resto podrá evolucionar de forma incremental.

## Server y Client Components

Se seguirá la regla de Next.js de mantener componentes de servidor por defecto y utilizar `"use client"` solo cuando exista una razón concreta, como:

- estado local;
- eventos de usuario;
- APIs del navegador;
- exportación mediante `html-to-image`;
- editores interactivos.

No se marcarán árboles completos como cliente por comodidad.

## Qué no decide este gate

Este gate no obliga todavía a elegir:

- una librería global de estado;
- una librería de formularios;
- una herramienta de tests end-to-end;
- una estrategia de caché avanzada.

Esas decisiones solo aparecerán si una necesidad real del producto las justifica.

## Fuentes revisadas

- Next.js — App Router: https://nextjs.org/docs/app
- Next.js — Getting Started / Installation: https://nextjs.org/docs/app/getting-started/installation
- Next.js — Project Structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js — Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js — `src` directory: https://nextjs.org/docs/pages/api-reference/file-conventions/src-folder

## Decisión pendiente

Aprobar A, B o C antes de generar el proyecto base.
