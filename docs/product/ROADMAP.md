# Roadmap de Content Publisher

Este roadmap ordena el desarrollo sin convertirlo en un compromiso rígido de fechas. Cada fase debe cerrar una capacidad útil antes de abrir la siguiente.

## Fase 0 — Cimentación

Objetivo: dejar el producto definido antes de empezar a implementar.

Incluye:

- visión;
- alcance V1;
- arquitectura base acordada;
- reglas de documentación;
- estrategia visual;
- plan de investigación;
- registro de decisiones;
- estructura inicial del repositorio.

Salida esperada: repositorio preparado para iniciar desarrollo sin decisiones implícitas.

## Fase 1 — Núcleo de contenido

Objetivo: poder capturar y estructurar una publicación sin diseño final.

Incluye:

- acceso privado;
- bandeja de ideas;
- estados;
- tipos de historia;
- editor de contenido;
- guardado de borradores;
- historial básico.

Salida esperada: una idea puede convertirse en un borrador editorial completo.

## Fase 2 — Sistema visual

Objetivo: transformar contenido estructurado en piezas visuales coherentes.

Incluye:

- identidad visual;
- tokens y reglas visuales;
- catálogo de arquetipos;
- primeras familias de diseño;
- carga de screenshots e imágenes;
- preview;
- generación de imagen.

Salida esperada: primera publicación visual generada íntegramente desde la aplicación.

## Fase 3 — Carruseles

Objetivo: soportar contenido multipágina.

Incluye:

- estructura de páginas;
- variantes de carrusel;
- navegación y preview;
- generación de documento final.

Salida esperada: carrusel listo para LinkedIn sin editor externo.

## Fase 4 — Publicación

Objetivo: cerrar el flujo completo.

Incluye:

- integración con Buffer;
- publicar ahora;
- programar;
- registro de estado;
- manejo de errores y reintentos controlados.

Salida esperada: publicación real enviada a LinkedIn desde Content Publisher.

## Fase 5 — Pulido V1

Objetivo: hacer el producto cómodo para uso recurrente.

Incluye:

- mejoras de usabilidad;
- control de calidad visual;
- revisión de tiempos de creación;
- ampliación hasta el objetivo de arquetipos de V1;
- documentación de uso;
- estabilización.

Salida esperada: V1 utilizable de forma habitual.

---

# Después de la V1

## Suggestion Engine

Motor de sugerencias de contenido basado en señales reales.

Fuentes previstas:

- GitHub;
- base de conocimiento;
- historial de publicaciones;
- ideas manuales;
- oportunidades detectadas por Opportunity Radar;
- tendencias externas cuando sean relevantes.

El motor deberá poder proponer:

- oportunidad de contenido;
- motivo por el que puede aportar valor;
- enfoque narrativo;
- formato;
- familia visual;
- prioridad o potencial.

## Opportunity Radar

Capa de inteligencia profesional que detecta novedades tecnológicas y las convierte en oportunidades accionables antes de decidir si merecen convertirse en contenido.

Flujo objetivo:

```text
fuente externa
→ source signal
→ opportunity
→ investigación / experimento / proyecto
→ caso de estudio
→ suggestion
→ idea
→ publication
```

Principios:

- no funcionar como agregador generalista de noticias;
- priorizar pocas señales de alta relevancia;
- conectar novedades con aprendizaje, proyectos y portfolio;
- mantener trazabilidad a la fuente original;
- separar una señal externa de una experiencia realmente realizada;
- aprovechar Suggestion Engine en lugar de duplicar un segundo motor editorial.

La definición funcional vive en `docs/product/OPPORTUNITY_RADAR.md` y la planificación incremental en `docs/development/OPPORTUNITY_RADAR_PLAN.md`.

La adquisición de fuentes externas está bloqueada por el gate `docs/architecture/proposals/AG-014_OPPORTUNITY_RADAR_EXTERNAL_SOURCES.md` hasta que se cierre explícitamente la decisión arquitectónica.

## Analítica editorial

- equilibrio temático;
- frecuencia;
- formatos utilizados;
- repetición de temas;
- rendimiento de publicaciones cuando los datos estén disponibles.

## Más canales

Solo después de validar LinkedIn. La arquitectura debe permitir futuras salidas sin obligar a que la V1 las implemente.

## Automatización asistida

Detección de cambios relevantes en fuentes conectadas y creación de propuestas de contenido, siempre con revisión humana antes de publicar.

Para Opportunity Radar, la programación automática de rastreos se decidirá únicamente después de validar el refresco bajo demanda y mediante un gate específico de scheduler, frecuencia, límites, observabilidad y costes.
