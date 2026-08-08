# Gates de arquitectura

## Propósito

Evitar que una decisión técnica importante aparezca de forma accidental durante la implementación.

El desarrollo puede avanzar de manera autónoma mientras el trabajo sea una consecuencia directa de decisiones ya aceptadas. Cuando aparezca una elección de arquitectura con impacto relevante, el avance debe detenerse y la decisión debe presentarse antes de implementar.

## Qué se considera una decisión de arquitectura

Una elección pasa por gate cuando afecta de forma significativa a uno o varios de estos puntos:

- estructura del sistema;
- dependencia fuerte de una tecnología o proveedor;
- modelo de datos difícil de cambiar;
- estrategia de autenticación o seguridad;
- renderizado de imágenes o documentos;
- organización del sistema de componentes visuales;
- integración con servicios externos;
- routing y estructura principal del código;
- despliegue;
- costes recurrentes relevantes;
- mantenibilidad a largo plazo.

## Qué no necesita gate

No requiere aprobación específica una decisión local y reversible, por ejemplo:

- nombre de una variable;
- extracción de un componente pequeño;
- ajuste de texto;
- refactorización interna sin cambio de contrato;
- test adicional;
- documentación;
- corrección de errores que no cambie la arquitectura.

## Procedimiento

Cuando aparezca un gate:

1. describir la decisión en lenguaje natural;
2. explicar por qué aparece ahora;
3. presentar las alternativas razonables;
4. recomendar una opción;
5. indicar las consecuencias principales;
6. esperar aprobación;
7. registrar la decisión como ADR;
8. continuar.

## Estado de gates

### AG-001 — Estrategia de estilos y componentes visuales

**Estado: Aprobado.**

Tailwind CSS + shadcn/ui para la interfaz y renderer React propio para las publicaciones. `ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`.

### AG-002 — Autenticación personal de V1

**Estado: Aprobado.**

Supabase Auth con email + contraseña, un único usuario autorizado, registro público desactivado y protección de datos/Storage mediante políticas. `ADR-005_PERSONAL_AUTHENTICATION.md`.

### AG-003 — Renderizado de imágenes y PDF

**Estado: Aprobado.**

Mismo renderer React para preview y archivo final, PNG con `html-to-image` y PDF con `pdf-lib`, detrás de un adaptador propio. `ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`.

### AG-004 — Modelo de datos inicial

**Estado: Aprobado.**

Núcleo relacional PostgreSQL + JSONB para estructuras variables, con UUID, `timestamptz`, claves foráneas, RLS y versionado de contenido. `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`.

### AG-005 — Routing y organización inicial del código Next.js

**Estado: Aprobado.**

App Router + `src/` + separación por responsabilidades entre rutas, features, UI compartida y renderer. `ADR-008_NEXTJS_APP_ROUTER_AND_SOURCE_ORGANIZATION.md`.

### AG-006 — Almacenamiento de renders publicables y URL estable

**Estado: Aprobado.**

Los assets fuente permanecen en `content-publisher` privado y los renders finales PNG/PDF se guardan en `content-publisher-published`, público solo para lectura. Escritura y borrado siguen restringidos por RLS al prefijo UUID del usuario. `ADR-009_PUBLIC_PUBLISHABLE_RENDER_STORAGE.md`.

### AG-007 — Autenticación de Buffer y almacenamiento del secreto

**Estado: Abierto.**

El flujo ya puede alcanzar `RENDER READY`. Para crear publicaciones reales, Buffer exige una credencial Bearer que debe permanecer exclusivamente en servidor.

La propuesta está documentada en `docs/architecture/proposals/AG-007_BUFFER_AUTHENTICATION_AND_SECRET_STORAGE.md`.

Recomendación actual: **Opción A — utilizar la API key personal de Buffer como variable de entorno server-side**, que es el mecanismo recomendado por Buffer para automatizaciones sobre la propia cuenta. OAuth se reservaría para una futura evolución multiusuario.

No se implementará la conexión real con Buffer hasta resolver este gate.

## Estado global

**AG-007 está abierto antes de implementar `RENDER READY → PUBLISH`.**

El resto del producto puede continuar en tareas que no dependan de la credencial de Buffer. La integración real con el proveedor queda bloqueada hasta aprobar la estrategia de autenticación.

## Regla

No se abrirán gates por decisiones locales y reversibles. Tampoco se introducirán dependencias estructurales por anticipación. Cuando una nueva necesidad implique cambiar una frontera, proveedor, estrategia de seguridad, persistencia, renderizado o despliegue, se documentará un nuevo AG antes de implementar.
