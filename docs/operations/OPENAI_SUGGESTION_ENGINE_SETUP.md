# Configuración operativa — OpenAI para Suggestion Engine

Fecha: 2026-08-09

## Objetivo

Configurar las llamadas server-side de Suggestion Engine sin exponer secretos y sin fijar en código un modelo concreto.

Esta guía deriva de `ADR-015_SUGGESTION_ENGINE_OPENAI_ADAPTER.md`.

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
```

Además:

- solo se envían campos normalizados de las señales;
- no se envía `metadata` arbitraria en la primera implementación;
- no se envían repositorios completos;
- se usa Responses API con Structured Outputs;
- el request utiliza `store: false`;
- la respuesta se valida contra IDs de señales realmente enviados.

Sobre `store: false` y controles de datos:

https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

## 5. Validación prevista

Cuando AG-013 defina cómo persistir Suggestions y la UI esté implementada:

1. comprobar que la aplicación detecta configuración OpenAI;
2. seleccionar un conjunto pequeño de señales reales;
3. generar propuestas;
4. comprobar que no inventan datos;
5. comprobar que cada propuesta referencia señales existentes;
6. revisar coste/uso de tokens;
7. aceptar una propuesta y verificar el flujo hasta Idea;
8. descartar otra y verificar que no reaparece como duplicado inmediato.

## 6. Rotación

La clave debe poder rotarse sin cambios de código:

1. crear nueva API key;
2. sustituir `OPENAI_API_KEY` en Vercel;
3. desplegar;
4. validar Suggestion Engine;
5. revocar la clave anterior.

No documentar nunca el valor de la clave; solo su fecha de creación/rotación si se necesita trazabilidad operativa.

## Estado actual

La integración de código está preparada, pero las llamadas reales permanecen inactivas mientras no se configuren las variables anteriores y no se cierre el gate de persistencia de Suggestions.
