"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { persistChatGPTOpportunityResponse } from "./manual";

const MAX_CHATGPT_IMPORT_BYTES = 256 * 1024;

async function readChatGPTImport(formData: FormData) {
  const pasted = formData.get("opportunitiesJson");
  if (typeof pasted === "string" && pasted.trim()) {
    if (Buffer.byteLength(pasted, "utf8") > MAX_CHATGPT_IMPORT_BYTES) {
      throw new Error("La respuesta pegada supera el tamaño máximo permitido.");
    }
    return pasted;
  }

  const file = formData.get("opportunitiesFile");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Pega el JSON devuelto por ChatGPT o selecciona un archivo JSON/TXT.");
  }

  if (file.size > MAX_CHATGPT_IMPORT_BYTES) {
    throw new Error("El archivo supera el tamaño máximo permitido de 256 KB.");
  }

  const extensionAllowed = /\.(?:json|txt)$/i.test(file.name);
  const mimeAllowed =
    file.type === "" ||
    file.type === "application/json" ||
    file.type === "text/plain";

  if (!extensionAllowed || !mimeAllowed) {
    throw new Error("Selecciona únicamente un archivo .json o .txt con la respuesta de ChatGPT.");
  }

  return file.text();
}

export async function importChatGPTOpportunitiesAction(formData: FormData) {
  let result: Awaited<ReturnType<typeof persistChatGPTOpportunityResponse>>;

  try {
    const raw = await readChatGPTImport(formData);
    result = await persistChatGPTOpportunityResponse(raw);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo importar la curación de oportunidades.";
    const params = new URLSearchParams({ importError: message.slice(0, 240) });
    redirect(`/opportunities?${params.toString()}`);
  }

  revalidatePath("/opportunities");
  revalidatePath("/signals");
  const params = new URLSearchParams({
    imported: String(result.imported),
    persisted: String(result.persisted),
    skipped: String(result.skipped),
  });
  redirect(`/opportunities?${params.toString()}`);
}
