# AG-014 — Enriquecimiento de contexto para Suggestion Engine

**Estado:** Aprobado — Opción B  
**Fecha:** 2026-08-09  
**ADR:** `ADR-017_SUGGESTION_EPHEMERAL_CONTEXT_RESOLVER.md`

## Decisión

Suggestion Engine utilizará un `SourceContextResolver` server-side para recuperar, únicamente bajo demanda, contexto adicional pequeño y sanitizado de las fuentes originales antes de llamar al modelo.

```text
source_signals
      ↓
prefiltro
      ↓
SourceContextResolver
      ↓
contexto efímero
      ↓
SuggestionModel
```

No se replica el repositorio, no se crea un índice persistente y el contexto enriquecido no se almacena en Supabase.

## Alcance aprobado

Para GitHub y Knowledge Base:

- mensaje completo del commit;
- estadísticas de cambio;
- rutas no sensibles de archivos modificados;
- pequeños fragmentos de Markdown modificado;
- fallback a señal ligera cuando no pueda resolverse contexto.

El código fuente bruto no se envía por defecto.

## Protecciones

- allowlist de repositorios obligatoria;
- exclusión de rutas sensibles;
- redacción defensiva de posibles secretos;
- límites de número de señales, archivos y caracteres;
- contenido fuente tratado como no confiable frente a prompt injection;
- ningún binario;
- contexto no persistente;
- `store: false` en Responses API.

## Alternativas descartadas

### A — Señales ligeras únicamente

Se conserva como fallback seguro, pero puede producir propuestas genéricas cuando el mensaje de commit es demasiado breve.

### C — RAG/índice persistente

Se pospone por complejidad, duplicación de corpus, sincronización y coste innecesarios para el volumen actual.

## Fuera de alcance

- embeddings;
- vector database;
- scheduler;
- análisis generalizado de código fuente;
- tendencias externas;
- publicación automática.
