# Validación de producción — 2026-08-09

## Resultado

Se ha validado correctamente el recorrido operativo básico de Content Publisher en producción hasta el descubrimiento del canal de LinkedIn:

`Vercel → Next.js → Supabase Auth/RLS → Buffer API → LinkedIn channel discovery`

## Validaciones completadas

- El proyecto `content-publisher` está desplegado en Vercel en Production.
- El login privado contra Supabase Auth funciona en producción.
- La sesión autenticada puede consultar datos protegidos por RLS.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` están configuradas en Vercel.
- `BUFFER_API_KEY` está configurada como secreto server-side en Vercel.
- Content Publisher autentica correctamente contra Buffer.
- Buffer devuelve una cuenta y una organización válidas.
- El perfil personal de LinkedIn está conectado en Buffer.
- Content Publisher descubre 1 canal LinkedIn y lo muestra como `Disponible`.

## Estado actual del canal

- Servicio: LinkedIn.
- Tipo: perfil personal conectado mediante Buffer.
- Estado en Content Publisher: disponible.

## Seguridad

- La API key de Buffer no se almacena en PostgreSQL ni en GitHub.
- La clave se mantiene en Vercel como variable privada de servidor.
- El navegador solo recibe el estado normalizado de la conexión y los canales descubiertos.

## Próxima validación

La siguiente prueba debe ser no pública y reversible:

1. crear una Idea de prueba;
2. convertirla en Publication;
3. completar Story, Format y Design;
4. generar un render final real;
5. enviar la Publication a Buffer como **draft**, no como publicación inmediata;
6. comprobar `publishing_jobs` e Historial;
7. revisar el draft directamente en Buffer.

No debe realizarse una publicación pública real hasta que el flujo de draft haya quedado validado de extremo a extremo.
