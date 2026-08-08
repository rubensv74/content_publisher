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

Decisión: Tailwind CSS + shadcn/ui para la interfaz de la aplicación y renderer React propio para las publicaciones. Registrado en `ADR-004_UI_STYLE_AND_RENDERER_BOUNDARY.md`.

### AG-002 — Autenticación personal de V1

**Estado: Aprobado.**

Decisión: Supabase Auth con email + contraseña, un único usuario autorizado, registro público desactivado y protección real de datos y Storage mediante políticas. Registrado en `ADR-005_PERSONAL_AUTHENTICATION.md`.

### AG-003 — Renderizado de imágenes y PDF

**Estado: Aprobado.**

Decisión: renderizado visual mediante los mismos componentes React usados en preview, exportación PNG con `html-to-image` y generación de carruseles PDF con `pdf-lib`, todo detrás de un adaptador propio. Registrado en `ADR-006_BROWSER_RENDERING_AND_PDF_EXPORT.md`.

### AG-004 — Modelo de datos inicial

**Estado: Aprobado.**

Decisión: núcleo relacional PostgreSQL + JSONB únicamente para estructuras genuinamente variables, con UUID, `timestamptz`, claves foráneas, RLS y versionado de contenido. Registrado en `ADR-007_HYBRID_RELATIONAL_JSONB_DATA_MODEL.md`.

### AG-005 — Routing y organización inicial del código Next.js

**Estado: Abierto.**

Antes de generar el esqueleto del proyecto debemos decidir si utilizamos App Router o Pages Router y cómo se separará el código de rutas, módulos de dominio, componentes de interfaz y renderer de publicaciones.

## Regla

No generar todavía el esqueleto Next.js de forma que resuelva AG-005 implícitamente. Una vez cerrado este gate, el proyecto podrá inicializarse siguiendo las decisiones registradas, salvo que aparezca un nuevo cambio arquitectónico.
