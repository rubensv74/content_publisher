import { redirect } from "next/navigation";

import type { SourceSignalSourceType } from "@/features/source-signals/types";
import { createClient } from "@/lib/supabase/server";

import type {
  OpportunityPriority,
  OpportunityRecord,
  OpportunityResearchWorkspace,
  OpportunitySignalSummary,
  OpportunityStatus,
} from "./types";
import { emptyOpportunityResearchWorkspace } from "./types";

type OpportunityRow = {
  id: string;
  title: string;
  summary: string | null;
  relevance_reason: string | null;
  status: OpportunityStatus;
  professional_relevance: number;
  actionability: number;
  learning_potential: number;
  project_potential: number;
  case_study_potential: number;
  editorial_potential: number;
  novelty: number;
  effort: number;
  priority_score: number;
  priority: OpportunityPriority;
  research_notes: string | null;
  research_workspace: unknown;
  dismissal_reason: string | null;
  status_changed_at: string;
  created_at: string;
  updated_at: string;
};

type LinkRow = {
  opportunity_id: string;
  source_signal_id: string;
};

type SignalRow = {
  id: string;
  source_type: SourceSignalSourceType;
  source_locator: string;
  source_ref: string;
  title: string;
  occurred_at: string | null;
};

function workspaceText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseResearchWorkspace(value: unknown): OpportunityResearchWorkspace {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...emptyOpportunityResearchWorkspace };
  }

  const record = value as Record<string, unknown>;
  return {
    version: 1,
    objective: workspaceText(record.objective),
    questions: workspaceText(record.questions),
    validationPlan: workspaceText(record.validationPlan),
    evidence: workspaceText(record.evidence),
    findings: workspaceText(record.findings),
    conclusion: workspaceText(record.conclusion),
    nextStep: workspaceText(record.nextStep),
  };
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

export async function getOpportunities(): Promise<OpportunityRecord[]> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id,title,summary,relevance_reason,status,professional_relevance,actionability,learning_potential,project_potential,case_study_potential,editorial_potential,novelty,effort,priority_score,priority,research_notes,research_workspace,dismissal_reason,status_changed_at,created_at,updated_at",
    )
    .eq("user_id", userId)
    .order("priority_score", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`No se pudieron cargar las oportunidades: ${error.message}`);
  }

  const opportunities = (data ?? []) as OpportunityRow[];
  if (opportunities.length === 0) return [];

  const opportunityIds = opportunities.map((item) => item.id);
  const { data: linkData, error: linkError } = await supabase
    .from("opportunity_source_signals")
    .select("opportunity_id,source_signal_id")
    .eq("user_id", userId)
    .in("opportunity_id", opportunityIds);

  if (linkError) {
    throw new Error(`No se pudo cargar la trazabilidad de oportunidades: ${linkError.message}`);
  }

  const links = (linkData ?? []) as LinkRow[];
  const signalIds = [...new Set(links.map((link) => link.source_signal_id))];
  const signalsById = new Map<string, OpportunitySignalSummary>();

  if (signalIds.length > 0) {
    const { data: signalData, error: signalError } = await supabase
      .from("source_signals")
      .select("id,source_type,source_locator,source_ref,title,occurred_at")
      .eq("user_id", userId)
      .in("id", signalIds);

    if (signalError) {
      throw new Error(`No se pudieron cargar las señales de las oportunidades: ${signalError.message}`);
    }

    for (const signal of (signalData ?? []) as SignalRow[]) {
      signalsById.set(signal.id, {
        id: signal.id,
        sourceType: signal.source_type,
        sourceLocator: signal.source_locator,
        sourceRef: signal.source_ref,
        title: signal.title,
        occurredAt: signal.occurred_at,
      });
    }
  }

  const linksByOpportunity = new Map<string, OpportunitySignalSummary[]>();
  for (const link of links) {
    const signal = signalsById.get(link.source_signal_id);
    if (!signal) continue;
    const current = linksByOpportunity.get(link.opportunity_id) ?? [];
    current.push(signal);
    linksByOpportunity.set(link.opportunity_id, current);
  }

  return opportunities.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    relevanceReason: row.relevance_reason,
    status: row.status,
    professionalRelevance: row.professional_relevance,
    actionability: row.actionability,
    learningPotential: row.learning_potential,
    projectPotential: row.project_potential,
    caseStudyPotential: row.case_study_potential,
    editorialPotential: row.editorial_potential,
    novelty: row.novelty,
    effort: row.effort,
    priorityScore: row.priority_score,
    priority: row.priority,
    researchNotes: row.research_notes,
    researchWorkspace: parseResearchWorkspace(row.research_workspace),
    dismissalReason: row.dismissal_reason,
    statusChangedAt: row.status_changed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signals: linksByOpportunity.get(row.id) ?? [],
  }));
}
