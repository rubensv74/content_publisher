# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1**.

Flujo principal:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

La biblioteca visual V1 dispone de 12/12 arquetipos además de Build Note. Supabase, Buffer, Vercel y LinkedIn están integrados.

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
JSON estructurado
  ↓
validación Content Publisher
  ↓
suggestions
  ↓
Aceptar / Descartar
  ↓
Idea
```

### Implementado

- señales locales, GitHub y Knowledge Base;
- memoria ligera `source_signals`;
- contexto adicional efímero y sanitizado;
- descarga `/suggestions/chatgpt-packet` en TXT;
- instrucciones y contrato JSON incluidos en el paquete;
- importación manual de JSON desde ChatGPT;
- validación de IDs, enums, confianza y arquetipo;
- persistencia `suggestions` + `suggestion_source_signals`;
- deduplicación por fingerprint;
- estados `new`, `accepted`, `dismissed`, `converted`;
- conversión explícita a Idea;
- ninguna publicación automática.

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

RLS protege los datos por `user_id`. El contexto enriquecido no se persiste como copia documental.

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

GitHub Actions ejecuta instalación, ESLint, TypeScript y build. Cada cambio funcional debe superar ese workflow antes de considerarse cerrado.

## Gates

Gates aprobados hasta **AG-016**. Decisiones registradas hasta **ADR-019**.

**No existe un gate de arquitectura abierto.** El desarrollo puede continuar autónomamente hasta que aparezca una nueva decisión estructural real.
