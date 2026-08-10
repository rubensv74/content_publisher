# Estado de implementación

Fecha de actualización: 2026-08-10

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1** y entra en fase de validación operativa.

Flujo principal:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

La biblioteca visual V1 dispone de 12/12 arquetipos además de Build Note. Supabase, Buffer, Vercel y LinkedIn están integrados.

El plan de aceptación V1 está documentado en:

`docs/operations/V1_RELEASE_VALIDATION.md`

La primera comprobación manual obligatoria es **RC-01 — Flujo ChatGPT Plus**.

## Suggestion Engine — arquitectura vigente

La decisión AG-016 elimina la dependencia de una API de IA de pago. V1 aprovecha ChatGPT Plus mediante un flujo asistido/manual registrado en ADR-019.

```text
Fuentes
  ↓
source_signals
  ↓
prefiltro
  ↓
SourceContextResolver
  ↓
TXT preparado y sanitizado
  ↓
ChatGPT Plus — interacción manual
  ↓
JSON estructurado + STORY draft
  ↓
validación Content Publisher
  ↓
suggestions
  ↓
Aceptar / Descartar
  ↓
Idea
  ↓
Publication con STORY precargada
```

### Implementado

- señales locales, GitHub y Knowledge Base;
- memoria ligera `source_signals`;
- contexto adicional efímero y sanitizado;
- descarga `/suggestions/chatgpt-packet` en TXT;
- instrucciones y contrato JSON incluidos en el paquete;
- importación manual de JSON desde ChatGPT mediante texto pegado;
- importación alternativa mediante archivo `.json` o `.txt`;
- límite de importación de 256 KB;
- feedback visible cuando la importación falla;
- validación de IDs, enums, confianza y arquetipo;
- tema editorial propuesto por ChatGPT, separado de metadatos internos;
- `storyDraft` estructurado con `problem`, `attempts`, `solution`, `result`, `learning`, `insight` y `cta`;
- regla contractual: un bloque STORY no respaldado por las señales debe ser `null`;
- persistencia `suggestions` + `suggestion_source_signals`;
- persistencia ligera de `suggestions.topic` y `suggestions.story_draft`;
- deduplicación por fingerprint versionado para distinguir el contrato STORY v2;
- estados `new`, `accepted`, `dismissed`, `converted`;
- conversión explícita a Idea;
- precarga de tema, story type, formato y STORY al convertir una Idea procedente de Suggestion Engine en Publication;
- formulario de creación de Publication alineado con los siete bloques STORY, incluidos `result` y `cta`;
- ninguna publicación automática.

### Incidencia descubierta en RC-01

La primera prueba humana validó `Signal → ChatGPT Plus → Suggestion → Idea`, pero reveló que el contrato anterior solo clasificaba la oportunidad y dejaba vacíos los bloques STORY al iniciar la Publication.

La corrección mantiene ADR-019 y no introduce ninguna API ni proveedor nuevo: ChatGPT Plus prepara ahora un STORY draft basado exclusivamente en las señales. La prueba RC-01 debe repetirse con un paquete nuevo porque las Suggestions importadas con el contrato anterior no contienen `topic` ni `story_draft`.

### Coste de IA

- no se usa `OPENAI_API_KEY`;
- no se usa `OPENAI_SUGGESTION_MODEL`;
- no se realizan llamadas de IA desde Vercel;
- no se crea `ai_runs` en V1;
- la interacción de IA se realiza manualmente con ChatGPT Plus.

ADR-015 queda supersedido para la ejecución V1. ADR-019 es la decisión vigente.

## Límites de contexto

- hasta 20 señales por paquete;
- hasta 6 señales enriquecidas;
- hasta 12 rutas seguras por señal;
- hasta 2 documentos Markdown por señal;
- fragmentos de hasta ~2.400 caracteres;
- ningún binario;
- ningún repositorio completo;
- código fuente bruto no enviado por defecto;
- exclusión/redacción de rutas y patrones sensibles.

## Datos y Supabase

Entidades relevantes:

- `source_signals`;
- `suggestions`;
- `suggestion_source_signals`;
- `ideas`;
- `publications`;
- `renders`;
- `publishing_jobs`.

`suggestions` incorpora `topic` y `story_draft JSONB`. El JSONB solo actúa como estructura editorial acotada; el contrato de importación valida los siete campos y limita su longitud. RLS protege los datos por `user_id`. El contexto enriquecido de las fuentes no se persiste como copia documental.

## Configuración externa

Para GitHub Source Reader siguen siendo necesarias variables server-side:

```text
GITHUB_SOURCE_TOKEN
GITHUB_SOURCE_REPOSITORIES
GITHUB_KNOWLEDGE_BASE_REPOSITORY
```

No hay configuración OpenAI API pendiente.

## Repositorio público

El repositorio es público de forma intencionada para la estrategia de GitHub Actions. Los secretos permanecen fuera del repositorio y `.env*` está ignorado.

## Calidad

GitHub Actions ejecuta instalación, ESLint, TypeScript y build. Cada corrección del Release Candidate debe superar el workflow `Quality` antes de considerarse cerrada.

Los bloqueos `build-rate-limit` de Vercel se registran como incidencia operativa independiente cuando GitHub Quality permanece verde.

## Release Candidate

Validaciones definidas:

- RC-01 — ChatGPT Plus → Suggestion → Idea → STORY precargada;
- RC-02 — calidad de las fuentes;
- RC-03 — ciclo editorial completo hasta Buffer Draft;
- RC-04 — reconciliación Buffer;
- RC-05 — QA visual de arquetipos;
- RC-06 — seguridad y datos;
- RC-07 — calidad técnica.

No se añadirá alcance funcional nuevo durante esta fase salvo que una incidencia real lo justifique.

## Gates

La corrección del handoff STORY es una mejora funcional dentro del flujo manual aprobado por AG-016 / ADR-019 y del uso de JSONB ya aprobado; no abre un gate nuevo.
