# AG-008 — Modelo de datos especializados para arquetipos visuales

**Estado:** Aprobado — Opción B  
**Fecha de decisión:** 2026-08-09  
**ADR:** `ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`

## Contexto

Content Publisher ya puede construir una parte importante de la biblioteca V1 usando dos fuentes de información separadas:

- `structured_content`: historia editorial y narrativa de la publicación;
- `publication_assets`: relaciones con archivos fuente como screenshots o imágenes.

Los arquetipos especializados pendientes necesitan datos que no son puramente narrativos ni archivos:

- **ED-03 Metric Hero**: valor, etiqueta, delta y eventualmente serie/gráfico;
- **PR-03 Annotated Screenshot**: anotaciones, coordenadas y callouts;
- **PR-04 Before / After**: semántica explícita de dos estados visuales y configuración de comparación;
- **TE-02 Code Focus**: lenguaje, snippet, líneas destacadas y presentación;
- **DA-01 Data Story**: métricas, categorías, series y configuración de visualización.

La decisión debía preservar tres fronteras claras:

```text
Historia editorial        → structured_content
Archivos fuente           → publication_assets + assets
Configuración visual      → ?
```

## Alternativas evaluadas

### Opción A — Guardar todo en `structured_content`

Ventaja principal: no requiere migración.

Descartada porque mezcla la historia editorial con datos de presentación, acopla el contenido a arquetipos concretos y dificulta reutilizar una misma historia con varios diseños.

### Opción B — Añadir `visual_config JSONB` a `publications`

```sql
visual_config jsonb not null default '{}'::jsonb
```

La configuración se organiza por clave de arquetipo:

```json
{
  "metric-hero": {
    "value": "42%",
    "label": "menos tiempo",
    "delta": "-18%"
  },
  "code-focus": {
    "language": "typescript",
    "snippet": "...",
    "highlightLines": [3, 4, 5]
  },
  "annotated-screenshot": {
    "annotations": [
      {
        "x": 0.42,
        "y": 0.31,
        "label": "Filtro interactivo"
      }
    ]
  }
}
```

Responsabilidades:

```text
structured_content
  → verdad narrativa/editorial

publication_assets
  → archivos y roles de los archivos

visual_config
  → parámetros especializados no binarios de cada arquetipo
```

Cada arquetipo registrado valida únicamente su propio namespace antes de permitir un render final. El `render_context` conserva una copia de la configuración utilizada.

**Opción aprobada.**

### Opción C — Crear `publication_visual_configs`

Técnicamente válida, pero descartada para V1 por introducir una nueva tabla, relaciones, índices, RLS y consultas sin un beneficio proporcional para una aplicación personal.

## Decisión

Se aprueba **Opción B — `visual_config JSONB` en `publications`, organizado por namespace de arquetipo**.

```text
Publication
├── structured_content   → qué queremos contar
├── publication_assets   → qué archivos utilizamos
├── visual_config        → cómo parametrizamos un arquetipo especializado
└── archetype_key        → qué renderer interpreta esos datos
```

No se añade una columna de versión independiente en V1. La compatibilidad se valida mediante `archetype_key` + `archetype_version`.

## Consecuencias aprobadas

1. Migración sobre `publications` para añadir `visual_config`.
2. Actualización de tipos TypeScript y consultas.
3. Validadores especializados junto a cada arquetipo.
4. Content Studio mostrará campos específicos solo cuando el diseño seleccionado los necesite.
5. `render_context` incluirá la configuración visual exacta utilizada.
6. Los renders anteriores quedarán obsoletos cuando cambie esa configuración.
7. Se puede continuar con Metric Hero, Annotated Screenshot, Before / After, Code Focus y Data Story sin mezclar datos de presentación con la historia.

## Registro

La decisión definitiva se documenta en:

`docs/architecture/decisions/ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`
