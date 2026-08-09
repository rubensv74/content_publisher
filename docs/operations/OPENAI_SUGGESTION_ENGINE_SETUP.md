# Configuración operativa — OpenAI para Suggestion Engine

Fecha: 2026-08-09

## Objetivo

Configurar las llamadas server-side de Suggestion Engine sin exponer secretos y sin fijar en código un modelo concreto.

Esta guía deriva de `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md` y `ADR-016_SUGGESTION_PERSISTENCE_AND_LIFECYCLE.md`.

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

## 4. Política de llamadas

Suggestion Engine aplica estas protecciones:

```text
source_signals
      ↓
prefiltro
      ↓
máximo 20 señales
      ↓
OpenAI
      ↓
máximo 5 propuestas estructuradas
      ↓
suggestions
      ↓
revisión humana
```

Además:

- solo se envían campos normalizados de las señales;
- no se envía `metadata` arbitraria en la primera implementación;
- no se envían repositorios completos;
- se usa Responses API con Structured Outputs;
- el request utiliza `store: false`;
- la respuesta se valida contra IDs de señales realmente enviados;
- las propuestas quedan persistidas y nunca entran directamente en Ideas.

Sobre `store: false` y controles de datos:

https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

## 5. Validación prevista

La UI de `/suggestions` ya está preparada. Cuando las variables estén configuradas:

1. refrescar las señales disponibles;
2. generar un lote pequeño de propuestas;
3. comprobar que no inventan datos;
4. comprobar que cada propuesta referencia señales existentes;
5. revisar coste/uso en la plataforma API;
6. aceptar una propuesta;
7. convertirla explícitamente en Idea y verificar la trazabilidad;
8. descartar otra y confirmar que permanece registrada como descartada.

## 6. Rotación

La clave debe poder rotarse sin cambios de código:

1. crear nueva API key;
2. sustituir `OPENAI_API_KEY` en Vercel;
3. desplegar;
4. validar Suggestion Engine;
5. revocar la clave anterior.

No documentar nunca el valor de la clave; solo su fecha de creación/rotación si se necesita trazabilidad operativa.

## Estado actual

AG-013 está cerrado y la persistencia/UI de Suggestions está implementada. Las llamadas reales permanecen inactivas únicamente mientras `OPENAI_API_KEY` y `OPENAI_SUGGESTION_MODEL` no estén configuradas en el entorno del servidor.
