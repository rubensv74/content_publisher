# ADR-016 — Suggestions persistentes y ciclo de vida explícito

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-013  
**Decisión aprobada:** Opción B

## Contexto

Suggestion Engine ya dispone de `source_signals` y de un contrato `SuggestionModel` capaz de devolver candidatos editoriales estructurados. Faltaba decidir si esas propuestas debían existir únicamente durante la ejecución o convertirse en una entidad revisable del producto.

La frontera conceptual acordada es:

```text
Hecho observado      → source_signal
Propuesta del motor  → suggestion
Decisión humana      → idea
Contenido trabajado  → publication
```

## Decisión

Content Publisher persistirá las propuestas en una tabla `suggestions` y conservará la relación many-to-many con las señales que las justifican mediante `suggestion_source_signals`.

Una Suggestion no es una Idea. La IA puede generar propuestas, pero la bandeja de Ideas solo recibe una nueva fila después de una decisión humana explícita.

## Ciclo de vida

```text
new
 ├── accepted ──→ converted ──→ idea
 └── dismissed
```

Estados V1:

- `new`: propuesta pendiente de revisión;
- `accepted`: propuesta aprobada por el usuario pero todavía no convertida;
- `dismissed`: propuesta descartada y conservada para trazabilidad/deduplicación;
- `converted`: propuesta convertida explícitamente en Idea.

## Modelo de datos

`suggestions` conserva:

- propietario (`user_id`);
- título, oportunidad y justificación;
- tipo de historia, formato, familia visual y arquetipo recomendados;
- prioridad y confianza;
- proveedor y modelo que generaron la propuesta;
- `generation_fingerprint` para deduplicación exacta;
- estado y marcas temporales del ciclo de vida;
- referencia a la Idea creada cuando se convierte.

`suggestion_source_signals` conserva únicamente las claves relacionales entre Suggestion y sus `source_signals`. No copia el contenido de la señal.

## Seguridad

1. Ambas tablas utilizan RLS por `user_id`.
2. La tabla de relación también conserva `user_id` para hacer exigible en base de datos que Suggestion y Source Signal pertenezcan al mismo usuario.
3. La relación con `ideas` utiliza igualmente la identidad del usuario.
4. No se almacena la API key, el prompt completo ni la respuesta cruda del proveedor.
5. Los campos de proveedor/modelo son metadatos técnicos, no secretos.

## Deduplicación V1

`generation_fingerprint` se calcula server-side a partir de:

- IDs ordenados de las señales fuente;
- título normalizado;
- tipo de historia;
- formato;
- familia visual;
- arquetipo.

Existe unicidad por `(user_id, generation_fingerprint)`.

Este mecanismo evita duplicados exactos o casi idénticos de una misma ejecución. La deduplicación semántica avanzada queda fuera de este ADR.

## Revisión humana

- Generar una Suggestion nunca crea una Publication.
- `Aceptar` solo cambia `new → accepted`.
- `Descartar` cambia `new/accepted → dismissed`.
- `Convertir en Idea` exige una acción explícita del usuario y deja la Suggestion en `converted` vinculada a la Idea resultante.
- La Idea creada utiliza `source_type = suggestion-engine` y `source_ref = suggestion.id`.

## Señales relacionadas

Cuando una propuesta se persiste correctamente, sus señales se marcan como `suggested` para que el prefiltrado no las reprocese ciegamente en ejecuciones posteriores. La Suggestion conserva la relación con las señales originales, que siguen siendo una memoria ligera y no la fuente documental completa.

## Consecuencias positivas

- bandeja estable y revisable;
- trazabilidad completa señal → sugerencia → idea;
- separación semántica entre propuesta de IA y decisión humana;
- posibilidad de descartar sin borrar;
- deduplicación incremental;
- base para evaluar en el futuro qué tipo de señales generan propuestas útiles.

## Costes aceptados

- dos tablas nuevas;
- RLS y relaciones adicionales;
- pequeño incremento de lógica de estado;
- almacenamiento adicional muy reducido al ser únicamente texto y metadatos.

## Fuera de alcance

Este ADR no decide:

- embeddings o base vectorial;
- deduplicación semántica;
- scheduler;
- generación automática recurrente;
- aprendizaje a partir de aceptaciones;
- enriquecimiento profundo de contexto desde repositorios;
- publicación automática.
