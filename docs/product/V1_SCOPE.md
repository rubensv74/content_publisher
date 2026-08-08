# Alcance de la V1

## Objetivo

La V1 debe permitir recorrer de principio a fin este flujo:

**Idea → contenido → diseño → previsualización → generación → publicación/programación en LinkedIn**

La V1 no se considerará terminada hasta poder crear y publicar una pieza real sin depender de Canva, PowerPoint u otro editor externo.

## Capacidades incluidas

### 1. Acceso privado

La aplicación será de uso personal en esta primera versión. Debe existir un mecanismo de acceso seguro, pero no se diseñará todavía un producto multiusuario.

### 2. Bandeja de ideas

Debe permitir:

- crear ideas;
- editar título y notas;
- asignar tema o categoría;
- elegir tipo de historia;
- guardar estado;
- archivar;
- convertir una idea en publicación.

Estados mínimos previstos: `idea`, `draft`, `ready`, `scheduled`, `published`, `archived`.

### 3. Tipos de historia

La V1 debe soportar al menos:

- Build / algo construido;
- Problema → solución;
- Arquitectura;
- Tutorial;
- Aprendizaje;
- Comparación / Before & After;
- Data Story;
- Reflexión profesional.

### 4. Content Studio

Flujo guiado para transformar una idea en una publicación.

Debe permitir trabajar con:

- titular;
- idea principal;
- contexto;
- problema;
- decisión o solución;
- resultado;
- aprendizaje;
- llamada final o cierre;
- texto completo de LinkedIn.

No todos los campos serán obligatorios para todos los tipos de historia.

### 5. Biblioteca visual

La V1 incluirá:

- catálogo documentado de referencias externas;
- sistema visual propio;
- familias de diseño;
- arquetipos implementados;
- variantes controladas.

Objetivo inicial: aproximadamente 12 arquetipos base capaces de producir unas 30–40 apariencias mediante variantes.

Familias iniciales:

1. Editorial
2. Product / Screenshot
3. Technical
4. Carousel

### 6. Recursos visuales

Debe ser posible incorporar:

- screenshots;
- imágenes;
- logos o iconos autorizados;
- recursos gráficos propios.

### 7. Identidad visual

Debe existir una configuración central para:

- firma visual;
- nombre mostrado;
- tipografía;
- paleta principal;
- paletas secundarias;
- sistema de series o numeración;
- elementos gráficos recurrentes.

### 8. Generación de imagen

La aplicación debe poder producir una creatividad final a partir del contenido y el arquetipo elegido.

### 9. Carruseles

Debe poder crear una publicación multipágina y generar un documento final adecuado para LinkedIn.

### 10. Vista previa

Antes de generar o publicar debe existir una previsualización suficientemente fiel para detectar errores de contenido o composición.

### 11. Texto de LinkedIn

Debe existir un editor específico para el texto que acompaña a la publicación.

La IA podrá ayudar a reorganizar o pulir el texto, pero la publicación final siempre deberá poder revisarse y editarse manualmente.

### 12. Borradores

Todo el trabajo debe poder guardarse y continuar más adelante.

### 13. Publicación y programación

La primera integración prevista es Buffer como capa entre Content Publisher y LinkedIn.

La V1 debe contemplar:

- publicar ahora;
- programar;
- guardar como borrador cuando la integración lo permita;
- registrar el resultado de la operación.

### 14. Historial editorial

Debe registrar como mínimo:

- fecha;
- tema;
- tipo de historia;
- formato;
- arquetipo;
- estado;
- identificador de serie si aplica;
- enlace o referencia externa cuando exista.

## Fuera de alcance de la V1

Se excluyen deliberadamente:

- editor gráfico libre tipo Canva;
- multiusuario;
- equipos y aprobaciones;
- publicación multired;
- estadísticas avanzadas;
- análisis automático de tendencias;
- generación automática de vídeo;
- importación automática masiva de repositorios;
- motor completo de sugerencias;
- automatización editorial sin revisión humana.

## Preparación para capacidades futuras

Aunque el motor de sugerencias queda fuera de la V1, el modelo de datos debe permitir registrar el origen de una idea, por ejemplo:

- manual;
- GitHub;
- knowledge base;
- suggestion engine;
- tendencia externa;
- otro.

Esto evita rehacer el modelo más adelante.

## Criterios de aceptación globales

La V1 estará completa cuando sea posible:

1. crear una idea;
2. convertirla en publicación;
3. elegir tipo, formato y diseño;
4. añadir recursos;
5. redactar y ajustar el contenido;
6. obtener una imagen o carrusel final;
7. previsualizarlo;
8. guardarlo;
9. publicarlo o programarlo en LinkedIn;
10. verlo reflejado en el historial editorial.
