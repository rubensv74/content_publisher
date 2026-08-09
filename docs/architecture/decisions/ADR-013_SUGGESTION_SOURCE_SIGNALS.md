# ADR-013 — Adaptadores de fuentes y memoria ligera de señales

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-010  
**Decisión aprobada:** Opción C

## Contexto

Suggestion Engine debe detectar oportunidades de contenido a partir de trabajo y conocimiento reales sin convertir Supabase en una réplica de GitHub ni releer ciegamente las mismas fuentes en cada ejecución.

Las fuentes iniciales previstas son:

- repositorios GitHub;
- base de conocimiento profesional almacenada en GitHub;
- historial editorial de Content Publisher;
- ideas manuales existentes.

## Decisión

Las fuentes completas permanecen en sus sistemas originales. Content Publisher las consulta mediante adaptadores server-side y persiste únicamente una memoria ligera de los elementos relevantes ya observados en `source_signals`.

```text
Fuente original
    ↓
Source Adapter
    ↓
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

La fuente original sigue siendo la verdad. `source_signals` no es una copia documental ni un índice completo del repositorio.

## Modelo de señal

Cada señal conserva como mínimo:

- usuario propietario;
- `source_type`;
- `source_locator`;
- `source_ref` estable;
- `fingerprint` único por usuario;
- `signal_type`;
- título;
- resumen corto opcional;
- fecha del evento fuente;
- `metadata` JSONB ligera;
- `first_seen_at`;
- `last_seen_at`;
- estado de análisis.

No se almacenan blobs, repositorios completos, secretos ni archivos arbitrarios.

## Reglas

1. Los adaptadores son server-side.
2. Cada adaptador devuelve candidatos normalizados y no escribe directamente en otras entidades editoriales.
3. `source_signals` utiliza RLS por `user_id`.
4. El `fingerprint` evita duplicar la misma señal observada varias veces.
5. Volver a detectar una señal actualiza `last_seen_at` y sus metadatos ligeros.
6. Una señal nunca crea automáticamente una Publication.
7. Una futura Suggestion aceptada se convertirá en Idea.
8. El contenido profundo se recuperará de la fuente original solo cuando haga falta contexto adicional.
9. La primera activación será manual/bajo demanda; no se introduce scheduler en esta decisión.
10. La autenticación necesaria para fuentes GitHub privadas se resolverá mediante un gate separado antes de introducir una credencial nueva.

## Consecuencias positivas

- volumen muy pequeño en Supabase;
- trazabilidad de qué se ha observado;
- reducción de duplicados;
- procesamiento incremental;
- GitHub y la knowledge base continúan siendo fuentes de verdad;
- independencia entre adquisición de señales y futura capa de IA;
- posibilidad de añadir scheduler o indexación semántica más adelante sin rehacer la frontera de fuentes.

## Costes y límites

- se añade la entidad `source_signals`;
- cada fuente necesita un adaptador y una estrategia de fingerprint;
- para contexto profundo siguen existiendo lecturas a la fuente original;
- el acceso a repositorios privados necesita una estrategia de autenticación explícita.

## Implementación inicial

La primera implementación incorpora el contrato común, persistencia `source_signals`, refresco manual y adaptadores locales para:

- historial editorial;
- ideas manuales.

Los adaptadores GitHub y Knowledge Base se incorporarán después de resolver la autenticación server-side de GitHub.

## Alternativas descartadas

### A — Lectura completa bajo demanda sin memoria

Descartada porque obliga a releer material ya analizado y dificulta controlar duplicados y trazabilidad.

### B — Replicar/indexar fuentes completas en Supabase

Descartada por introducir sincronización, duplicación de datos y coste operativo desproporcionados para una aplicación personal.

## Evolución futura

Embeddings, proveedor de IA, tendencias externas, scheduler y analítica de LinkedIn no forman parte de esta decisión y requerirán sus propios gates cuando aparezca la necesidad.