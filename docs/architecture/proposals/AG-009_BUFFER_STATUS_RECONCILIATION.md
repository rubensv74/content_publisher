# AG-009 — Reconciliación de estados de Buffer

**Estado:** Resuelto — Opción A aprobada  
**Fecha:** 2026-08-09  
**Decisión:** `ADR-012_BUFFER_STATUS_RECONCILIATION_ON_DEMAND.md`

## Contexto

Content Publisher puede crear en Buffer drafts, publicaciones programadas y publicaciones inmediatas. La respuesta inicial no siempre es terminal: Buffer puede avanzar posteriormente entre estados como:

```text
draft
scheduled
sending
sent
error
needs_approval
```

Por tanto, el estado local puede quedar temporalmente desactualizado si no se vuelve a consultar Buffer.

Fuentes oficiales utilizadas para resolver el gate:

- https://developers.buffer.com/guides/posts-and-scheduling.html
- https://developers.buffer.com/examples/get-scheduled-posts.html
- https://developers.buffer.com/types/PostStatus.html
- https://developers.buffer.com/reference.html

La API GraphQL permite recuperar un post por ID y consultar su estado actual. No se adoptó un webhook de estado como dependencia de V1.

## Alternativas evaluadas

### A — Reconciliación bajo demanda — APROBADA

Cuando el usuario abre Historial, Content Publisher identifica jobs no terminales y consulta Buffer. También existe una acción manual **Actualizar estado**.

Ventajas principales:

- no necesita cron ni proceso background;
- coste mínimo para uso personal;
- actualiza el estado cuando realmente se necesita;
- mantiene la lógica encapsulada para reutilizarla en el futuro.

Limitación aceptada: la base local puede estar temporalmente desactualizada mientras no se use la aplicación.

### B — Polling periódico en segundo plano — DESCARTADA PARA V1

Un scheduler consultaría Buffer a intervalos regulares.

Aporta mayor actualización autónoma, pero introduce infraestructura recurrente, autenticación de endpoint, observabilidad, reintentos y consumo innecesario para el volumen de V1.

### C — Híbrida — DESCARTADA PARA V1

Combina reconciliación bajo demanda y polling periódico. Reduce la ventana de inconsistencia, pero hereda la complejidad de B sin aportar suficiente valor en una aplicación personal.

## Decisión aprobada

**Opción A — reconciliación bajo demanda.**

Flujo:

```text
Usuario abre Historial
        ↓
buscar publishing_jobs reconciliables
        ↓
consultar Buffer por external_id
        ↓
actualizar provider_payload.bufferStatus
        ↓
mapear estado local
        ↓
actualizar Publication cuando corresponda
        ↓
renderizar Historial actualizado
```

Reglas:

- la reconciliación nunca publica, reprograma ni elimina contenido;
- `provider_payload.bufferStatus` conserva el estado exacto del proveedor;
- `publishing_jobs.status` mantiene el vocabulario local existente;
- `sent` confirmado por Buffer marca la publicación como `published`;
- `error` confirmado por Buffer marca el job como `failed`;
- no se introduce Vercel Cron en V1;
- una futura sincronización automática deberá reutilizar este servicio y pasar por un nuevo gate.

## Estado de implementación

Implementado:

- consulta GraphQL de un post por ID;
- servicio idempotente de reconciliación;
- ejecución automática al abrir `/history`;
- botón manual **Actualizar estado**;
- snapshot de `bufferStatus`, `sentAt`, `dueAt`, `bufferUpdatedAt` y `lastReconciledAt`;
- actualización local a `published` o `failed` cuando Buffer confirma un estado terminal.
