"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  allowedOpportunityTransitions,
  defaultOpportunityEvaluation,
  technologyOpportunityEvaluation,
} from "./scoring";
import {
  opportunityStatuses,
  type OpportunityEvaluation,
  type OpportunityResearchWorkspace,
  type OpportunityStatus,
} from "./types";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string" || !userId) redirect("/login");
  return { supabase, userId };
}

function requireString(formData: FormData, key: string, label: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Falta ${label}.`);
  }
  return value.trim();
}

function optionalText(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function score(formData: FormData, key: string) {
  const raw = formData.get(key);
  const value = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`La dimensión ${key} debe estar entre 1 y 5.`);
  }
  return value;
}

function readEvaluation(formData: FormData): OpportunityEvaluation {
  return {
    professionalRelevance: score(formData, "professionalRelevance"),
    actionability: score(formData, "actionability"),
    learningPotential: score(formData, "learningPotential"),
    projectPotential: score(formData, "projectPotential"),
    caseStudyPotential: score(formData, "caseStudyPotential"),
    editorialPotential: score(formData, "editorialPotential"),
    novelty: score(formData, "novelty"),
    effort: score(formData, "effort"),
  };
}

function readResearchWorkspace(formData: FormData): OpportunityResearchWorkspace {
  return {
    version: 1,
    objective: optionalText(formData, "researchObjective", 2400),
    questions: optionalText(formData, "researchQuestions", 4000),
    validationPlan: optionalText(formData, "researchValidationPlan", 4000),
    evidence: optionalText(formData, "researchEvidence", 6000),
    findings: optionalText(formData, "researchFindings", 6000),
    conclusion: optionalText(formData, "researchConclusion", 4000),
    nextStep: optionalText(formData, "researchNextStep", 2400),
  };
}

export async function createOpportunityFromSignalAction(formData: FormData) {
  const signalId = requireString(formData, "signalId", "la señal");
  const { supabase, userId } = await getAuthenticatedUser();
  const { data: signal, error: signalError } = await supabase
    .from("source_signals")
    .select("id,source_type,source_locator,title,summary")
    .eq("id", signalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (signalError) {
    throw new Error(`No se pudo cargar la señal: ${signalError.message}`);
  }
  if (!signal) {
    throw new Error("La señal no existe o no pertenece al usuario autenticado.");
  }

  const evaluation =
    signal.source_type === "technology"
      ? technologyOpportunityEvaluation
      : defaultOpportunityEvaluation;

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .insert({
      user_id: userId,
      title: signal.title,
      summary: signal.summary,
      relevance_reason:
        signal.source_type === "technology"
          ? `Novedad tecnológica detectada en ${signal.source_locator}. Pendiente de revisión humana para confirmar su aplicación profesional.`
          : `Señal detectada en ${signal.source_locator}. Pendiente de revisión humana para confirmar su aplicación profesional.`,
      professional_relevance: evaluation.professionalRelevance,
      actionability: evaluation.actionability,
      learning_potential: evaluation.learningPotential,
      project_potential: evaluation.projectPotential,
      case_study_potential: evaluation.caseStudyPotential,
      editorial_potential: evaluation.editorialPotential,
      novelty: evaluation.novelty,
      effort: evaluation.effort,
    })
    .select("id")
    .single();

  if (opportunityError || !opportunity) {
    throw new Error(
      `No se pudo crear la oportunidad: ${opportunityError?.message ?? "respuesta vacía"}`,
    );
  }

  const { error: linkError } = await supabase.from("opportunity_source_signals").insert({
    opportunity_id: opportunity.id,
    source_signal_id: signal.id,
    user_id: userId,
  });

  if (linkError) {
    await supabase
      .from("opportunities")
      .delete()
      .eq("id", opportunity.id)
      .eq("user_id", userId);
    throw new Error(`No se pudo vincular la señal: ${linkError.message}`);
  }

  revalidatePath("/signals");
  revalidatePath("/opportunities");
  redirect("/opportunities?created=1");
}

export async function attachSignalToOpportunityAction(formData: FormData) {
  const opportunityId = requireString(formData, "opportunityId", "la oportunidad");
  const signalId = requireString(formData, "signalId", "la señal");
  const { supabase, userId } = await getAuthenticatedUser();

  const { error } = await supabase.from("opportunity_source_signals").upsert(
    {
      opportunity_id: opportunityId,
      source_signal_id: signalId,
      user_id: userId,
    },
    { onConflict: "opportunity_id,source_signal_id", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`No se pudo vincular la señal: ${error.message}`);
  }

  revalidatePath("/signals");
  revalidatePath("/opportunities");
}

export async function updateOpportunityEvaluationAction(formData: FormData) {
  const opportunityId = requireString(formData, "opportunityId", "la oportunidad");
  const evaluation = readEvaluation(formData);
  const relevanceReason = optionalText(formData, "relevanceReason", 1200);
  const researchNotes = optionalText(formData, "researchNotes", 6000);
  const { supabase, userId } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("opportunities")
    .update({
      relevance_reason: relevanceReason,
      research_notes: researchNotes,
      professional_relevance: evaluation.professionalRelevance,
      actionability: evaluation.actionability,
      learning_potential: evaluation.learningPotential,
      project_potential: evaluation.projectPotential,
      case_study_potential: evaluation.caseStudyPotential,
      editorial_potential: evaluation.editorialPotential,
      novelty: evaluation.novelty,
      effort: evaluation.effort,
    })
    .eq("id", opportunityId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo actualizar la evaluación: ${error.message}`);
  }

  revalidatePath("/opportunities");
}

export async function updateOpportunityResearchAction(formData: FormData) {
  const opportunityId = requireString(formData, "opportunityId", "la oportunidad");
  const researchWorkspace = readResearchWorkspace(formData);
  const researchNotes = optionalText(formData, "researchNotes", 6000);
  const { supabase, userId } = await getAuthenticatedUser();

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("status")
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (opportunityError) {
    throw new Error(`No se pudo cargar la oportunidad: ${opportunityError.message}`);
  }
  if (!opportunity) {
    throw new Error("La oportunidad no existe.");
  }

  const status = opportunity.status as OpportunityStatus;
  if (!["researching", "project_candidate", "active", "case_study"].includes(status)) {
    throw new Error("Activa el estado Investigando antes de guardar un workspace de investigación.");
  }

  const { error } = await supabase
    .from("opportunities")
    .update({
      research_workspace: researchWorkspace,
      research_notes: researchNotes,
    })
    .eq("id", opportunityId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo guardar la investigación: ${error.message}`);
  }

  revalidatePath("/opportunities");
}

export async function updateOpportunityStatusAction(formData: FormData) {
  const opportunityId = requireString(formData, "opportunityId", "la oportunidad");
  const requestedStatus = requireString(formData, "status", "el nuevo estado");

  if (!opportunityStatuses.includes(requestedStatus as OpportunityStatus)) {
    throw new Error("El estado solicitado no es válido.");
  }

  const nextStatus = requestedStatus as OpportunityStatus;
  const { supabase, userId } = await getAuthenticatedUser();
  const { data: current, error: currentError } = await supabase
    .from("opportunities")
    .select("status")
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (currentError) {
    throw new Error(`No se pudo leer la oportunidad: ${currentError.message}`);
  }
  if (!current) {
    throw new Error("La oportunidad no existe.");
  }

  const currentStatus = current.status as OpportunityStatus;
  if (!allowedOpportunityTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`No se permite pasar de ${currentStatus} a ${nextStatus}.`);
  }

  const dismissalReason =
    nextStatus === "dismissed" ? optionalText(formData, "dismissalReason", 1200) : null;

  const { error } = await supabase
    .from("opportunities")
    .update({
      status: nextStatus,
      status_changed_at: new Date().toISOString(),
      dismissal_reason: dismissalReason,
    })
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .eq("status", currentStatus);

  if (error) {
    throw new Error(`No se pudo cambiar el estado: ${error.message}`);
  }

  revalidatePath("/opportunities");
}
