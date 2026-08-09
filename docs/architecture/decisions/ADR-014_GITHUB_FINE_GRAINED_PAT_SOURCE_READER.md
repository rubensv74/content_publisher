# ADR-014 — GitHub source reader con fine-grained PAT

**Estado:** Aceptado  
**Fecha:** 2026-08-09  
**Gate:** AG-011  
**Decisión aprobada:** Opción A

## Contexto

Suggestion Engine necesita leer repositorios GitHub privados desde el runtime de Content Publisher para convertir cambios reales en señales ligeras. El conector GitHub disponible dentro de ChatGPT no forma parte del runtime de la aplicación.

La fase actual es personal, de bajo volumen y con un conjunto controlado de repositorios. No se justifica todavía la complejidad operativa de una GitHub App.

## Decisión

Content Publisher utilizará un **fine-grained personal access token** dedicado, exclusivamente server-side, con acceso de solo lectura y limitado a repositorios seleccionados.

Variable sensible:

```text
GITHUB_SOURCE_TOKEN
```

La aplicación mantendrá además una allowlist explícita mediante:

```text
GITHUB_SOURCE_REPOSITORIES
GITHUB_KNOWLEDGE_BASE_REPOSITORY
```

Poseer el token no autoriza al adapter a explorar cualquier repositorio accesible: la petición debe pertenecer también a la allowlist configurada.

## Permisos

Permiso mínimo previsto:

```text
Repository access: Only select repositories
Contents: Read-only
Metadata: acceso de lectura implícito/mínimo requerido por GitHub
```

No se conceden permisos de escritura.

## Reglas de seguridad

1. `GITHUB_SOURCE_TOKEN` nunca usa prefijo `NEXT_PUBLIC_`.
2. El token no se almacena en Supabase.
3. El token no se registra en logs, metadata ni `source_signals`.
4. El cliente runtime solo ejecuta peticiones GET.
5. Cada repositorio debe estar incluido en `GITHUB_SOURCE_REPOSITORIES`.
6. La Knowledge Base debe identificarse además mediante `GITHUB_KNOWLEDGE_BASE_REPOSITORY` para conservar su semántica funcional propia.
7. El token debe poder revocarse o rotarse sin migraciones de datos.
8. La expiración y rotación se documentan operativamente.
9. Una futura evolución multiusuario reabrirá esta decisión y evaluará GitHub App.

## Flujo

```text
Vercel Sensitive Env
GITHUB_SOURCE_TOKEN
        ↓
GitHub source client (server only)
        ↓
allowlist
        ↓
GitHub REST API · GET
        ↓
Source adapters
        ↓
source_signals
```

## Consecuencias

### Positivas

- configuración pequeña para uso personal;
- principio de mínimo privilegio;
- acceso a repositorios privados;
- revocación y rotación independientes;
- no introduce callbacks ni infraestructura OAuth;
- mantiene GitHub como fuente de verdad.

### Limitaciones aceptadas

- credencial vinculada a una cuenta personal;
- requiere renovación periódica;
- un cambio de resource owner puede exigir una nueva credencial o reabrir el gate;
- no es el mecanismo definitivo para un producto multiusuario.

## Evolución

Si Content Publisher se convierte en servicio compartido o necesita múltiples propietarios/organizaciones, se evaluará una GitHub App con installation tokens mediante un nuevo gate de arquitectura.