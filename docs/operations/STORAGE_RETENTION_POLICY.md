# Política de conservación y limpieza de Storage

Estado: **criterio operativo acordado para aplicar más adelante**.

Fecha: 2026-08-09.

## Objetivo

Mantener Content Publisher dentro de un consumo razonable de Supabase Storage sin perder el historial editorial ni la capacidad de reconstruir una publicación.

La V1 **no borrará automáticamente archivos**. Primero se prioriza la trazabilidad y la estabilidad del producto. La limpieza se incorporará cuando el uso real de Storage justifique esa necesidad.

## Qué se conserva

### Datos editoriales — conservar indefinidamente

Se conservarán en PostgreSQL:

- título y tema;
- historia estructurada;
- caption de LinkedIn;
- diseño y variante utilizados;
- identidad y configuración necesarias para reconstrucción;
- información de publicación, programación e historial;
- referencias de `publishing_jobs`;
- `render_context` y demás metadatos de trazabilidad.

Estos datos ocupan muy poco comparados con los archivos binarios y constituyen el historial profesional de la aplicación.

### Configuración para reconstruir — conservar indefinidamente

Se conservará la información que permita comprender o regenerar una publicación, incluyendo:

- `structured_content`;
- `visual_config`;
- arquetipo y versión;
- configuración de identidad;
- relaciones relevantes con assets;
- snapshot guardado en `render_context`.

## Qué puede limpiarse en el futuro

### Renders finales PNG/PDF

Los renders publicados no necesitan conservarse obligatoriamente para siempre si existe información suficiente para reconstruirlos.

Sin embargo, el archivo original es la evidencia más fiable de cómo se veía exactamente una publicación en el momento de publicarse. Un render regenerado años después podría presentar pequeñas diferencias por cambios de renderer, tipografía o navegador.

Por ello, la política inicial será:

- no eliminar renders automáticamente;
- mostrar el consumo de Storage antes de introducir limpieza;
- considerar limpieza manual o asistida cuando el bucket se acerque aproximadamente al **70–80 % de la cuota disponible**;
- permitir eliminar renders antiguos sin eliminar la publicación ni su historial;
- estudiar más adelante una retención orientativa de **90–180 días** para renders ya publicados, únicamente si el volumen real lo hace necesario.

### Assets fuente

Los screenshots e imágenes fuente se dividirán conceptualmente en:

- **reutilizables**: conservar mientras sigan teniendo valor para futuras publicaciones;
- **puntuales**: candidatos a limpieza cuando ya no sean necesarios y no exista dependencia de un render pendiente.

La aplicación no debe eliminar un asset si todavía es necesario para reproducir o editar una publicación activa sin advertirlo expresamente.

## Regla de seguridad

La limpieza de Storage nunca debe borrar silenciosamente información editorial ni alterar el historial.

El modelo esperado es:

```text
Base de datos / historial          → conservar
Configuración para reconstruir     → conservar
PNG/PDF publicados                 → conservar hasta necesitar limpieza
Screenshots reutilizables          → conservar
Assets puntuales no reutilizables  → candidatos a limpieza
```

## Trabajo futuro

Cuando el consumo lo justifique, implementar una vista de administración de Storage que muestre:

- almacenamiento total utilizado;
- consumo por publicación;
- consumo por tipo de archivo;
- renders antiguos candidatos a limpieza;
- assets sin uso;
- acción manual de eliminación con confirmación;
- impacto estimado de cada limpieza.

No se implementará borrado automático antes de disponer de estas salvaguardas y de datos reales de uso.
