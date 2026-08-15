import { redirect } from "next/navigation";

import { getSourceSignals } from "@/features/source-signals/data";
import { refreshTechnologySourceSignals } from "@/features/source-signals/refresh";
import type { SourceSignalRecord } from "@/features/source-signals/types";
import { createClient } from "@/lib/supabase/server";

import { getOpportunities } from "./data";
import {
  buildChatGPTOpportunityPacket,
  MAX_ASSISTED_OPPORTUNITIES,
  MAX_OPPORTUNITY_SIGNALS,
  parseChatGPTOpportunityResponse,
  type OpportunityPacketSignal,
} from "./manual-contract";

const POWER_PLATFORM_SOURCE_IDS = new Set(["SRC-004", "SRC-005", "SRC-006"]);
const POWER_PLATFORM_AREAS = new Set([
  "power-platform",
  "power-apps",
  "canvas-apps",
  "model-driven-apps",
  "power-fx",
  "power-automate",
  "cloud-flows",
  "desktop-flows",
  "dataverse",
  "copilot-studio",
  "power-pages",
  "governance",
  "alm",
  "connectors",
  "low-code",
]);

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es").replace(/\s+/g, " ");
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function signalAreas(signal: SourceSignalRecord) {
  return stringArray(signal.metadata.professionalAreas);
}

function isPowerPlatformSignal(signal: SourceSignalRecord) {
  return (
    POWER_PLATFORM_SOURCE_IDS.has(signal.sourceLocator) ||
    signalAreas(signal).some((area) => POWER_PLATFORM_AREAS.has(area))
  );
}

function occurredAtValue(signal: SourceSignalRecord) {
  const value = signal.occurredAt ?? signal.lastSeenAt;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function packetSignal(signal: SourceSignalRecord): OpportunityPacketSignal {
  const metadata = signal.metadata;
  const sourceName = typeof metadata.sourceName === "string" ? metadata.sourceName : undefined;
  const provider = typeof metadata.provider === "string" ? metadata.provider : undefined;
  const itemUrl = typeof metadata.itemUrl === "string" ? metadata.itemUrl : undefined;
  const priority = typeof metadata.priority === "string" ? metadata.priority : undefined;

  return {
    id: signal.id,
    title: signal.title,
    summary: signal.summary,
    occurredAt: signal.occurredAt,
    sourceLocator: signal.sourceLocator,
    metadata: {
      sourceName,
      provider,
      itemUrl,
      professionalAreas: signalAreas(signal),
      priority,
    },
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

async function getLinkedTechnologySignalIds(userId: string) {
  const { supabase } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("opportunity_source_signals")
    .select("source_signal_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo revisar la trazabilidad existente: ${error.message}`);
  }

  return new Set(
    (data ?? []).map((row) => row.source_signal_id as string).filter(Boolean),
  );
}

export async function prepareChatGPTOpportunityPacket() {
  let technologyRefreshWarning = false;

  try {
    await refreshTechnologySourceSignals();
  } catch {
    technologyRefreshWarning = true;
  }

  const { userId } = await getAuthenticatedContext();
  const [allSignals, linkedSignalIds] = await Promise.all([
    getSourceSignals(),
    getLinkedTechnologySignalIds(userId),
  ]);

  const available = allSignals
    .filter(
      (signal) =>
        signal.sourceType === "technology" && !linkedSignalIds.has(signal.id),
    )
    .sort((left, right) => occurredAtValue(right) - occurredAtValue(left));

  const primary = available.filter(isPowerPlatformSignal);
  const secondary = available.filter((signal) => !isPowerPlatformSignal(signal));
  const selected = [...primary, ...secondary].slice(0, MAX_OPPORTUNITY_SIGNALS);

  return {
    content: buildChatGPTOpportunityPacket(
      selected.map(packetSignal),
      MAX_ASSISTED_OPPORTUNITIES,
    ),
    signalCount: selected.length,
    primarySignalCount: Math.min(primary.length, MAX_OPPORTUNITY_SIGNALS),
    technologyRefreshWarning,
  };
}

export async function persistChatGPTOpportunityResponse(raw: string) {
  const { supabase, userId } = await getAuthenticatedContext();
  const [allSignals, existingOpportunities] = await Promise.all([
    getSourceSignals(),
    getOpportunities(),
  ]);

  const technologySignals = allSignals.filter(
    (signal) => signal.sourceType === "technology",
  );
  const technologySignalIds = new Set(technologySignals.map((signal) => signal.id));
  const candidates = parseChatGPTOpportunityResponse(
    raw,
    technologySignalIds,
    MAX_ASSISTED_OPPORTUNITIES,
  );

  let persisted = 0;
  let skipped = 0;
  const usedSignalIds = new Set<string>();

  for (const candidate of candidates) {
    const candidateSignalSet = new Set(candidate.sourceSignalIds);
    const duplicate = existingOpportunities.some((opportunity) => {
      if (normalize(opportunity.title) === normalize(candidate.title)) return true;
      if (opportunity.signals.length !== candidateSignalSet.size) return false;
      return opportunity.signals.every((signal) => candidateSignalSet.has(signal.id));
    });

    if (duplicate) {
      skipped += 1;
      continue;
    }

    const { data: opportunity, error: opportunityError } = await supabase
      .from("opportunities")
      .insert({
        user_id: userId,
        title: candidate.title,
        summary: candidate.summary,
        relevance_reason: candidate.relevanceReason,
        professional_relevance: candidate.professionalRelevance,
        actionability: candidate.actionability,
        learning_potential: candidate.learningPotential,
        project_potential: candidate.projectPotential,
        case_study_potential: candidate.caseStudyPotential,
        editorial_potential: candidate.editorialPotential,
        novelty: candidate.novelty,
        effort: candidate.effort,
        status: "new",
      })
      .select("id")
      .single();

    if (opportunityError || !opportunity) {
      throw new Error(
        `No se pudo guardar una oportunidad: ${opportunityError?.message ?? "respuesta vacía"}`,
      );
    }

    const links = candidate.sourceSignalIds.map((sourceSignalId) => ({
      opportunity_id: opportunity.id,
      source_signal_id: sourceSignalId,
      user_id: userId,
    }));

    const { error: linkError } = await supabase
      .from("opportunity_source_signals")
      .insert(links);

    if (linkError) {
      await supabase
        .from("opportunities")
        .delete()
        .eq("id", opportunity.id)
        .eq("user_id", userId);
      throw new Error(`No se pudo guardar la trazabilidad: ${linkError.message}`);
    }

    candidate.sourceSignalIds.forEach((id) => usedSignalIds.add(id));
    existingOpportunities.push({
      id: opportunity.id as string,
      title: candidate.title,
      summary: candidate.summary,
      relevanceReason: candidate.relevanceReason,
      status: "new",
      professionalRelevance: candidate.professionalRelevance,
      actionability: candidate.actionability,
      learningPotential: candidate.learningPotential,
      projectPotential: candidate.projectPotential,
      caseStudyPotential: candidate.caseStudyPotential,
      editorialPotential: candidate.editorialPotential,
      novelty: candidate.novelty,
      effort: candidate.effort,
      priorityScore: 0,
      priority: "low",
      researchNotes: null,
      dismissalReason: null,
      statusChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signals: candidate.sourceSignalIds.map((id) => {
        const signal = technologySignals.find((item) => item.id === id);
        return {
          id,
          sourceType: "technology" as const,
          sourceLocator: signal?.sourceLocator ?? "technology",
          sourceRef: signal?.sourceRef ?? id,
          title: signal?.title ?? candidate.title,
          occurredAt: signal?.occurredAt ?? null,
        };
      }),
    });
    persisted += 1;
  }

  if (usedSignalIds.size > 0) {
    const { error: signalError } = await supabase
      .from("source_signals")
      .update({ analysis_status: "reviewed" })
      .eq("user_id", userId)
      .in("id", [...usedSignalIds]);

    if (signalError) {
      throw new Error(`No se pudieron actualizar las señales: ${signalError.message}`);
    }
  }

  return {
    imported: candidates.length,
    persisted,
    skipped,
  };
}
