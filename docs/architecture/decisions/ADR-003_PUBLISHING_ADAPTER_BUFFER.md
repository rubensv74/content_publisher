# ADR-003 — Buffer como primera capa de publicación

- Estado: Aceptada para V1
- Fecha: 2026-08-08

## Contexto

Content Publisher debe poder publicar o programar contenido en LinkedIn. Integrarse directamente con LinkedIn desde el principio añade permisos, autenticación, versionado y requisitos de acceso que no aportan valor diferencial al producto.

## Decisión

Utilizar Buffer como primera capa de publicación hacia LinkedIn.

La aplicación no se acoplará directamente a Buffer. Se definirá una frontera propia de publicación para que Buffer sea una implementación sustituible.

## Motivos

- Reduce complejidad de integración en la V1.
- Permite concentrar el desarrollo en el valor diferencial: contenido, identidad y diseño.
- Facilita publicación inmediata y programada.
- Mantiene abierta la posibilidad de integrar LinkedIn directamente en el futuro.

## Alternativas descartadas para V1

### Integración directa con LinkedIn

No se descarta como evolución futura, pero no compensa el esfuerzo inicial mientras Buffer cubra el flujo necesario.

### Publicación completamente manual

Podría servir para un prototipo, pero no cumple el objetivo de que la V1 cierre el proceso desde la idea hasta la publicación.

## Consecuencias

El módulo de publicación deberá aceptar una orden neutral, por ejemplo:

- texto;
- recursos finales;
- fecha/hora opcional;
- destino;
- metadatos.

La lógica específica de Buffer quedará aislada dentro de un adaptador.
