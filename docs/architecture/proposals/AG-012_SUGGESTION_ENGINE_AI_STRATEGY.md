# AG-012 — Estrategia de IA para Suggestion Engine

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

AG-010 separó las fuentes originales de la memoria ligera `source_signals`. AG-011 dejó preparada la lectura segura de repositorios privados. El siguiente paso funcional es decidir cómo transformar señales observadas en oportunidades editoriales útiles.

El objetivo no es producir publicaciones automáticamente. El motor debe evaluar hechos reales y devolver propuestas explicables que el usuario pueda aceptar, descartar o convertir en Idea.

```text
source_signals
      ↓
evaluación editorial
      ↓
Suggestion
  - oportunidad
  - por qué aporta valor
  - enfoque narrativo
  - formato recomendado
  - familia visual
  - prioridad/confianza
  - fuentes que la justifican
      ↓
revisión humana
      ↓
Idea
```

## Opción A — Motor determinista sin LLM

Reglas y scoring sobre tipo, recencia, tema, estado editorial y repetición.

### Ventajas

- coste de IA cero;
- comportamiento totalmente predecible;
- sin credencial adicional;
- fácil de probar.

### Inconvenientes

- interpreta mal matices técnicos;
- difícil resumir por qué un cambio puede ser interesante para otras personas;
- reglas crecientes y frágiles;
- poca capacidad para proponer enfoque narrativo.

**Valoración:** útil como prefiltrado, insuficiente como motor principal.

## Opción B — OpenAI inicial detrás de adaptador propio — RECOMENDADA

Crear una frontera `SuggestionModel` propia. La primera implementación usaría OpenAI Responses API exclusivamente desde servidor, con salida estructurada mediante JSON Schema. El resto del producto no importaría directamente el SDK/proveedor.

```text
Suggestion Engine
      ↓
SuggestionModel (contrato propio)
      ↓
OpenAI adapter
      ↓
Responses API + Structured Outputs
```

El modelo concreto se mantendría configurable mediante entorno, por ejemplo `OPENAI_SUGGESTION_MODEL`, para poder cambiar coste/calidad sin convertir cada cambio de modelo en una decisión arquitectónica.

### Ventajas

- buena interpretación de contexto técnico y editorial;
- salida estructurada validable;
- proveedor encapsulado;
- podemos combinar reglas deterministas con razonamiento del modelo;
- permite mantener la revisión humana obligatoria;
- no exige embeddings ni base vectorial en esta fase.

### Inconvenientes

- introduce `OPENAI_API_KEY` y facturación API separada de ChatGPT;
- coste variable por tokens;
- necesidad de límites de contexto y presupuesto;
- dependencia inicial de un proveedor, aunque quede aislada detrás del adapter.

### Control de coste propuesto

- refresco/generación solo bajo demanda;
- prefiltrar señales antes de llamar al modelo;
- enviar resúmenes y contexto necesario, no repositorios completos;
- limitar número de señales por análisis;
- modelo configurable;
- registrar uso técnico sin almacenar secretos;
- no generar publicaciones completas automáticamente.

OpenAI publica actualmente varios niveles de modelo. Para una primera evaluación editorial de bajo volumen puede priorizarse un modelo económico y cambiarlo después mediante configuración, sin fijarlo en el ADR.

## Opción C — Multi-provider desde el primer día

Diseñar e implementar simultáneamente adapters para varios proveedores/modelos.

### Ventajas

- máxima portabilidad;
- comparación de calidad/coste;
- menor dependencia operativa de un proveedor.

### Inconvenientes

- credenciales múltiples;
- contratos y diferencias de capacidades;
- más tests y observabilidad;
- complejidad sin evidencia de que vaya a utilizarse;
- ralentiza la primera versión útil de Suggestion Engine.

**Valoración:** sobredimensionada ahora. El contrato propio de la opción B deja abierta esta evolución cuando exista una necesidad real.

## Recomendación

**Opción B — OpenAI como primer proveedor, detrás de un contrato propio `SuggestionModel`, con Structured Outputs y revisión humana.**

La arquitectura propuesta separa tres responsabilidades:

```text
Source adapters   → qué hechos existen
Suggestion Engine → qué contexto seleccionar y qué reglas aplicar
SuggestionModel   → interpretar y devolver candidatos estructurados
```

## Seguridad y privacidad si se aprueba B

1. `OPENAI_API_KEY` exclusivamente server-side y sensible en Vercel.
2. Nunca guardar la clave en Supabase o GitHub.
3. No enviar secretos detectados ni archivos arbitrarios.
4. El motor trabaja primero sobre `source_signals` ligeras.
5. Solo recupera contexto profundo de una fuente cuando sea necesario.
6. Ninguna salida crea o publica una Publication automáticamente.
7. La aceptación humana crea una Idea.
8. Usar `store: false` para llamadas que no necesiten estado remoto persistente.

## Facturación

La API de OpenAI se factura y gestiona separadamente de las suscripciones ChatGPT. Antes de activar llamadas reales habrá que configurar la cuenta API y un presupuesto pequeño/controlado.

Fuentes oficiales:

- https://platform.openai.com/docs/api-reference/responses
- https://platform.openai.com/docs/guides/structured-outputs
- https://openai.com/api/pricing/
- https://help.openai.com/en/articles/8156019

## Lo que AG-012 no decide

- embeddings o vector database;
- RAG persistente;
- scheduler;
- tendencias externas;
- publicación automática;
- modelo exacto permanente;
- generación de imágenes con IA.

## Decisión solicitada

- **A** — reglas deterministas sin LLM;
- **B** — OpenAI inicial detrás de adapter propio **(recomendada)**;
- **C** — multi-provider desde el inicio.

La implementación de generación inteligente de Suggestions queda detenida en este gate.