# AG-010 — Estrategia de fuentes para Suggestion Engine

**Estado:** Aprobado — Opción C  
**Fecha:** 2026-08-09  
**ADR:** `ADR-013_SUGGESTION_SOURCE_SIGNALS.md`

## Contexto

Suggestion Engine debe detectar oportunidades de contenido a partir de trabajo y conocimiento reales sin inventar experiencia profesional.

Fuentes iniciales:

- repositorios GitHub;
- base de conocimiento profesional en GitHub;
- historial editorial de Content Publisher;
- ideas manuales;
- tendencias externas solo en una evolución posterior.

La decisión era cómo leer y recordar esas fuentes sin duplicarlas innecesariamente.

## Alternativas evaluadas

### A — Lectura completamente bajo demanda

Consultar las fuentes desde cero cada vez que se solicitan sugerencias.

Ventaja principal: arquitectura mínima.

Problemas: releer repetidamente información ya procesada, mayor coste de contexto, peor control de duplicados y menor trazabilidad de por qué apareció una sugerencia.

### B — Replicar/indexar fuentes completas en Supabase

Copiar documentos, commits, issues u otros elementos externos a tablas propias.

Ventaja principal: búsqueda local rápida y procesamiento incremental potente.

Problemas: duplicación de datos, sincronización, borrados, mayor almacenamiento y ambigüedad sobre la fuente de verdad. Sobredimensionado para una aplicación personal.

### C — Adaptadores + registro ligero de señales — APROBADA

Las fuentes completas permanecen donde están. Content Publisher las consulta mediante adaptadores server-side y persiste únicamente elementos relevantes ya observados.

```text
GitHub / Knowledge Base / datos locales
        ↓
Source Adapters
        ↓
SourceSignalCandidate
        ↓
source_signals
        ↓
Suggestion Engine
```

Una señal contiene referencia, fingerprint, título/resumen y metadatos ligeros; no copia el archivo o repositorio completo.

## Modelo aprobado

```text
Fuente original = verdad
SourceSignal    = memoria ligera de lo observado
Suggestion      = propuesta explicable
Idea            = decisión aceptada por el usuario
```

`source_signals` conserva:

- `source_type`;
- `source_locator`;
- `source_ref`;
- `fingerprint` único por usuario;
- `signal_type`;
- título y resumen corto;
- fecha del evento fuente;
- metadata JSONB ligera;
- `first_seen_at` y `last_seen_at`;
- estado de análisis.

## Salvaguardas

- RLS por usuario;
- no almacenar blobs ni repositorios completos;
- no almacenar secretos;
- adapters exclusivamente server-side;
- el fingerprint evita duplicar una señal ya observada;
- una señal no publica ni crea automáticamente una Publication;
- una futura Suggestion aceptada se convierte primero en Idea.

## Implementación inicial

Se implementan antes de introducir credenciales externas:

- tabla `source_signals`;
- contrato común `SourceSignalAdapter`;
- adapter de Ideas;
- adapter de Historial editorial;
- refresco manual/bajo demanda;
- vista `/signals` para inspeccionar la memoria ligera.

La conexión de GitHub/Knowledge Base privados se detiene en **AG-011**, porque requiere decidir una nueva credencial de runtime.

## Fuera de AG-010

No se decide todavía:

- proveedor/modelo de IA;
- embeddings;
- base vectorial;
- scheduler;
- tendencias externas;
- analítica LinkedIn;
- publicación automática.

## Resultado

**Opción C aprobada.** La decisión completa se registra en `ADR-013_SUGGESTION_SOURCE_SIGNALS.md`.
