# Política de documentación

## Propósito

Content Publisher debe producir dos resultados en paralelo:

1. un producto funcional;
2. conocimiento útil y reutilizable.

La documentación no debe convertirse en un registro exhaustivo de cada conversación o pequeño cambio. Se documentará aquello que tenga valor para mantener, explicar, auditar o reutilizar el producto.

## Qué se documenta siempre

### Decisiones importantes

Toda decisión relevante debe dejar constancia de:

- qué se decidió;
- contexto;
- motivos;
- alternativas consideradas;
- consecuencias.

Las decisiones de arquitectura se guardarán como ADR en `docs/architecture/decisions/`.

### Alcance de producto

Cambios que afecten a:

- funcionalidades;
- flujos;
- criterios de aceptación;
- exclusiones;
- roadmap.

### Diseño

Se documentarán:

- principios visuales;
- identidad;
- arquetipos;
- reglas de composición;
- referencias estudiadas;
- motivos de aceptación o descarte.

### Integraciones externas

Para cada integración se documentarán:

- finalidad;
- documentación oficial;
- restricciones;
- autenticación;
- errores conocidos;
- decisiones derivadas.

### Conocimiento reutilizable

Cuando durante el desarrollo aparezca una solución o aprendizaje aplicable a otros proyectos, se creará una nota candidata en `docs/knowledge/candidates/`.

## Qué no debe documentarse por defecto

- cambios triviales de texto;
- conversaciones completas;
- pruebas descartables sin aprendizaje;
- detalles que ya están claramente expresados por el código y no requieren explicación;
- documentación duplicada.

## Regla contra duplicados

Una idea debe tener una única fuente principal dentro del repositorio. Otros documentos deben enlazarla en lugar de repetirla.

## Fuentes externas

Toda información externa que influya en una decisión debe incluir:

- enlace a la fuente;
- fecha de revisión cuando pueda cambiar con el tiempo;
- preferencia por documentación oficial cuando exista.

## Documentación para la base de conocimiento

Los documentos dentro de `docs/knowledge/candidates/` deben ser independientes del contexto específico de Content Publisher siempre que sea posible.

Ejemplo correcto:

`Cómo diseñar un sistema de plantillas paramétricas en React`.

Ejemplo incorrecto:

`Cómo funciona el botón azul de la pantalla X de Content Publisher`.

## Estado de los documentos

Cuando sea útil, un documento puede indicar uno de estos estados:

- Draft
- Proposed
- Accepted
- Superseded
- Deprecated

## Actualización

Si una decisión cambia, no se debe borrar el razonamiento anterior. Se marcará como sustituido y se enlazará la nueva decisión cuando el historial tenga valor para comprender la evolución.
