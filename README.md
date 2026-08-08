# Content Publisher

Aplicación web personal para convertir ideas, aprendizajes y desarrollos reales en contenido profesional para LinkedIn, con una identidad visual reconocible y un flujo completo desde la idea hasta la publicación.

## Objetivo de la V1

La V1 debe permitir completar este recorrido sin depender de Canva, PowerPoint u otra herramienta intermedia:

**Idea → contenido → diseño → previsualización → generación → publicación/programación en LinkedIn**

## Principios

- La identidad visual debe ser consistente, pero no repetitiva.
- La variedad se consigue mediante una biblioteca de arquetipos y variantes, no mediante un editor libre tipo Canva.
- La aplicación debe ser más rápida de usar que construir una publicación manualmente.
- La IA debe ayudar a estructurar y editar ideas reales, no inventar experiencia profesional.
- Las decisiones importantes deben quedar documentadas con su contexto y alternativas.
- El conocimiento reutilizable generado durante el proyecto se registrará para su posterior incorporación a la base de conocimiento profesional.

## Plataforma acordada

- Aplicación web
- Next.js
- React
- TypeScript
- Supabase / PostgreSQL
- Supabase Storage
- Vercel
- Buffer como primera capa de publicación hacia LinkedIn

Las decisiones detalladas se documentan en `docs/architecture/`.

## Documentación

- `docs/product/`: visión, alcance y roadmap.
- `docs/architecture/`: arquitectura y decisiones técnicas.
- `docs/design/`: sistema visual, arquetipos y reglas de diseño.
- `docs/research/`: investigación y fuentes externas.
- `docs/development/`: método de trabajo y reglas de documentación.
- `docs/knowledge/candidates/`: conocimiento reutilizable candidato a trasladarse a la base de conocimiento general.

## Estado

**Sprint 0 — Cimentación del producto.**

El código de producto no se inicializará hasta que estén documentadas las decisiones de arquitectura necesarias para hacerlo sin introducir elecciones implícitas o difíciles de revertir.
