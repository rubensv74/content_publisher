# Guía de uso — Content Publisher V1

## Para qué sirve

Content Publisher convierte una idea en una publicación profesional de LinkedIn sin depender de Canva, PowerPoint u otro editor gráfico externo.

El recorrido normal es:

```text
IDEA → STORY → FORMAT → DESIGN → PREVIEW → RENDER → BUFFER → LINKEDIN
```

La aplicación siempre mantiene revisión humana antes de publicar.

## 1. Crear una idea

En **Ideas**:

1. crea un título corto;
2. añade el tema;
3. escribe notas suficientes para recordar qué quieres contar;
4. elige el tipo de historia cuando corresponda;
5. guarda la idea.

Una idea puede editarse, archivarse o convertirse en publicación.

## 2. Convertir la idea en publicación

Pulsa **Convertir en publicación**.

La idea original queda registrada como origen y se abre el trabajo editorial en **Content Studio**.

## 3. Completar la historia

Content Studio separa la historia en campos que ayudan a ordenar el pensamiento:

- problema o contexto;
- qué intentaste;
- decisión o solución;
- resultado;
- aprendizaje;
- idea transferible;
- cierre o llamada final.

No todos los campos tienen que ser extensos. El objetivo es disponer de información suficiente para que el diseño y el texto final tengan una historia clara.

Pulsa **Guardar cambios** para conservar historia y caption.

## 4. Redactar el texto de LinkedIn

El bloque **LinkedIn caption** contiene el texto que acompañará a la imagen o carrusel.

Una estructura útil es:

```text
HOOK → CONTEXTO → PROBLEMA → DECISIÓN → RESULTADO → APRENDIZAJE → CTA
```

El texto puede editarse manualmente hasta el último momento.

## 5. Elegir formato

La publicación puede ser:

- **Imagen única** — creatividad 1080 × 1350;
- **Carrusel PDF** — varias páginas 1080 × 1350.

## 6. Elegir diseño

En el panel de **Diseños compatibles** aparecen únicamente los arquetipos válidos para el formato y tipo de historia actuales.

Se puede previsualizar otro diseño antes de guardarlo.

Cuando estés conforme, pulsa **Usar este diseño**.

Content Publisher mantiene la historia separada del diseño, por lo que cambiar de arquetipo no obliga a reescribir el contenido.

## 7. Añadir recursos visuales

En **Recursos** pueden subirse PNG, JPEG y WebP.

Los originales se almacenan de forma privada.

Según el diseño, Content Studio puede pedir:

- `hero` — screenshot o imagen principal;
- `before` — estado anterior;
- `after` — estado posterior.

Los diseños que necesiten un recurso indican claramente qué falta antes de permitir crear el render final.

## 8. Completar configuración visual específica

Algunos diseños necesitan datos adicionales que no forman parte de la historia.

Ejemplos:

- **Metric Hero** — cifra, etiqueta, delta y contexto;
- **Annotated Screenshot** — anotaciones y posiciones;
- **Before / After** — etiquetas y resumen del cambio;
- **Code Focus** — lenguaje, código y líneas destacadas;
- **Data Story** — categorías, valores e insight principal.

Estos valores se guardan de forma independiente para que no contaminen la historia editorial.

## 9. Revisar Preview

Antes de generar el archivo final, revisa:

- textos cortados;
- ortografía;
- contraste;
- screenshot correcto;
- datos y cifras;
- firma visual;
- composición general.

El preview y el archivo final utilizan el mismo árbol de renderizado para reducir diferencias entre ambos.

## 10. Crear render final

Pulsa **Crear render final**.

Según el formato se generará:

- PNG para imagen única;
- PDF para carrusel;
- una miniatura PNG adicional cuando Buffer la necesite para el documento.

El archivo final se guarda con una URL pública estable para que Buffer pueda recuperarlo.

Los recursos originales continúan siendo privados.

## 11. Qué ocurre si cambias algo después

Si modificas historia, diseño, configuración visual, identidad o recursos después de generar un render, el render anterior se considera **obsoleto**.

No se ofrece para publicar.

Debes generar un nuevo render para evitar enviar por error una creatividad que ya no coincida con el contenido actual.

## 12. Guardar un draft en Buffer

Para una revisión segura selecciona el canal LinkedIn y pulsa **Guardar draft en Buffer**.

El botón muestra progreso y confirmación.

Un draft en Buffer **no publica en LinkedIn**.

La aplicación también evita crear otro draft idéntico para la misma publicación, render y canal cuando ya existe uno activo.

## 13. Programar

Selecciona una fecha y hora futuras y utiliza **Programar**.

Content Publisher registra el trabajo y Buffer gestiona la entrega a LinkedIn.

## 14. Publicar ahora

**Publicar ahora** solicita a Buffer que envíe la publicación inmediatamente.

Esta acción debe utilizarse únicamente cuando el contenido y el render hayan sido revisados.

## 15. Historial

En **Historial** puedes ver:

- publicación;
- tipo de acción;
- fecha;
- programación;
- render utilizado;
- diseño;
- identificador de Buffer;
- resultado;
- errores cuando existan.

Los estados no terminales se vuelven a consultar en Buffer al abrir Historial.

También existe el botón **Actualizar estado** para forzar una nueva comprobación.

La actualización de estado es de solo lectura respecto a Buffer: no publica, reprograma ni elimina contenido.

## 16. Eliminar drafts duplicados

Los drafts creados en Buffer pueden eliminarse desde Historial mediante **Eliminar draft de Buffer**.

La acción necesita confirmación y solo afecta al draft elegido.

El registro local permanece como `cancelled` para conservar trazabilidad.

## 17. Identidad

En **Identity / Settings** se centralizan:

- nombre visible;
- firma corta;
- dirección visual;
- paleta;
- tipografía.

Los diseños leen esta configuración central para conservar una identidad reconocible sin que todas las publicaciones tengan el mismo aspecto.

## 18. Conservación de datos y Storage

La V1 no borra archivos automáticamente.

Se conservan indefinidamente los datos editoriales y la información necesaria para comprender o reconstruir una publicación.

Los PNG, PDF y assets podrán limpiarse más adelante si el consumo de Storage lo hace necesario. La política está documentada en:

`docs/operations/STORAGE_RETENTION_POLICY.md`

## Regla práctica de uso

Para una publicación importante, el recorrido recomendado es:

```text
Idea
↓
Historia
↓
Caption
↓
Diseño
↓
Recursos / datos visuales
↓
Preview
↓
Render final
↓
Draft en Buffer
↓
Revisión
↓
Programar o publicar
↓
Historial
```

El draft es el punto de control recomendado antes de cualquier publicación pública.