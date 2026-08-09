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

Suggestion Engine dispone ya de su cimentación de fuentes y memoria ligera. No se ha introducido todavía IA generativa.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui para aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth personal, sin signup público.
- AG-003 — React/DOM + `html-to-image` + `pdf-lib` detrás de adaptador propio.
- AG-004 — PostgreSQL relacional + JSONB.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público para renders finales.
- AG-007 — API key personal de Buffer server-side.
- AG-008 — `publications.visual_config JSONB` por namespace.
- AG-009 — reconciliación Buffer bajo demanda.
- AG-010 — source adapters + `source_signals`.
- AG-011 — GitHub fine-grained PAT read-only + allowlist.

Decisiones registradas hasta **ADR-014**.

### Gate abierto

**AG-012 — Estrategia de IA para Suggestion Engine.**

`docs/architecture/proposals/AG-012_SUGGESTION_ENGINE_AI_STRATEGY.md`

## Datos y Supabase

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`;
5. `add_source_signals`.

Buckets:

- `content-publisher`: privado para fuentes;
- `content-publisher-published`: lectura pública para renders finales.

RLS protege los datos por `user_id`.

## Producto V1

Implementado:

- autenticación privada;
- Ideas CRUD y conversión a Publication;
- Content Studio;
- identidad visual central;
- biblioteca de recursos;
- 12 arquetipos V1 + Build Note;
- PNG/PDF final;
- prevención de renders obsoletos;
- Buffer draft/programar/publicar ahora;
- confirmaciones para acciones externas;
- historial y reconciliación Buffer bajo demanda;
- política de Storage documentada.

## Suggestion Engine — cimentación

Arquitectura:

```text
Fuente original
      ↓
Source Adapter
      ↓
source_signals
      ↓
Suggestion Engine futuro
      ↓
Suggestion
      ↓
revisión humana
      ↓
Idea
```

`source_signals` conserva solo referencias, fingerprint, título/resumen, fecha, metadata ligera y estado de análisis. No replica repositorios ni documentos completos.

### Fuentes locales implementadas

- Ideas manuales;
- Historial editorial.

### GitHub Source Reader — AG-011

Decisión: fine-grained PAT de solo lectura, server-side y repo-scoped.

Variables preparadas:

```text
GITHUB_SOURCE_TOKEN
GITHUB_SOURCE_REPOSITORIES
GITHUB_KNOWLEDGE_BASE_REPOSITORY
```

Código preparado:

- cliente REST GitHub únicamente GET;
- validación de allowlist antes de cualquier petición;
- adapter GitHub para commits recientes;
- adapter Knowledge Base diferenciado funcionalmente;
- fingerprints estables por repositorio + commit;
- refresco GitHub bajo demanda desde `/signals`;
- ningún token persistido en Supabase.

La credencial real no está versionada ni se solicita por chat. Su configuración manual está documentada en:

`docs/operations/GITHUB_SOURCE_READER_SETUP.md`

## Buffer → LinkedIn

Implementado:

- draft;
- programar;
- publicar ahora;
- guardia contra drafts duplicados;
- eliminación de drafts;
- confirmación explícita para efectos reales;
- reconciliación bajo demanda;
- `Actualizar estado`.

La reconciliación es de lectura respecto a Buffer: no publica, reprograma ni borra contenido.

## Política de Storage

`docs/operations/STORAGE_RETENTION_POLICY.md`

Criterio V1:

- sin borrado automático;
- conservar historial/configuración ligera;
- estudiar limpieza de binarios al 70–80 % de cuota;
- retención temporal solo si el uso real lo justifica.

## Calidad y despliegue

GitHub Actions ejecuta instalación, ESLint, TypeScript y build Next.js.

Vercel ha alcanzado temporalmente su `build-rate-limit` por el elevado número de cambios del día. Esta situación operativa puede retrasar nuevos deployments, pero no cambia el estado del código validado por CI.

## Estado de V1

**Código: Release Candidate.**

Pendientes manuales con efecto externo:

1. programar deliberadamente una publicación de prueba;
2. comprobar reconciliación después del envío;
3. verificar el post real en LinkedIn;
4. marcar V1 como validada.

## Próxima frontera

El trabajo autónomo se detiene en **AG-012** antes de introducir proveedor, credencial o coste de IA para Suggestion Engine.