# AG-010 — Estrategia de fuentes para Suggestion Engine

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

La V1 de Content Publisher está en Release Candidate. El siguiente bloque previsto en la visión del producto es **Suggestion Engine**: detectar oportunidades de contenido a partir de trabajo y conocimiento reales sin inventar experiencia profesional.

Las fuentes previstas son inicialmente:

- repositorios GitHub;
- base de conocimiento profesional almacenada en GitHub;
- historial editorial de Content Publisher en Supabase;
- ideas manuales ya registradas;
- tendencias externas solo más adelante y cuando aporten valor.

Antes de implementar el motor hay que decidir cómo entra esa información en Content Publisher. Esta decisión condiciona persistencia, sincronización, duplicados, coste, seguridad y la futura capa de IA.

El gate **no decide todavía el proveedor de IA**. Esa decisión se tratará por separado después de cerrar cómo se obtienen y representan las señales.

## Objetivo funcional

Suggestion Engine debe poder responder a preguntas como:

```text
¿Qué trabajo reciente merece convertirse en publicación?
¿Por qué puede aportar valor?
¿Ya hemos hablado de algo demasiado parecido?
¿Qué enfoque narrativo encaja?
¿Qué formato y familia visual podrían funcionar?
```

Una sugerencia aceptada se convierte en **Idea**, nunca directamente en Publication.

## Decisión que debe tomarse

Elegir cómo Content Publisher accede y conserva información procedente de fuentes externas.

La frontera deseada es:

```text
Fuentes reales
    ↓
Source adapters
    ↓
Señales candidatas
    ↓
Suggestion Engine
    ↓
Suggestion
    ↓
[revisión humana]
    ↓
Idea
```

## Opción A — Lectura completamente bajo demanda

Content Publisher consulta cada fuente únicamente cuando el usuario solicita nuevas sugerencias.

Ejemplo:

```text
Solicitar sugerencias
      ↓
leer GitHub en ese momento
leer knowledge base en ese momento
leer historial en Supabase
      ↓
generar propuestas
```

No se mantiene una copia ni un índice local de señales externas.

### Ventajas

- arquitectura inicial muy pequeña;
- no duplica información de GitHub;
- no necesita sincronización;
- la fuente original sigue siendo la única verdad;
- no introduce procesos background.

### Inconvenientes

- hay que releer información ya analizada en cada ejecución;
- aumenta llamadas externas y contexto procesado;
- resulta más difícil saber qué cambios ya se analizaron;
- peor control de sugerencias repetidas;
- una fuente grande puede producir consultas lentas o costosas;
- complica construir historial de por qué apareció una sugerencia.

**Valoración:** válida para un prototipo muy pequeño, pero insuficiente como base duradera del motor.

## Opción B — Ingestar y replicar las fuentes en Supabase

Content Publisher copia de forma estructurada documentos, commits, issues u otros elementos externos a tablas propias y ejecuta Suggestion Engine principalmente sobre esa copia local.

### Ventajas

- búsqueda rápida y uniforme;
- buen control del estado de sincronización;
- permite análisis histórico y procesamiento incremental;
- reduce lecturas repetidas de APIs externas;
- prepara una futura indexación semántica.

### Inconvenientes

- duplica grandes cantidades de información;
- obliga a resolver sincronización, borrados y cambios remotos;
- aumenta Storage y base de datos;
- puede crear dudas sobre cuál es la fuente de verdad;
- requiere jobs de ingestión y observabilidad;
- es excesivo para una aplicación personal en esta fase.

**Valoración:** potente, pero sobredimensionada para la primera versión de Suggestion Engine.

## Opción C — Adaptadores + registro ligero de señales — RECOMENDADA

Las fuentes completas permanecen donde están. Content Publisher las lee mediante **adaptadores server-side**, pero solo persiste un registro ligero de los elementos relevantes ya observados.

No se replica el contenido completo del repositorio.

Ejemplo conceptual:

```text
GitHub / Knowledge Base
        ↓
source adapter
        ↓
extraer señales relevantes
        ↓
source_signals
  - source_type
  - source_repository
  - source_ref
  - fingerprint
  - title / summary
  - occurred_at
  - metadata ligera
  - first_seen_at
  - last_seen_at
        ↓
Suggestion Engine
```

El contenido completo se recupera de la fuente original cuando una señal necesita contexto adicional.

### Ejemplos de señal

```text
GitHub
- cierre de una feature relevante
- ADR nuevo
- sprint completado
- release
- cambio técnico con aprendizaje reutilizable

Knowledge Base
- playbook nuevo o actualizado
- patrón validado
- decisión reutilizable

Content Publisher
- tema que lleva tiempo sin publicarse
- idea archivada que ahora tiene nuevo contexto
- riesgo de repetir una publicación reciente
```

### Fingerprint

Cada señal recibe un identificador reproducible basado en su fuente y referencia estable, por ejemplo conceptualmente:

```text
source_type + repository + path/id + revision/event
```

Esto permite reconocer que algo ya se analizó sin copiar toda la fuente.

### Ventajas

- GitHub y la knowledge base siguen siendo las fuentes de verdad;
- persiste memoria suficiente para evitar trabajo y sugerencias duplicadas;
- volumen de Supabase muy pequeño;
- permite procesamiento incremental;
- facilita explicar de dónde salió una sugerencia;
- no necesita clonar repositorios en la base de datos;
- deja preparada una futura indexación semántica sin imponerla ahora;
- los adaptadores pueden reutilizarse si más adelante se añade sincronización programada.

### Inconvenientes

- requiere una nueva entidad `source_signals`;
- hay que definir fingerprints y metadatos por fuente;
- sigue necesitando consultar la fuente original cuando se requiere contexto profundo;
- introduce una pequeña capa de sincronización lógica, aunque no una réplica completa.

**Valoración:** recomendada.

## Alcance inicial si se aprueba C

### Source adapters

Contratos propios y server-side para:

```text
GitHubSourceAdapter
KnowledgeBaseSourceAdapter
EditorialHistorySourceAdapter
ManualIdeasSourceAdapter
```

GitHub y Knowledge Base pueden compartir infraestructura técnica porque la knowledge base vive en GitHub, pero permanecen como fuentes funcionales distintas.

### Persistencia ligera

Nueva entidad conceptual `source_signals` con:

- usuario;
- tipo de fuente;
- repositorio/fuente;
- referencia externa estable;
- fingerprint único por usuario;
- título/resumen corto;
- tipo de señal;
- fecha del evento fuente;
- metadata JSONB ligera;
- primera y última detección;
- estado de análisis opcional.

No se guardarán blobs, archivos completos ni repositorios completos en esta tabla.

### Seguridad

- credenciales de GitHub exclusivamente server-side;
- ningún token llega al navegador;
- no se copian secretos ni archivos arbitrarios a `source_signals`;
- los adapters aplican allowlist de repositorios/fuentes autorizados;
- una sugerencia nunca publica ni crea automáticamente una Publication.

### Activación inicial

La primera versión puede refrescar señales **bajo demanda**, reutilizando la filosofía aprobada para Buffer: el usuario solicita explorar novedades y el sistema actualiza el registro ligero.

Un scheduler futuro no forma parte de esta decisión y requerirá un gate adicional si se considera necesario.

## Lo que AG-010 no decide

Queda deliberadamente fuera de este gate:

- proveedor/modelo de IA;
- embeddings o base vectorial;
- frecuencia de refresco automático;
- tendencias externas;
- analítica de LinkedIn;
- publicación automática;
- agentes autónomos.

Estas decisiones solo aparecerán si el producto demuestra que las necesita.

## Recomendación

**Opción C — adaptadores server-side + registro ligero de señales, sin replicar las fuentes completas.**

Es la alternativa que mejor equilibra trazabilidad, coste, simplicidad y capacidad de evolución:

```text
Fuente original = verdad
Source signal   = memoria ligera de lo observado
Suggestion      = propuesta explicable
Idea            = decisión aceptada por el usuario
```

## Consecuencias si se aprueba C

1. Registrar la decisión como ADR.
2. Diseñar `source_signals` con RLS y fingerprint único.
3. Crear contrato común para source adapters.
4. Implementar primero historial + GitHub/knowledge base sin tendencias externas.
5. Añadir refresco manual/bajo demanda.
6. Construir una vista de señales antes de incorporar IA generativa.
7. Abrir posteriormente un gate separado para la estrategia de IA y modelos.

## Decisión solicitada

- **A** — lectura completa bajo demanda, sin persistencia de señales;
- **B** — replicar/indexar las fuentes en Supabase;
- **C** — adaptadores + registro ligero `source_signals` **(recomendada)**.

La implementación de Suggestion Engine queda detenida en este gate hasta aprobar una opción.