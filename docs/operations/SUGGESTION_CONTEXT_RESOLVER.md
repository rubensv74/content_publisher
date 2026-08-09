# Operación — Contexto enriquecido de Suggestion Engine

Fecha: 2026-08-09

## Objetivo

Documentar qué información adicional puede leer Suggestion Engine desde GitHub/Knowledge Base después de AG-014 y qué información queda excluida.

## Qué puede enviarse temporalmente al modelo

Solo para un conjunto pequeño de señales preseleccionadas:

- mensaje completo del commit;
- estadísticas agregadas;
- rutas no sensibles de archivos modificados;
- estado/adiciones/eliminaciones de esos archivos;
- pequeños fragmentos de Markdown modificado.

El contexto se recupera en el momento de `Generar sugerencias`, se usa para esa ejecución y no se guarda como copia documental en Supabase.

## Qué no se envía por defecto

- repositorios completos;
- binarios;
- `.env`;
- secretos o credenciales;
- contraseñas/tokens/claves privadas;
- código fuente bruto generalizado;
- metadata arbitraria de `source_signals`.

## Límites actuales

```text
20 señales ligeras máximas por lote
6 señales enriquecidas máximas
12 rutas máximas por señal enriquecida
2 documentos Markdown máximos por señal
~2.400 caracteres máximos por fragmento Markdown
5 Suggestions máximas por respuesta
```

## Fallback

El enriquecimiento es best-effort. Si GitHub no puede devolver el commit/documento o el archivo no cumple las reglas de seguridad, Suggestion Engine continúa con la señal ligera original.

## Seguridad frente a contenido malicioso

Los documentos fuente se consideran no confiables. Antes de llamar al modelo:

- se excluyen rutas sensibles;
- se redactan patrones comunes de credenciales;
- se trunca el contenido;
- el prompt del modelo indica expresamente que cualquier instrucción embebida en el contexto debe tratarse como datos, no como órdenes.

## Trazabilidad

La Suggestion conserva sus relaciones con `source_signals`, no con una copia del contexto profundo. GitHub y Knowledge Base continúan siendo la fuente de verdad.

Referencia arquitectónica:

`docs/architecture/decisions/ADR-017_SUGGESTION_EPHEMERAL_CONTEXT_RESOLVER.md`
