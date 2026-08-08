# ADR-010 — API key personal de Buffer solo en servidor

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

Content Publisher V1 es una aplicación personal y privada de un único usuario. El flujo ya produce renders finales PNG/PDF con URL pública estable y el siguiente paso es crear y programar publicaciones reales mediante Buffer.

Buffer exige autenticación Bearer para todas las llamadas. Para automatizaciones sobre la propia cuenta, su documentación permite una API key personal y recomienda mantenerla fuera del cliente y almacenarla como variable de entorno.

Construir OAuth 2.0 + PKCE en V1 introduciría callbacks, estado de autorización, access tokens, refresh tokens y rotación de credenciales que solo aportan valor real en un producto multiusuario.

## Decisión

Content Publisher utilizará una API key personal de Buffer configurada como:

```text
BUFFER_API_KEY
```

La credencial:

- existirá únicamente en el entorno del servidor;
- no se versionará en GitHub;
- no se persistirá en PostgreSQL;
- no se incluirá en `publishing_jobs` ni en logs o payloads persistidos;
- no se enviará al navegador.

Todas las llamadas a `https://api.buffer.com` se realizarán desde código server-side detrás del adaptador de publicación.

## Frontera

```text
Application / Server Action
        │
        ▼
Publishing boundary
        │
        ▼
Buffer adapter
        │
        ├── BUFFER_API_KEY (server only)
        ▼
Buffer GraphQL API
```

El dominio seguirá hablando en términos de publicación, programación, draft, canal, render y estado. La forma concreta de autenticarse con Buffer queda encapsulada en el adaptador.

## Manejo de errores

- ausencia de `BUFFER_API_KEY`: integración no configurada;
- `401 Unauthorized`: clave inválida o revocada;
- errores GraphQL: se normalizan antes de llegar al dominio;
- nunca se incluirá la credencial en mensajes de error persistidos.

## Consecuencias

### Positivas

- mínima superficie de seguridad para una aplicación personal;
- ninguna tabla adicional de secretos;
- ninguna credencial privilegiada de Supabase para leer secretos;
- implementación sencilla y fácil de rotar;
- permite continuar con la integración real de Buffer sin introducir OAuth prematuramente.

### Limitaciones

La conexión no puede configurarse completamente desde la UI. La API key debe añadirse manualmente al entorno local o a Vercel.

## Evolución

Si Content Publisher pasa a ser multiusuario o requiere que terceros conecten sus propias cuentas de Buffer, esta ADR deberá reabrirse. En ese escenario se evaluará OAuth 2.0 Authorization Code + PKCE y almacenamiento seguro de refresh tokens.

La tabla `publishing_jobs` y la frontera de Publishing no deberán cambiar por ese motivo.

## Fuentes

- https://developers.buffer.com/guides/authentication.html
- https://developers.buffer.com/guides/getting-started.html
- https://developers.buffer.com/guides/posts-and-scheduling.html
