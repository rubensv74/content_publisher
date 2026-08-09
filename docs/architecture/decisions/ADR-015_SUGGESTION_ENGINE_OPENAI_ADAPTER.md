# ADR-015 — OpenAI como primer motor de Suggestion Engine detrás de un adaptador propio

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-012  
**Decisión aprobada:** Opción B

## Contexto

Content Publisher ya separa las fuentes originales de la memoria ligera `source_signals`. El siguiente paso es interpretar esas señales para detectar oportunidades editoriales con criterio suficiente para entender cambios técnicos, aprendizajes, decisiones de arquitectura y resultados.

Un motor puramente determinista resulta útil como prefiltrado, pero insuficiente para interpretar el valor narrativo de señales técnicas. Al mismo tiempo, no se justifica implementar varios proveedores de IA antes de tener evidencia de que se necesitan.

## Decisión

Suggestion Engine utilizará inicialmente OpenAI mediante la Responses API, pero el resto del producto dependerá de un contrato propio `SuggestionModel`, no de tipos o llamadas del proveedor.

```text
source_signals
      ↓
selección determinista de contexto
      ↓
Suggestion Engine
      ↓
SuggestionModel
      ↓
OpenAI adapter
      ↓
Responses API + Structured Outputs
      ↓
SuggestionCandidate[]
      ↓
revisión humana
```

## Fronteras

- `Source adapters` determinan qué hechos existen.
- `Suggestion Engine` decide qué señales analizar y cuánto contexto enviar.
- `SuggestionModel` define el contrato interno para interpretar señales.
- `OpenAI adapter` traduce el contrato interno a la API del proveedor.
- La persistencia y ciclo de vida de Suggestions se decidirán por separado.

## Salida estructurada

La respuesta del modelo debe respetar un JSON Schema estricto. Cada candidato incluye como mínimo:

- IDs de señales que lo justifican;
- título de oportunidad;
- oportunidad editorial;
- motivo por el que puede aportar valor;
- tipo de historia recomendado;
- formato recomendado;
- familia visual;
- arquetipo recomendado;
- prioridad;
- confianza.

No se acepta texto libre como contrato de integración.

## Seguridad y privacidad

1. `OPENAI_API_KEY` es exclusivamente server-side.
2. La clave no se almacena en Supabase ni GitHub.
3. El cliente nunca se importa en componentes de navegador.
4. El motor envía primero señales ligeras, no repositorios completos.
5. La llamada inicial excluye `metadata` arbitraria y usa únicamente campos normalizados necesarios.
6. Se utiliza `store: false` para no solicitar persistencia de estado de la respuesta.
7. La salida nunca publica contenido ni crea una Publication automáticamente.
8. La revisión humana sigue siendo obligatoria.

## Configuración

El modelo concreto no forma parte de la arquitectura y se configura mediante:

```text
OPENAI_SUGGESTION_MODEL
```

Cambiar el modelo por coste, calidad o disponibilidad no requiere un nuevo gate mientras se mantenga el mismo contrato funcional.

La credencial se configura mediante:

```text
OPENAI_API_KEY
```

Ambas variables son de servidor; la API key debe marcarse como sensible en Vercel.

## Control de coste

- ejecución solo bajo demanda en esta etapa;
- prefiltrado determinista de señales;
- límite explícito de señales por análisis;
- límite de sugerencias por respuesta;
- envío de contexto ligero;
- modelo configurable;
- sin embeddings, búsqueda vectorial ni procesamiento recurrente en esta decisión.

## Implementación

La primera implementación utiliza HTTP directo a `POST /v1/responses` para mantener la dependencia del proveedor encapsulada y pequeña. El request usa Structured Outputs mediante `text.format.type = json_schema` con `strict: true`.

El código queda preparado pero no realiza llamadas reales mientras no existan `OPENAI_API_KEY` y `OPENAI_SUGGESTION_MODEL` en el entorno del servidor.

## Consecuencias positivas

- interpretación editorial superior a reglas simples;
- salida predecible y validable;
- proveedor aislado;
- coste controlable;
- posibilidad de reemplazar OpenAI en el futuro sin modificar las entidades editoriales;
- no se introduce todavía almacenamiento vectorial ni infraestructura adicional.

## Costes y límites

- nueva credencial y facturación API independiente;
- comportamiento probabilístico que exige validación y evaluación;
- debe existir control de contexto y coste;
- una respuesta estructuralmente válida puede seguir siendo editorialmente poco útil, por lo que la revisión humana no desaparece.

## Fuentes oficiales

- https://platform.openai.com/docs/api-reference/responses
- https://platform.openai.com/docs/api-reference/authentication
- https://platform.openai.com/docs/guides/structured-outputs
- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

## Fuera de alcance

Este ADR no decide:

- persistencia de Suggestions;
- embeddings;
- vector database;
- RAG persistente;
- scheduler;
- tendencias externas;
- generación de publicaciones completas;
- publicación automática;
- generación de imágenes con IA.
