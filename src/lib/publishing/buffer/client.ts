const BUFFER_API_URL = "https://api.buffer.com";

type GraphQLErrorItem = {
  message?: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorItem[];
};

export class BufferApiError extends Error {
  readonly status?: number;
  readonly code: "not-configured" | "unauthorized" | "graphql" | "network";

  constructor(
    message: string,
    code: BufferApiError["code"],
    status?: number,
  ) {
    super(message);
    this.name = "BufferApiError";
    this.code = code;
    this.status = status;
  }
}

function getApiKey() {
  const apiKey = process.env.BUFFER_API_KEY?.trim();

  if (!apiKey) {
    throw new BufferApiError(
      "Buffer todavía no está configurado en el entorno del servidor.",
      "not-configured",
    );
  }

  return apiKey;
}

export function isBufferConfigured() {
  return Boolean(process.env.BUFFER_API_KEY?.trim());
}

export async function bufferGraphQL<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const apiKey = getApiKey();
  let response: Response;

  try {
    response = await fetch(BUFFER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
  } catch {
    throw new BufferApiError(
      "No se pudo conectar con Buffer.",
      "network",
    );
  }

  if (response.status === 401) {
    throw new BufferApiError(
      "La API key de Buffer no es válida o ha sido revocada.",
      "unauthorized",
      response.status,
    );
  }

  if (!response.ok) {
    throw new BufferApiError(
      `Buffer respondió con HTTP ${response.status}.`,
      "network",
      response.status,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors?.length) {
    const message = payload.errors
      .map((error) => error.message)
      .filter(Boolean)
      .join(" · ");

    throw new BufferApiError(
      message || "Buffer devolvió un error GraphQL.",
      "graphql",
    );
  }

  if (!payload.data) {
    throw new BufferApiError(
      "Buffer devolvió una respuesta sin datos.",
      "graphql",
    );
  }

  return payload.data;
}
