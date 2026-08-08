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
- workflow de calidad en GitHub.

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

## Primer vertical slice de Content Studio

Se ha implementado el primer flujo funcional:

`IDEA → STORY → FORMAT → CONTENT STUDIO`

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
- se abre el primer editor de Content Studio.

Content Studio permite actualmente revisar y guardar la historia estructurada y un borrador del caption de LinkedIn. La biblioteca de Publicaciones lista los borradores existentes y permite reabrirlos.

## Validación del vertical slice en base de datos

Se ha ejecutado una prueba transaccional bajo el rol autenticado real que comprobó:

- creación de Idea;
- creación de Publication vinculada;
- conversión de estado de la Idea;
- actualización posterior del borrador de publicación.

El resultado fue correcto y la transacción se revirtió al finalizar, por lo que no quedaron registros de prueba.

## Vercel

Se ha iniciado un primer deployment de preview de la aplicación para comprobar el acceso desde navegador con el usuario real de Supabase.

Preview creado por la integración de despliegue:

`https://content-publisher-d3spxd9gk-seijoruben-5081s-projects.vercel.app`

Inspector devuelto por Vercel:

`https://vercel.com/seijoruben-5081s-projects/content-publisher/FKKckWwSkczwZsnKW1uHKaMaaWJx`

Las variables públicas de Supabase se suministraron únicamente al snapshot de despliegue y no se guardaron en GitHub. La publishable key de Supabase está diseñada para uso cliente y la protección efectiva de datos depende de RLS.

La integración de Vercel devolvió el deployment como `INITIALIZING`, pero las operaciones posteriores de consulta de estado no localizaron todavía ese deployment en el listado del equipo. Por tanto, no se considerará validado hasta abrir el preview y completar el login manualmente.

Este deployment de preview es una instantánea operativa para validación; no sustituye la futura conexión Git continua entre GitHub y Vercel.

## Calidad técnica

El primer ciclo de CI histórico detectó una incompatibilidad de tipos al crear el `Blob` PDF. El problema se corrigió normalizando los bytes de `pdf-lib` antes de construir el `Blob`.

Los runs antiguos permanecen en rojo como histórico. Las escrituras realizadas mediante la integración de GitHub no han generado nuevos runs visibles de Actions, por lo que el siguiente build de Vercel o una ejecución local seguirá siendo una validación necesaria del estado actual completo.

## Siguiente objetivo

1. abrir el preview de Vercel e iniciar sesión con el usuario personal;
2. crear una Idea desde la interfaz;
3. editarla y convertirla en publicación;
4. guardar la historia en Content Studio;
5. comenzar el bloque `DESIGN` conectando el contenido estructurado con el primer arquetipo React;
6. después habilitar `PREVIEW` y probar el exportador PNG/PDF con contenido real.

No se modificará la arquitectura aprobada sin abrir un nuevo gate si aparece una decisión estructural relevante.
