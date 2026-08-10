# AG-014 — Fuentes externas para Opportunity Radar

**Estado:** Aprobado — Opción B con coste adicional 0 EUR  
**Fecha:** 2026-08-10  
**Afecta a:** Opportunity Radar, Source Signals, seguridad, operación y costes  
**ADR:** `ADR-021_OPPORTUNITY_RADAR_CURATED_ZERO_COST_SOURCES.md`

## Decisión

Se aprueba **Opción B — catálogo curado + adaptadores por tipo de fuente**, subordinada permanentemente a `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.

Opportunity Radar utilizará únicamente fuentes que puedan consultarse con coste adicional de 0 EUR y sin billing habilitado.

Orden de preferencia:

1. RSS / Atom / feeds oficiales;
2. APIs oficiales gratuitas únicamente cuando no requieran billing y puedan fallar cerrado;
3. changelog o endpoint estructurado público;
4. adaptador HTML específico únicamente cuando no exista alternativa razonable.

No se construirá un crawler web genérico y no se contratará un proveedor externo de agregación.

## Arquitectura aprobada

```text
Source Catalog
      ↓
RSS / Atom / API gratuita / Structured Page / Targeted HTML Adapter
      ↓
ExternalSourceCandidate
      ↓
normalización + fingerprint
      ↓
SourceSignal
      ↓
Opportunity evaluation
```

La fuente original continúa siendo la verdad. Content Publisher conserva únicamente memoria ligera y trazabilidad.

## Política económica obligatoria

- coste adicional permitido = 0 EUR;
- no billing;
- no pago por uso;
- no créditos que exijan activar facturación;
- no agregadores comerciales;
- una fuente que pase a ser de pago se desactiva o sustituye;
- si se agota una cuota gratuita el sistema se detiene o degrada, nunca paga;
- automatización solo si puede mantenerse dentro de la misma política.

## Contrato conceptual

Una fuente externa debe declarar como mínimo:

- identificador estable;
- nombre;
- organización/proveedor;
- URL principal;
- tipo de acceso;
- áreas profesionales relacionadas;
- prioridad;
- estado activo/inactivo;
- coste adicional cero;
- billing requerido = false;
- política o notas de uso cuando sean relevantes;
- información operativa mínima cuando proceda.

## Política de adquisición

1. Preferir fuentes oficiales o de primera parte.
2. Preferir mecanismos estructurados frente a scraping HTML.
3. No almacenar artículos completos.
4. Persistir título, resumen mínimo, referencia, fecha, fingerprint y metadatos ligeros.
5. Conservar siempre la URL o referencia original.
6. Respetar límites, términos de uso y restricciones de acceso.
7. No incorporar credenciales o servicios de pago.
8. No incorporar una dependencia externa global para resolver una única fuente.

## Primer lote

El catálogo inicial se documenta en `docs/research/OPPORTUNITY_RADAR_SOURCE_CATALOG_V1.md`.

OR-02 implementa inicialmente:

- GitHub Changelog;
- Supabase Changelog;
- OpenAI Product Release Notes.

Las tres fuentes se consumen mediante RSS oficial y sin dependencia comercial adicional.

## Scheduler

La ejecución automática sigue fuera de este gate. La adquisición inicial es manual/bajo demanda.

OR-07 solo podrá aprobar automatización si existe una alternativa verificablemente gratuita y compatible con `ADR-020`.

## Implementación

AG-014 se considera implementado en su primer ciclo mediante OR-02:

- catálogo P0 versionado;
- lector RSS/Atom propio;
- adaptador tecnológico;
- `source_type = technology`;
- persistencia en `source_signals`;
- refresco manual desde `/signals`;
- migración aplicada al Supabase real;
- validación Quality de GitHub superada.

## Resultado

Gate cerrado. La siguiente frontera arquitectónica pertenece a OR-03 y al modelo persistente de `Opportunity`.
