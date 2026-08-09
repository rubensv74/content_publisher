# ADR-012 — Reconciliación de estados de Buffer bajo demanda

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-009  
**Decisión aprobada:** Opción A

## Contexto

Content Publisher puede crear drafts, publicaciones programadas y publicaciones inmediatas mediante Buffer. Algunos estados de Buffer no son terminales y evolucionan después de la respuesta inicial de creación, por ejemplo:

```text
scheduled → sending → sent
```

o pueden terminar en `error`.

La API GraphQL de Buffer permite consultar de nuevo un post por su identificador y recuperar su estado actual. Para una aplicación personal de bajo volumen no se justifica introducir todavía un scheduler recurrente.

## Decisión

La V1 reconciliará estados **bajo demanda**.

La reconciliación se ejecutará cuando el usuario abra Historial y también podrá forzarse mediante una acción manual de actualización.

Flujo:

```text
Abrir Historial
      ↓
localizar publishing_jobs no terminales
      ↓
consultar Buffer por external_id
      ↓
validar y mapear el estado remoto
      ↓
actualizar publishing_jobs
      ↓
actualizar publication cuando corresponda
      ↓
mostrar Historial actualizado
```

## Reglas

1. La reconciliación es exclusivamente de lectura remota: nunca publica, reprograma ni elimina contenido en Buffer.
2. Solo se consultan jobs de Buffer que puedan cambiar de estado y tengan `external_id`.
3. El estado exacto devuelto por Buffer se conserva en `provider_payload.bufferStatus`.
4. El campo local `publishing_jobs.status` mantiene el vocabulario existente de Content Publisher y se actualiza mediante un mapeo explícito.
5. Cuando Buffer confirme `sent`, el job local pasa a `published` y la publicación se marca `published` con `published_at` basado en `sentAt` cuando esté disponible.
6. Cuando Buffer confirme `error`, el job local pasa a `failed` sin ejecutar ninguna acción remota adicional.
7. Estados `sending` o `needs_approval` permanecen no terminales localmente.
8. Drafts y jobs cancelados no se consultan automáticamente.
9. La operación debe ser idempotente: ejecutar la reconciliación varias veces con el mismo estado remoto no cambia el resultado funcional.
10. No se introduce Vercel Cron en V1.

## Mapeo V1

```text
Buffer draft           → local sent para acción draft (convención existente)
Buffer scheduled       → local scheduled
Buffer sending         → local pending
Buffer needs_approval  → local pending
Buffer sent            → local published
Buffer error           → local failed
```

El estado remoto permanece disponible por separado en `provider_payload.bufferStatus` para no perder semántica del proveedor.

## Consecuencias positivas

- No añade infraestructura recurrente.
- Mantiene el historial correcto cuando el usuario realmente lo consulta.
- El coste de API y compute es mínimo para una aplicación personal.
- La lógica queda encapsulada y podrá reutilizarse en el futuro desde un scheduler si se necesitara sincronización automática.
- La API key continúa exclusivamente en servidor.

## Limitaciones aceptadas

- La base de datos puede permanecer temporalmente desactualizada mientras no se abra la aplicación.
- Un error de publicación no se detectará de forma proactiva en segundo plano.
- Las notificaciones automáticas quedan fuera de V1.

## Evolución futura

Si Content Publisher necesita alertas, sincronización continua o mayor volumen de publicación, se evaluará un scheduler o mecanismo push mediante un nuevo gate de arquitectura, reutilizando el mismo servicio de reconciliación.