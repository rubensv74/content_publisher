# AG-014 — Fuentes externas para Opportunity Radar

**Estado:** Aprobado — Opción B con coste adicional cero  
**Fecha:** 2026-08-10  
**ADR:** `ADR-021_OPPORTUNITY_RADAR_CURATED_ZERO_COST_SOURCES.md`  
**Política transversal:** `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`  
**Afecta a:** Opportunity Radar, Source Signals, seguridad, operación y costes

## Contexto

Content Publisher ya dispone de una estrategia aprobada para `source_signals`: las fuentes originales siguen siendo la verdad y la aplicación persiste únicamente señales ligeras observadas.

Opportunity Radar requiere ampliar esa estrategia a fuentes tecnológicas externas: webs oficiales, blogs de producto, changelogs, documentación, feeds y otras fuentes donde aparezcan lanzamientos o cambios relevantes.

La decisión debía resolver cómo adquirir esas señales sin convertir Content Publisher en un crawler generalista y sin introducir dependencias económicas.

## Restricción económica no negociable

El usuario establece que Content Publisher debe funcionar siempre con **0 EUR de coste adicional**.

La suscripción existente de ChatGPT Plus puede utilizarse mediante interacción humana, pero no autoriza consumo de la API de OpenAI, cuya facturación es independiente. Esta restricción queda formalizada en `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md` y no puede ser ignorada por implementaciones futuras.

Si una capacidad exige pago, se reduce, se ejecuta manualmente o se descarta.

## Alternativa A — Crawler web genérico

Content Publisher recibe una lista de URLs y rastrea páginas HTML de forma periódica, detectando cambios y extrayendo contenido.

### Valoración

Descartada como estrategia principal por:

- fragilidad ante cambios de HTML;
- complejidad de scraping;
- riesgo de incumplir términos o restricciones;
- necesidad de throttling, robots, reintentos y parsing específico;
- tendencia a capturar demasiado ruido;
- mantenimiento elevado para una aplicación personal.

## Alternativa B — Catálogo curado + adaptadores por tipo de fuente — APROBADA

Mantener un catálogo explícito de fuentes autorizadas y gratuitas utilizando el mecanismo más estable disponible en este orden:

1. RSS / Atom / feeds oficiales gratuitos;
2. APIs oficiales únicamente si su uso es gratuito y no requiere facturación habilitada;
3. changelog, release feed o endpoint estructurado público gratuito;
4. adaptador HTML específico únicamente cuando no exista alternativa razonable y el acceso sea compatible con las condiciones de la fuente.

```text
Source Catalog gratuito
      ↓
RSS / API gratuita / Structured Page / Targeted HTML Adapter
      ↓
ExternalSourceCandidate
      ↓
normalización + fingerprint
      ↓
SourceSignal
      ↓
Opportunity evaluation
```

### Ventajas

- encaja con la arquitectura existente de adaptadores;
- bajo acoplamiento;
- trazabilidad por fuente;
- control de volumen y calidad;
- fácil desactivar una fuente problemática;
- evita construir infraestructura de crawling genérica;
- permite incorporar fuentes de forma incremental;
- permite garantizar coste adicional cero.

### Costes aceptados

Los únicos costes admitidos son de complejidad y mantenimiento técnico, nunca económicos:

- algunas fuentes requerirán adaptadores específicos;
- el catálogo deberá mantenerse;
- no se cubrirá automáticamente toda la web.

## Alternativa C — Proveedor externo de búsqueda/agregación

Descartada. Un agregador externo puede introducir coste recurrente, límites comerciales o dependencia de proveedor y contradice la política rígida de coste adicional cero.

## Decisión aprobada

**Opción B — Catálogo curado + adaptadores por tipo de fuente, limitado exclusivamente a alternativas con coste adicional de 0 EUR.**

La decisión mantiene la filosofía aprobada en AG-010: fuentes originales como verdad, adaptadores server-side y persistencia ligera de señales.

## Reglas obligatorias de adquisición

1. Preferir fuentes oficiales o de primera parte.
2. Preferir mecanismos estructurados frente a scraping HTML.
3. No almacenar artículos completos salvo necesidad explícita y permiso compatible.
4. Persistir título, resumen mínimo, referencia, fecha, fingerprint y metadatos suficientes para trazabilidad.
5. Conservar siempre la URL o referencia original.
6. Respetar límites, términos de uso y restricciones de acceso.
7. No incorporar credenciales ni servicios que requieran pago o billing habilitado.
8. No incorporar una dependencia externa global para resolver una única fuente.
9. Si una fuente deja de ser gratuita, se desactiva o sustituye.
10. Si se alcanza un límite gratuito, la funcionalidad se detiene o degrada; nunca se genera un cargo.

## Contrato conceptual

Una fuente externa debería declarar como mínimo:

- identificador estable;
- nombre;
- organización/proveedor;
- URL principal;
- tipo de acceso (`rss`, `atom`, `api`, `structured-page`, `html-adapter`);
- áreas profesionales relacionadas;
- prioridad de consulta;
- estado activo/inactivo;
- política o notas de uso cuando sean relevantes;
- condición explícita `zero_additional_cost = true` o equivalente;
- fecha de última consulta correcta;
- información mínima de error operativo.

Las señales generadas deberán distinguir una fuente externa sin perder compatibilidad con `source_signals`.

## Primer catálogo candidato

El catálogo real se definirá mediante OR-01. Se estudiarán únicamente fuentes que puedan cumplir la política de coste cero, especialmente:

- release notes y blogs oficiales de plataformas utilizadas;
- GitHub releases de herramientas relevantes;
- blogs oficiales de ingeniería y producto;
- changelogs públicos de servicios;
- feeds de documentación y novedades;
- fuentes oficiales de estándares y ecosistemas técnicos.

## Scheduler

AG-014 decide únicamente cómo adquirir señales externas.

La primera implementación será manual/bajo demanda. La automatización periódica seguirá requiriendo un gate específico y solo podrá aprobarse si existe una solución con coste adicional cero y comportamiento fail-closed ante límites.

## IA

No se utilizará la API de OpenAI ni ninguna API de IA facturable para Opportunity Radar.

Cuando sea necesaria interpretación mediante IA se reutilizará el flujo manual de handoff a ChatGPT Plus aprobado en `ADR-019_CHATGPT_PLUS_ASSISTED_MANUAL_SUGGESTION_WORKFLOW.md`.

## Impacto aprobado

- ampliar de forma coherente los tipos de `source_signals`;
- crear un catálogo de fuentes separado de los adaptadores;
- reutilizar persistencia y deduplicación de `source_signals`;
- incorporar adapters externos gratuitos;
- mantener `suggestions` desacoplado de la adquisición;
- crear posteriormente el dominio `opportunities` sobre señales normalizadas;
- excluir por diseño cualquier dependencia que pueda generar coste adicional.

## Cierre

AG-014 queda **cerrado y aprobado** el 2026-08-10 con la Opción B y la restricción permanente de coste adicional cero.

OR-01 puede continuar inmediatamente y OR-02 podrá comenzar cuando exista un primer catálogo validado de fuentes gratuitas.