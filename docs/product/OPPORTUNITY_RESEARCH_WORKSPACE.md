# Opportunity Research Workspace

## Objetivo

Convertir una oportunidad seleccionada en una investigación trazable antes de decidir si merece convertirse en proyecto o caso de estudio.

## Principio

La investigación permanece dentro del dominio Opportunity. No se crea una entidad paralela ni un proveedor nuevo.

Flujo:

```text
Noticia / señal
  ↓
Opportunity
  ↓ Seleccionada
Investigando
  ↓
Research Workspace
  ↓
Candidata a proyecto / volver a Seleccionada / descartar
```

## Workspace estructurado

El estado de investigación se conserva como JSONB acotado y versionado:

- `objective`: qué queremos averiguar o validar;
- `questions`: preguntas que deben resolverse;
- `validationPlan`: cómo se comprobará;
- `evidence`: fuentes, enlaces, pruebas y evidencias reunidas;
- `findings`: hallazgos observados;
- `conclusion`: conclusión provisional o final;
- `nextStep`: siguiente acción recomendada.

El antiguo `research_notes` se conserva como notas libres y compatibilidad histórica.

## Reglas

- No se generan conclusiones automáticamente.
- No se inventan evidencias.
- El usuario mantiene control explícito sobre el cambio de estado.
- La UI debe mostrar el workspace cuando la oportunidad está en `researching`, `project_candidate`, `active` o `case_study`.
- Guardar investigación no cambia automáticamente el estado de la oportunidad.
- `project_candidate` sigue requiriendo una acción humana explícita.

## Arquitectura

Esta extensión no abre un nuevo gate: utiliza PostgreSQL + JSONB ya aprobados, el dominio Opportunity existente y no introduce una nueva frontera, proveedor o mecanismo de publicación.
