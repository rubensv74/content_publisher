# Checklist de cierre — Content Publisher V1

Fecha: 2026-08-09  
Estado global: **Release Candidate — pendiente de validación pública final**

## Criterio

La V1 se considera funcionalmente preparada cuando el flujo completo está implementado y la publicación real puede ejecutarse con revisión humana explícita.

La publicación pública no se dispara como parte de pruebas automáticas.

## Núcleo

- [x] Acceso privado mediante Supabase Auth.
- [x] Registro público desactivado.
- [x] RLS para datos propios.
- [x] Ideas: crear, editar, archivar, eliminar y convertir.
- [x] Content Studio con historia estructurada.
- [x] Editor de caption de LinkedIn.
- [x] Guardado y continuación posterior.

## Sistema visual

- [x] Identidad visual central.
- [x] Recursos fuente privados.
- [x] Roles `hero`, `before` y `after`.
- [x] Preview con el mismo árbol usado para exportar.
- [x] PNG 1080 × 1350.
- [x] Carruseles PDF + miniatura PNG.
- [x] Protección contra renders obsoletos.
- [x] Snapshot de contenido, identidad, assets y configuración visual en `render_context`.

## Biblioteca V1

- [x] ED-01 Bold Statement.
- [x] ED-03 Metric Hero.
- [x] PR-01 Hero Screenshot.
- [x] PR-02 Split Screenshot.
- [x] PR-03 Annotated Screenshot.
- [x] PR-04 Before / After.
- [x] TE-01 Architecture Flow.
- [x] TE-02 Code Focus.
- [x] TE-03 Process Steps.
- [x] DA-01 Data Story.
- [x] CA-01 Tutorial Sequence / Step by Step.
- [x] CA-02 Case Study.
- [x] Build Note como composición editorial adicional.

## Buffer / LinkedIn

- [x] API key exclusivamente server-side.
- [x] Descubrimiento de cuenta Buffer.
- [x] Descubrimiento de organización.
- [x] Descubrimiento de canal LinkedIn.
- [x] Creación de draft real validada.
- [x] Protección contra drafts duplicados.
- [x] Eliminación explícita de drafts desde Historial.
- [x] Programación implementada.
- [x] Publicar ahora implementado.
- [x] Confirmación explícita antes de programar.
- [x] Confirmación explícita antes de publicar ahora.
- [x] Reconciliación bajo demanda de estados Buffer.
- [x] Acción manual `Actualizar estado`.
- [ ] Programación real validada con una publicación de prueba.
- [ ] Publicación pública real validada en LinkedIn.

## Historial

- [x] Registro del render exacto.
- [x] Acción realizada.
- [x] Canal y organización.
- [x] ID externo.
- [x] Estado local.
- [x] Estado remoto Buffer conservado.
- [x] Errores saneados.
- [x] Estado `cancelled` para drafts eliminados.
- [x] `published_at` solo después de confirmación `sent`.

## Infraestructura

- [x] Supabase dedicado.
- [x] Storage privado para fuentes.
- [x] Storage público separado para renders finales.
- [x] Vercel Production conectado a `main`.
- [x] Variables de entorno de producción.
- [x] Workflow de calidad GitHub Actions.
- [x] Lint.
- [x] TypeScript.
- [x] Build Next.js.

## Documentación

- [x] Visión.
- [x] Alcance V1.
- [x] Arquitectura.
- [x] ADRs.
- [x] Gates de arquitectura.
- [x] Catálogo de arquetipos.
- [x] Guía de uso V1.
- [x] Configuración Buffer/Vercel.
- [x] Política futura de Storage.
- [x] Estado de implementación.

## Validación manual final

La validación final deberá realizarse con una publicación elegida expresamente para ello.

Secuencia recomendada:

```text
1. Crear o elegir publicación de prueba
2. Revisar Story + Caption
3. Generar render final
4. Crear draft en Buffer
5. Revisar texto + recurso en Buffer
6. Elegir una hora cercana y programar
7. Confirmar el diálogo de programación
8. Abrir Historial después de la hora
9. Verificar reconciliación scheduled/sending → sent
10. Abrir LinkedIn y comprobar la publicación real
11. Confirmar texto, imagen/PDF y enlace
12. Marcar V1 como validada
```

## Regla de seguridad

Los pasos 6–10 no deben ejecutarse automáticamente. Programar o publicar en LinkedIn requiere una decisión humana explícita sobre la publicación concreta.