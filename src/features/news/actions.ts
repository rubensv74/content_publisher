"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { defaultOpportunityEvaluation } from "@/features/opportunities/scoring";

import { getNewsAuthContext } from "./data";
import { persistChatGPTNewsResponse } from "./manual";
import { newsStatuses, type NewsStatus } from "./types";

const MAX_CHATGPT_IMPORT_BYTES = 256 * 1024;

function requireNewsId(formData: FormData) {
  const newsId = formData.get("newsId");
  if (typeof newsId !== "string" || !newsId) {
    throw new Error("Falta el identificador de la noticia.");
  }
  return newsId;
}

async function readChatGPTImport(formData: FormData) {
  const pasted = formData.get("newsJson");
  if (typeof pasted === "string" && pasted.trim()) {
    if (Buffer.byteLength(pasted, "utf8") > MAX_CHATGPT_IMPORT_BYTES) {
      throw new Error("La respuesta pegada supera el tamaño máximo permitido.");
    }
    return pasted;
  }

  const file = formData.get("newsFile");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Pega el JSON devuelto por ChatGPT o selecciona un archivo JSON/TXT.");
  }
  if (file.size > MAX_CHATGPT_IMPORT_BYTES) {
    throw new Error("El archivo supera el tamaño máximo permitido de 256 KB.");
  }

  const extensionAllowed = /\.(?:json|txt)$/i.test(file.name);
  const mimeAllowed =
    file.type === "" || file.type === "application/json" || file.type === "text/plain";
  if (!extensionAllowed || !mimeAllowed) {
    throw new Error("Selecciona únicamente un archivo .json o .txt con la respuesta de ChatGPT.");
  }

  return file.text();
}

export async function importChatGPTNewsAction(formData: FormData) {
  try {
    const raw = await readChatGPTImport(formData);
    const result = await persistChatGPTNewsResponse(raw);
    const params = new URLSearchParams({
      imported: String(result.imported),
      persisted: String(result.persisted),
      skipped: String(result.skipped),
    });
    revalidatePath("/news");
    revalidatePath("/signals");
    redirect(`/news?${params.toString()}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo importar la curación de noticias.";
    const params = new URLSearchParams({ importError: message.slice(0, 240) });
    redirect(`/news?${params.toString()}`);
  }
}

export async function updateNewsStatusAction(formData: FormData) {
  const newsId = requireNewsId(formData);
  const statusValue = formData.get("status");
  if (
    typeof statusValue !== "string" ||
    !newsStatuses.includes(statusValue as NewsStatus) ||
    statusValue === "converted"
  ) {
    throw new Error("El estado solicitado no es válido.");
  }

  const { supabase, userId } = await getNewsAuthContext();
  const { error } = await supabase
    .from("news_items")
    .update({ status: statusValue })
    .eq("id", newsId)
    .eq("user_id", userId)
    .neq("status", "converted");

  if (error) {
    throw new Error(`No se pudo actualizar la noticia: ${error.message}`);
  }
  revalidatePath("/news");
}

export async function convertNewsToOpportunityAction(formData: FormData) {
  const newsId = requireNewsId(formData);
  const { supabase, userId } = await getNewsAuthContext();

  const { data: news, error: newsError } = await supabase
    .from("news_items")
    .select("id,title,summary,relevance_reason,relevance_score,status,converted_opportunity_id")
    .eq("id", newsId)
    .eq("user_id", userId)
    .maybeSingle();

  if (newsError) {
    throw new Error(`No se pudo cargar la noticia: ${newsError.message}`);
  }
  if (!news) {
    throw new Error("La noticia no existe.");
  }
  if (news.status === "converted" || news.converted_opportunity_id) {
    revalidatePath("/news");
    return;
  }

  const { data: linkData, error: linkError } = await supabase
    .from("news_item_source_signals")
    .select("source_signal_id")
    .eq("news_item_id", newsId)
    .eq("user_id", userId);

  if (linkError) {
    throw new Error(`No se pudo cargar la trazabilidad de la noticia: ${linkError.message}`);
  }
  const signalIds = (linkData ?? [])
    .map((row) => row.source_signal_id as string)
    .filter(Boolean);
  if (signalIds.length === 0) {
    throw new Error("La noticia no conserva ninguna fuente original vinculada.");
  }

  const professionalRelevance = Math.max(
    1,
    Math.min(5, Number(news.relevance_score) || defaultOpportunityEvaluation.professionalRelevance),
  );
  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .insert({
      user_id: userId,
      title: news.title,
      summary: news.summary,
      relevance_reason: news.relevance_reason,
      professional_relevance: professionalRelevance,
      actionability: defaultOpportunityEvaluation.actionability,
      learning_potential: defaultOpportunityEvaluation.learningPotential,
      project_potential: defaultOpportunityEvaluation.projectPotential,
      case_study_potential: defaultOpportunityEvaluation.caseStudyPotential,
      editorial_potential: defaultOpportunityEvaluation.editorialPotential,
      novelty: defaultOpportunityEvaluation.novelty,
      effort: defaultOpportunityEvaluation.effort,
      status: "new",
    })
    .select("id")
    .single();

  if (opportunityError || !opportunity) {
    throw new Error(`No se pudo crear la oportunidad: ${opportunityError?.message ?? "respuesta vacía"}`);
  }

  const opportunityLinks = signalIds.map((sourceSignalId) => ({
    opportunity_id: opportunity.id,
    source_signal_id: sourceSignalId,
    user_id: userId,
  }));
  const { error: opportunityLinkError } = await supabase
    .from("opportunity_source_signals")
    .insert(opportunityLinks);

  if (opportunityLinkError) {
    await supabase.from("opportunities").delete().eq("id", opportunity.id).eq("user_id", userId);
    throw new Error(`No se pudo conservar la trazabilidad de la oportunidad: ${opportunityLinkError.message}`);
  }

  const { error: updateError } = await supabase
    .from("news_items")
    .update({ status: "converted", converted_opportunity_id: opportunity.id })
    .eq("id", newsId)
    .eq("user_id", userId)
    .is("converted_opportunity_id", null);

  if (updateError) {
    await supabase
      .from("opportunity_source_signals")
      .delete()
      .eq("opportunity_id", opportunity.id)
      .eq("user_id", userId);
    await supabase.from("opportunities").delete().eq("id", opportunity.id).eq("user_id", userId);
    throw new Error(`No se pudo cerrar la conversión: ${updateError.message}`);
  }

  revalidatePath("/news");
  revalidatePath("/opportunities");
}
