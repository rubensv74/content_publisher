# AG-002 — Autenticación personal de la V1

- Estado: Aprobada
- Fecha: 2026-08-08
- Opción elegida: A — Supabase Auth con email + contraseña, sin registro público

## Por qué aparece esta decisión ahora

La V1 será una aplicación privada de uso personal. Antes de conectar la interfaz con Supabase necesitamos decidir cómo se protege el acceso, porque esta elección afecta sesiones, rutas, permisos y políticas de datos.

## Decisión aprobada

Utilizar Supabase Auth con email y contraseña para un único usuario autorizado en la V1.

La configuración prevista será:

- un único usuario creado de forma controlada;
- registro público desactivado;
- sesión gestionada mediante la integración de Supabase con Next.js;
- tablas protegidas mediante Row Level Security (RLS);
- recursos de Storage protegidos mediante políticas equivalentes.

## Motivos

- Es simple para una aplicación personal.
- No depende de Google, GitHub u otro proveedor de identidad.
- No necesita enviar un correo en cada inicio de sesión.
- Aprovecha la misma plataforma ya elegida para datos y almacenamiento.
- Deja abierta una evolución posterior a varios usuarios si algún día fuera necesaria.

## Alternativas descartadas para V1

### Enlace de acceso por email

Evita contraseñas, pero obliga a depender del correo para cada acceso y añade una necesidad operativa que no aporta suficiente valor en la V1.

### Inicio de sesión con GitHub

Sería cómodo, pero añade configuración OAuth y hace que GitHub forme parte del acceso al producto sin una ventaja clara para el caso de uso actual.

## Regla de seguridad

La protección no se limitará a ocultar pantallas. Los datos y recursos deberán tener políticas de acceso en Supabase para que un cliente no autenticado no pueda leerlos aunque conozca una URL o endpoint.

## Fuentes revisadas

- Supabase — Password-based Auth: https://supabase.com/docs/guides/auth/passwords
- Supabase — General Auth configuration: https://supabase.com/docs/guides/auth/general-configuration
- Supabase — Auth con Next.js: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase — Server-Side Rendering: https://supabase.com/docs/guides/auth/server-side
- Supabase — Auth y Row Level Security: https://supabase.com/docs/guides/auth

## Registro formal

La decisión queda registrada en `docs/architecture/decisions/ADR-005_PERSONAL_AUTHENTICATION.md`.
