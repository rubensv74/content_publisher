# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1**.

Flujo operativo:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

Supabase, Vercel, Buffer y el canal LinkedIn están integrados. Se ha validado un draft real en Buffer. La validación pública final continúa siendo deliberadamente manual: programar/publicar una pieza real y comprobar el resultado en LinkedIn.

La biblioteca visual V1 dispone de implementación runtime para **12 de 12 arquetipos**, además de Build Note.

Paralelamente se ha iniciado, tras aprobar AG-010, la cimentación de Suggestion Engine sin introducir todavía IA generativa ni credenciales GitHub nuevas.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui para aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth personal, sin signup público.
- AG-003 — React/DOM + `html-to-image` + `pdf-lib` detrás de adaptador propio.
- AG-004 — PostgreSQL relacional + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público separado para renders finales.
- AG-007 — API key personal de Buffer exclusivamente server-side.
- AG-008 — `publications.visual_config JSONB` por namespace de arquetipo.
- AG-009 — reconciliación de Buffer bajo demanda.
- AG-010 — source adapters + memoria ligera `source_signals`.

Decisiones registradas hasta **ADR-013**.

### Gate abierto

**AG-011 — Autenticación runtime de GitHub para fuentes privadas.**

Antes de que los adapters de GitHub y Knowledge Base puedan leer repositorios privados desde Vercel debe decidirse el mecanismo de autenticación. La propuesta está en:

`docs/architecture/proposals/AG-011_GITHUB_RUNTIME_AUTHENTICATION.md`

## Datos y Supabase

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`;
5. `add_source_signals`.

Buckets:

- `content-publisher`: privado para recursos fuente;
- `content-publisher-published`: lectura pública para renders finales consumibles por Buffer.

RLS protege los datos por `user_id`.

## Modelo editorial y visual

```text
structured_content   → qué queremos contar
publication_assets   → qué archivos utilizamos
visual_config        → parámetros especializados del diseño
archetype_key        → renderer seleccionado
render_context       → snapshot del resultado generado
```

Los cambios de contenido, diseño, configuración visual, assets o identidad invalidan de forma segura los renders anteriores para publicación sin borrar su trazabilidad.

## Ideas y Content Studio

Ideas permite crear, editar, archivar, eliminar y convertir una idea en publicación.

Content Studio persiste historia, caption, diseño, configuración visual y recursos. Los guardados muestran feedback explícito. El render final solo se habilita si diseño, assets y configuración especializada son válidos.

## Recursos visuales

`/assets` permite cargar PNG, JPEG y WebP al bucket privado, reutilizarlos y asociarlos mediante roles como:

```text
hero
before
after
```

## Biblioteca visual V1

Implementados:

1. ED-01 — Bold Statement;
2. ED-03 — Metric Hero;
3. PR-01 — Hero Screenshot;
4. PR-02 — Split Screenshot;
5. PR-03 — Annotated Screenshot;
6. PR-04 — Before / After;
7. TE-01 — Architecture Flow;
8. TE-02 — Code Focus;
9. TE-03 — Process Steps;
10. DA-01 — Data Story;
11. CA-01 — Tutorial Sequence / Step by Step;
12. CA-02 — Case Study.

Adicional: Build Note.

Single-image genera 1080 × 1350. Los carruseles generan PDF más miniatura PNG para Buffer.

## Buffer → LinkedIn

Implementado:

- draft;
- programar;
- publicar ahora;
- confirmaciones explícitas para acciones con efectos reales;
- guardia server-side contra drafts duplicados;
- eliminación de drafts desde Historial;
- reconciliación bajo demanda de estados no terminales;
- botón `Actualizar estado`.

Mapeo de reconciliación:

```text
scheduled       → scheduled
sending         → pending
needs_approval  → pending
sent            → published
error           → failed
```

La reconciliación es de lectura respecto a Buffer: no publica, reprograma ni borra contenido.

## Suggestion Engine — cimentación AG-010

Se ha adoptado:

```text
Fuente original = verdad
SourceSignal    = memoria ligera
Suggestion      = propuesta futura
Idea            = decisión humana aceptada
```

La nueva entidad `source_signals` conserva únicamente:

- fuente y referencia;
- fingerprint;
- tipo de señal;
- título/resumen;
- fecha del evento;
- metadata JSONB ligera;
- primera/última detección;
- estado de análisis.

No replica repositorios ni documentos completos.

### Adaptadores implementados sin credenciales externas

- Ideas manuales;
- Historial editorial.

### UI

`/signals` permite inspeccionar la memoria registrada y refrescar manualmente las fuentes locales.

### Pendiente

Los adapters GitHub/Knowledge Base se detienen antes de introducir credenciales. Esa frontera es AG-011.

## Política de Storage

`docs/operations/STORAGE_RETENTION_POLICY.md`

Criterio V1:

- no borrar automáticamente;
- conservar historial y configuración ligera;
- estudiar limpieza de binarios al acercarse al 70–80 % de la cuota;
- retención temporal de renders solo si el uso real lo justifica.

## Calidad

GitHub Actions ejecuta instalación, ESLint, TypeScript y build Next.js.

Vercel puede limitar temporalmente nuevos deployments cuando se supera su build-rate-limit; esa situación operativa no modifica el estado del código validado por CI.

## Estado de V1

**Código: Release Candidate.**

Pendientes manuales con efecto externo:

1. programar deliberadamente una publicación de prueba;
2. comprobar reconciliación después de la hora de envío;
3. verificar el post real en LinkedIn;
4. marcar V1 como validada.

## Próxima frontera

El trabajo autónomo se detiene en **AG-011** antes de conectar repositorios GitHub privados desde el runtime de Content Publisher.
