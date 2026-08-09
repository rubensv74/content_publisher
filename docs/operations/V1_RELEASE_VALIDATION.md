# Validación de Release Candidate V1

Fecha: 2026-08-09

## Objetivo

Cerrar Content Publisher V1 mediante uso real del producto, no mediante nuevas decisiones teóricas.

La validación debe demostrar que el recorrido principal funciona de extremo a extremo:

```text
Fuente real
  ↓
Suggestion Engine asistido con ChatGPT Plus
  ↓
Suggestion
  ↓
Idea
  ↓
Publication
  ↓
Story + diseño
  ↓
Render final
  ↓
Buffer Draft
  ↓
Historial y reconciliación
```

La publicación pública en LinkedIn no forma parte de una validación automática y requiere siempre autorización humana explícita.

---

## RC-01 — Flujo ChatGPT Plus

### Preparación

1. Abrir `/suggestions`.
2. Pulsar **Descargar paquete para ChatGPT**.
3. Confirmar que se descarga un `.txt`.
4. Abrir el archivo y comprobar que contiene `CONTENT PUBLISHER — PAQUETE PARA CHATGPT PLUS`.
5. Confirmar que incluye al menos una señal.
6. Si aparece una advertencia de GitHub, registrarla como incidencia de configuración, no como fallo del contrato manual.

### Procesado en ChatGPT Plus

1. Adjuntar el TXT a una conversación de ChatGPT Plus.
2. Indicar que siga exactamente las instrucciones del paquete.
3. Verificar que la respuesta contiene únicamente el objeto JSON requerido.
4. Confirmar que cada propuesta referencia uno o más `sourceSignalIds` incluidos en el paquete.
5. Guardar opcionalmente la respuesta como `.json` o `.txt`.

### Importación

Validar ambas rutas disponibles:

- pegar directamente el JSON;
- seleccionar un archivo `.json` o `.txt`.

La aplicación debe:

- aceptar hasta 256 KB;
- rechazar extensiones/tipos no admitidos;
- rechazar JSON inválido;
- rechazar IDs de señales inexistentes;
- rechazar enums, arquetipos o confianza fuera del contrato;
- mostrar un mensaje visible de error sin abandonar la pantalla;
- mostrar el número de propuestas importadas cuando la respuesta es válida.

### Ciclo de revisión

1. Aceptar una Suggestion.
2. Verificar estado `Aceptada`.
3. Convertirla en Idea.
4. Verificar que aparece en `/ideas`.
5. Comprobar que la Idea conserva oportunidad, rationale y recomendación inicial.
6. Descartar otra Suggestion y comprobar que queda registrada como descartada.

**RC-01 PASS** cuando una Suggestion real completa `ChatGPT → importación → aceptación → Idea` sin modificación manual de base de datos.

---

## RC-02 — Calidad de las fuentes

Validar que el paquete puede contener señales procedentes de:

- Ideas locales;
- historial editorial cuando existan publicaciones elegibles;
- repositorios GitHub incluidos en la allowlist;
- Knowledge Base configurada.

Para GitHub/Knowledge Base comprobar:

- mensaje del commit;
- rutas de archivos modificados;
- estadísticas agregadas;
- pequeños fragmentos Markdown cuando proceda;
- ausencia de código fuente bruto por defecto;
- ausencia de `.env`, secretos, tokens o claves privadas.

**RC-02 PASS** cuando las Suggestions pueden justificarse con hechos reales y no dependen únicamente del título de un commit trivial.

---

## RC-03 — Ciclo editorial completo

Tomar una Idea creada desde Suggestion Engine y completar:

```text
Idea
 ↓
Publication
 ↓
Story
 ↓
Format
 ↓
Design
 ↓
Preview
 ↓
Render final
 ↓
Buffer Draft
```

Validar:

- título y contenido editorial;
- story estructurada;
- selección de arquetipo/variante;
- requisitos de assets y `visual_config`;
- preview;
- PNG/PDF según formato;
- prevención de renders obsoletos;
- caption;
- confirmación antes de enviar a Buffer;
- creación de `publishing_job`;
- draft real en Buffer;
- historial visible.

No utilizar `Publicar ahora` para esta prueba salvo autorización humana explícita.

**RC-03 PASS** cuando una Idea generada desde una señal termina en un Draft real de Buffer con trazabilidad completa.

---

## RC-04 — Reconciliación Buffer

Para trabajos no terminales:

1. abrir `/history`;
2. comprobar reconciliación bajo demanda;
3. usar **Actualizar estado** cuando sea necesario;
4. verificar que `sent` remoto pasa a `published` local;
5. verificar que `error` remoto pasa a `failed`;
6. comprobar que `published_at` solo se rellena cuando Buffer confirma `sent`;
7. confirmar que la reconciliación no modifica ni publica el post remoto.

**RC-04 PASS** cuando los estados locales convergen con Buffer sin cron ni efectos remotos de escritura.

---

## RC-05 — QA visual de arquetipos

Revisar los 12 arquetipos V1 más Build Note con contenido real o representativo.

Criterios comunes:

- sin texto cortado;
- sin desbordamientos;
- contraste suficiente;
- jerarquía tipográfica clara;
- marca del autor coherente;
- assets correctamente encuadrados;
- preview y exportación visualmente equivalentes;
- PNG/PDF con dimensiones correctas;
- layouts suficientemente distintos entre sí.

Registrar únicamente defectos observados. No añadir nuevos arquetipos durante el cierre RC salvo corrección imprescindible.

---

## RC-06 — Seguridad y datos

Comprobar:

- autenticación obligatoria;
- RLS por usuario en entidades editoriales;
- assets fuente privados;
- renders publicables en bucket separado;
- secretos únicamente server-side;
- repositorio público sin secretos;
- `GITHUB_SOURCE_TOKEN` fuera de GitHub/Supabase;
- ningún `OPENAI_API_KEY` en runtime;
- contexto profundo de Suggestion Engine no persistido;
- ninguna publicación pública sin confirmación humana.

---

## RC-07 — Calidad técnica

Cada corrección del Release Candidate debe superar:

```text
npm run check
npm run build
```

y el workflow `Quality` de GitHub Actions.

Un rechazo de deployment por `build-rate-limit` de Vercel se registra como incidencia operativa independiente si GitHub Quality permanece verde.

---

## Criterio de salida V1.0

V1 puede etiquetarse `v1.0.0` cuando:

- RC-01 PASS;
- RC-02 PASS;
- RC-03 PASS;
- RC-04 PASS o no aplicable de forma justificada durante la ventana de prueba;
- RC-05 sin defectos críticos/altos abiertos;
- RC-06 PASS;
- RC-07 PASS;
- documentación operativa actualizada;
- no existe ningún gate de arquitectura abierto.

## Estado inicial

| Validación | Estado |
|---|---|
| RC-01 ChatGPT Plus | Pendiente de prueba humana |
| RC-02 Fuentes | Pendiente de prueba humana |
| RC-03 Ciclo editorial | Pendiente de prueba humana |
| RC-04 Reconciliación Buffer | Pendiente / según trabajo disponible |
| RC-05 QA visual | Pendiente |
| RC-06 Seguridad | Parcialmente validada por diseño/auditoría |
| RC-07 Calidad técnica | Activa en CI |

La siguiente comprobación manual obligatoria es **RC-01**.