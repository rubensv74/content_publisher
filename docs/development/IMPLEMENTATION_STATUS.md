# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1**.

Flujo operativo principal:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

Supabase, Vercel, Buffer y el canal LinkedIn están integrados. Se ha validado un draft real en Buffer. La validación pública final continúa siendo deliberadamente manual: programar/publicar una pieza real y comprobar el resultado en LinkedIn.

La biblioteca visual V1 dispone de implementación runtime para **12 de 12 arquetipos**, además de Build Note.

Suggestion Engine dispone ya de adquisición de señales, memoria ligera, lectura GitHub preparada y una frontera de IA aprobada e implementada a nivel de contrato/cliente. La generación real de Suggestions permanece detenida hasta cerrar su persistencia y ciclo de vida.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui y renderer propio.
- AG-002 — Supabase Auth personal.
- AG-003 — React/DOM + `html-to-image` + `pdf-lib`.
- AG-004 — PostgreSQL relacional + JSONB.
- AG-005 — Next.js App Router + `src/`.
- AG-006 — assets privados + renders finales públicos.
- AG-007 — Buffer server-side.
- AG-008 — `visual_config JSONB`.
- AG-009 — reconciliación Buffer bajo demanda.
- AG-010 — source adapters + `source_signals`.
- AG-011 — GitHub fine-grained PAT read-only + allowlist.
- AG-012 — OpenAI detrás de `SuggestionModel` con Structured Outputs.

Decisiones registradas hasta **ADR-015**.

### Gate abierto

**AG-013 — Persistencia y ciclo de vida de Suggestions.**

`docs/architecture/proposals/AG-013_SUGGESTION_PERSISTENCE_AND_LIFECYCLE.md`

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

No se ha creado todavía una tabla `suggestions`; depende de AG-013.

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

## Suggestion Engine — adquisición de señales

Arquitectura:

```text
Fuente original
      ↓
Source Adapter
      ↓
source_signals
      ↓
Suggestion Engine
      ↓
SuggestionModel
      ↓
Suggestion
      ↓
revisión humana
      ↓
Idea
```

`source_signals` conserva solo referencias, fingerprint, título/resumen, fecha, metadata ligera y estado de análisis. No replica repositorios ni documentos completos.

Fuentes locales implementadas:

- Ideas manuales;
- Historial editorial.

GitHub Source Reader preparado:

- cliente REST únicamente GET;
- allowlist antes de cualquier petición;
- adapter GitHub para commits recientes;
- adapter Knowledge Base diferenciado;
- fingerprints por repositorio + commit;
- refresco bajo demanda;
- ningún token persistido en Supabase.

Configuración operativa:

`docs/operations/GITHUB_SOURCE_READER_SETUP.md`

## Suggestion Engine — IA AG-012

Decisión: OpenAI como primer proveedor detrás del contrato interno `SuggestionModel`.

Código preparado:

- tipos internos de `SuggestionCandidate`;
- preselección determinista de hasta 20 señales;
- límite de hasta 5 propuestas por ejecución;
- cliente server-side para Responses API;
- Structured Outputs con JSON Schema estricto;
- salida con historia, formato, familia visual, arquetipo, prioridad y confianza;
- comprobación de que los IDs fuente devueltos pertenecen al lote enviado;
- modelo configurable por entorno;
- solicitudes con `store: false`;
- no se envía `metadata` arbitraria en el primer contrato.

Variables preparadas:

```text
OPENAI_API_KEY
OPENAI_SUGGESTION_MODEL
```

No se configura ningún secreto en el repositorio. La activación operativa está documentada en:

`docs/operations/OPENAI_SUGGESTION_ENGINE_SETUP.md`

La generación real no se expone todavía en UI porque AG-013 debe definir dónde viven las Suggestions y cómo se aceptan/descartan.

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

Vercel ha alcanzado temporalmente su `build-rate-limit` por el elevado número de cambios del día. Esta situación operativa puede retrasar deployments, pero no cambia el estado del código validado por CI.

## Estado de V1

**Código: Release Candidate.**

Pendientes manuales con efecto externo:

1. programar deliberadamente una publicación de prueba;
2. comprobar reconciliación después del envío;
3. verificar el post real en LinkedIn;
4. marcar V1 como validada.

## Próxima frontera

El trabajo autónomo se detiene en **AG-013** antes de crear persistencia de Suggestions o activar llamadas reales a OpenAI desde la interfaz.
