# Configuración operativa — OpenAI para Suggestion Engine

Fecha: 2026-08-09

## Objetivo

Configurar las llamadas server-side de Suggestion Engine sin exponer secretos y sin fijar en código un modelo concreto.

Esta guía deriva de `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md` y de la cadencia bajo demanda definida en `ADR-018_SUGGESTION_GENERATION_ON_DEMAND.md`.

## Variables necesarias

```text
OPENAI_API_KEY
OPENAI_SUGGESTION_MODEL
```

Ninguna debe utilizar el prefijo `NEXT_PUBLIC_`.

## 1. Preparar la cuenta API

La API de OpenAI se gestiona separadamente de ChatGPT. Antes de activar Suggestion Engine hay que disponer de un proyecto/cuenta API con facturación o saldo habilitado y un límite de gasto prudente.

Documentación oficial:

- https://platform.openai.com/docs/quickstart
- https://platform.openai.com/docs/api-reference/authentication
- https://openai.com/api/pricing/

## 2. Crear una API key

Crear una clave dedicada para Content Publisher desde la plataforma de OpenAI.

Reglas:

- no pegarla en GitHub;
- no guardarla en Supabase;
- no enviarla por chat;
- no incluirla en screenshots;
- si se expone accidentalmente, revocarla y crear otra.

## 3. Configurar Vercel

En el proyecto `content-publisher`:

1. abrir **Settings → Environment Variables**;
2. crear `OPENAI_API_KEY`;
3. marcarla como **Sensitive**;
4. limitarla al entorno que corresponda, empezando por Production cuando se vaya a validar;
5. crear `OPENAI_SUGGESTION_MODEL` con el nombre del modelo elegido para esta función;
6. desplegar una versión nueva para que las variables entren en vigor.

El modelo se mantiene fuera del código para poder cambiar coste/calidad sin modificar arquitectura.

## 4. Cadencia V1

Suggestion Engine no se ejecuta automáticamente.

```text
Generar sugerencias
      ↓
refresco de fuentes
      ↓
prefiltro
      ↓
hasta 6 señales enriquecidas
      ↓
OpenAI
      ↓
hasta 5 Suggestions
```

No existen cron jobs ni webhooks de generación. Cada consumo de OpenAI requiere una acción explícita en la interfaz.

## 5. Política de llamadas

Protecciones activas:

- hasta 20 señales ligeras por ejecución;
- hasta 6 señales enriquecidas;
- no se envían repositorios completos;
- contexto profundo limitado y efímero;
- código fuente bruto no enviado por defecto;
- rutas sensibles excluidas;
- redacción defensiva de patrones de credenciales;
- Responses API con Structured Outputs;
- request con `store: false`;
- respuesta validada contra IDs de señales realmente enviadas;
- hasta 5 propuestas por ejecución.

Sobre `store: false` y controles de datos:

https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

## 6. Validación prevista

Cuando las variables estén configuradas:

1. abrir `/suggestions`;
2. comprobar que Motor IA aparece como `Configurado`;
3. pulsar `Generar sugerencias` una sola vez;
4. verificar el resumen de señales refrescadas, analizadas y propuestas generadas;
5. comprobar que las Suggestions no inventan hechos;
6. comprobar que cada propuesta referencia señales existentes;
7. aceptar una propuesta;
8. convertirla en Idea y comprobar la trazabilidad;
9. descartar otra y verificar que conserva su estado;
10. revisar el uso/coste en la plataforma de OpenAI.

La política de telemetría histórica dentro de Content Publisher está pendiente de AG-016.

## 7. Rotación

La clave debe poder rotarse sin cambios de código:

1. crear nueva API key;
2. sustituir `OPENAI_API_KEY` en Vercel;
3. desplegar;
4. validar Suggestion Engine;
5. revocar la clave anterior.

No documentar nunca el valor de la clave; solo su fecha de creación/rotación si se necesita trazabilidad operativa.

## Estado actual

La integración de código, persistencia, revisión humana, contexto efímero y ejecución bajo demanda están implementadas. Las llamadas reales permanecen inactivas mientras no existan `OPENAI_API_KEY` y `OPENAI_SUGGESTION_MODEL` en el entorno del servidor.
