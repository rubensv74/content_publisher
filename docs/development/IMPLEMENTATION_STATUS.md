# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1**.

Flujo operativo principal:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

Supabase, Vercel, Buffer y LinkedIn están integrados. Se ha validado un draft real en Buffer; la validación pública final sigue siendo deliberadamente manual.

La biblioteca visual V1 dispone de implementación runtime para **12 de 12 arquetipos**, además de Build Note.

Suggestion Engine dispone ya de adquisición de señales, persistencia de Suggestions, revisión humana, enriquecimiento efímero/acotado de contexto y una cadencia V1 explícitamente bajo demanda.

## Arquitectura

Gates aprobados hasta **AG-015**. Decisiones registradas hasta **ADR-018**.

Últimas decisiones:

- AG-010 — adapters + `source_signals`;
- AG-011 — GitHub fine-grained PAT read-only + allowlist;
- AG-012 — OpenAI detrás de `SuggestionModel`;
- AG-013 — `suggestions` persistentes y relación many-to-many con señales;
- AG-014 — `SourceContextResolver` bajo demanda, sanitizado y no persistente;
- AG-015 — generación de Suggestions exclusivamente bajo demanda.

### Gate abierto

**AG-016 — Observabilidad y control de coste de Suggestion Engine.**

`docs/architecture/proposals/AG-016_AI_USAGE_OBSERVABILITY_AND_COST_CONTROL.md`

Debe decidirse si Content Publisher conserva telemetría técnica de las llamadas de IA o delega toda la observabilidad histórica al proveedor.

## Datos y Supabase

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`;
5. `add_source_signals`;
6. `add_suggestions`.

Entidades de Suggestion Engine:

```text
source_signals
      ↑
      │ suggestion_source_signals
      │
suggestions
      │
      └── converted_idea_id → ideas
```

RLS protege los datos por `user_id`. El contexto enriquecido de repositorios **no se persiste** en estas tablas.

## Suggestion Engine — flujo actual

```text
Usuario pulsa Generar sugerencias
      ↓
refresco de fuentes
      ↓
source_signals
      ↓
prefiltro
      ↓
SourceContextResolver
      ↓
contexto temporal cuando aplica
      ↓
SuggestionModel / OpenAI
      ↓
suggestions
      ↓
Aceptar / Descartar
      ↓
Convertir en Idea
```

### Cadencia AG-015

- ninguna generación en segundo plano;
- ningún cron, worker recurrente o webhook de generación;
- GitHub/OpenAI solo se consumen cuando el usuario inicia el análisis;
- `Generar sugerencias` refresca primero las fuentes para evitar el paso manual previo;
- si falla el refresco externo, el motor puede continuar con las señales disponibles y lo indica en la interfaz;
- la pantalla informa del número de señales refrescadas, analizadas y propuestas generadas.

### Límites de contexto AG-014

- hasta 20 señales ligeras por ejecución;
- hasta 6 señales enriquecidas;
- hasta 12 rutas seguras por señal enriquecida;
- hasta 2 documentos Markdown por señal;
- hasta ~2.400 caracteres por fragmento Markdown;
- ningún binario;
- ningún repositorio completo;
- código fuente bruto no enviado por defecto.

### Seguridad del contexto

- se reutiliza la allowlist GitHub de AG-011;
- se excluyen rutas sensibles (`.env`, secretos, credenciales, contraseñas, tokens, claves privadas);
- se redactan defensivamente patrones habituales de credenciales;
- el contenido fuente se trata como no confiable y el modelo recibe instrucción explícita para ignorar prompts/comandos embebidos;
- el fallo de enriquecimiento degrada a la señal ligera;
- el contexto no se guarda en Supabase ni como respuesta cruda del proveedor;
- Responses API continúa con `store: false`.

## Persistencia y revisión de Suggestions

Implementado:

- `suggestions`;
- `suggestion_source_signals`;
- fingerprint de generación;
- estados `new`, `accepted`, `dismissed`, `converted`;
- `/suggestions`;
- `Generar sugerencias`;
- `Aceptar`;
- `Descartar`;
- `Convertir en Idea`;
- `ideas.source_type = suggestion-engine`;
- trazabilidad señal → Suggestion → Idea.

## Configuración externa pendiente

La ejecución real de IA requiere variables server-side en Vercel:

```text
OPENAI_API_KEY
OPENAI_SUGGESTION_MODEL
```

La lectura runtime de GitHub requiere:

```text
GITHUB_SOURCE_TOKEN
GITHUB_SOURCE_REPOSITORIES
GITHUB_KNOWLEDGE_BASE_REPOSITORY
```

Los secretos no se guardan en GitHub ni Supabase.

## Repositorio público

`rubensv74/content_publisher` se mantiene público de forma intencionada para la estrategia de consumo de minutos de GitHub Actions. La postura de seguridad está documentada en `docs/operations/PUBLIC_REPOSITORY_SECURITY_POSTURE.md`.

## Producto V1

Implementado:

- autenticación privada;
- Ideas CRUD y conversión a Publication;
- Content Studio;
- identidad visual;
- biblioteca de recursos;
- 12 arquetipos V1 + Build Note;
- PNG/PDF final;
- prevención de renders obsoletos;
- Buffer draft/programar/publicar ahora;
- historial y reconciliación Buffer bajo demanda;
- política de Storage;
- Suggestion Engine hasta cadencia manual AG-015.

## Calidad y despliegue

GitHub Actions valida instalación, ESLint, TypeScript y build de Next.js. El último cambio de AG-014 fue validado correctamente y desplegado por Vercel.

La implementación derivada de AG-015 debe superar de nuevo el workflow antes de considerarse cerrada operativamente.

## Próxima frontera

El trabajo autónomo se detiene en **AG-016** antes de introducir persistencia de telemetría de IA o un presupuesto monetario interno.
