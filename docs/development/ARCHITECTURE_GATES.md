# Gates de arquitectura

## Propósito

Evitar que una decisión técnica importante aparezca de forma accidental durante la implementación.

El desarrollo puede avanzar de manera autónoma mientras el trabajo sea una consecuencia directa de decisiones ya aceptadas. Cuando aparezca una elección de arquitectura con impacto relevante, el avance debe detenerse y la decisión debe presentarse antes de implementar.

## Qué se considera una decisión de arquitectura

Una elección pasa por gate cuando afecta de forma significativa a uno o varios de estos puntos:

- estructura del sistema;
- dependencia fuerte de una tecnología o proveedor;
- modelo de datos difícil de cambiar;
- estrategia de autenticación o seguridad;
- renderizado de imágenes o documentos;
- organización del sistema de componentes visuales;
- integración con servicios externos;
- despliegue;
- costes recurrentes relevantes;
- mantenibilidad a largo plazo.

## Qué no necesita gate

No requiere aprobación específica una decisión local y reversible, por ejemplo:

- nombre de una variable;
- extracción de un componente pequeño;
- ajuste de texto;
- refactorización interna sin cambio de contrato;
- test adicional;
- documentación;
- corrección de errores que no cambie la arquitectura.

## Procedimiento

Cuando aparezca un gate:

1. describir la decisión en lenguaje natural;
2. explicar por qué aparece ahora;
3. presentar las alternativas razonables;
4. recomendar una opción;
5. indicar las consecuencias principales;
6. esperar aprobación;
7. registrar la decisión como ADR;
8. continuar.

## Gates abiertos antes de inicializar el código

### AG-001 — Estrategia de estilos y componentes visuales

Debe decidirse cómo se construirá la interfaz y el sistema visual en React/Next.js.

### AG-002 — Autenticación personal de V1

Debe decidirse el mecanismo de acceso privado.

### AG-003 — Renderizado de imágenes y PDF

Debe decidirse qué enfoque técnico utilizará el motor para producir los recursos finales.

### AG-004 — Modelo de datos inicial

Debe validarse el modelo conceptual antes de crear las primeras migraciones.

## Regla

No inicializar librerías o plantillas que resuelvan uno de estos gates de forma implícita antes de que la decisión esté aceptada.
