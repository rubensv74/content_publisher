# Validación runtime — 2026-08-09

## Alcance

Validación del primer despliegue estable de Content Publisher en Vercel con autenticación real de Supabase.

## Resultado

El recorrido navegador → Vercel → Supabase Auth → workspace protegido funciona correctamente.

Evidencias verificadas:

- la URL de producción carga la pantalla de acceso privado;
- el usuario autorizado inicia sesión correctamente mediante email + contraseña;
- Supabase Auth registra `POST /auth/v1/token` con estado `200`;
- tras el login, la aplicación accede al workspace protegido;
- la carga de Ideas ejecuta `GET /rest/v1/ideas` con estado `200` bajo la sesión autenticada;
- no se ha detectado un error de autenticación ni de acceso RLS en este recorrido.

## Conclusión

Queda validada en producción la cimentación de autenticación y acceso autenticado a datos:

`Browser → Vercel → Next.js → Supabase Auth → RLS → Workspace`.

La siguiente validación runtime es comprobar desde Settings la conexión server-side con Buffer mediante una operación de solo lectura. No se realizará ninguna publicación real durante esta comprobación.
