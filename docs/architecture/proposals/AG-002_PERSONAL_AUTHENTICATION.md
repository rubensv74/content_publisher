# AG-002 — Autenticación personal de la V1

- Estado: Proposed
- Fecha: 2026-08-08
- Gate: requiere aprobación antes de implementar acceso y persistencia protegida

## Por qué aparece esta decisión ahora

La V1 será una aplicación privada de uso personal. Antes de conectar la interfaz con Supabase necesitamos decidir cómo se protege el acceso, porque esta elección afecta sesiones, rutas, permisos y políticas de datos.

## Opción A — Supabase Auth con email + contraseña, sin registro público

### Cómo funcionaría

- Se crea un único usuario autorizado en Supabase.
- El acceso se realiza con email y contraseña.
- El registro público queda desactivado.
- La sesión se mantiene mediante el soporte de Supabase para Next.js.
- Las tablas de usuario se protegen mediante Row Level Security (RLS).

### Ventajas

- Muy simple para una aplicación personal.
- No depende de Google, GitHub u otro proveedor de identidad.
- No necesita enviar un correo en cada inicio de sesión.
- Aprovecha la misma plataforma ya elegida para datos y almacenamiento.
- Deja abierta una evolución posterior a varios usuarios si algún día fuera necesaria.

### Inconvenientes

- Hay que gestionar una contraseña.
- El flujo de recuperación de contraseña utiliza email.

## Opción B — Supabase Auth mediante enlace de acceso por email

En lugar de contraseña, Supabase envía un enlace o código al correo para iniciar sesión.

### Ventajas

- No hay contraseña que recordar.
- Flujo sencillo para un único usuario.

### Inconvenientes

- Dependemos del envío de email cada vez que haya que iniciar sesión.
- Para producción es recomendable configurar un servicio SMTP propio; el servicio de correo incluido por Supabase está pensado principalmente para pruebas y tiene límites bajos.
- Añade una dependencia operativa que no aporta demasiado valor en una aplicación personal.

## Opción C — Inicio de sesión con GitHub mediante Supabase Auth

### Ventajas

- Acceso cómodo con una cuenta ya existente.
- No hay contraseña específica de Content Publisher.

### Inconvenientes

- Añade configuración OAuth y dependencia de GitHub para acceder al producto.
- No aporta una ventaja clara para la V1 frente al email y contraseña.

## Recomendación

**Opción A: Supabase Auth con email + contraseña y registro público desactivado.**

Es la opción más sencilla y estable para una aplicación personal. No necesitamos construir registro, gestión de usuarios ni recuperación avanzada en la V1.

La configuración prevista sería:

```text
Content Publisher
       │
       ▼
Supabase Auth
email + password
       │
       ├── 1 usuario existente
       ├── registro público desactivado
       └── sesión protegida
              │
              ▼
       PostgreSQL + Storage
           protegidos por RLS
```

## Regla propuesta

La protección no se limitará a ocultar pantallas. Los datos y recursos deberán tener políticas de acceso en Supabase para que un cliente no autenticado no pueda leerlos aunque conozca una URL o endpoint.

## Fuentes revisadas

- Supabase — Password-based Auth: https://supabase.com/docs/guides/auth/passwords
- Supabase — General Auth configuration: https://supabase.com/docs/guides/auth/general-configuration
- Supabase — Auth con Next.js: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase — Server-Side Rendering: https://supabase.com/docs/guides/auth/server-side
- Supabase — Auth y Row Level Security: https://supabase.com/docs/guides/auth

## Decisión pendiente

Aprobar una opción antes de implementar autenticación o crear políticas de acceso sobre los datos.
