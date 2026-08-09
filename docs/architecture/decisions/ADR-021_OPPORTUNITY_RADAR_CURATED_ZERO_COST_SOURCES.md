# ADR-021 — Opportunity Radar con catálogo curado de fuentes gratuitas

**Estado:** Aceptado  
**Fecha:** 2026-08-10  
**Gate:** AG-014  
**Decisión:** Opción B — catálogo curado + adaptadores por tipo de fuente, bajo política de coste adicional cero.

## Contexto

Opportunity Radar necesita detectar novedades tecnológicas externas sin convertirse en un crawler generalista y sin introducir costes económicos adicionales.

La arquitectura existente de `source_signals` ya establece que las fuentes originales siguen siendo la verdad y que Content Publisher persiste únicamente señales ligeras y trazables.

## Decisión

Se adopta un catálogo explícito y curado de fuentes externas. Para cada fuente se utilizará el mecanismo gratuito y más estable disponible, por este orden:

1. RSS / Atom / feed oficial gratuito;
2. API oficial con uso gratuito sin facturación habilitada;
3. changelog, release feed o endpoint estructurado público gratuito;
4. adaptador HTML específico y respetuoso con las condiciones de acceso, únicamente si no existe una alternativa estructurada.

No se construirá un crawler web genérico.

```text
Catálogo curado gratuito
        ↓
RSS / API gratuita / endpoint estructurado / adapter HTML específico
        ↓
normalización + fingerprint
        ↓
source_signals
        ↓
Opportunity Engine
```

## Invariante económica

Este ADR está subordinado a `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`.

Por tanto:

- no se utilizarán APIs comerciales;
- no se contratarán agregadores;
- no se consumirán APIs de IA facturables;
- no se habilitará facturación para ampliar cuotas;
- una fuente que requiera pago se excluye;
- una fuente gratuita que pase a ser de pago se desactiva;
- alcanzar una cuota gratuita debe provocar degradación o pausa, nunca gasto;
- el catálogo puede ser más pequeño si eso es necesario para mantener 0 EUR de coste adicional.

## Criterios de alta de una fuente

Una fuente solo puede entrar en el catálogo si cumple todos los criterios obligatorios:

1. relevancia profesional demostrable;
2. autoridad suficiente, preferentemente fuente oficial o de primera parte;
3. acceso legal y técnicamente razonable;
4. mecanismo estable de adquisición;
5. coste adicional de 0 EUR;
6. ausencia de riesgo de cobro automático;
7. trazabilidad mediante URL o referencia original;
8. volumen suficientemente controlable para no introducir ruido innecesario.

## Criterios de baja

Una fuente se desactiva si:

- empieza a exigir pago;
- exige activar billing;
- elimina su mecanismo de acceso gratuito;
- cambia sus condiciones de uso de forma incompatible;
- se vuelve inestable o demasiado costosa computacionalmente para los límites gratuitos disponibles;
- genera más ruido que oportunidades útiles.

## Persistencia

No se replicarán artículos completos. Las señales conservarán solo lo necesario para identificación y análisis:

- fuente;
- referencia/URL original;
- fingerprint;
- tipo de señal;
- título;
- resumen mínimo cuando proceda;
- fecha del evento;
- metadatos ligeros;
- fechas de primera y última observación.

## Ejecución inicial

La primera implementación será manual/bajo demanda.

La automatización programada queda fuera de este ADR. Cualquier scheduler futuro deberá cumplir `ADR-020`; si no existe una alternativa gratuita fiable, se mantendrá el refresco manual.

## IA y evaluación

Opportunity Radar no utilizará una API de IA de pago. Cuando un paso necesite interpretación mediante IA, se reutilizará el patrón de handoff manual a ChatGPT Plus ya aprobado en `ADR-019`.

Siempre que sea posible, deduplicación, filtrado inicial, clasificación básica y reglas de prioridad se ejecutarán de forma determinista dentro de Content Publisher.

## Consecuencias

- control total del catálogo;
- coste adicional cero;
- menor cobertura que un agregador comercial;
- incorporación incremental de fuentes;
- algunos adapters requerirán mantenimiento;
- se acepta intervención manual cuando automatizar implique coste.

## Decisiones descartadas

### A — Crawler genérico

Descartado por complejidad, ruido, fragilidad y mantenimiento.

### C — Proveedor externo de agregación

Descartado porque contradice la política rígida de coste adicional cero y añade dependencia de proveedor.

## Resultado

AG-014 queda cerrado con Opción B. Puede comenzar OR-01 y, tras disponer de un catálogo validado, OR-02 puede implementar las primeras señales externas gratuitas.