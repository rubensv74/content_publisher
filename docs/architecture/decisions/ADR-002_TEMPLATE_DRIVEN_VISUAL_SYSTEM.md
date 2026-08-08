# ADR-002 — Sistema visual basado en arquetipos y variantes

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher necesita ofrecer una variedad visual amplia sin perder identidad ni convertirse en un editor gráfico complejo.

Un único diseño produciría fatiga y repetición. Un lienzo libre tipo Canva aumentaría mucho el coste de desarrollo y trasladaría de nuevo al usuario el trabajo de composición.

## Decisión

El sistema visual se basará en:

- familias de diseño;
- arquetipos;
- variantes;
- contenido estructurado;
- identidad visual centralizada.

El usuario elegirá entre composiciones preparadas y podrá ajustar opciones controladas, pero no posicionará libremente cada elemento.

## Motivos

- Permite mucha variedad con un número razonable de componentes.
- Mantiene coherencia visual.
- Hace posible generar automáticamente previews y recursos finales.
- Facilita añadir nuevos diseños sin modificar el modelo editorial.
- Permite que el futuro motor de sugerencias recomiende un diseño de forma objetiva.

## Alternativas descartadas

### Plantilla única

Demasiado rígida y repetitiva para una estrategia de publicación a largo plazo.

### Editor libre tipo Canva

Aporta una complejidad desproporcionada y contradice el objetivo de acelerar la creación.

### Plantillas independientes sin sistema común

Generaría duplicación, inconsistencias y dificultaría mantener una identidad estable.

## Consecuencias

La arquitectura deberá separar claramente:

1. contenido;
2. identidad;
3. definición del arquetipo;
4. variante;
5. renderizado final.

La biblioteca podrá crecer sin que cada nuevo diseño implique crear un flujo de producto distinto.
