# Formatos y restricciones de LinkedIn

## Objetivo

Mantener en el repositorio las restricciones externas que condicionan el renderizado y la publicación. Estas reglas deben revisarse periódicamente porque LinkedIn puede cambiarlas.

Última revisión: 2026-08-08.

## Documentos / carruseles

Fuente oficial:

https://www.linkedin.com/help/linkedin/answer/a518909

LinkedIn permite compartir documentos en publicaciones.

Condiciones relevantes en la revisión actual:

- formatos admitidos: PPT, PPTX, DOC, DOCX y PDF;
- tamaño máximo: 100 MB;
- máximo: 300 páginas;
- solo se puede añadir un documento por publicación;
- LinkedIn recomienda convertir a PDF para mantener mayor calidad;
- todas las páginas del PDF deben tener el mismo tamaño;
- las capas del PDF deben quedar aplanadas o fusionadas cuando sea necesario;
- el documento publicado no puede sustituirse posteriormente dentro de la misma publicación.

### Decisión de producto derivada

Content Publisher utilizará PDF como formato final preferente para carruseles, salvo que una necesidad futura justifique otro formato.

Esta es una decisión de formato de salida, no de librería de renderizado. La tecnología concreta para generar el PDF sigue abierta.

## Imágenes

Fuente oficial:

https://www.linkedin.com/help/linkedin/answer/a527229

En publicaciones fotográficas LinkedIn admite relaciones de aspecto dentro de un rango aproximado de 3:1 a 4:5. Las proporciones que exceden el rango pueden sufrir recorte.

Para publicaciones con varias imágenes, LinkedIn procesa hasta una relación máxima de 4:5 y la primera imagen influye en la composición mostrada.

### Implicación para V1

La biblioteca de Content Publisher no debe asumir una única proporción universal. Sin embargo, se definirán uno o dos tamaños canónicos para que los arquetipos sean predecibles y fáciles de probar en móvil.

La elección exacta de esos tamaños formará parte del diseño visual, no debe quedar fijada accidentalmente en el código.

## Formatos multimedia

Fuente oficial:

https://www.linkedin.com/help/linkedin/answer/a564109

LinkedIn admite actualmente, entre otros:

- JPEG;
- PNG;
- GIF;
- PDF;
- PPT/PPTX;
- DOC/DOCX;
- MP4;
- MOV;
- AVI;
- WEBM.

La V1 de Content Publisher se concentrará en:

- PNG para creatividades de imagen;
- PDF para carruseles.

## Copyright y fuentes externas

LinkedIn recuerda expresamente que el contenido de terceros debe respetar su política de copyright.

Por esa razón, las referencias visuales investigadas por Content Publisher se utilizarán para estudiar principios de composición. No se incorporarán automáticamente recursos, fotografías, ilustraciones o plantillas de terceros al producto.

## Mantenimiento

Este archivo debe revisarse:

- antes de cerrar la implementación del renderizador;
- antes de cerrar la integración de publicación;
- cuando LinkedIn cambie la experiencia de publicación;
- como mínimo antes de una versión mayor del producto.
