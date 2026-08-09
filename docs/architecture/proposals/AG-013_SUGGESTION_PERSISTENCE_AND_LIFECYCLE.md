# AG-013 — Persistencia y ciclo de vida de Suggestions

**Estado:** Aprobado — Opción B  
**Fecha:** 2026-08-09  
**ADR:** `ADR-016_SUGGESTION_PERSISTENCE_AND_LIFECYCLE.md`

## Decisión

Las propuestas de Suggestion Engine se persisten como entidad propia `suggestions` y mantienen una relación many-to-many con las `source_signals` que las justifican mediante `suggestion_source_signals`.

```text
source_signal
      ↓
suggestion
      ↓
revisión humana
      ↓
idea
      ↓
publication
```

La separación semántica es obligatoria:

- una señal representa un hecho observado;
- una sugerencia representa una propuesta del motor;
- una Idea representa una decisión humana;
- una Publication representa contenido ya trabajado.

## Ciclo de vida aprobado

```text
new
 ├── accepted ──→ converted ──→ idea
 └── dismissed
```

- `new`: pendiente de revisión;
- `accepted`: aprobada por el usuario;
- `dismissed`: descartada sin borrarla;
- `converted`: convertida explícitamente en Idea.

## Persistencia

`suggestions` conserva el contenido estructurado de la propuesta, recomendación editorial, prioridad, confianza, proveedor, modelo, fingerprint de generación, estado y marcas temporales.

`suggestion_source_signals` conserva las relaciones con las señales fuente sin duplicar el contenido documental original.

## Reglas de seguridad

- RLS por `user_id`;
- relaciones protegidas también por `user_id` para impedir cruces entre propietarios;
- no se guarda el prompt completo ni la respuesta cruda del proveedor;
- no se guarda ningún secreto de OpenAI;
- la conversión a Idea exige una acción humana explícita.

## Deduplicación V1

`generation_fingerprint` evita duplicados exactos o casi idénticos de una misma oportunidad utilizando señales fuente y atributos editoriales normalizados.

La deduplicación semántica avanzada no forma parte de esta decisión.

## Implementación derivada

- migración `add_suggestions`;
- tabla `suggestions`;
- tabla `suggestion_source_signals`;
- bandeja `/suggestions`;
- acciones `Aceptar`, `Descartar` y `Convertir en Idea`;
- generación bajo demanda mediante el `SuggestionModel` aprobado en AG-012;
- las señales utilizadas pasan a `analysis_status = suggested`.

## Alternativas descartadas

### A — Suggestions efímeras

Descartada porque se perderían al recargar, impedirían una revisión estable y dificultarían deduplicación y trazabilidad.

### C — Crear directamente Ideas

Descartada porque mezclaría propuestas automáticas con decisiones humanas y llenaría la bandeja de Ideas de ruido no aceptado.

## Fuera de alcance

AG-013 no decide embeddings, base vectorial, scheduler, enriquecimiento profundo de contexto, tendencias externas, aprendizaje automático a partir de aceptaciones ni publicación automática.
