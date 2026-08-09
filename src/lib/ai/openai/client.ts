const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type OpenAIOutputContent = {
  type?: string;
  text?: string;
  refusal?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIOutputContent[];
};

type OpenAIResponsesPayload = {
  id?: string;
  model?: string;
  status?: string;
  output?: OpenAIOutputItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export class OpenAIResponsesError extends Error {
  readonly code:
    | "not-configured"
    | "unauthorized"
    | "network"
    | "provider"
    | "invalid-output";
  readonly status?: number;

  constructor(
    message: string,
    code: OpenAIResponsesError["code"],
    status?: number,
  ) {
    super(message);
    this.name = "OpenAIResponsesError";
    this.code = code;
    this.status = status;
  }
}

function getApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new OpenAIResponsesError(
      "OpenAI no está configurado en el entorno del servidor.",
      "not-configured",
    );
  }

  return apiKey;
}

export function getOpenAISuggestionModelName() {
  const model = process.env.OPENAI_SUGGESTION_MODEL?.trim();

  if (!model) {
    throw new OpenAIResponsesError(
      "Falta OPENAI_SUGGESTION_MODEL en el entorno del servidor.",
      "not-configured",
    );
  }

  return model;
}

export function isOpenAISuggestionConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY?.trim() &&
      process.env.OPENAI_SUGGESTION_MODEL?.trim(),
  );
}

function extractOutputText(payload: OpenAIResponsesPayload) {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }

      if (content.type === "refusal" && content.refusal) {
        throw new OpenAIResponsesError(
          "OpenAI rechazó generar la respuesta solicitada.",
          "provider",
        );
      }
    }
  }

  throw new OpenAIResponsesError(
    "OpenAI devolvió una respuesta sin contenido estructurado utilizable.",
    "invalid-output",
  );
}

export async function createOpenAIStructuredResponse(args: {
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
}) {
  const apiKey = getApiKey();
  const model = getOpenAISuggestionModelName();
  let response: Response;

  try {
    response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        instructions: args.instructions,
        input: args.input,
        text: {
          format: {
            type: "json_schema",
            name: args.schemaName,
            schema: args.schema,
            strict: true,
          },
        },
      }),
      cache: "no-store",
    });
  } catch {
    throw new OpenAIResponsesError(
      "No se pudo conectar con OpenAI.",
      "network",
    );
  }

  if (response.status === 401) {
    throw new OpenAIResponsesError(
      "La API key de OpenAI no es válida o ha sido revocada.",
      "unauthorized",
      response.status,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as OpenAIResponsesPayload;

  if (!response.ok) {
    throw new OpenAIResponsesError(
      payload.error?.message
        ? `OpenAI respondió con un error: ${payload.error.message}`
        : `OpenAI respondió con HTTP ${response.status}.`,
      "provider",
      response.status,
    );
  }

  if (payload.status && payload.status !== "completed") {
    throw new OpenAIResponsesError(
      `OpenAI no completó la respuesta. Estado: ${payload.status}.`,
      "provider",
      response.status,
    );
  }

  const outputText = extractOutputText(payload);
  let data: unknown;

  try {
    data = JSON.parse(outputText);
  } catch {
    throw new OpenAIResponsesError(
      "OpenAI devolvió una salida que no pudo interpretarse como JSON.",
      "invalid-output",
    );
  }

  return {
    id: payload.id,
    model: payload.model ?? model,
    data,
    usage: payload.usage
      ? {
          inputTokens: payload.usage.input_tokens,
          outputTokens: payload.usage.output_tokens,
          totalTokens: payload.usage.total_tokens,
        }
      : undefined,
  };
}
