# Estado de implementación

Fecha de actualización: 2026-08-08

## Arquitectura cerrada

Los gates iniciales de arquitectura están aprobados y registrados:

- AG-001 — Tailwind CSS + shadcn/ui para la aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — renderizado React/DOM con `html-to-image` y PDF con `pdf-lib` detrás de adaptador propio.
- AG-004 — modelo relacional PostgreSQL + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.

## Cimentación implementada

La base ejecutable del producto contiene:

- Next.js + React + TypeScript;
- Tailwind CSS;
- estructura por responsabilidades bajo `src/`;
- clientes Supabase para navegador y servidor;
- renovación de sesión mediante `proxy.ts`;
- login privado con email + contraseña;
- shell principal de navegación;
- frontera independiente del renderer de publicaciones;
- adaptador de exportación PNG/PDF;
- modelo PostgreSQL V1 con RLS;
- Storage privado;
- workflow de calidad en GitHub para `push`, `pull_request` y ejecución manual.

## Supabase dedicado

Existe un proyecto Supabase independiente para Content Publisher:

- nombre: `Content Publisher`;
- región: `eu-west-1`;
- coste confirmado al crearlo: 0 al mes;
- proyecto sano tras la creación.

Migraciones aplicadas:

1. `initial_schema` — tablas, relaciones, restricciones, triggers, RLS y Storage privado;
2. `add_fk_indexes` — índices de cobertura recomendados para claves foráneas.

Los advisors de seguridad no devolvieron avisos después de aplicar la cimentación. Los avisos de índices todavía no utilizados son esperables mientras la base no tenga tráfico representativo.

## Autenticación validada

Se ha creado el usuario personal autorizado en Supabase Auth.

La comprobación del backend confirma:

- existe una única cuenta de usuario;
- la cuenta está confirmada;
- las políticas RLS permiten a ese usuario trabajar únicamente con sus propios datos;
- una prueba de inserción/lectura autenticada se ejecutó dentro de una transacción y se revirtió para no dejar datos de prueba.

La contraseña del usuario no se almacena ni se comparte con el repositorio.

## Ideas — primer módulo funcional

La bandeja de Ideas ya dispone de persistencia real y operaciones básicas:

- crear;
- listar;
- editar;
- archivar;
- eliminar;
- distinguir visualmente una idea ya convertida;
- iniciar la conversión de una Idea en Publication.

Las operaciones se ejecutan mediante Server Actions y respetan la sesión autenticada y RLS.

## Vertical slice de Content Studio

El flujo funcional implementado alcanza ya:

`IDEA → STORY → FORMAT → DESIGN → PREVIEW`

Desde una Idea se puede abrir `/publications/new` y definir:

- título de trabajo;
- tema;
- tipo de historia;
- problema o contexto;
- intentos previos;
- decisión o solución;
- aprendizaje;
- idea transferible;
- formato inicial: imagen única o carrusel.

Al crear el borrador:

- se inserta una fila real en `publications`;
- queda vinculada a la Idea de origen;
- la Idea pasa a estado `converted`;
- se abre Content Studio.

Content Studio permite revisar y guardar la historia estructurada, editar el borrador del caption de LinkedIn, seleccionar un diseño compatible y reabrir posteriormente el borrador desde la biblioteca de Publicaciones.

## Renderer visual

El renderer permanece aislado de los componentes de aplicación conforme a ADR-004. La biblioteca activa incorpora por ahora dos arquetipos de validación:

### Build Note v1

- familia `editorial`;
- formato `single-image`;
- variante `editorial-light`;
- canvas 1080 × 1350, relación 4:5;
- utiliza título, problema/contexto, decisión/solución y aprendizaje;
- preview escalable en Content Studio;
- exportación PNG mediante `html-to-image` usando exactamente el mismo árbol React visible en preview.

### Step by Step v1

- familia `carousel`;
- formato `carousel`;
- variante `editorial-light`;
- páginas 1080 × 1350, relación 4:5;
- genera dinámicamente portada y páginas a partir de contexto, intentos, decisión, aprendizaje e insight;
- preview multipágina;
- exportación PDF mediante `pdf-lib`, ensamblando las páginas PNG generadas desde los mismos nodos React.

La identidad utilizada por estos dos arquetipos es provisional y está encapsulada en `publication-renderer/identity/default-identity.ts`. Sirve para validar el motor sin cerrar todavía la identidad visual definitiva.

## Persistencia de Design

La selección de diseño ya puede guardarse en `publications` mediante:

- `archetype_key`;
- `archetype_version`;
- `variant_key`.

Antes de persistir una selección, la Server Action valida que:

- el arquetipo exista en el registro activo;
- coincida la versión;
- exista la variante;
- el formato sea compatible;
- el tipo de historia sea compatible.

De esta forma una publicación no puede quedar vinculada a una combinación que el renderer actual no soporte.

## Validación del vertical slice en base de datos

Se ejecutó una prueba transaccional bajo el rol autenticado real que comprobó:

- creación de Idea;
- creación de Publication vinculada;
- conversión de estado de la Idea;
- actualización posterior del borrador de publicación.

El resultado fue correcto y la transacción se revirtió al finalizar, por lo que no quedaron registros de prueba.

## Calidad técnica

El primer ciclo histórico de CI detectó una incompatibilidad de tipos al crear el `Blob` PDF. El problema se corrigió normalizando los bytes de `pdf-lib` antes de construir el `Blob`.

Para validar el estado completo actual se abrió temporalmente una PR de control que ejecutó el workflow `Quality`. El resultado fue verde en:

- instalación de dependencias;
- ESLint;
- TypeScript;
- build de Next.js.

La PR temporal se cerró sin fusionar y la rama de validación se devolvió al commit de `main`, por lo que no dejó el archivo marcador en la rama principal.

A continuación el workflow se actualizó para ejecutarse también en cada `push` a `main`. El primer run sobre `main` con esta configuración terminó correctamente en lint, TypeScript y build.

## Vercel

La integración de despliegue ha generado previews de validación, pero el conector de Vercel no está devolviendo después esos deployments en el listado del equipo, aunque sí entrega URL e Inspector al crearlos. Por ese motivo no se considera todavía validado el recorrido navegador → login → Content Studio.

Las variables públicas de Supabase se suministraron únicamente al snapshot de despliegue y no se guardaron en GitHub. La publishable key está diseñada para uso cliente; la protección efectiva de los datos depende de RLS.

La conexión Git continua entre GitHub y un proyecto Vercel estable sigue pendiente. Esto es un asunto operativo de despliegue, no una modificación de la arquitectura aprobada.

## Siguiente objetivo

1. validar el recorrido completo en navegador con el usuario real;
2. revisar visualmente Build Note y Step by Step con contenido real;
3. cerrar la identidad visual V1 y persistir `identity_profiles`;
4. persistir los renders finales después de exportarlos;
5. preparar la frontera `PUBLISH` hacia Buffer/LinkedIn.

Antes de implementar `PUBLISH` será necesario resolver un nuevo gate de arquitectura sobre el almacenamiento y exposición estable de los assets finales, porque Buffer necesita URLs públicas y estables mientras los recursos fuente deben permanecer privados.
