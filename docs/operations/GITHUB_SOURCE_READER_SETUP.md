# Configuración operativa — GitHub Source Reader

Fecha: 2026-08-09

## Objetivo

Permitir que Content Publisher lea repositorios GitHub privados para generar `source_signals` sin conceder permisos de escritura ni exponer secretos.

Arquitectura aprobada: `ADR-014_GITHUB_FINE_GRAINED_PAT_SOURCE_READER.md`.

## Variables

```text
GITHUB_SOURCE_TOKEN                 → secreto sensible, solo servidor
GITHUB_SOURCE_REPOSITORIES          → allowlist owner/repository separada por comas
GITHUB_KNOWLEDGE_BASE_REPOSITORY    → repositorio que actúa como Knowledge Base
```

El token nunca debe llamarse `NEXT_PUBLIC_*`.

## Crear el token

En GitHub crea un **fine-grained personal access token** dedicado.

Configuración recomendada:

```text
Token name: Content Publisher Source Reader
Resource owner: cuenta propietaria de los repositorios
Repository access: Only select repositories
Repository permissions:
  Contents: Read-only
```

Selecciona únicamente los repositorios que Content Publisher deba analizar.

Fuentes oficiales:

- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
- https://docs.github.com/en/rest/commits/commits

## Configurar Vercel

En el proyecto `content-publisher`, añade en Production:

### `GITHUB_SOURCE_TOKEN`

- valor: token fine-grained;
- marcar como **Sensitive**;
- no compartir el valor en chats, capturas ni documentación.

### `GITHUB_SOURCE_REPOSITORIES`

Ejemplo conceptual:

```text
rubensv74/content_publisher,rubensv74/functional-engineering-knowledge-base
```

Esta variable es una segunda barrera: el adapter rechaza cualquier repositorio que no aparezca en ella aunque el token técnicamente tenga acceso.

### `GITHUB_KNOWLEDGE_BASE_REPOSITORY`

Ejemplo:

```text
rubensv74/functional-engineering-knowledge-base
```

Debe estar incluido también en `GITHUB_SOURCE_REPOSITORIES`.

Después de modificar variables de entorno, la configuración estará disponible para nuevos deployments.

## Verificación

En Content Publisher:

```text
Señales
  ↓
GitHub Source Reader = Preparado
  ↓
Refrescar GitHub
```

La aplicación registrará señales ligeras. No copia el repositorio completo ni guarda el token en Supabase.

## Rotación

Cuando el token se acerque a su fecha de expiración:

1. crear un nuevo fine-grained PAT con el mismo alcance mínimo;
2. sustituir `GITHUB_SOURCE_TOKEN` en Vercel;
3. generar un nuevo deployment;
4. abrir `Señales` y ejecutar `Refrescar GitHub`;
5. comprobar que funciona;
6. revocar el token antiguo en GitHub.

No es necesaria ninguna migración de Supabase.

## Seguridad

- solo lectura;
- only select repositories;
- allowlist adicional en Content Publisher;
- secreto solo server-side;
- ninguna escritura GitHub desde este adapter;
- no guardar tokens en `.env.example`, documentación, GitHub o Supabase;
- no ampliar permisos para resolver un error sin entender antes qué endpoint los requiere.

## Evolución

Si Content Publisher pasa a multiusuario o necesita múltiples resource owners, no se reutilizará indefinidamente este PAT. Se abrirá un gate para evaluar GitHub App e installation tokens.