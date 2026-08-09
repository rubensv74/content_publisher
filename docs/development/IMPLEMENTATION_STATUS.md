# Estado de implementación

Fecha de actualización: 2026-08-09

## Resumen ejecutivo

Content Publisher dispone ya de un recorrido V1 ejecutable en producción:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER READY → BUFFER DRAFT
```

La integración real con Supabase, Vercel, Buffer y el canal personal de LinkedIn está validada. Durante las pruebas se ha detenido deliberadamente el recorrido antes de una publicación pública real.

La biblioteca visual objetivo de V1 está ya cubierta: **12 de 12 arquetipos previstos disponen de una implementación base operativa**, además de Build Note como composición editorial adicional.

## Arquitectura

Gates aprobados:

- AG-001 — Tailwind CSS + shadcn/ui para la aplicación; renderer propio para publicaciones.
- AG-002 — Supabase Auth con email + contraseña, sin registro público.
- AG-003 — renderizado React/DOM con `html-to-image` y PDF con `pdf-lib` detrás de adaptador propio.
- AG-004 — modelo relacional PostgreSQL + JSONB para estructuras variables.
- AG-005 — Next.js App Router + `src/` + separación por responsabilidades.
- AG-006 — assets fuente privados + bucket público separado para renders finales.
- AG-007 — API key personal de Buffer exclusivamente server-side.
- AG-008 — `publications.visual_config JSONB` namespaced por arquetipo para inputs visuales especializados.

Decisiones registradas hasta **ADR-011**.

AG-008 queda cerrado mediante `ADR-011_SPECIALIZED_ARCHETYPE_VISUAL_CONFIG.md`.

## Modelo de contenido visual especializado

La publicación mantiene tres responsabilidades separadas:

```text
structured_content   → qué queremos contar
publication_assets   → qué archivos utilizamos
visual_config        → parámetros visuales especializados
```

`visual_config` se almacena como JSONB en `publications` y conserva namespaces independientes por arquetipo, por ejemplo:

```json
{
  "metric-hero": {
    "value": "42%",
    "label": "menos tiempo"
  },
  "code-focus": {
    "language": "typescript",
    "snippet": "..."
  }
}
```

Cada arquetipo especializado valida únicamente su propio namespace antes de habilitar un render final.

## Infraestructura operativa

### Supabase

Proyecto dedicado activo.

Migraciones principales:

1. `initial_schema`;
2. `add_fk_indexes`;
3. `public_publishable_renders`;
4. `add_publication_visual_config`.

Buckets:

- `content-publisher`: privado para recursos fuente;
- `content-publisher-published`: lectura pública para renders finales consumibles por Buffer.

El modelo mantiene RLS por `user_id` y rutas de Storage con prefijo UUID del usuario.

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

- login desde producción;
- sesión persistente;
- workspace privado;
- RLS sobre datos propios;
- cierre de sesión;
- ausencia de signup público.

## Ideas

La bandeja de Ideas permite crear, listar, editar, archivar, eliminar y convertir una Idea en Publication.

## Content Studio

Desde una publicación se puede persistir:

- título y tema;
- tipo de historia;
- problema o contexto;
- intentos previos;
- decisión o solución;
- resultado;
- aprendizaje;
- idea transferible;
- cierre o CTA;
- caption de LinkedIn;
- diseño y variante;
- configuración visual especializada;
- assets asociados.

Los guardados muestran progreso y confirmación explícitos.

Studio descubre dinámicamente los arquetipos compatibles con formato y tipo de historia. Los diseños especializados muestran sus propios campos solo cuando son necesarios.

## Biblioteca de recursos visuales

`/assets` permite:

- subir PNG, JPEG y WebP;
- almacenar originales en el bucket privado;
- registrar MIME, dimensiones, tamaño y nombre original;
- visualizar mediante signed URLs temporales;
- reutilizar recursos en varias publicaciones;
- eliminar recursos cuando ya no son necesarios.

Roles usados actualmente en publicaciones:

```text
hero
before
after
```

Los cambios de assets invalidan de forma segura los renders anteriores mediante la marca temporal de la publicación.

## Renderer visual

El renderer permanece aislado de la UI de aplicación conforme a ADR-004.

### Cobertura V1

Los **12 arquetipos objetivo** tienen una implementación base runtime:

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

Además existe **Build Note**, arquetipo editorial adicional utilizado en la primera demo real.

### Arquetipos especializados incorporados con AG-008

**Metric Hero**

- valor principal;
- etiqueta;
- delta opcional;
- contexto opcional;
- PNG 1080 × 1350.

**Annotated Screenshot**

- requiere asset `hero`;
- entre 1 y 4 anotaciones;
- posición X/Y porcentual;
- callouts numerados sobre el screenshot;
- PNG 1080 × 1350.

**Before / After**

- requiere assets `before` y `after`;
- etiquetas configurables;
- resumen del cambio;
- composición split;
- PNG 1080 × 1350.

**Code Focus**

- lenguaje;
- snippet;
- líneas destacadas opcionales;
- explicación breve;
- PNG 1080 × 1350.

**Data Story**

- título;
- unidad opcional;
- serie numérica de 2–5 valores;
- insight/takeaway;
- visualización de barras sin dependencia externa de charting;
- PNG 1080 × 1350.

Los carruseles existentes continúan generándose como PDF más miniatura PNG de portada para Buffer.

## Persistencia y trazabilidad de renders

Flujo:

```text
Preview React
  ↓
PNG / PDF
  ↓
renders.status = pending
  ↓
content-publisher-published
  ↓
renders.status = ready
  ↓
URL HTTPS pública estable
```

`render_context` conserva snapshot de:

- contenido editorial;
- `visual_config`;
- versión de esquema;
- arquetipo y variante;
- identidad;
- IDs, roles y metadatos de assets;
- datos técnicos de exportación;
- miniaturas cuando aplica.

No se guardan signed URLs temporales como parte de la evidencia del render.

## Protección contra renders obsoletos

Un render solo alcanza el panel Publish cuando:

- coincide con el arquetipo guardado;
- coincide con la variante guardada;
- fue generado después de la última modificación relevante;
- están presentes los assets requeridos;
- la configuración visual especializada es válida.

Cambiar historia, diseño, configuración visual, assets o identidad hace que un render anterior siga siendo trazable pero deje de estar habilitado para publicar.

## Política futura de Storage

Se ha documentado en:

`docs/operations/STORAGE_RETENTION_POLICY.md`

Criterio actual:

- conservar indefinidamente historial editorial y datos ligeros;
- conservar la configuración necesaria para reconstrucción;
- no borrar automáticamente PNG/PDF ni assets en V1;
- estudiar limpieza manual/asistida cuando Storage se aproxime al 70–80 % de la cuota disponible;
- priorizar la eliminación de renders antiguos y assets puntuales antes de perder trazabilidad editorial;
- una política temporal de 90–180 días para renders publicados solo se evaluará si el volumen real lo justifica.

## Buffer → LinkedIn

Validado en producción:

- API key server-side;
- autenticación con Buffer;
- cuenta y organización;
- canal LinkedIn personal;
- lectura de renders públicos;
- creación real de drafts.

Modos implementados:

- publicar ahora;
- programar;
- guardar draft.

No se ha realizado todavía una publicación pública real durante las pruebas.

## Protección contra drafts duplicados

La primera demo permitió detectar un problema de feedback que provocó varias pulsaciones válidas. Se corrigió con:

- progreso visible;
- bloqueo durante la operación;
- mensaje de éxito;
- bloqueo inmediato después del éxito;
- guardia server-side contra duplicados para publicación + render + canal;
- eliminación explícita desde Historial;
- estado local `cancelled` cuando se elimina un draft de Buffer.

## Publishing Jobs e Historial

Cada operación de publicación conserva trazabilidad de publicación, render exacto, canal, organización, acción, estado, ID externo, URL externa, fechas y error saneado cuando aplica.

`/history` se deriva de `publications`, `renders` y `publishing_jobs`; no existe una tabla de historial redundante.

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
Publicación pública en LinkedIn ⏳
```

## Calidad y despliegue

El workflow `Quality` ejecuta instalación, ESLint, TypeScript y build de Next.js.

La implementación de AG-008 y la cobertura completa de los 12 arquetipos V1 han superado el workflow de calidad. El último cambio de protección frente a renders obsoletos por cambio de asset también ha superado lint, typecheck y build y está desplegado correctamente en Vercel Production.

## Próximo gate de arquitectura

La siguiente frontera estructural es la **reconciliación de estados asíncronos de Buffer**.

Un `publishing_job` puede quedar localmente en un estado intermedio mientras Buffer avanza posteriormente hasta un estado terminal. Antes de automatizar esa sincronización debe decidirse si V1 actualiza estados solo cuando el usuario abre la aplicación, mediante comprobaciones periódicas en segundo plano o mediante otra estrategia soportada por la API.

Esta decisión debe registrarse en un nuevo gate antes de implementar sincronización automática.
