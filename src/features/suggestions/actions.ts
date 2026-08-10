"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { persistChatGPTSuggestionResponse } from "./manual";
import type { SuggestionPriority } from "./types";

const MAX_CHATGPT_IMPORT_BYTES = 256 * 1024;

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string" || !userId) redirect("/login");
  return { supabase, userId };
}

function requireSuggestionId(formData: FormData) {
  const suggestionId = formData.get("suggestionId");
  if (typeof suggestionId !== "string" || !suggestionId) {
    throw new Error("Falta el identificador de la sugerencia.");
  }
  return suggestionId;
}

function ideaPriority(priority: SuggestionPriority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

async function readChatGPTImport(formData: FormData) {
  const pasted = formData.get("suggestionsJson");
  if (typeof pasted === "string" && pasted.trim()) {
    if (Buffer.byteLength(pasted, "utf8") > MAX_CHATGPT_IMPORT_BYTES) {
      throw new Error("La respuesta pegada supera el tamaño máximo permitido.");
    }
    return pasted;
  }

  const file = formData.get("suggestionsFile");
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

export async function importChatGPTSuggestionsAction(formData: FormData) {
  let imported = 0;

  try {
    const raw = await readChatGPTImport(formData);
    const result = await persistChatGPTSuggestionResponse(raw);
    imported = result.imported;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo importar la respuesta de ChatGPT.";
    const params = new URLSearchParams({ importError: message.slice(0, 240) });
    redirect(`/suggestions?${params.toString()}`);
  }

  revalidatePath("/suggestions");
  revalidatePath("/signals");
  redirect(`/suggestions?imported=${imported}`);
}

export async function acceptSuggestionAction(formData: FormData) {
  const suggestionId = requireSuggestionId(formData);
  const { supabase, userId } = await getAuthenticatedUser();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("suggestions")
    .update({ status: "accepted", accepted_at: now, dismissed_at: null })
    .eq("id", suggestionId)
    .eq("user_id", userId)
    .eq("status", "new");
  if (error) throw new Error(`No se pudo aceptar la sugerencia: ${error.message}`);
  revalidatePath("/suggestions");
}

export async function dismissSuggestionAction(formData: FormData) {
  const suggestionId = requireSuggestionId(formData);
  const { supabase, userId } = await getAuthenticatedUser();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("suggestions")
    .update({ status: "dismissed", dismissed_at: now })
    .eq("id", suggestionId)
    .eq("user_id", userId)
    .in("status", ["new", "accepted"]);
  if (error) throw new Error(`No se pudo descartar la sugerencia: ${error.message}`);
  revalidatePath("/suggestions");
}

export async function convertSuggestionToIdeaAction(formData: FormData) {
  const suggestionId = requireSuggestionId(formData);
  const { supabase, userId } = await getAuthenticatedUser();
  const { data: suggestion, error: suggestionError } = await supabase
    .from("suggestions")
    .select(
      "id,title,topic,opportunity,rationale,story_type,story_draft,format,design_family,archetype_key,priority,status",
    )
    .eq("id", suggestionId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  if (suggestionError) {
    throw new Error(`No se pudo cargar la sugerencia: ${suggestionError.message}`);
  }
  if (!suggestion) {
    throw new Error("La sugerencia debe estar aceptada antes de convertirla en Idea.");
  }

  const notes = [
    suggestion.opportunity,
    "",
    `Por qué puede aportar valor: ${suggestion.rationale}`,
    "",
    `Recomendación inicial: ${suggestion.story_type} · ${suggestion.format} · ${suggestion.design_family} · ${suggestion.archetype_key}`,
  ].join("\n");
  const topic =
    typeof suggestion.topic === "string" && suggestion.topic.trim()
      ? suggestion.topic.trim()
      : null;
  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .insert({
      user_id: userId,
      title: suggestion.title,
      topic,
      notes,
      source_type: "suggestion-engine",
      source_ref: suggestion.id,
      priority: ideaPriority(suggestion.priority as SuggestionPriority),
      status: "idea",
    })
    .select("id")
    .single();
  if (ideaError || !idea) {
    throw new Error(
      `No se pudo crear la Idea: ${ideaError?.message ?? "respuesta vacía"}`,
    );
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("suggestions")
    .update({
      status: "converted",
      converted_at: now,
      converted_idea_id: idea.id,
    })
    .eq("id", suggestionId)
    .eq("user_id", userId)
    .eq("status", "accepted");
  if (updateError) {
    await supabase.from("ideas").delete().eq("id", idea.id).eq("user_id", userId);
    throw new Error(`No se pudo cerrar la conversión: ${updateError.message}`);
  }
  revalidatePath("/suggestions");
  revalidatePath("/ideas");
}
