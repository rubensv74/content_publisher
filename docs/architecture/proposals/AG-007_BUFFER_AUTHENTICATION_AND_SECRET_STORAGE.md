# AG-007 — Autenticación de Buffer y almacenamiento del secreto

- Estado: Propuesta
- Fecha: 2026-08-08
- Gate: abierto

## Por qué aparece esta decisión ahora

Content Publisher ya puede llegar desde una Idea hasta un render final PNG/PDF con URL pública estable.

El siguiente tramo es crear trabajos reales de publicación mediante Buffer. Para hacerlo, las llamadas al API necesitan una credencial Bearer y esa credencial no puede exponerse en el navegador ni almacenarse en GitHub.

Buffer ofrece actualmente dos mecanismos relevantes:

1. una API key personal para automatizaciones sobre la propia cuenta;
2. OAuth 2.0 Authorization Code + PKCE para aplicaciones que actúan en nombre de otros usuarios.

La V1 de Content Publisher es una aplicación privada de un solo usuario, por lo que hay que decidir si utilizamos la credencial personal más simple o construimos desde el principio un flujo OAuth completo.

## Requisitos

La solución debe:

- mantener la credencial fuera del cliente;
- no guardar secretos en GitHub;
- permitir crear y programar publicaciones en la propia cuenta de Buffer;
- ser suficientemente segura para una aplicación personal privada;
- evitar complejidad que solo sería necesaria en un producto multiusuario;
- permitir sustituir la estrategia más adelante sin cambiar el dominio `publishing_jobs`;
- mantener las llamadas específicas de Buffer detrás de la frontera de publicación ya aprobada.

---

## Opción A — API key personal de Buffer en variable de entorno del servidor

### Funcionamiento

Se crea una API key desde Buffer Settings → API y se guarda únicamente como secreto de entorno:

```text
BUFFER_API_KEY=...
```

En desarrollo viviría en `.env.local`, nunca versionado. En Vercel se configuraría como variable protegida del proyecto.

Todas las llamadas a Buffer se ejecutarían desde código de servidor de Next.js. El navegador nunca recibiría la clave.

La pantalla de Settings podría consultar mediante una acción de servidor el estado de la conexión y mostrar cuenta/canales disponibles, pero no tendría que almacenar el secreto en PostgreSQL.

### Ventajas

- es el mecanismo que Buffer recomienda explícitamente para automatizaciones personales;
- encaja exactamente con una aplicación de un único usuario;
- no requiere callbacks OAuth, refresh tokens ni rotación de tokens de acceso;
- no necesita una nueva tabla de secretos;
- no requiere Service Role para leer credenciales;
- es fácil de rotar si la clave se compromete;
- mantiene el secreto fuera de Supabase y fuera del cliente.

### Inconveniente

La conexión no es autoservicio desde la UI: la API key se configura en el entorno de despliegue.

Para V1 esto es aceptable porque la aplicación es personal y privada.

**Recomendación: Opción A.**

---

## Opción B — OAuth 2.0 confidencial con PKCE y refresh tokens

Content Publisher se registraría como cliente OAuth de Buffer. La aplicación redirigiría a Buffer, recibiría un authorization code y almacenaría access/refresh tokens de forma segura en el servidor.

Buffer exige PKCE y, si se solicita `offline_access`, el refresh token debe persistirse y actualizarse cada vez que se usa porque los refresh tokens son de un solo uso.

### Ventajas

- experiencia de “Conectar Buffer” desde la propia UI;
- adecuada si en el futuro Content Publisher se convierte en producto multiusuario;
- permite revocar/autorización por usuario.

### Inconvenientes

- callback OAuth;
- estado CSRF y PKCE;
- almacenamiento cifrado de refresh tokens;
- rotación obligatoria de refresh token;
- mayor superficie de error y seguridad;
- complejidad que V1 no necesita.

**No recomendada para una aplicación personal de un solo usuario.**

---

## Opción C — API key personal almacenada en Supabase/Vault

La API key seguiría siendo personal, pero se almacenaría en una capa de secretos de Supabase en lugar de Vercel.

Es técnicamente posible, pero obligaría a crear una ruta de acceso server-side al secreto y posiblemente introducir credenciales privilegiadas adicionales para una ventaja pequeña en V1.

Puede tener sentido si en el futuro toda la gestión operativa de secretos se centraliza en Supabase, pero ahora añade una dependencia sin necesidad.

**No recomendada para V1.**

---

## Recomendación

**Opción A — API key personal de Buffer almacenada como variable de entorno server-side.**

Arquitectura resultante:

```text
Browser
  │
  ▼
Content Publisher / Server Action
  │
  ├── lee BUFFER_API_KEY en servidor
  │
  ▼
Buffer Adapter
  │
  ▼
https://api.buffer.com
  │
  ▼
LinkedIn
```

La frontera de publicación no expondrá la credencial al resto de módulos. `publishing_jobs` seguirá almacenando estado, IDs externos, errores y referencias a renders, pero nunca el API key.

## Consecuencias si se aprueba

1. añadir `BUFFER_API_KEY` solo a `.env.example` como nombre, nunca como valor;
2. crear `src/lib/publishing/buffer/` con cliente GraphQL server-only;
3. implementar una comprobación de conexión y descubrimiento de organización/canales;
4. mostrar estado de Buffer en Settings;
5. crear el adaptador para publicar ahora, programar y guardar draft;
6. usar siempre el `render_id` y URL pública del render final seleccionado;
7. registrar la respuesta de Buffer en `publishing_jobs` sin almacenar secretos;
8. manejar `401` como credencial inválida/revocada y solicitar actualizar la variable de entorno.

## Evolución futura

Si Content Publisher se convierte en aplicación multiusuario, esta decisión deberá reabrirse y la opción OAuth será la candidata natural. La frontera `Publishing` y el modelo `publishing_jobs` permiten hacerlo sin rediseñar el núcleo editorial.

## Fuentes revisadas

- Buffer API — Authentication: https://developers.buffer.com/guides/authentication.html
- Buffer API — Quick Start: https://developers.buffer.com/guides/getting-started.html
- Buffer API — REST API Migration: https://developers.buffer.com/guides/rest-migration.html

## Decisión pendiente

Si se aprueba la opción A, la decisión se registrará como el siguiente ADR y comenzará la integración real `RENDER READY → PUBLISH`.
