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

Suggestion Engine ya dispone de adquisición de señales, memoria ligera, lectura GitHub preparada, frontera OpenAI y persistencia/revisión de Suggestions.

## Arquitectura

Gates aprobados hasta AG-013:

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
- AG-013 — `suggestions` persistentes + trazabilidad a señales + revisión humana.

Decisiones registradas hasta **ADR-016**.

### Gate abierto

**AG-014 — Enriquecimiento de contexto para Suggestion Engine.**

`docs/architecture/proposals/AG-014_SUGGESTION_CONTEXT_ENRICHMENT.md`

## Datos y Supabase

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`;
5. `add_source_signals`;
6. `add_suggestions`.

Nuevas entidades de Suggestion Engine:

```text
source_signals
      ↑
      │ suggestion_source_signals
      │
suggestions
      │
      └── converted_idea_id → ideas
```

`suggestions` y `suggestion_source_signals` están creadas en el proyecto Supabase real, con RLS y relaciones que garantizan el mismo `user_id`.

Buckets:

- `content-publisher`: privado para fuentes;
- `content-publisher-published`: lectura pública para renders finales.

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

## Suggestion Engine — flujo implementado

```text
Fuente original
      ↓
Source Adapter
      ↓
source_signals
      ↓
prefiltro
      ↓
SuggestionModel
      ↓
OpenAI adapter
      ↓
suggestions
      ↓
Aceptar / Descartar
      ↓
Convertir en Idea
```

### Adquisición de señales

Fuentes locales:

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

### IA

OpenAI es el primer proveedor detrás del contrato interno `SuggestionModel`.

Protecciones:

- hasta 20 señales por ejecución;
- hasta 5 propuestas;
- Structured Outputs con JSON Schema estricto;
- validación de IDs de señales;
- modelo configurable;
- `store: false`;
- no se envía `metadata` arbitraria;
- no se envían repositorios completos en la implementación actual.

Variables preparadas:

```text
OPENAI_API_KEY
OPENAI_SUGGESTION_MODEL
```

La configuración manual está documentada en:

`docs/operations/OPENAI_SUGGESTION_ENGINE_SETUP.md`

### Persistencia y revisión — AG-013

Implementado:

- tabla `suggestions`;
- tabla `suggestion_source_signals`;
- fingerprint de generación;
- estados `new`, `accepted`, `dismissed`, `converted`;
- bandeja `/suggestions`;
- acción `Generar sugerencias` cuando OpenAI esté configurado;
- `Aceptar`;
- `Descartar`;
- `Convertir en Idea`;
- `ideas.source_type = suggestion-engine` para Ideas derivadas;
- trazabilidad hasta las señales originales;
- señales usadas marcadas `suggested` para evitar reprocesamiento ciego.

La generación real permanecerá inactiva mientras las variables OpenAI no estén configuradas en Vercel.

## Repositorio público

El repositorio se mantiene público de forma intencionada como decisión operativa de CI. La postura de seguridad está documentada en:

`docs/operations/PUBLIC_REPOSITORY_SECURITY_POSTURE.md`

Los secretos continúan fuera de GitHub; `.env`/`.env.local` están ignorados y el runtime utiliza variables server-side.

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

## Política de Storage

`docs/operations/STORAGE_RETENTION_POLICY.md`

Criterio V1:

- sin borrado automático;
- conservar historial/configuración ligera;
- estudiar limpieza de binarios al 70–80 % de cuota;
- retención temporal solo si el uso real lo justifica.

## Calidad y despliegue

La implementación de persistencia/UI de Suggestions ha superado instalación, ESLint, TypeScript y build de Next.js en GitHub Actions.

Vercel sigue pudiendo rechazar deployments temporales por `build-rate-limit`. El carácter público del repositorio resuelve la estrategia de minutos de GitHub Actions, pero es independiente de los límites de build de Vercel.

## Estado de V1

**Código: Release Candidate.**

Pendientes manuales con efecto externo:

1. programar deliberadamente una publicación de prueba;
2. comprobar reconciliación después del envío;
3. verificar el post real en LinkedIn;
4. marcar V1 como validada.

## Próxima frontera

El trabajo autónomo se detiene en **AG-014** antes de decidir si Suggestion Engine debe recuperar contexto profundo y efímero de GitHub/Knowledge Base o continuar exclusivamente con señales ligeras.
