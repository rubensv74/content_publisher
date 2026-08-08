# ADR-008 — App Router y organización del código fuente

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher ya tiene definidas las fronteras entre interfaz de aplicación, capacidades funcionales, renderer visual, exportación, persistencia y publicación. Antes de generar el proyecto Next.js era necesario evitar que el routing o una estructura mínima inicial acabaran absorbiendo responsabilidades que pertenecen a otros módulos.

## Decisión

Utilizar:

- Next.js App Router;
- código principal dentro de `src/`;
- `src/app/` para rutas y composición;
- `src/features/` para capacidades funcionales;
- `src/components/` para UI compartida de la aplicación;
- `src/publication-renderer/` para el motor visual exportable;
- `src/lib/` para integraciones y utilidades técnicas;
- `src/domain/` para contratos compartidos;
- `src/config/` para catálogos y configuración versionada.

Los Server Components serán la opción por defecto. Los Client Components se introducirán únicamente cuando exista una necesidad concreta de interactividad o acceso a APIs del navegador.

## Motivos

- Mantiene visible la separación entre la aplicación y el contenido publicable.
- Evita que `src/app/` se convierta en un contenedor indiscriminado de lógica funcional.
- Facilita que Ideas, Publications, Assets, Publishing e Identity evolucionen como capacidades reconocibles.
- Permite mantener el renderer libre de dependencias de shadcn/ui.
- Deja la raíz del repositorio disponible para documentación, Supabase, recursos y configuración.

## Alternativas descartadas

### App Router con estructura mínima

Sería suficiente para un prototipo pequeño, pero aumenta el riesgo de mezclar routing, UI, lógica funcional y renderer a medida que crezca la V1.

### Pages Router

No existe una necesidad de compatibilidad que justifique iniciar un proyecto nuevo con el modelo anterior de routing.

## Consecuencias

La estructura inicial será deliberadamente clara, pero no se convertirá en una arquitectura rígida de carpetas. Se podrán crear subcarpetas y mover implementaciones locales cuando el código real lo justifique, siempre que se mantengan las fronteras funcionales acordadas.

El renderer de publicaciones seguirá teniendo prohibido depender de `src/components/ui/` o de shadcn/ui.
