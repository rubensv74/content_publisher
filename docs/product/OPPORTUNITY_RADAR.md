# Opportunity Radar — Concepto de producto

## Propósito

Opportunity Radar amplía Content Publisher desde la creación de contenido hacia la detección de oportunidades profesionales.

Su objetivo no es convertirse en un agregador de noticias tecnológicas. Debe detectar señales externas relevantes, filtrarlas y ayudar a convertirlas en aprendizaje, proyectos, casos de estudio y, cuando exista una historia real que contar, contenido profesional.

```text
Señal tecnológica
      ↓
Oportunidad
      ↓
Investigación / experimento / proyecto
      ↓
Caso de estudio
      ↓
Suggestion Engine
      ↓
Idea
      ↓
Publication
```

La publicación es una salida posible, no el objetivo inmediato de cada hallazgo.

## Problema que resuelve

Las novedades tecnológicas suelen consumirse de forma desconectada del trabajo real. Una herramienta nueva puede ser interesante, pero si no se convierte en una acción concreta termina siendo ruido.

Opportunity Radar debe responder a cinco preguntas:

1. ¿Qué ha aparecido o cambiado?
2. ¿Por qué puede ser relevante para el usuario?
3. ¿Merece la pena dedicarle tiempo?
4. ¿Qué aprendizaje, prueba o proyecto concreto podría producir?
5. ¿Existe después una historia profesional auténtica que merezca publicarse?

## Principio central

**Content Publisher no debe premiar la novedad; debe premiar la utilidad profesional.**

El sistema debe preferir pocas oportunidades explicables y de alta relevancia frente a un gran volumen de noticias.

## Relación con capacidades existentes

Opportunity Radar no sustituye `source-signals` ni `suggestions`.

La arquitectura actual ya distingue:

```text
Fuente original = verdad
SourceSignal    = memoria ligera de lo observado
Suggestion      = propuesta editorial explicable
Idea            = decisión humana
Publication     = contenido trabajado
```

Opportunity Radar introduce una capa nueva entre señal y contenido:

```text
External Source
      ↓
SourceSignal
      ↓
Opportunity
      ├── investigación
      ├── prueba técnica
      ├── proyecto
      ├── caso de estudio
      └── posible Suggestion
```

Una `Opportunity` representa una posible acción profesional derivada de una o varias señales. No es todavía una sugerencia de publicación.

## Tipos de señales que interesan

El catálogo concreto será configurable, pero inicialmente se consideran relevantes:

- lanzamiento de nuevo software o plataforma;
- nuevas capacidades de herramientas existentes;
- nuevas APIs, SDKs o integraciones;
- cambios importantes en productos utilizados en proyectos propios;
- nuevos patrones de arquitectura o desarrollo;
- novedades en IA aplicada al análisis, automatización y desarrollo;
- nuevas capacidades en datos, BI, low-code y automatización;
- estándares, guías o prácticas con impacto profesional;
- herramientas que permitan construir un prototipo demostrable;
- cambios que puedan generar un caso de estudio útil.

## Áreas profesionales iniciales

El radar debe poder clasificar oportunidades por áreas, sin convertir esta lista en una taxonomía rígida:

- análisis funcional;
- arquitectura de soluciones;
- diseño de sistemas;
- inteligencia artificial aplicada;
- automatización;
- Power Platform;
- SQL y datos;
- Power BI / analítica;
- desarrollo web;
- React / TypeScript / Next.js;
- Supabase / backend;
- Android;
- GitHub y flujo de desarrollo asistido por IA.

## Evaluación de una oportunidad

La puntuación no debe depender únicamente de popularidad o novedad. Como mínimo debe considerar:

- **relevancia profesional**: relación con las áreas de trabajo y aprendizaje;
- **accionabilidad**: posibilidad de hacer algo concreto con la señal;
- **potencial de aprendizaje**: conocimiento reusable que puede producir;
- **potencial de proyecto**: posibilidad de construir un experimento o producto demostrable;
- **potencial de caso de estudio**: capacidad para documentar problema, decisión, implementación y resultado;
- **potencial editorial**: posibilidad de convertirse posteriormente en contenido auténtico;
- **coste estimado**: esfuerzo necesario para obtener valor;
- **novedad respecto al historial**: evitar repetir temas ya investigados o publicados.

La fórmula exacta y los pesos no se fijan todavía como decisión arquitectónica.

## Opportunity Backlog

Las oportunidades seleccionadas deben vivir en un backlog propio y no mezclarse automáticamente con Ideas.

Ciclo conceptual inicial:

```text
new
 ├── shortlisted
 │      ├── investigating
 │      │      ├── project_candidate
 │      │      ├── case_study
 │      │      └── content_candidate
 │      └── archived
 └── dismissed
```

Este ciclo es funcional. La persistencia definitiva y sus estados se cerrarán antes de implementar el dominio.

## Conversión en caso de estudio

Una oportunidad puede convertirse en una propuesta de caso de estudio con:

- contexto y señal que lo origina;
- problema que merece investigarse;
- hipótesis o pregunta principal;
- experimento/prototipo propuesto;
- tecnologías implicadas;
- resultado esperado;
- conocimientos que demostraría;
- tamaño aproximado del trabajo;
- posible repositorio o proyecto destino;
- evidencias necesarias para considerarlo completado.

El sistema puede ayudar a estructurarlo, pero no debe presentar como experiencia algo que todavía no se ha realizado.

## Conversión en contenido

Una oportunidad puede alimentar Suggestion Engine en dos momentos distintos:

1. **antes del proyecto**, para contenido de análisis o investigación cuando exista valor real y se identifique claramente como tal;
2. **después del proyecto/caso de estudio**, para contenido basado en experiencia propia y evidencias.

La segunda vía debe tener mayor valor editorial porque demuestra trabajo realizado.

## Reglas de calidad

- No convertir cada noticia en una sugerencia.
- No copiar artículos completos ni replicar fuentes externas.
- Mantener enlace y trazabilidad a la fuente original.
- Distinguir hechos observados de interpretación del motor.
- Mostrar por qué una oportunidad ha sido priorizada.
- Permitir descartar y archivar sin borrar el historial útil para deduplicación.
- No crear proyectos, Ideas ni Publications sin una acción explícita del usuario.
- No afirmar que se ha probado o utilizado una tecnología si solo se ha detectado o investigado.

## Métrica de éxito

El éxito del radar no se medirá por señales capturadas.

Las métricas útiles serán posteriormente:

- oportunidades realmente investigadas;
- oportunidades convertidas en experimentos/proyectos;
- casos de estudio terminados;
- conocimiento reusable generado;
- Suggestions aceptadas derivadas de casos reales;
- publicaciones derivadas de experiencia propia.

## Fuera del primer alcance

No se incluye inicialmente:

- rastreo indiscriminado de toda la web;
- publicación automática;
- compra automática de herramientas;
- ejecución automática de proyectos;
- scraping masivo;
- entrenamiento de modelos propios;
- embeddings o base vectorial por defecto;
- analítica de reputación o alcance social como criterio principal.

## Resultado esperado

Content Publisher evoluciona de:

```text
Tengo una idea → creo una publicación
```

a:

```text
Detecto una señal
→ decido si merece atención
→ aprendo o construyo algo
→ documento el resultado
→ convierto experiencia real en contenido
```

Opportunity Radar debe ser el puente entre inteligencia tecnológica, aprendizaje práctico, portfolio y publicación profesional.