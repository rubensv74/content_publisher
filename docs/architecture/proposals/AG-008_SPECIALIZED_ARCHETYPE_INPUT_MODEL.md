# AG-008 — Modelo de datos especializados para arquetipos visuales

**Estado:** Propuesto — pendiente de decisión

## Contexto

Content Publisher ya puede construir una parte importante de la biblioteca V1 usando dos fuentes de información que ya están separadas:

- `structured_content`: historia editorial y narrativa de la publicación;
- `publication_assets`: relaciones con archivos fuente como screenshots o imágenes.

Esto ha permitido implementar sin ampliar el modelo de datos:

- Bold Statement;
- Hero Screenshot;
- Split Screenshot;
- Architecture Flow;
- Process Steps;
- Tutorial Sequence / Step by Step;
- Case Study;
- además de Build Note como arquetipo editorial operativo adicional.

Con ello, **7 de los 12 arquetipos objetivo de V1** ya están cubiertos.

Los cinco pendientes necesitan datos que no son puramente narrativos ni archivos:

- **ED-03 Metric Hero**: valor, etiqueta, delta y eventualmente serie/gráfico;
- **PR-03 Annotated Screenshot**: anotaciones, coordenadas y callouts;
- **PR-04 Before / After**: semántica explícita de dos estados visuales y configuración de comparación;
- **TE-02 Code Focus**: lenguaje, snippet, líneas destacadas y presentación;
- **DA-01 Data Story**: métricas, categorías, series y configuración de visualización.

Hasta ahora no era necesario decidir dónde persistir este tipo de información. A partir de este punto sí lo es, porque introducir esos datos de forma improvisada mezclaría responsabilidades y condicionaría todos los arquetipos posteriores.

## Decisión que debe tomarse

Definir dónde persisten los **inputs visuales especializados** de cada arquetipo y cómo se validan antes de renderizar.

La solución debe conservar tres fronteras claras:

```text
Historia editorial        → structured_content
Archivos fuente           → publication_assets + assets
Configuración visual      → ?
```

## Opción A — Guardar todo en `structured_content`

Ejemplo:

```json
{
  "problem": "...",
  "solution": "...",
  "learning": "...",
  "metricValue": "42%",
  "metricLabel": "menos tiempo",
  "codeLanguage": "typescript",
  "codeSnippet": "...",
  "annotations": []
}
```

### Ventajas

- no requiere migración;
- implementación inmediata;
- una sola estructura JSONB.

### Inconvenientes

- mezcla la historia editorial con datos de presentación;
- hace que `structured_content` dependa de arquetipos concretos;
- dificulta reutilizar una misma historia con diseños distintos;
- complica validación, mantenimiento y evolución del esquema;
- rompe la separación conceptual que el modelo V1 ya mantiene entre contenido, assets y diseño.

**Valoración:** no recomendada.

## Opción B — Añadir `visual_config JSONB` a `publications`

Añadir una columna JSONB específica para datos visuales no narrativos:

```sql
visual_config jsonb not null default '{}'::jsonb
```

con una restricción que garantice que siempre sea un objeto JSON.

La configuración se organizaría por clave de arquetipo para no perder trabajo al cambiar temporalmente de diseño:

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

### Responsabilidades

```text
structured_content
  → verdad narrativa/editorial

publication_assets
  → archivos y roles de los archivos

visual_config
  → parámetros especializados no binarios de cada arquetipo
```

Cada arquetipo registrado validará únicamente su propio namespace antes de permitir un render final.

El `render_context` conservará una copia del `visual_config` validado utilizado para producir el archivo final, igual que ya conserva contenido, identidad, diseño y assets.

### Ventajas

- mantiene limpia la historia editorial;
- encaja con ADR-007, que ya adopta núcleo relacional + JSONB para estructuras variables;
- no introduce una nueva tabla ni consultas adicionales;
- conserva configuraciones de varios diseños aunque el usuario cambie de arquetipo;
- permite validación runtime por arquetipo y versión;
- es suficiente para una V1 personal sin sobrediseñar la persistencia;
- puede extraerse a una tabla propia más adelante si la configuración visual adquiere un ciclo de vida independiente.

### Inconvenientes

- requiere una pequeña migración;
- obliga a mantener validadores por arquetipo;
- un mismo JSONB puede crecer si una publicación acumula muchas configuraciones, aunque el volumen esperado en V1 es muy pequeño.

**Valoración:** recomendada.

## Opción C — Crear `publication_visual_configs`

Ejemplo conceptual:

```text
publication_visual_configs
  id
  user_id
  publication_id
  archetype_key
  archetype_version
  config jsonb
  created_at
  updated_at
```

### Ventajas

- separación máxima;
- facilita múltiples configuraciones y versiones por publicación;
- permite gestionar la configuración visual con ciclo de vida independiente;
- puede ser útil en un futuro multiusuario, colaborativo o con versionado avanzado.

### Inconvenientes

- nueva tabla, relaciones, índices, políticas RLS y consultas;
- más complejidad en Studio y renderer;
- aumenta el coste de mantenimiento para una necesidad V1 todavía pequeña;
- introduce una abstracción que hoy no aporta valor funcional proporcional.

**Valoración:** técnicamente válida, pero sobredimensionada para V1.

## Recomendación

**Opción B — `visual_config JSONB` en `publications`, organizado por namespace de arquetipo.**

Es la alternativa que mejor conserva las fronteras actuales sin añadir una capa relacional prematura:

```text
Publication
├── structured_content   → qué queremos contar
├── publication_assets   → qué archivos utilizamos
├── visual_config        → cómo parametrizamos un arquetipo especializado
└── archetype_key        → qué renderer interpreta esos datos
```

No se propone una columna de versión adicional para V1. La compatibilidad se validará mediante `archetype_key` + `archetype_version`, que ya forman parte del contrato y del snapshot del render.

## Consecuencias si se aprueba B

1. Migración pequeña sobre `publications` para añadir `visual_config`.
2. Actualización de tipos TypeScript y consultas.
3. Validadores especializados junto a cada arquetipo.
4. Content Studio mostrará campos específicos solo cuando el diseño seleccionado los necesite.
5. `render_context` incluirá la configuración visual exacta utilizada.
6. Los renders anteriores quedarán obsoletos cuando cambie esa configuración, usando el mismo mecanismo de invalidez ya aplicado a contenido, identidad y assets.
7. Se podrá continuar con Metric Hero, Annotated Screenshot, Before / After, Code Focus y Data Story sin mezclar datos de presentación con la historia.

## Decisión solicitada

- **A** — ampliar `structured_content` con todos los datos especializados;
- **B** — añadir `visual_config JSONB` a `publications` **(recomendada)**;
- **C** — crear una tabla `publication_visual_configs` independiente.

La implementación de los cinco arquetipos especializados queda detenida en este gate hasta que se apruebe una opción.
