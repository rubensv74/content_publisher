# AG-013 — Persistencia y ciclo de vida de Suggestions

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

AG-012 aprobó OpenAI detrás de `SuggestionModel` para transformar `source_signals` en candidatos editoriales estructurados. Antes de exponer generación real en la interfaz debemos decidir qué ocurre con esas propuestas después de recibirlas.

La decisión afecta al modelo de datos, deduplicación, trazabilidad y relación entre una señal observada, una Suggestion y una Idea aceptada.

El flujo conceptual ya aprobado es:

```text
Source Signal
      ↓
Suggestion Engine
      ↓
Suggestion
      ↓
revisión humana
      ↓
Idea
```

La pregunta de AG-013 es si `Suggestion` debe ser una entidad persistente propia o solo un resultado temporal.

## Opción A — Suggestions efímeras

El modelo genera candidatos y se muestran en memoria. Al recargar la página desaparecen. Solo se persiste aquello que el usuario convierte inmediatamente en Idea.

### Ventajas

- ningún cambio adicional de base de datos;
- implementación mínima;
- poco almacenamiento.

### Inconvenientes

- se pierde una propuesta al cerrar o refrescar;
- no existe historial de sugerencias aceptadas/descartadas;
- difícil evitar que el motor proponga repetidamente lo mismo;
- no puede medirse qué señales generan oportunidades útiles;
- una ejecución fallida a mitad de revisión puede hacer perder resultados válidos.

**Valoración:** demasiado frágil para uso recurrente.

## Opción B — Entidad `suggestions` + relación explícita con señales — RECOMENDADA

Crear una entidad propia para las propuestas y una relación many-to-many con las señales que las justifican.

Modelo conceptual:

```text
source_signals
      ↑
      │ suggestion_source_signals
      │
suggestions
      │
      ├── new
      ├── accepted
      ├── dismissed
      └── converted
              ↓
             idea
```

Campos orientativos de `suggestions`:

- `id`;
- `user_id`;
- `title`;
- `opportunity`;
- `rationale`;
- `story_type`;
- `format`;
- `design_family`;
- `archetype_key`;
- `priority`;
- `confidence`;
- `status`;
- `provider`;
- `model`;
- `generation_fingerprint`;
- `created_at`;
- `updated_at`;
- `accepted_at` / `dismissed_at` cuando corresponda;
- `converted_idea_id` cuando termine convertida.

`suggestion_source_signals` conservaría las relaciones con las señales reales que sustentan cada propuesta.

### Ventajas

- bandeja revisable y estable;
- aceptar/descartar sin perder trazabilidad;
- deduplicación entre ejecuciones;
- permite aprender qué propuestas resultan útiles sin confundirlas con Ideas;
- mantiene clara la frontera `Suggestion = propuesta`, `Idea = decisión humana`;
- relación relacional precisa con una o varias señales fuente;
- facilita auditoría y futura evaluación del motor.

### Inconvenientes

- añade dos tablas y RLS;
- requiere lifecycle explícito;
- algo más de código de persistencia.

**Valoración:** coherente con el núcleo relacional existente y con AG-010.

## Opción C — Guardar directamente cada propuesta como Idea

Cada candidato generado por IA entra directamente en `ideas`, marcado con `source_type = suggestion-engine` y algún estado diferenciado.

### Ventajas

- reutiliza una entidad existente;
- UI y conversión a Publication ya disponibles;
- menos tablas.

### Inconvenientes

- mezcla propuestas no aceptadas con ideas decididas por el usuario;
- la bandeja de Ideas puede llenarse de ruido;
- descartar una sugerencia pasa a ser una operación sobre Ideas;
- dificulta medir aceptación real;
- debilita la revisión humana como frontera de producto.

**Valoración:** sencilla técnicamente pero incorrecta semánticamente.

## Recomendación

**Opción B — `suggestions` como entidad propia + `suggestion_source_signals`.**

La separación quedaría:

```text
Hecho observado   → source_signal
Propuesta del motor → suggestion
Decisión humana   → idea
Contenido trabajado → publication
```

Esto mantiene la semántica del producto y evita que la IA ensucie directamente la bandeja de Ideas.

## Reglas propuestas si se aprueba B

1. RLS por `user_id`.
2. Una Suggestion nunca crea una Publication directamente.
3. Solo una acción explícita de aceptación puede convertirla en Idea.
4. Descartar no borra necesariamente la fila; cambia su estado para evitar repetición.
5. Las señales fuente se relacionan mediante FK, no copiando su contenido.
6. `generation_fingerprint` ayuda a evitar candidatos duplicados equivalentes.
7. No se guarda el prompt completo ni respuestas crudas del proveedor por defecto.
8. Sí pueden conservarse `provider`, `model`, confianza y uso técnico mínimo para evaluación/coste.
9. La aceptación puede marcar las señales relacionadas como `suggested`, sin impedir que una misma señal participe en otra propuesta claramente distinta.
10. La política de retención de Suggestions será ligera; son datos pequeños, no binarios.

## Lo que AG-013 no decide

- algoritmo exacto de deduplicación semántica;
- embeddings;
- scheduler;
- frecuencia automática de generación;
- tendencias externas;
- aprendizaje automático a partir de aceptaciones;
- publicación automática.

## Decisión solicitada

- **A** — Suggestions efímeras;
- **B** — entidad `suggestions` + relación con `source_signals` **(recomendada)**;
- **C** — convertir todo directamente en Ideas.
