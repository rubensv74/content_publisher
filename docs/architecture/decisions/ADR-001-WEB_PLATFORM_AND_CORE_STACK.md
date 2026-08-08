# ADR-001 — Plataforma web y stack principal

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher necesita combinar edición de contenido, gestión de recursos, generación visual, llamadas a servicios externos, autenticación y publicación. Además debe poder utilizarse desde distintos dispositivos sin instalar una aplicación específica.

## Decisión

Construir el producto como aplicación web utilizando:

- Next.js
- React
- TypeScript
- Supabase / PostgreSQL
- Supabase Storage
- Vercel

## Motivos

- React y TypeScript ofrecen una base adecuada para construir un sistema visual basado en componentes.
- Next.js permite resolver en el mismo producto interfaz y operaciones de servidor sin tener que diseñar dos aplicaciones separadas desde el inicio.
- Supabase cubre persistencia, autenticación potencial y almacenamiento sin obligar a construir una infraestructura propia.
- PostgreSQL aporta un modelo relacional sólido para ideas, publicaciones, diseños, historial y futuras relaciones del motor de sugerencias.
- Vercel encaja naturalmente con Next.js y simplifica el despliegue inicial.

## Alternativas descartadas

### Power Apps

Se descarta para este producto porque el motor visual, el renderizado, la integración con servicios externos y la necesidad de controlar completamente la experiencia encajan mejor en una aplicación web propia.

### Aplicación de escritorio

Añadiría distribución e instalación sin aportar una ventaja clara para el caso de uso.

### React SPA sin Next.js

Sería viable, pero obligaría a introducir posteriormente una capa de servidor o servicios adicionales para proteger credenciales, generar recursos y gestionar integraciones. Next.js reduce esa fragmentación.

## Consecuencias

- El proyecto servirá también como entorno real para consolidar React y TypeScript.
- Algunas decisiones concretas de implementación siguen abiertas y deberán resolverse antes de generar el proyecto base.
