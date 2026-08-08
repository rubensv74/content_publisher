# ADR-005 — Autenticación personal de Content Publisher

- Estado: Aceptada
- Fecha: 2026-08-08

## Contexto

La V1 de Content Publisher será una aplicación privada de uso personal. La autenticación afecta al acceso a rutas, sesiones, datos y archivos, por lo que debe quedar definida antes de implementar la conexión real con Supabase.

## Decisión

Utilizar **Supabase Auth con email y contraseña**, con registro público desactivado.

La V1 tendrá un único usuario autorizado. La sesión se integrará con Next.js y los datos y recursos se protegerán mediante políticas de acceso en Supabase.

## Reglas

- No habrá registro público en la V1.
- No se confiará únicamente en ocultar rutas o pantallas.
- Las tablas con datos de usuario tendrán Row Level Security (RLS).
- Los recursos almacenados deberán tener políticas equivalentes de acceso.
- Las credenciales y claves sensibles no se expondrán al cliente.

## Motivos

- Minimiza complejidad para una aplicación personal.
- Reutiliza Supabase, ya elegido para datos y almacenamiento.
- Evita una dependencia innecesaria de GitHub, Google u otro proveedor de identidad.
- No obliga a depender del envío de correo para cada inicio de sesión.
- Permite evolucionar a varios usuarios si el producto lo necesitara en el futuro.

## Alternativas descartadas para V1

### Magic link / OTP por email

Es viable, pero introduce dependencia operativa del correo para un flujo que no necesita esa complejidad.

### OAuth con GitHub

Es cómodo, pero añade configuración y dependencia externa sin una ventaja suficiente para la V1.

## Consecuencias

La inicialización de Supabase deberá incluir desde el principio:

- configuración de Auth;
- usuario autorizado;
- registro público desactivado;
- políticas RLS;
- protección de Storage;
- manejo de sesión en Next.js.

La autenticación queda separada de futuras integraciones con GitHub. GitHub podrá actuar como fuente del Suggestion Engine sin convertirse por ello en el proveedor de identidad del producto.
