# AG-005 — Routing y organización inicial del código Next.js

- Estado: Aprobada — Opción A
- Fecha: 2026-08-08
- Gate: cerrado

## Decisión

Se aprueba **App Router + `src/` + organización por responsabilidades**.

La aplicación utilizará App Router y mantendrá el código principal dentro de `src/`, con fronteras explícitas entre routing, capacidades del producto, interfaz de aplicación y motor visual de publicaciones.

## Estructura acordada

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
│   ├── lib/
│   │   ├── supabase/
│   │   └── publishing/
│   │
│   ├── domain/
│   └── config/
│
├── public/
├── supabase/
├── docs/
└── archivos de configuración
```

La estructura física podrá evolucionar localmente mientras se mantengan estas fronteras. No se crearán carpetas sin responsabilidad clara.

## Reglas acordadas

### `src/app/`

Será principalmente la capa de rutas, layouts y composición de páginas. La lógica reutilizable de Ideas, Publications, Assets, Publishing o Identity no deberá quedar enterrada dentro de rutas.

### `src/features/`

Agrupará las capacidades funcionales del producto. Cada feature podrá contener componentes, acciones, validaciones y acceso a datos propios cuando aparezcan de forma justificada.

### `src/components/`

Contendrá la interfaz compartida de la aplicación. `src/components/ui/` será la zona de componentes shadcn/ui.

### `src/publication-renderer/`

Mantendrá la frontera ya aprobada:

- no importará componentes desde `src/components/ui/`;
- no dependerá de shadcn/ui;
- consumirá contratos de dominio, assets y tokens propios;
- será el mismo renderer utilizado por preview y exportación.

### Server y Client Components

Los componentes serán de servidor por defecto. `"use client"` se utilizará únicamente cuando exista una necesidad concreta, como estado local, eventos de usuario, APIs del navegador, exportación visual o editores interactivos.

## Alternativas descartadas

### App Router con estructura mínima en raíz

Se descarta porque facilitaría la mezcla progresiva de routing, lógica funcional, UI y renderer a medida que el producto crezca.

### Pages Router

Se descarta para un proyecto nuevo porque no existe ninguna necesidad de compatibilidad que justifique comenzar con el modelo anterior de routing.

## Consecuencias

- La raíz del repositorio permanecerá limpia para documentación, Supabase, recursos y configuración.
- La interfaz de la aplicación y las publicaciones exportables tendrán fronteras físicas visibles.
- El routing no se convertirá en el lugar por defecto para alojar lógica de negocio.
- La estructura podrá crecer de forma incremental sin necesidad de una reorganización temprana.

## Fuentes revisadas

- Next.js — App Router: https://nextjs.org/docs/app
- Next.js — Getting Started / Installation: https://nextjs.org/docs/app/getting-started/installation
- Next.js — Project Structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js — Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js — `src` directory: https://nextjs.org/docs/pages/api-reference/file-conventions/src-folder

## Registro definitivo

La decisión se registra como `ADR-008_NEXTJS_APP_ROUTER_AND_SOURCE_ORGANIZATION.md`.
