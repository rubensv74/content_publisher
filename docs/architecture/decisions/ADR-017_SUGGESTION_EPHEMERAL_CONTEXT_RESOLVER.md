# ADR-017 — Contexto efímero y acotado para Suggestion Engine

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-014  
**Decisión aprobada:** Opción B

## Contexto

`source_signals` conserva una memoria ligera de hechos observados. Para GitHub y Knowledge Base, una señal puede contener poco más que un mensaje de commit y no aportar suficiente contexto para detectar el aprendizaje técnico real detrás del cambio.

No se quiere resolver este problema replicando repositorios completos ni introduciendo todavía RAG, embeddings o un índice persistente.

## Decisión

Content Publisher incorporará una frontera server-side `SourceContextResolver` que recupera contexto adicional únicamente para las señales seleccionadas en una ejecución de Suggestion Engine.

```text
source_signals
      ↓
prefiltro
      ↓
SourceContextResolver
      ↓
contexto efímero y sanitizado
      ↓
SuggestionModel
      ↓
suggestions
```

El contexto enriquecido no se persiste como copia documental en Supabase.

## Alcance V1

Para señales GitHub y Knowledge Base basadas en commits, el resolver puede recuperar:

- mensaje completo del commit;
- estadísticas agregadas de cambio;
- nombres/rutas de archivos modificados no sensibles;
- estado y adiciones/eliminaciones por archivo;
- un número pequeño de documentos Markdown modificados en ese commit.

El código fuente bruto no se envía por defecto al modelo.

## Límites iniciales

- máximo 20 señales ligeras seleccionadas por ejecución;
- máximo 6 señales enriquecidas por ejecución;
- máximo 12 rutas de archivos por señal enriquecida;
- máximo 2 documentos Markdown por señal;
- máximo aproximado de 2.400 caracteres por fragmento Markdown;
- lectura únicamente desde repositorios incluidos en la allowlist de AG-011;
- ningún binario;
- ningún repositorio completo.

Estos límites son parámetros internos reversibles y pueden ajustarse sin nuevo gate mientras no cambie la estrategia arquitectónica.

## Seguridad

1. El resolver reutiliza el GitHub Source Reader read-only de AG-011.
2. Se omiten rutas sensibles como `.env`, secretos, credenciales, contraseñas, tokens o claves privadas.
3. Se aplican redacciones defensivas a patrones habituales de credenciales antes de enviar texto al modelo.
4. Los documentos recuperados se consideran **contenido no confiable**. El prompt del modelo le ordena ignorar instrucciones o comandos embebidos en las fuentes.
5. Una lectura de enriquecimiento fallida degrada de forma segura a la señal ligera; no bloquea el lote completo.
6. El contexto profundo no se guarda en `suggestions`, `source_signals` ni logs de aplicación.
7. `store: false` continúa aplicándose a Responses API.

## Persistencia

Se conserva únicamente:

- la `source_signal` ligera original;
- la Suggestion resultante;
- la relación entre ambas.

El contexto recuperado se utiliza durante la ejecución y se descarta después.

## Consecuencias positivas

- mejor calidad editorial con mensajes de commit breves;
- coste y exposición limitados;
- GitHub/Knowledge Base continúan siendo fuentes de verdad;
- no hay sincronización de corpus;
- no se introduce vector database;
- fallback automático a señales ligeras.

## Costes aceptados

- lecturas adicionales a GitHub al generar sugerencias;
- más tokens en algunas ejecuciones;
- necesidad de filtros de seguridad y truncado;
- posibilidad de que una señal no pueda enriquecerse y use solo su resumen ligero.

## Fuera de alcance

Este ADR no decide:

- embeddings o RAG persistente;
- envío generalizado de código fuente;
- scheduler;
- generación automática recurrente;
- tendencias externas;
- modelo OpenAI concreto;
- publicación automática.
