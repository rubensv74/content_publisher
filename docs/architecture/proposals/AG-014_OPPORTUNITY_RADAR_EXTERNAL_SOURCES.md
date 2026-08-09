# AG-014 — Fuentes externas para Opportunity Radar

**Estado:** Pendiente de decisión  
**Fecha:** 2026-08-10  
**Afecta a:** Opportunity Radar, Source Signals, seguridad, operación y costes

## Contexto

Content Publisher ya dispone de una estrategia aprobada para `source_signals`: las fuentes originales siguen siendo la verdad y la aplicación persiste únicamente señales ligeras observadas.

Opportunity Radar requiere ampliar esa estrategia a fuentes tecnológicas externas: webs oficiales, blogs de producto, changelogs, documentación, feeds y otras fuentes donde aparezcan lanzamientos o cambios relevantes.

Esta ampliación introduce una decisión arquitectónica real porque afecta a:

- cómo se accede a fuentes de terceros;
- qué dependencias y credenciales pueden ser necesarias;
- frecuencia y coste de consulta;
- cumplimiento de términos de uso y robots;
- deduplicación;
- resiliencia frente a cambios de HTML;
- despliegue y ejecución programada futura.

Por tanto, no debe implementarse hasta cerrar este gate.

## Objetivo

Elegir una estrategia que permita descubrir novedades de forma sostenible y explicable sin convertir Content Publisher en un crawler generalista.

## Alternativa A — Crawler web genérico

Content Publisher recibe una lista de URLs y rastrea páginas HTML de forma periódica, detectando cambios y extrayendo contenido.

### Ventajas

- máxima flexibilidad;
- permite cubrir casi cualquier web;
- independencia de feeds o APIs.

### Problemas

- alta fragilidad ante cambios de HTML;
- mayor complejidad de scraping;
- riesgo de incumplir términos o restricciones;
- necesidad de throttling, robots, reintentos y parsing específico;
- tendencia natural a capturar demasiado ruido;
- mantenimiento elevado para una aplicación personal.

**Valoración:** no recomendada como estrategia principal.

## Alternativa B — Catálogo curado + adaptadores por tipo de fuente

Mantener un catálogo explícito de fuentes autorizadas y utilizar el mecanismo más estable disponible en este orden:

1. RSS / Atom / feeds oficiales;
2. APIs oficiales cuando aporten valor real;
3. changelog o endpoint estructurado público;
4. adaptador HTML específico únicamente cuando no exista alternativa razonable.

```text
Source Catalog
      ↓
RSS / API / Structured Page / Targeted HTML Adapter
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
- permite incorporar fuentes de forma incremental.

### Costes

- algunas fuentes requerirán adaptadores específicos;
- el catálogo deberá mantenerse;
- no cubre automáticamente toda la web.

**Valoración:** opción recomendada.

## Alternativa C — Proveedor externo de búsqueda/agregación

Utilizar una API comercial o servicio externo que rastree la web y entregue noticias/resultados relevantes.

### Ventajas

- reduce el trabajo de extracción;
- cobertura amplia;
- búsqueda transversal inmediata.

### Problemas

- nueva dependencia crítica;
- coste recurrente potencial;
- límites y cambios de proveedor;
- menor control sobre qué se rastrea;
- mayor dificultad para explicar por qué una señal apareció;
- puede devolver mucho ruido y contenido duplicado.

**Valoración:** útil como complemento futuro, no recomendada como base inicial.

## Recomendación

**Opción B — Catálogo curado + adaptadores por tipo de fuente.**

La recomendación mantiene la filosofía aprobada en AG-010: fuentes originales como verdad, adaptadores server-side y persistencia ligera de señales.

No se aprueba todavía automáticamente. Requiere decisión explícita antes de implementar.

## Contrato conceptual propuesto

Sin fijar aún nombres de tablas o interfaces definitivas, una fuente externa debería declarar como mínimo:

- identificador estable;
- nombre;
- organización/proveedor;
- URL principal;
- tipo de acceso (`rss`, `atom`, `api`, `structured-page`, `html-adapter`);
- áreas profesionales relacionadas;
- prioridad de consulta;
- estado activo/inactivo;
- política o notas de uso cuando sean relevantes;
- fecha de última consulta correcta;
- información mínima de error operativo.

Las señales generadas deberían poder distinguir un nuevo tipo de fuente externa sin perder compatibilidad con `source_signals`.

## Política de adquisición propuesta

1. Preferir fuentes oficiales o de primera parte.
2. Preferir mecanismos estructurados frente a scraping HTML.
3. No almacenar artículos completos salvo que una fuente lo autorice y exista una necesidad explícita.
4. Persistir título, resumen mínimo, referencia, fecha, fingerprint y metadatos suficientes para trazabilidad.
5. Conservar siempre la URL o referencia original.
6. Respetar límites, términos de uso y restricciones de acceso.
7. Evitar credenciales nuevas hasta que una fuente concreta las justifique.
8. No incorporar una dependencia externa global para resolver una única fuente.

## Primer catálogo candidato

El catálogo real se definirá mediante investigación separada. Como categorías iniciales se estudiarán:

- release notes y blogs oficiales de plataformas utilizadas;
- GitHub releases de herramientas relevantes;
- blogs oficiales de ingeniería y producto;
- changelogs de servicios SaaS;
- feeds de documentación y novedades cuando existan;
- fuentes oficiales de estándares y ecosistemas técnicos.

No se aprueba ninguna fuente concreta en este gate.

## Scheduler

AG-014 decide únicamente cómo adquirir señales externas.

La ejecución automática periódica se mantiene fuera del alcance de esta decisión. La primera implementación deberá poder ejecutarse manualmente/bajo demanda. Cuando exista valor probado se abrirá un gate específico para scheduler, frecuencia, límites y observabilidad.

## Impacto esperado si se aprueba B

- ampliar el catálogo de `SourceSignalSourceType` con una categoría externa coherente;
- crear un catálogo de fuentes separado de los adaptadores;
- reutilizar la persistencia y deduplicación de `source_signals`;
- incorporar adaptadores externos server-side;
- mantener `suggestions` desacoplado de la forma de adquisición;
- crear posteriormente el dominio `opportunities` sobre señales ya normalizadas.

## Criterio de cierre

El gate queda cerrado cuando se elija explícitamente A, B o C —o una variante documentada— y se registre el ADR correspondiente.

Hasta entonces se permite investigación, documentación y backlog, pero **no implementación productiva del rastreo externo**.