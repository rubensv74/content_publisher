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

**Estado: Aprobado.**

La V1 utiliza una API key personal de Buffer en `BUFFER_API_KEY`, disponible exclusivamente en servidor. La credencial no se almacena en PostgreSQL, no llega al navegador y no se versiona. OAuth 2.0 + PKCE queda reservado para una futura evolución multiusuario. `ADR-010_BUFFER_PERSONAL_API_KEY_SERVER_SIDE.md`.

### AG-008 — Datos especializados de arquetipos visuales

**Estado: Aprobado — Opción B.**

Los parámetros visuales especializados se almacenan en `publications.visual_config JSONB`, organizados por namespace de arquetipo. Se mantienen separadas la historia editorial (`structured_content`), los archivos fuente (`publication_assets`) y la configuración visual especializada (`visual_config`).

Decisión registrada en `ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`.

### AG-009 — Reconciliación de estados de Buffer

**Estado: Aprobado — Opción A.**

La V1 reconcilia estados de Buffer bajo demanda cuando el usuario abre Historial y mediante una acción manual de actualización. No se introduce polling periódico ni Vercel Cron en V1.

Decisión registrada en `ADR-012_BUFFER_STATUS_RECONCILIATION_ON_DEMAND.md`.

### AG-010 — Estrategia de fuentes para Suggestion Engine

**Estado: Aprobado — Opción C.**

Las fuentes completas permanecen en sus sistemas originales. Content Publisher utiliza adaptadores server-side y conserva solo una memoria ligera en `source_signals` con referencias, fingerprint, resumen y metadatos mínimos. No se replican repositorios ni documentos completos.

Decisión registrada en `ADR-013_SUGGESTION_SOURCE_SIGNALS.md`.

La primera implementación cubre señales locales de Ideas e Historial editorial. GitHub y Knowledge Base permanecen pendientes de resolver su autenticación runtime.

### AG-011 — Autenticación runtime de GitHub para fuentes privadas

**Estado: Abierto — pendiente de decisión.**

Suggestion Engine necesita leer repositorios GitHub privados desde el servidor de Content Publisher. Debe decidirse qué mecanismo de autenticación utiliza la aplicación antes de introducir una credencial nueva.

Alternativas documentadas:

- **A** — fine-grained personal access token, read-only y limitado a repositorios seleccionados, almacenado server-side **(recomendada para la fase personal actual)**;
- **B** — GitHub App con installation tokens;
- **C** — solo API pública sin autenticación, insuficiente para repositorios privados.

Propuesta completa:

`docs/architecture/proposals/AG-011_GITHUB_RUNTIME_AUTHENTICATION.md`

Este gate no decide todavía proveedor de IA, embeddings ni automatización programada.

## Estado global

**Existe un gate de arquitectura abierto: AG-011.**

Las bases de `source_signals` y los adaptadores locales pueden quedar implementadas. El desarrollo autónomo se detiene antes de conectar repositorios privados o introducir secretos de GitHub en producción.

## Regla

No se abrirán gates por decisiones locales y reversibles. Tampoco se introducirán dependencias estructurales por anticipación. Cuando una nueva necesidad implique cambiar una frontera, proveedor, estrategia de seguridad, persistencia, renderizado o despliegue, se documentará un nuevo AG antes de implementar.
