# Ruta de aprendizaje en VS Code

## Objetivo

Content Publisher debe servir para dos cosas al mismo tiempo:

1. construir un producto real;
2. aprender React, TypeScript, Next.js y desarrollo web moderno sobre código que tiene una utilidad concreta.

La prioridad no es avanzar despacio para estudiar teoría ni avanzar tan rápido que la IA oculte cómo funciona la aplicación. El método de trabajo será **aprender cada concepto cuando el producto lo necesite y aplicarlo inmediatamente**.

---

## Entorno de trabajo

El IDE de referencia es **Visual Studio Code**.

Requisitos locales:

- Node.js 22 o superior;
- npm;
- Git;
- Visual Studio Code;
- una copia local del repositorio.

El repositorio incluye recomendaciones mínimas en `.vscode/extensions.json`. No se pretende convertir VS Code en un entorno lleno de extensiones: cada herramienta adicional deberá tener una utilidad clara.

### Extensiones recomendadas

- ESLint: muestra problemas de código mientras se trabaja;
- Tailwind CSS IntelliSense: ayuda con las clases de Tailwind;
- Error Lens: hace más visibles errores y avisos dentro del editor;
- GitHub Pull Requests: permite revisar cambios y PR desde VS Code.

La asistencia de IA puede utilizarse desde el editor, pero no se fija un proveedor concreto como dependencia del proyecto.

---

## Puesta en marcha local

Desde la carpeta del repositorio:

```bash
npm install
```

Crear `.env.local` a partir de `.env.example` y completar las variables de Supabase necesarias para el entorno personal.

`BUFFER_API_KEY` solo es necesaria para validar la integración real con Buffer y debe permanecer exclusivamente en servidor.

Arrancar la aplicación:

```bash
npm run dev
```

Antes de considerar terminado un cambio:

```bash
npm run check
npm run build
```

`npm run check` ejecuta ESLint y TypeScript. El workflow `Quality` de GitHub repite estas comprobaciones y el build en cada pull request hacia `main`.

---

# Método de aprendizaje durante el desarrollo

Cada bloque funcional seguirá esta secuencia:

```text
Objetivo funcional
      ↓
Concepto nuevo que necesitamos
      ↓
Localizar un ejemplo real en el repositorio
      ↓
Entender el flujo antes de modificarlo
      ↓
Realizar un cambio pequeño
      ↓
Ejecutar y observar el resultado
      ↓
Revisar el diff
      ↓
Lint + TypeScript + build
      ↓
Explicar qué hemos aprendido
```

La prueba de aprendizaje no es memorizar sintaxis. Es poder explicar con palabras propias:

- dónde empieza una acción del usuario;
- qué componente la recibe;
- qué datos cambian;
- qué parte se ejecuta en navegador y cuál en servidor;
- dónde se persisten los datos;
- qué resultado vuelve a la interfaz.

Si no podemos explicar ese recorrido, hemos automatizado demasiado pronto.

---

# Orden de aprendizaje sobre el código real

## Nivel 1 — Orientarse en una aplicación React / Next.js

### Conceptos

- componente;
- JSX/TSX;
- props;
- composición;
- rutas y layouts;
- diferencia inicial entre código de servidor y código de navegador.

### Dónde verlo

```text
src/app/
src/components/
```

`src/app/` define rutas y composición de páginas. `src/components/` contiene piezas reutilizables de la interfaz.

### Objetivo práctico

Ser capaz de abrir una pantalla, localizar qué archivo la crea y seguir los componentes que la forman sin modificar todavía la lógica de negocio.

---

## Nivel 2 — TypeScript aplicado, no TypeScript como asignatura

### Conceptos

- tipos básicos;
- `type` e `interface`;
- parámetros y valores de retorno;
- objetos opcionales;
- uniones;
- por qué el compilador evita errores antes de ejecutar la aplicación.

### Dónde verlo

```text
src/domain/
src/features/
```

### Objetivo práctico

Tomar un dato real de Content Publisher —por ejemplo una Idea o una Publication— y seguir su forma desde el dominio hasta la interfaz.

No se estudiará TypeScript de forma aislada durante semanas. Cada nueva construcción del lenguaje se explicará cuando aparezca en código real.

---

## Nivel 3 — Estado, formularios e interacción

### Conceptos

- estado local;
- eventos;
- campos controlados;
- validación;
- `use client`;
- cuándo un componente necesita ejecutarse en el navegador.

### Dónde verlo

Las pantallas interactivas de:

```text
src/features/ideas/
src/features/publications/
src/features/identity/
```

### Objetivo práctico

Modificar de forma controlada un campo o una validación existente y predecir qué ocurrirá antes de probarlo.

---

## Nivel 4 — Del botón a la base de datos

Este es el bloque más importante para comprender una aplicación web completa.

### Conceptos

- operaciones asíncronas;
- Server Actions;
- sesión;
- cliente y servidor;
- Supabase;
- PostgreSQL;
- RLS;
- errores y estados de respuesta.

### Dónde verlo

```text
src/features/ideas/
src/features/auth/
src/lib/supabase/
src/proxy.ts
supabase/
```

### Primer recorrido recomendado

Usar la bandeja de Ideas como ejercicio de lectura de extremo a extremo:

```text
Usuario crea/edita una Idea
          ↓
Formulario / componente
          ↓
Server Action
          ↓
Supabase
          ↓
PostgreSQL + RLS
          ↓
Resultado
          ↓
Interfaz actualizada
```

El objetivo no será reescribir Ideas. Será comprender un flujo que ya funciona antes de añadir nuevas capacidades.

---

## Nivel 5 — Arquitectura por capacidades

### Conceptos

- separar responsabilidades;
- evitar que las páginas acumulen toda la lógica;
- distinguir dominio, interfaz e integración;
- dependencias entre módulos.

### Dónde verlo

```text
src/features/auth/
src/features/ideas/
src/features/identity/
src/features/publications/
src/features/renders/
src/features/publishing/
```

### Objetivo práctico

Ante una nueva función, poder decidir primero **a qué capacidad pertenece** antes de decidir en qué archivo escribirla.

---

## Nivel 6 — Renderer visual

Aquí React deja de ser únicamente una tecnología de interfaz y se convierte en el motor de las publicaciones.

### Conceptos

- componentes visuales parametrizados;
- contenido frente a presentación;
- arquetipos y variantes;
- dimensiones fijas;
- recursos cargados;
- exportación desde el navegador.

### Dónde verlo

```text
src/publication-renderer/
src/features/renders/
```

### Flujo que hay que comprender

```text
Publication
    ↓
Renderer React
    ├── Preview
    ↓
Export Adapter
    ├── PNG: html-to-image
    └── PDF: pdf-lib
    ↓
Render persistido
```

### Objetivo práctico

Construir o modificar un arquetipo sabiendo por qué la misma composición sirve tanto para preview como para exportación.

---

## Nivel 7 — Integraciones seguras de servidor

### Conceptos

- API externa;
- secretos;
- variables de entorno;
- contrato de integración;
- adaptador;
- normalización de errores;
- por qué una credencial no puede aparecer en el navegador.

### Dónde verlo

```text
src/features/publishing/
src/lib/publishing/
.env.example
```

### Caso práctico

Buffer permite seguir el recorrido:

```text
Content Studio
     ↓
acción de publicación
     ↓
servidor Next.js
     ↓
Buffer Adapter
     ↓
Buffer
     ↓
LinkedIn
```

La clave `BUFFER_API_KEY` nunca forma parte del código del cliente.

---

## Nivel 8 — Calidad y Git

### Conceptos

- diff;
- commit;
- rama;
- pull request;
- lint;
- comprobación de tipos;
- build;
- CI.

### Dónde verlo

```text
package.json
.github/workflows/quality.yml
```

### Rutina

Antes de subir un cambio debemos ser capaces de responder:

1. ¿Qué problema resuelve?
2. ¿Qué archivos hemos cambiado y por qué?
3. ¿Hay algo en el diff que no esperábamos?
4. ¿Pasa `npm run check`?
5. ¿Pasa `npm run build` cuando el cambio lo justifica?

Git no se utilizará solo como copia de seguridad. Será parte del proceso de entender y controlar los cambios.

---

# Cómo usar la IA sin dejar de aprender

La IA es útil para:

- explicar código existente;
- localizar el flujo que interviene en una función;
- proponer alternativas;
- generar una primera implementación;
- revisar errores;
- revisar el diff;
- explicar conceptos que aparecen durante el desarrollo;
- crear tests y documentación cuando tengan valor.

La IA empieza a perjudicar el aprendizaje cuando:

- modifica muchos archivos sin que entendamos el motivo;
- instala librerías para resolver problemas que todavía no comprendemos;
- sustituye una explicación por un bloque enorme de código;
- aceptamos un cambio porque “funciona” sin seguir el recorrido de datos;
- dejamos de revisar el diff.

## Regla de trabajo

Para cualquier concepto que sea nuevo, el orden será:

**entender → implementar → ejecutar → revisar**.

No al revés.

Esto no significa escribir manualmente cada línea. Significa que la automatización no debe superar nuestra capacidad para explicar el cambio.

---

# Primer itinerario recomendado

El mejor punto de entrada no es crear otra aplicación de ejemplo. Es estudiar una pequeña parte de Content Publisher que ya funciona.

Orden recomendado:

1. abrir la aplicación y la estructura `src/` en VS Code;
2. entender `src/app/` y localizar la ruta de Ideas;
3. seguir la pantalla hasta `src/features/ideas/`;
4. localizar una operación de creación o edición;
5. seguirla hasta Supabase;
6. identificar dónde interviene la sesión y RLS;
7. realizar una modificación funcional pequeña;
8. ejecutar la aplicación;
9. revisar el diff en Source Control;
10. ejecutar `npm run check`;
11. explicar el recorrido completo antes de cerrar el cambio.

Este único ejercicio conecta React, TypeScript, Next.js, servidor, Supabase, PostgreSQL, seguridad y Git sin necesitar un proyecto de entrenamiento paralelo.

---

# Criterio de progreso

No mediremos el aprendizaje por número de tecnologías vistas.

Consideraremos dominado un bloque cuando se pueda:

- leer el código sin depender constantemente de una explicación externa;
- localizar dónde realizar un cambio;
- anticipar qué partes pueden verse afectadas;
- interpretar los errores principales;
- revisar críticamente una propuesta de IA;
- explicar el flujo funcional con lenguaje natural.

El objetivo final no es memorizar Next.js. Es adquirir suficiente criterio para construir, revisar y mantener aplicaciones web con autonomía creciente.
