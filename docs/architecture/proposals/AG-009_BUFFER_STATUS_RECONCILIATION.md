# AG-009 — Reconciliación de estados de Buffer

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

Content Publisher ya puede crear en Buffer:

- drafts;
- publicaciones programadas;
- publicaciones para enviar inmediatamente.

La respuesta inicial de Buffer permite guardar el resultado en `publishing_jobs`, pero algunos estados no son terminales. Buffer documenta un ciclo de vida con estados como:

```text
draft
scheduled
sending
sent
error
needs_approval
```

Por tanto, el estado guardado inmediatamente después de crear un post puede quedar desactualizado cuando Buffer avance posteriormente de `scheduled` o `sending` a `sent` o `error`.

La API GraphQL actual permite recuperar posts y filtrarlos por estado. La documentación pública consultada describe consultas de posts programados, enviados y drafts.

Fuentes oficiales:

- https://developers.buffer.com/guides/posts-and-scheduling.html
- https://developers.buffer.com/examples/get-scheduled-posts.html
- https://developers.buffer.com/types/PostStatus.html
- https://developers.buffer.com/guides/introduction.html

No se ha encontrado en la documentación pública actual un mecanismo oficial de webhook de estado que podamos adoptar como dependencia de V1. Por ello el gate se plantea alrededor de reconciliación mediante lectura de la API.

## Decisión que debe tomarse

Definir cuándo debe Content Publisher consultar de nuevo Buffer para actualizar `publishing_jobs.status` y las fechas derivadas de una publicación.

La solución debe equilibrar:

- exactitud del historial;
- simplicidad;
- consumo de API y compute;
- ausencia de procesos innecesarios para una aplicación personal;
- facilidad de evolución posterior.

## Opción A — Reconciliación bajo demanda

Cuando el usuario abre una pantalla que necesita información de publicación —principalmente Historial y, cuando proceda, Content Studio— el servidor identifica jobs no terminales y consulta Buffer para obtener su estado actual.

Estados candidatos a reconciliar:

```text
scheduled
sending
needs_approval
```

El sistema actualiza localmente solo si Buffer devuelve una transición válida.

También puede existir una acción manual `Actualizar estado` para forzar la comprobación.

### Ventajas

- sin cron ni proceso background;
- coste prácticamente nulo para el volumen personal de V1;
- el estado se actualiza precisamente cuando el usuario necesita verlo;
- sencilla de observar y depurar;
- no introduce nueva infraestructura;
- mantiene la API key exclusivamente en servidor;
- fácil de evolucionar más adelante.

### Inconvenientes

- la base de datos puede permanecer temporalmente desactualizada mientras nadie abra la aplicación;
- no permite reaccionar de forma automática a un fallo de Buffer en el instante en que ocurre.

**Valoración:** recomendada para V1.

## Opción B — Polling periódico en segundo plano

Crear un job programado que consulte periódicamente los `publishing_jobs` no terminales y sincronice sus estados con Buffer.

Una implementación natural en el despliegue actual sería un endpoint server-side protegido y un scheduler como Vercel Cron.

Documentación de referencia de Vercel:

- https://vercel.com/docs/cron-jobs

### Ventajas

- el historial local se mantiene actualizado incluso sin abrir la aplicación;
- permite detectar fallos de publicación de manera más autónoma;
- prepara el sistema para futuras notificaciones.

### Inconvenientes

- introduce infraestructura recurrente;
- añade autenticación del endpoint de cron, observabilidad y reintentos;
- consume compute y llamadas a Buffer aunque el usuario no consulte la aplicación;
- su frecuencia y límites dependen del plan de despliegue;
- es complejidad desproporcionada para el volumen personal previsto en V1.

**Valoración:** útil más adelante, no recomendada todavía.

## Opción C — Híbrida

Aplicar reconciliación bajo demanda y añadir además un polling periódico de baja frecuencia.

### Ventajas

- combina actualización inmediata al consultar con actualización autónoma;
- reduce la ventana de inconsistencia.

### Inconvenientes

- hereda prácticamente toda la complejidad de la opción B;
- duplica caminos de entrada a la misma lógica;
- aporta poco valor adicional mientras el producto sea personal y de bajo volumen.

**Valoración:** posible evolución futura, sobredimensionada para V1.

## Recomendación

**Opción A — reconciliación bajo demanda.**

Flujo propuesto:

```text
Usuario abre Historial
        ↓
buscar publishing_jobs no terminales
        ↓
consultar Buffer por los posts implicados
        ↓
validar transición
        ↓
actualizar publishing_jobs
        ↓
recalcular estado visible de la publicación
        ↓
renderizar Historial actualizado
```

La lógica de consulta se encapsulará detrás del adaptador de Buffer actual, de forma que añadir un scheduler futuro no requiera modificar el dominio: únicamente reutilizaría la misma operación de reconciliación.

## Estados y reglas iniciales

### Terminales locales

```text
draft
sent
error
cancelled
```

No se consultan continuamente salvo acción explícita de diagnóstico.

### No terminales

```text
scheduled
sending
needs_approval
```

Son candidatos a reconciliación.

### Regla de seguridad

Una lectura de Buffer nunca debe provocar una publicación, reprogramación ni borrado. La reconciliación solo puede actualizar información local a partir del estado remoto.

## Consecuencias si se aprueba A

1. Añadir una consulta de post/estado al adaptador Buffer server-side.
2. Crear un servicio de reconciliación idempotente para jobs no terminales.
3. Ejecutarlo al cargar `/history` y donde sea estrictamente necesario.
4. Añadir una acción manual `Actualizar estado`.
5. Actualizar `published_at` únicamente cuando Buffer confirme `sent`.
6. Conservar errores y estados remotos para trazabilidad.
7. No introducir Vercel Cron en V1.
8. Si más adelante se necesita actualización automática, abrir un nuevo gate para scheduler/notificaciones reutilizando el servicio existente.

## Decisión solicitada

- **A** — reconciliación bajo demanda **(recomendada)**;
- **B** — polling periódico background;
- **C** — híbrida: bajo demanda + polling periódico.

La implementación de sincronización de estados queda detenida en este gate hasta aprobar una opción.
