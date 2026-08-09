# AG-011 — Autenticación runtime de GitHub para fuentes privadas

**Estado:** Propuesto — pendiente de decisión  
**Fecha:** 2026-08-09

## Contexto

AG-010 aprobó adaptadores server-side + `source_signals`. Las fuentes locales —Ideas e Historial editorial— no necesitan nuevas credenciales, pero GitHub y la Knowledge Base sí deben poder leerse desde el runtime desplegado de Content Publisher.

El conector GitHub disponible dentro de ChatGPT no forma parte del runtime de la aplicación y no puede utilizarse como mecanismo de producción. Content Publisher necesita su propia autenticación server-side para consultar repositorios privados.

La credencial elegida debe cumplir:

- solo lectura;
- acceso al mínimo conjunto de repositorios necesario;
- nunca llegar al navegador;
- nunca guardarse en PostgreSQL;
- almacenarse como secreto de entorno en Vercel;
- poder rotarse/revocarse sin migraciones de datos;
- permitir una allowlist explícita de repositorios fuente.

Fuentes oficiales consultadas:

- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app

## Opción A — Fine-grained personal access token server-side — RECOMENDADA

Crear un token personal de acceso fine-grained dedicado a Content Publisher.

Configuración prevista:

```text
Nombre: Content Publisher Source Reader
Repository access: Only select repositories
Repository permissions:
  Contents: Read-only
  Metadata: Read-only / acceso mínimo requerido
```

El token se almacenaría únicamente como variable sensible de Vercel:

```text
GITHUB_SOURCE_TOKEN
```

Los repositorios permitidos se declararían además mediante una allowlist de aplicación; poseer el token no bastaría para que el adapter explorase cualquier repositorio accesible.

### Ventajas

- configuración muy sencilla para una aplicación personal;
- permisos fine-grained y selección explícita de repositorios;
- no necesita callbacks, OAuth ni infraestructura de instalación;
- encaja con el patrón ya utilizado para `BUFFER_API_KEY`;
- revocable y rotable de forma independiente;
- suficiente para lecturas bajo demanda de bajo volumen.

### Inconvenientes

- la credencial está vinculada a una cuenta personal;
- necesita política de expiración/rotación;
- un token fine-grained se crea para un resource owner concreto, lo que puede complicar una futura expansión a varios propietarios/organizaciones;
- no es la solución ideal si Content Publisher evoluciona a producto multiusuario o servicio compartido.

**Valoración:** recomendada para la fase personal actual.

## Opción B — GitHub App

Crear una GitHub App privada, instalarla solo en los repositorios fuente y autenticar Content Publisher como instalación.

La aplicación usaría App ID + clave privada para generar installation access tokens de corta duración. GitHub documenta que estos tokens expiran y pueden limitarse a repositorios y permisos concedidos a la instalación.

### Ventajas

- modelo de integración nativo para aplicaciones;
- permisos e instalaciones muy controlables;
- tokens de instalación de corta duración;
- mejor escalabilidad para organizaciones, múltiples usuarios o muchas instalaciones;
- no depende de un PAT personal de larga vida.

### Inconvenientes

- configuración inicial notablemente mayor;
- gestión segura de una clave privada;
- generación/renovación de installation tokens;
- IDs de App e instalación;
- complejidad innecesaria para una sola persona y pocas fuentes en esta fase.

**Valoración:** arquitectura preferible si el producto se convierte en servicio multiusuario, pero sobredimensionada ahora.

## Opción C — Solo API pública sin autenticación

Los adapters consultan exclusivamente repositorios públicos.

### Ventajas

- ningún secreto nuevo;
- implementación mínima.

### Inconvenientes

- no puede cubrir repositorios privados;
- limita precisamente el tipo de trabajo real que Suggestion Engine pretende analizar;
- fuerza a hacer públicos repositorios por una limitación técnica, lo cual es una mala frontera de seguridad.

**Valoración:** descartable para el objetivo funcional actual.

## Recomendación

**Opción A — fine-grained PAT read-only, server-side y limitado a repositorios seleccionados.**

Flujo:

```text
Vercel Sensitive Env
GITHUB_SOURCE_TOKEN
        ↓
GitHub Source Adapter (server only)
        ↓
allowlist de repositorios
        ↓
GitHub REST API read-only
        ↓
SourceSignalCandidate
        ↓
source_signals
```

## Salvaguardas si se aprueba A

1. El token nunca se expone como `NEXT_PUBLIC_*`.
2. No se guarda en Supabase.
3. No se registra en logs ni `provider_payload`.
4. Acceso solo a repositorios seleccionados.
5. Permiso `Contents: Read-only`; no se conceden permisos de escritura.
6. Allowlist de repositorios adicional en código/configuración.
7. El adapter solo ejecuta operaciones GET.
8. Se documenta fecha de expiración y procedimiento de rotación.
9. Si una futura fuente pertenece a otro resource owner incompatible con el token actual, se reabre el gate antes de ampliar credenciales.
10. Una evolución multiusuario deberá reevaluar GitHub App en lugar de reutilizar este PAT.

## Lo que AG-011 no decide

- qué repositorios concretos entrarán inicialmente en la allowlist;
- qué eventos GitHub producen señales;
- proveedor/modelo de IA;
- embeddings;
- scheduler;
- webhooks;
- escritura automática en GitHub.

## Decisión solicitada

- **A** — fine-grained PAT read-only y repo-scoped **(recomendada)**;
- **B** — GitHub App;
- **C** — solo fuentes públicas.

La conexión runtime con repositorios GitHub privados queda detenida hasta aprobar una opción.
