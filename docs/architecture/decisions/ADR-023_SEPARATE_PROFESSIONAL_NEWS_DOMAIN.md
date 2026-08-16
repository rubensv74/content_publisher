# ADR-023 — Dominio separado de noticias profesionales

## Estado

Aceptado el 17/08/2026 mediante AG-017, opción A.

## Contexto

Opportunity Radar estaba convirtiendo señales tecnológicas directamente en oportunidades profesionales. Esto mezclaba dos conceptos distintos: una noticia observada y una oportunidad que merece investigación o trabajo. El resultado podía ser técnicamente correcto pero poco útil como radar diario.

El objetivo de producto se redefine en tres corrientes prioritarias:

1. Power Apps.
2. Power BI.
3. IA aplicada a la profesión: análisis funcional, automatización, diseño de soluciones empresariales, agentes, datos, documentación/requisitos y productividad profesional.

Las fuentes originales pueden estar en inglés, pero la experiencia de consumo debe estar en español.

## Decisión

Se introduce un dominio persistente `News` separado de `Opportunity`.

```text
fuentes oficiales
      ↓
source_signals
      ↓
curación asistida con ChatGPT Plus
      ↓
news_items
      ↓ decisión humana
opportunities
      ↓
investigación / proyecto / caso de estudio
```

Principios semánticos:

```text
Signal       = hecho detectado en una fuente
NewsItem     = noticia profesional curada para lectura
Opportunity  = decisión humana de que una noticia merece trabajo
Suggestion   = oportunidad editorial para crear contenido
Idea         = decisión humana de crear contenido
```

## Persistencia

Se crean:

- `news_items`: versión curada en español, categoría, relevancia, estado de lectura y conversión;
- `news_item_source_signals`: relación N:M entre noticia y señales originales.

El artículo original sigue siendo la fuente de verdad. `news_items` no replica el artículo completo: conserva título en español, resumen breve, motivo de interés y referencia a las señales.

Categorías iniciales cerradas:

- `power-apps`
- `power-bi`
- `ai-applied`

Estados iniciales:

- `unread`
- `read`
- `saved`
- `dismissed`
- `converted`

## Curación e idioma

Content Publisher no llama a una API de IA. Mantiene ADR-019 y la política de coste cero:

1. refresca fuentes RSS oficiales;
2. prepara un TXT con un conjunto equilibrado de señales;
3. ChatGPT Plus clasifica, traduce/sintetiza y explica la relevancia profesional;
4. el usuario importa JSON estructurado;
5. el servidor valida IDs, categorías, puntuaciones y duplicados antes de persistir.

ChatGPT puede descartar una señal. No existe obligación de llenar un cupo.

## Fuentes

Las fuentes tecnológicas siguen registrándose como `source_signals`. El catálogo debe priorizar fuentes oficiales de Microsoft para Power Apps, Power BI y Microsoft 365/Copilot. Otras fuentes permanecen secundarias y no deben dominar el paquete de noticias.

## Conversión a Opportunity

Una noticia solo se convierte en Opportunity por una acción humana explícita. La Opportunity hereda la trazabilidad hacia las mismas `source_signals` y la noticia conserva `converted_opportunity_id`.

No se crean proyectos, casos de estudio, Suggestions ni publicaciones automáticamente.

## Coste y seguridad

- 0 EUR de coste adicional.
- Sin `OPENAI_API_KEY`.
- Sin scheduler ni cron en esta fase.
- Solo fuentes públicas oficiales mediante GET.
- RLS y `user_id` en las nuevas tablas.
- Contenido de fuentes tratado como datos no confiables.

## Consecuencias

Positivas:

- el usuario dispone de un radar de noticias útil antes de decidir qué investigar;
- Power Apps, Power BI e IA aplicada quedan visibles como corrientes independientes;
- noticias y oportunidades dejan de mezclarse;
- se conserva la trazabilidad hasta la fuente original;
- el idioma de consumo pasa a ser español sin alterar la fuente.

Trade-offs aceptados:

- dos tablas nuevas;
- una pantalla adicional;
- un segundo flujo asistido/manual con ChatGPT Plus;
- mayor disciplina de estados.
