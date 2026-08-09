# ADR-011 — Configuración visual especializada por publicación

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-008  
**Decisión aprobada:** Opción B

## Contexto

Content Publisher separa actualmente:

- `structured_content` para la historia editorial;
- `assets` + `publication_assets` para archivos fuente;
- `archetype_key`, `archetype_version` y `variant_key` para seleccionar el renderer.

Los arquetipos especializados de V1 necesitan parámetros adicionales que no pertenecen a la narrativa ni son archivos: métricas, datos de gráfico, anotaciones, fragmentos de código, líneas destacadas o configuración before/after.

Mezclar estos datos dentro de `structured_content` degradaría la separación de responsabilidades y dificultaría reutilizar una misma historia con distintos diseños.

## Decisión

Añadir a `publications` una columna:

```sql
visual_config jsonb not null default '{}'::jsonb
```

con una restricción que exija un objeto JSON.

La columna se organiza por namespace de arquetipo:

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
  }
}
```

Las fronteras quedan:

```text
structured_content   → qué queremos contar
publication_assets   → qué archivos utilizamos
visual_config        → parámetros visuales especializados
archetype_key        → qué renderer interpreta la configuración
```

## Reglas

1. Cada arquetipo solo lee y valida su propio namespace.
2. Cambiar de diseño no elimina la configuración de otros arquetipos de la misma publicación.
3. La configuración especializada debe validarse antes de habilitar un render final.
4. El `render_context` guardará un snapshot del `visual_config` utilizado.
5. Una modificación de `visual_config` invalida los renders anteriores de la misma forma que una modificación del contenido o del diseño.
6. No se introduce una tabla adicional ni una versión independiente de configuración en V1.
7. La compatibilidad se apoya en `archetype_key` + `archetype_version`.

## Consecuencias positivas

- La historia editorial permanece independiente del diseño.
- No se añade una nueva tabla ni complejidad relacional prematura.
- Una publicación puede conservar configuraciones de varios arquetipos.
- Los renderers especializados pueden evolucionar mediante validadores locales y versionados.
- La decisión es coherente con ADR-007, que adopta un modelo relacional con JSONB para estructuras variables.

## Costes y límites

- Requiere una migración de esquema.
- Cada arquetipo especializado necesita su propio validador.
- El JSONB puede crecer si se almacenan muchas configuraciones, aunque el volumen previsto para V1 es pequeño.

## Alternativas descartadas

### A — Guardar datos especializados en `structured_content`

Descartada porque mezcla narrativa y presentación y acopla la historia a diseños concretos.

### C — Tabla `publication_visual_configs`

Descartada para V1 por añadir relaciones, RLS, índices y ciclo de vida independiente sin un beneficio proporcional para una aplicación personal.

## Evolución futura

Si las configuraciones visuales adquieren versionado propio, colaboración multiusuario, múltiples revisiones simultáneas o un ciclo de vida independiente, podrá evaluarse su extracción a una tabla específica mediante un nuevo gate de arquitectura.
