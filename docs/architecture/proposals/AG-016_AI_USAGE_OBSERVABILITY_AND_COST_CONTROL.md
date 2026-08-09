# AG-016 — Observabilidad y control de coste de Suggestion Engine

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

AG-015 mantiene Suggestion Engine bajo demanda y ya existen límites por ejecución. La integración OpenAI devuelve metadatos de uso (`inputTokens`, `outputTokens`, `totalTokens`), pero actualmente esos datos no forman parte de una política persistente de observabilidad.

Antes de activar el motor con uso real conviene decidir cuánto control económico debe asumir Content Publisher y cuánto debe delegarse al propio proyecto/proveedor de OpenAI.

La decisión afecta al modelo de datos, trazabilidad operativa y posibilidad de analizar consumo histórico.

## Opción A — Control únicamente en proveedor + feedback efímero

Content Publisher conserva sus límites por ejecución y puede mostrar el uso devuelto por la llamada actual, pero no persiste un historial propio de ejecuciones de IA.

El control monetario se realiza en la plataforma/proyecto de OpenAI.

### Ventajas

- ninguna tabla adicional;
- mínimo código y almacenamiento;
- la fuente económica oficial sigue siendo el proveedor;
- suficiente para un volumen personal muy pequeño.

### Inconvenientes

- no existe historial dentro de Content Publisher;
- difícil correlacionar consumo con cantidad/calidad de Suggestions;
- no podemos comparar fácilmente modelos o evolución del contexto desde la propia aplicación.

**Valoración:** válida y simple, pero aporta poca trazabilidad al motor.

## Opción B — Registro ligero `ai_runs` + presupuesto duro en proveedor — RECOMENDADA

Crear una entidad mínima de observabilidad para cada ejecución de Suggestion Engine, sin almacenar prompts ni contexto profundo.

Modelo orientativo:

```text
ai_runs
  id
  user_id
  feature
  provider
  model
  status
  input_tokens
  output_tokens
  total_tokens
  signals_considered
  signals_enriched
  suggestions_generated
  started_at
  completed_at
  error_code
```

No se guardarían:

- API keys;
- prompts completos;
- respuesta cruda del proveedor;
- fragmentos de repositorios;
- contexto efímero recuperado por `SourceContextResolver`.

El límite monetario fuerte seguiría configurándose en el proyecto/proveedor. Content Publisher usaría `ai_runs` para explicar cuánto y cómo se está usando la IA.

### Ventajas

- trazabilidad de consumo por ejecución;
- permite comparar modelos y calidad/coste más adelante;
- almacenamiento ínfimo;
- no replica contenido sensible;
- facilita detectar ejecuciones anómalas;
- separa observabilidad técnica de contenido editorial.

### Inconvenientes

- nueva tabla, RLS y código de lifecycle;
- requiere decidir qué registrar en fallos parciales;
- añade una pequeña responsabilidad operativa.

**Valoración:** mejor equilibrio entre transparencia, coste y simplicidad.

## Opción C — Presupuesto y bloqueo monetario calculado por la aplicación

Además de registrar ejecuciones, Content Publisher mantendría un catálogo de precios por modelo, calcularía coste estimado y bloquearía nuevas ejecuciones al alcanzar un presupuesto diario/mensual.

### Ventajas

- control visible dentro de la aplicación;
- posibilidad de límites propios por periodo;
- buena base para un producto multiusuario.

### Inconvenientes

- precios de modelos cambian y necesitan mantenimiento;
- cálculo monetario puede diferir de la facturación real del proveedor;
- hay que resolver concurrencia y consistencia del presupuesto;
- duplica parcialmente controles que ya ofrece el proveedor;
- sobredimensionado para una aplicación personal bajo demanda.

**Valoración:** innecesaria para V1.

## Recomendación

**Opción B — `ai_runs` como telemetría ligera, manteniendo el control monetario fuerte en OpenAI.**

La separación sería:

```text
OpenAI project/billing
      ↓
límite monetario real

Content Publisher
      ↓
ai_runs
      ↓
uso técnico y trazabilidad
```

Esto evita convertir Content Publisher en un sistema de facturación y a la vez permite comprender el coste técnico real de Suggestion Engine.

## Reglas propuestas si se aprueba B

1. RLS por `user_id`.
2. Solo metadatos técnicos; nunca secretos ni contenido profundo.
3. Registrar ejecuciones completadas y fallidas.
4. `provider` y `model` quedan como texto para comparar cambios de configuración.
5. Los tokens se registran solo cuando el proveedor los devuelve.
6. El motor sigue siendo bajo demanda.
7. No se introduce una tabla de precios en V1.
8. El presupuesto monetario real se configura fuera de la aplicación, en la cuenta/proyecto del proveedor.
9. La retención puede ser larga porque cada fila ocupa muy poco.
10. La telemetría nunca se utiliza para publicar automáticamente ni alterar una Suggestion ya generada.

## Lo que AG-016 no decide

- modelo OpenAI concreto;
- importe exacto del presupuesto mensual;
- scheduler;
- RAG/embeddings;
- tendencias externas;
- analítica de LinkedIn;
- publicación automática.

## Decisión solicitada

- **A** — control en proveedor + feedback efímero;
- **B** — `ai_runs` ligero + presupuesto real en proveedor **(recomendada)**;
- **C** — presupuesto monetario calculado y bloqueado por Content Publisher.

La implementación de persistencia de telemetría queda detenida en este gate.
