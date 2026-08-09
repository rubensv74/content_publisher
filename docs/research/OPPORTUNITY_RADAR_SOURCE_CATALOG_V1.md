# Opportunity Radar — Catálogo inicial de fuentes V1

**Estado:** Aprobado para primer ciclo de implementación  
**Fecha:** 2026-08-10  
**Política:** coste adicional obligatorio = 0 EUR  
**ADR:** `ADR-020_ZERO_ADDITIONAL_COST_POLICY.md`, `ADR-021_OPPORTUNITY_RADAR_CURATED_ZERO_COST_SOURCES.md`

## Objetivo

Definir un primer catálogo pequeño y de alta calidad para validar Opportunity Radar sin convertirlo en un agregador masivo de noticias.

La prioridad no es cubrir toda la tecnología. La prioridad es detectar cambios que puedan generar:

- aprendizaje profesional útil;
- experimentos;
- nuevos proyectos;
- casos de estudio;
- mejoras en proyectos existentes;
- oportunidades editoriales basadas en trabajo real.

## Criterios obligatorios

Toda fuente de este catálogo debe:

1. ser oficial o de primera parte siempre que sea posible;
2. tener relación directa con áreas profesionales relevantes;
3. poder consultarse con coste adicional de 0 EUR;
4. no requerir billing habilitado;
5. conservar una referencia original verificable;
6. permitir un acceso razonablemente estable;
7. poder desactivarse de forma independiente;
8. aportar más señal que ruido.

Una fuente se elimina si empieza a exigir pago, billing o un plan superior.

# Fuentes P0 — primer lote recomendado

Estas fuentes son las primeras que merece la pena implementar porque combinan relevancia alta y mecanismos de adquisición sencillos.

## SRC-001 — GitHub Changelog

- **Organización:** GitHub
- **Área:** GitHub, Git, Actions, Issues, Projects, Copilot, seguridad, desarrollo asistido por IA
- **Fuente oficial:** `https://github.blog/changelog/`
- **Acceso preferido:** RSS oficial
- **Coste adicional:** 0 EUR
- **Prioridad:** P0
- **Valor:** Muy alto

### Por qué entra

GitHub forma parte directa del método de desarrollo de Content Publisher y del ecosistema profesional del usuario. Cambios en Issues, Projects, Actions, Copilot, repositorios o automatización pueden convertirse rápidamente en mejoras de proceso, experimentos o publicaciones.

### Señales interesantes

- nuevas funcionalidades;
- cambios de GitHub Projects/Issues;
- capacidades de agentes/Copilot;
- GitHub Actions;
- nuevas APIs gratuitas;
- deprecaciones;
- seguridad;
- cambios de Git y repositorios.

---

## SRC-002 — Supabase Changelog

- **Organización:** Supabase
- **Área:** PostgreSQL, backend, Auth, Storage, Realtime, Edge Functions, IA aplicada
- **Fuente oficial:** `https://supabase.com/changelog`
- **Acceso preferido:** RSS oficial
- **Coste adicional:** 0 EUR para consultar la fuente
- **Prioridad:** P0
- **Valor:** Muy alto

### Por qué entra

Supabase es parte de la arquitectura actual de Content Publisher y una tecnología reutilizable en nuevos proyectos.

### Señales interesantes

- cambios de PostgreSQL y Database;
- Auth;
- Storage;
- Edge Functions;
- seguridad;
- breaking changes;
- deprecaciones;
- integraciones con herramientas de desarrollo e IA.

### Regla especial

Una noticia sobre una capacidad exclusiva de planes de pago puede registrarse como información, pero no debe convertirse automáticamente en una recomendación de adopción si requiere gasto.

---

## SRC-003 — OpenAI Product Release Notes

- **Organización:** OpenAI
- **Área:** ChatGPT, Codex, agentes, IA aplicada al trabajo y desarrollo
- **Fuente oficial:** `https://openai.com/products/release-notes/`
- **Acceso preferido:** RSS oficial
- **Coste adicional:** 0 EUR para consultar la fuente
- **Prioridad:** P0
- **Valor:** Muy alto

### Por qué entra

Las nuevas capacidades incluidas en ChatGPT Plus pueden modificar directamente la forma de trabajar, aprender, desarrollar software y operar Content Publisher sin introducir gasto adicional.

### Regla especial

Opportunity Radar debe diferenciar:

- funcionalidad incluida en ChatGPT Plus;
- funcionalidad gratuita;
- API o créditos de pago;
- funcionalidades de planes superiores.

Solo las dos primeras pueden proponerse como adopción directa dentro de la política de coste cero.

---

## SRC-004 — Microsoft Power BI Blog

- **Organización:** Microsoft
- **Área:** Power BI, analítica, visualización, semantic models, DAX
- **Fuente oficial:** `https://powerbi.microsoft.com/en-us/blog/`
- **Acceso preferido:** RSS oficial
- **Coste adicional:** 0 EUR para consultar la fuente
- **Prioridad:** P0
- **Valor:** Muy alto

### Por qué entra

Power BI es un área directa de aprendizaje, proyectos y posibles casos de estudio.

### Señales interesantes

- Desktop;
- visuales;
- modelado;
- DAX;
- integración con Fabric;
- nuevas capacidades de IA;
- novedades relevantes para diseño de dashboards.

---

## SRC-005 — Android Developers Blog

- **Organización:** Google / Android
- **Área:** Android Studio, Android, Jetpack, publicación, seguridad
- **Fuente oficial:** `https://android-developers.googleblog.com/`
- **Acceso preferido:** feed oficial
- **Coste adicional:** 0 EUR
- **Prioridad:** P0
- **Valor:** Alto

### Por qué entra

Permite detectar cambios relevantes para aplicaciones Android actuales y futuros casos de estudio.

### Señales interesantes

- Android Studio;
- nuevas versiones Android;
- cambios de Play;
- Jetpack;
- arquitectura;
- seguridad y privacidad;
- herramientas asistidas por IA.

---

## SRC-006 — Kotlin Blog

- **Organización:** JetBrains
- **Área:** Kotlin, Android, desarrollo multiplataforma
- **Fuente oficial:** `https://blog.jetbrains.com/kotlin/`
- **Acceso preferido:** `https://blog.jetbrains.com/kotlin/feed/`
- **Coste adicional:** 0 EUR
- **Prioridad:** P0
- **Valor:** Alto

### Por qué entra

JetBrains ofrece oficialmente RSS gratuito y Kotlin forma parte de la evolución del aprendizaje Android.

### Señales interesantes

- nuevas versiones;
- lenguaje;
- tooling;
- Kotlin Multiplatform;
- rendimiento;
- interoperabilidad;
- cambios de Gradle/ecosistema relevantes.

# Fuentes P1 — segundo lote

Se incorporarán después de validar la adquisición y deduplicación con P0.

## SRC-007 — Microsoft Power Platform Release Plan

- **Organización:** Microsoft
- **Área:** Power Apps, Power Automate, Dataverse, Power Pages, governance
- **Fuente oficial:** `https://learn.microsoft.com/en-us/power-platform/release-plan/`
- **Acceso preferido:** página estructurada de Microsoft Learn
- **Frecuencia conocida:** los planes activos se actualizan periódicamente; el plan 2026 wave 1 indica actualización semanal
- **Coste adicional:** 0 EUR para consultar la documentación pública
- **Prioridad:** P1
- **Valor:** Muy alto

### Señales interesantes

- características anunciadas;
- Public Preview;
- General Availability;
- GitHub/ALM;
- nuevas capacidades de Power Apps y Automate;
- agentes e IA;
- gobierno y administración.

### Regla de calidad

Distinguir claramente entre `planned`, `preview` y `released`. Una característica prevista no puede tratarse como ya disponible.

---

## SRC-008 — Microsoft Fabric What's New

- **Organización:** Microsoft
- **Área:** Fabric, Power BI, SQL, Data Engineering, Data Warehouse, Real-Time Intelligence, IA
- **Fuente oficial:** `https://learn.microsoft.com/en-us/fabric/fundamentals/whats-new`
- **Acceso preferido:** página estructurada de Microsoft Learn
- **Coste adicional:** 0 EUR para consultar la documentación pública
- **Prioridad:** P1
- **Valor:** Muy alto

### Señales interesantes

- GA y previews;
- SQL Database in Fabric;
- Power BI;
- Data Factory;
- Data Engineering;
- agentes de datos;
- CI/CD;
- nuevas capacidades de arquitectura y analítica.

---

## SRC-009 — Vercel Changelog

- **Organización:** Vercel
- **Área:** Next.js hosting, web platform, deployments, funciones, caching, seguridad
- **Fuente oficial:** `https://vercel.com/changelog`
- **Acceso preferido:** página estructurada oficial
- **Coste adicional:** 0 EUR para consultar la fuente
- **Prioridad:** P1
- **Valor:** Alto

### Regla especial

El changelog mezcla capacidades disponibles en distintos planes. El análisis debe marcar la disponibilidad y **no recomendar adopción si requiere Pro/Enterprise o consumo facturable**.

---

## SRC-010 — Next.js Blog

- **Organización:** Vercel / Next.js
- **Área:** Next.js, React, App Router, seguridad, Turbopack
- **Fuente oficial:** `https://nextjs.org/blog`
- **Acceso preferido:** página estructurada oficial
- **Coste adicional:** 0 EUR
- **Prioridad:** P1
- **Valor:** Alto

### Señales interesantes

- releases;
- seguridad;
- cambios de App Router;
- caching;
- Turbopack;
- deprecaciones;
- patrones arquitectónicos.

---

## SRC-011 — React Blog

- **Organización:** React
- **Área:** React, Server Components, seguridad, arquitectura web
- **Fuente oficial:** `https://react.dev/blog`
- **Acceso preferido:** página estructurada oficial; releases del repositorio como alternativa
- **Coste adicional:** 0 EUR
- **Prioridad:** P1
- **Valor:** Alto

### Por qué entra

El propio equipo de React define el blog como fuente oficial de actualizaciones importantes, notas relevantes y deprecaciones.

---

## SRC-012 — TypeScript Blog

- **Organización:** Microsoft / TypeScript Team
- **Área:** TypeScript, JavaScript tooling, desarrollo web
- **Fuente oficial:** `https://devblogs.microsoft.com/typescript/`
- **Acceso preferido:** página oficial; feed del sitio podrá validarse técnicamente antes de implementación
- **Coste adicional:** 0 EUR
- **Prioridad:** P1
- **Valor:** Alto

### Señales interesantes

- nuevas versiones;
- breaking changes;
- rendimiento;
- tooling;
- cambios del compilador;
- migraciones.

---

## SRC-013 — PostgreSQL Project News

- **Organización:** PostgreSQL Global Development Group
- **Área:** PostgreSQL, SQL, bases de datos, seguridad
- **Fuente oficial:** `https://www.postgresql.org/about/newsarchive/pgsql/`
- **Acceso preferido:** página estructurada oficial; RSS del proyecto podrá validarse técnicamente antes de implementación
- **Coste adicional:** 0 EUR
- **Prioridad:** P1
- **Valor:** Alto

### Señales interesantes

- major releases;
- betas y RC;
- actualizaciones de versiones soportadas;
- seguridad;
- cambios de calendario y compatibilidad.

# Fuentes expresamente excluidas en V1

No se incorporarán:

- NewsAPI;
- SerpAPI;
- Tavily de pago;
- Exa de pago;
- Firecrawl cloud de pago;
- Feedly Pro;
- agregadores comerciales equivalentes;
- APIs de modelos de IA facturables;
- fuentes que obliguen a habilitar billing aunque ofrezcan crédito inicial;
- crawling indiscriminado de webs.

La lista es conceptual: cualquier servicio equivalente queda excluido por `ADR-020`, aunque no aparezca expresamente aquí.

# Orden de incorporación recomendado

```text
Lote A
  SRC-001 GitHub Changelog
  SRC-002 Supabase Changelog
  SRC-003 OpenAI Release Notes

Lote B
  SRC-004 Power BI Blog
  SRC-005 Android Developers Blog
  SRC-006 Kotlin Blog

Lote C
  SRC-007 Power Platform Release Plan
  SRC-008 Fabric What's New
  SRC-009 Vercel Changelog

Lote D
  SRC-010 Next.js Blog
  SRC-011 React Blog
  SRC-012 TypeScript Blog
  SRC-013 PostgreSQL Project News
```

## Por qué empezar con tres

El primer adaptador debe demostrar:

- lectura;
- normalización;
- fingerprint;
- deduplicación;
- refresco manual;
- tolerancia a errores;
- persistencia como Source Signal.

Añadir trece fuentes antes de validar eso solo multiplicaría los errores.

# Criterios de relevancia iniciales

Una señal debe ganar prioridad si cumple uno o varios criterios:

- afecta directamente a una tecnología utilizada en proyectos actuales;
- introduce una capacidad que permite construir un experimento concreto;
- resuelve un problema que ya se ha encontrado durante un proyecto;
- abre una posibilidad clara de aprendizaje práctico;
- modifica una arquitectura, herramienta o flujo de trabajo existente;
- contiene una breaking change, deprecación o cambio de seguridad;
- puede convertirse en un caso de estudio demostrable;
- aporta una habilidad útil para análisis funcional, arquitectura de soluciones o diseño de sistemas.

Debe perder prioridad si:

- es principalmente marketing;
- requiere un producto o plan de pago para probarla;
- no tiene aplicación práctica identificable;
- repite una señal ya registrada;
- solo aporta curiosidad sin acción posible;
- pertenece a un área alejada del foco profesional actual.

# Campos mínimos del catálogo técnico

Cada fuente implementada deberá declarar al menos:

```text
id
name
provider
source_url
access_type
professional_areas
priority
active
zero_additional_cost
billing_required
last_success_at
last_error
notes
```

Invariantes:

```text
zero_additional_cost = true
billing_required = false
```

Una fuente que no pueda cumplir ambos valores no entra en producción.

# Resultado OR-01

Este catálogo es suficiente para iniciar OR-02 con un primer lote controlado de tres fuentes RSS oficiales:

1. GitHub Changelog;
2. Supabase Changelog;
3. OpenAI Product Release Notes.

No se requiere ninguna nueva decisión arquitectónica para iniciar el diseño técnico de OR-02 mientras se respeten ADR-020 y ADR-021.