# AG-014 — Enriquecimiento de contexto para Suggestion Engine

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

AG-010 definió `source_signals` como memoria ligera y AG-012/AG-013 permiten convertir esas señales en Suggestions persistentes mediante un modelo de IA.

La primera implementación del motor envía exclusivamente campos normalizados de cada señal:

- tipo de fuente;
- repositorio/localizador;
- referencia;
- tipo de señal;
- título;
- resumen corto;
- fecha.

Esto es deliberadamente seguro y económico, pero para GitHub el contenido puede reducirse prácticamente al mensaje de un commit. Una señal como `feat: improve export flow` no contiene suficiente información para entender qué problema se resolvió, qué decisión fue importante o qué aprendizaje es transferible.

La nueva frontera es decidir cuánto contexto adicional puede recuperar Content Publisher antes de pedir una sugerencia a la IA.

## Opción A — Mantener únicamente señales ligeras

Suggestion Engine trabaja solo con `source_signals` tal como están persistidas.

### Ventajas

- mínimo coste de tokens;
- mínima exposición de información;
- cero lecturas adicionales a las fuentes;
- implementación ya disponible;
- comportamiento sencillo de auditar.

### Inconvenientes

- contexto técnico muy pobre para commits con mensajes breves;
- propuestas genéricas o poco fundamentadas;
- menor capacidad para distinguir un cambio rutinario de una decisión interesante;
- obliga a enriquecer manualmente los mensajes de commit si se quiere mejor calidad.

**Valoración:** válida como fallback, limitada como estrategia principal.

## Opción B — Context Resolver bajo demanda y acotado — RECOMENDADA

Introducir una frontera server-side `SourceContextResolver` separada de los Source Adapters.

```text
source_signals
      ↓
prefiltro determinista
      ↓
señales candidatas
      ↓
SourceContextResolver
      ↓
contexto acotado y sanitizado
      ↓
SuggestionModel
```

El resolver vuelve a la fuente original únicamente para las pocas señales seleccionadas en una ejecución. No crea una copia persistente del repositorio ni un índice completo.

### Contexto permitido inicialmente

Para una señal GitHub:

- mensaje completo del commit;
- nombres/rutas de archivos modificados;
- estadísticas de cambio cuando estén disponibles;
- fragmentos textuales pequeños únicamente de tipos/rutas permitidos;
- documentación Markdown relevante asociada al cambio.

Para Knowledge Base:

- título y metadatos del documento;
- fragmento Markdown limitado alrededor del contenido relevante;
- enlaces/relaciones documentales cuando ayuden a interpretar la señal.

### Límites propuestos

- recuperación solo bajo demanda;
- ningún repositorio completo;
- ningún binario;
- excluir `.env`, secretos, credenciales y rutas sensibles;
- no enviar archivos arbitrarios por defecto;
- tamaño máximo por señal y por ejecución;
- truncado explícito;
- contexto temporal: se usa para la llamada y no se persiste como copia documental en Supabase;
- `store: false` continúa aplicándose a la llamada del proveedor;
- logs sin contenido profundo.

### Ventajas

- mejora sustancial de calidad sin introducir RAG persistente;
- las fuentes siguen siendo la verdad;
- coste y exposición controlables;
- compatible con el diseño de adapters + memoria ligera ya aprobado;
- puede implementarse gradualmente por tipo de fuente.

### Inconvenientes

- más llamadas GitHub por ejecución;
- mayor coste de tokens;
- obliga a definir filtros y límites de seguridad;
- el contenido privado permitido puede viajar al proveedor de IA durante esa ejecución.

**Valoración:** equilibrio adecuado para una aplicación personal con generación manual y de bajo volumen.

## Opción C — Índice persistente / RAG semántico

Copiar o fragmentar contenido seleccionado, generar embeddings y mantener un índice persistente —por ejemplo PostgreSQL/pgvector— para recuperar contexto semántico.

### Ventajas

- búsqueda semántica potente;
- útil si el corpus crece mucho;
- permite combinar múltiples documentos y repositorios;
- reduce lecturas repetidas a GitHub una vez indexado.

### Inconvenientes

- duplica contenido de fuentes;
- sincronización e invalidación;
- embeddings y coste adicional;
- mayor superficie de privacidad y retención;
- más tablas, jobs y observabilidad;
- contradice la simplicidad buscada en la fase personal actual salvo evidencia de necesidad.

**Valoración:** sobredimensionada ahora.

## Recomendación

**Opción B — `SourceContextResolver` bajo demanda, acotado, sanitizado y no persistente.**

Mantendría dos niveles:

```text
Nivel 1 — siempre
source_signal ligera

Nivel 2 — solo cuando hace falta
contexto efímero y limitado recuperado desde la fuente
```

El motor podría seguir funcionando con Nivel 1 si una fuente no permite enriquecimiento.

## Política de privacidad propuesta para B

1. La allowlist de repositorios de AG-011 sigue siendo obligatoria.
2. El resolver no puede ampliar por sí mismo el conjunto de repositorios accesibles.
3. Se bloquean archivos de secretos/configuración sensible por nombre y patrón.
4. El código fuente bruto no se envía por defecto; el primer resolver prioriza metadatos de cambios y documentación textual.
5. Para habilitar contenido técnico más profundo de un repositorio privado tendría que existir una regla explícita de configuración, no una inferencia automática.
6. No se persiste el contexto recuperado como réplica en Supabase.
7. La Suggestion sí conserva sus relaciones con las `source_signals`, no el corpus profundo usado temporalmente.

## Control de coste propuesto

- aplicar el resolver únicamente a las señales que superen el prefiltrado;
- limitar el número de señales enriquecidas por ejecución;
- límite de caracteres/tokens por señal;
- truncar antes de llamar a OpenAI;
- mantener máximo de 5 Suggestions por lote;
- seguir ejecutando solo bajo demanda.

## Lo que AG-014 no decide

- embeddings futuros;
- proveedor alternativo de IA;
- scheduler;
- generación automática;
- analítica de rendimiento de LinkedIn;
- qué repositorios concretos se incluirán en la allowlist operativa;
- modelo OpenAI concreto.

## Decisión solicitada

- **A** — señales ligeras únicamente;
- **B** — contexto adicional acotado y efímero bajo demanda **(recomendada)**;
- **C** — índice/RAG persistente.

La implementación del contexto profundo se detiene en este gate. La generación basada únicamente en señales ligeras puede seguir funcionando con la arquitectura ya aprobada.
