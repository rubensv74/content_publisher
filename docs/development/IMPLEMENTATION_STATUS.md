# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher está en **Release Candidate de V1**.

El recorrido implementado es:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER → LINKEDIN
```

La integración real con Supabase, Vercel, Buffer y el canal personal de LinkedIn está operativa. Se ha validado un draft real en Buffer. La única validación funcional de extremo a extremo que continúa pendiente es realizar deliberadamente una publicación pública real en LinkedIn y comprobar el resultado final.

La biblioteca visual objetivo de V1 está cubierta: **12 de 12 arquetipos previstos disponen de implementación runtime**, además de Build Note como composición editorial adicional.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui para aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — React/DOM + `html-to-image` + `pdf-lib` detrás de adaptador propio.
- AG-004 — PostgreSQL relacional + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público separado para renders finales.
- AG-007 — API key personal de Buffer exclusivamente server-side.
- AG-008 — `publications.visual_config JSONB` por namespace de arquetipo.
- AG-009 — reconciliación de estados de Buffer bajo demanda.

Decisiones registradas hasta **ADR-012**.

**No existe un gate de arquitectura abierto actualmente.**

## Modelo editorial y visual

La publicación mantiene responsabilidades separadas:

```text
structured_content   → qué queremos contar
publication_assets   → qué archivos utilizamos
visual_config        → parámetros especializados del diseño
archetype_key        → qué renderer interpreta esos datos
```

`visual_config` conserva configuraciones independientes por arquetipo. Cambiar temporalmente de diseño no destruye la configuración guardada de otro arquetipo.

Los renders finales conservan un snapshot en `render_context` con contenido, configuración visual, identidad, diseño, assets y datos técnicos de exportación.

## Infraestructura

### Supabase

Proyecto dedicado activo con RLS por usuario.

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`.

Buckets:

- `content-publisher`: privado para fuentes;
- `content-publisher-published`: lectura pública para archivos finales consumibles por Buffer.

### Vercel

Producción conectada continuamente:

```text
rubensv74/content_publisher → Vercel → content-publisher-nu.vercel.app
```

Variables de producción:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
BUFFER_API_KEY
```

`BUFFER_API_KEY` permanece exclusivamente server-side.

## Autenticación

Validado:

- login de producción;
- sesión persistente;
- workspace privado;
- RLS;
- cierre de sesión;
- sin signup público.

## Ideas

La bandeja permite:

- crear;
- listar;
- editar;
- archivar;
- eliminar;
- convertir una idea en publicación.

## Content Studio

Puede persistir:

- título y tema;
- tipo de historia;
- problema/contexto;
- intentos;
- decisión/solución;
- resultado;
- aprendizaje;
- idea transferible;
- cierre/CTA;
- caption de LinkedIn;
- diseño y variante;
- configuración visual específica;
- assets asociados.

Los botones de guardado muestran progreso y confirmación.

Studio filtra dinámicamente los diseños compatibles y bloquea el render final cuando falta un asset obligatorio o una configuración especializada válida.

## Recursos visuales

`/assets` permite subir PNG, JPEG y WebP al bucket privado.

Capacidades:

- límite de carga controlado;
- MIME, dimensiones, tamaño y nombre original;
- signed URLs temporales para visualización;
- reutilización en varias publicaciones;
- eliminación manual;
- roles `hero`, `before` y `after`.

Los cambios de assets invalidan los renders anteriores sin borrar su trazabilidad.

## Biblioteca visual V1

Implementados:

1. ED-01 — Bold Statement;
2. ED-03 — Metric Hero;
3. PR-01 — Hero Screenshot;
4. PR-02 — Split Screenshot;
5. PR-03 — Annotated Screenshot;
6. PR-04 — Before / After;
7. TE-01 — Architecture Flow;
8. TE-02 — Code Focus;
9. TE-03 — Process Steps;
10. DA-01 — Data Story;
11. CA-01 — Tutorial Sequence / Step by Step;
12. CA-02 — Case Study.

Adicional:

- Build Note — composición editorial usada en la primera demo real.

Los formatos de imagen generan 1080 × 1350. Los carruseles generan PDF y miniatura PNG para Buffer.

## Protección contra renders obsoletos

Un render solo llega al panel Publish cuando:

- arquetipo y variante coinciden con la selección guardada;
- se generó después de la última modificación relevante;
- están presentes los assets obligatorios;
- la configuración visual requerida es válida.

Cambiar contenido, diseño, `visual_config`, asset o identidad obliga a generar un nuevo render.

## Buffer → LinkedIn

Validado en producción:

- API key server-side;
- cuenta Buffer;
- organización;
- canal LinkedIn;
- acceso de Buffer a los renders públicos;
- creación real de drafts.

Modos implementados:

- draft;
- programar;
- publicar ahora.

Medidas de seguridad y UX:

- progreso visible;
- guardia server-side contra drafts duplicados;
- eliminación explícita de drafts desde Historial;
- confirmación explícita antes de **Programar**;
- confirmación explícita adicional antes de **Publicar ahora**.

No se ha realizado todavía una publicación pública real como parte de la validación.

## Reconciliación de estados Buffer — AG-009

La V1 aplica **reconciliación bajo demanda**.

Flujo:

```text
abrir Historial
      ↓
localizar publishing_jobs reconciliables
      ↓
consultar Buffer por external_id
      ↓
actualizar estado remoto y local
      ↓
actualizar Publication si termina en sent/error
```

Se añadió también **Actualizar estado** para forzar manualmente la comprobación.

El adaptador consulta el post de Buffer por ID y recupera:

- `status`;
- `dueAt`;
- `sentAt`;
- `externalLink`;
- `updatedAt`.

El estado remoto se conserva en `provider_payload.bufferStatus`.

Mapeo local:

```text
scheduled       → scheduled
sending         → pending
needs_approval  → pending
sent            → published
error           → failed
```

La reconciliación es solo de lectura respecto a Buffer: **no puede publicar, reprogramar ni borrar contenido**.

No se introduce Vercel Cron en V1.

## Historial

`/history` deriva la información de:

- `publications`;
- `renders`;
- `publishing_jobs`.

Conserva:

- publicación y tema;
- render exacto;
- diseño;
- acción;
- estado local;
- estado Buffer en payload;
- programación;
- ID y URL externa;
- fechas;
- errores saneados;
- cancelación de drafts.

## Política de Storage

Documentada en:

`docs/operations/STORAGE_RETENTION_POLICY.md`

Criterio V1:

- no borrar automáticamente archivos;
- conservar indefinidamente el historial y datos ligeros;
- conservar configuración necesaria para reconstrucción;
- estudiar limpieza manual/asistida al acercarse aproximadamente al 70–80 % de la cuota;
- considerar una retención futura de 90–180 días solo si el volumen real lo justifica.

## Primera validación end-to-end

Caso:

**“De una idea técnica a una publicación sin pasar por Canva”**

Resultado:

```text
Idea ✅
Story ✅
Caption ✅
Design ✅
Preview ✅
Render PNG final ✅
Buffer conectado ✅
LinkedIn detectado ✅
Draft real en Buffer ✅
Programación real ⏳
Publicación pública LinkedIn ⏳
```

## Calidad

GitHub Actions ejecuta:

- instalación;
- ESLint;
- TypeScript;
- build Next.js.

CI actúa como gate técnico antes de considerar estable cada tanda.

## Documentación de uso y cierre

Guía de usuario:

`docs/product/USER_GUIDE_V1.md`

Checklist de release:

`docs/development/V1_RELEASE_CHECKLIST.md`

## Estado de V1

**Código: Release Candidate.**

Pendientes de aceptación manual:

1. programar deliberadamente una publicación de prueba;
2. comprobar que Historial reconcilia el estado después de la hora de publicación;
3. verificar el post real en LinkedIn;
4. marcar la V1 como validada.

Estas acciones no se ejecutan automáticamente porque producen efectos públicos reales.

## Después de V1

El roadmap reserva para etapas posteriores el Suggestion Engine, analítica editorial, nuevas fuentes y más canales. Ninguna de esas capacidades se implementará por anticipación sin el gate de arquitectura correspondiente.
