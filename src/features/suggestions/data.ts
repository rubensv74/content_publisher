import type {
  DesignFamilyKey,
  PublicationFormat,
  StoryTypeKey,
} from "@/domain/content";
import type { SourceSignalSourceType } from "@/features/source-signals/types";
import { createClient } from "@/lib/supabase/server";

import type {
  SuggestionPriority,
  SuggestionRecord,
  SuggestionStatus,
  SuggestionStoryDraft,
} from "./types";

type SuggestionRow = {
  id: string;
  title: string;
  topic: string | null;
  opportunity: string;
  rationale: string;
  story_type: StoryTypeKey;
  story_draft: unknown;
  format: PublicationFormat;
  design_family: DesignFamilyKey;
  archetype_key: string;
  priority: SuggestionPriority;
  confidence: number | string;
  status: SuggestionStatus;
  provider: string;
  model: string;
  generation_fingerprint: string;
  accepted_at: string | null;
  dismissed_at: string | null;
  converted_at: string | null;
  converted_idea_id: string | null;
  created_at: string;
  updated_at: string;
};

type LinkRow = {
  suggestion_id: string;
  source_signal_id: string;
};

type SignalRow = {
  id: string;
  source_type: SourceSignalSourceType;
  source_locator: string;
  source_ref: string;
  title: string;
};

export type SuggestionRecommendation = {
  id: string;
  topic: string | null;
  storyType: StoryTypeKey;
  storyDraft: SuggestionStoryDraft;
  format: PublicationFormat;
  designFamily: DesignFamilyKey;
  archetypeKey: string;
  status: SuggestionStatus;
  convertedIdeaId: string | null;
};

function storyValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStoryDraft(value: unknown): SuggestionStoryDraft {
  const record =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    problem: storyValue(record.problem),
    attempts: storyValue(record.attempts),
    solution: storyValue(record.solution),
    result: storyValue(record.result),
    learning: storyValue(record.learning),
    insight: storyValue(record.insight),
    cta: storyValue(record.cta),
  };
}

export async function getSuggestions(): Promise<SuggestionRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,title,topic,opportunity,rationale,story_type,story_draft,format,design_family,archetype_key,priority,confidence,status,provider,model,generation_fingerprint,accepted_at,dismissed_at,converted_at,converted_idea_id,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`No se pudieron cargar las sugerencias: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as SuggestionRow[];
  const suggestionIds = rows.map((row) => row.id);

  if (suggestionIds.length === 0) {
    return [];
  }

  const { data: linkData, error: linkError } = await supabase
    .from("suggestion_source_signals")
    .select("suggestion_id,source_signal_id")
    .in("suggestion_id", suggestionIds);

  if (linkError) {
    throw new Error(`No se pudieron cargar las fuentes de las sugerencias: ${linkError.message}`);
  }

  const links = (linkData ?? []) as unknown as LinkRow[];
  const signalIds = [...new Set(links.map((link) => link.source_signal_id))];
  const signalsById = new Map<string, SignalRow>();

  if (signalIds.length > 0) {
    const { data: signalData, error: signalError } = await supabase
      .from("source_signals")
      .select("id,source_type,source_locator,source_ref,title")
      .in("id", signalIds);

    if (signalError) {
      throw new Error(`No se pudieron cargar las señales relacionadas: ${signalError.message}`);
    }

    for (const signal of (signalData ?? []) as unknown as SignalRow[]) {
      signalsById.set(signal.id, signal);
    }
  }

  const signalIdsBySuggestion = new Map<string, string[]>();
  for (const link of links) {
    const current = signalIdsBySuggestion.get(link.suggestion_id) ?? [];
    current.push(link.source_signal_id);
    signalIdsBySuggestion.set(link.suggestion_id, current);
  }

  return rows.map((row) => {
    const sourceSignalIds = signalIdsBySuggestion.get(row.id) ?? [];
    return {
      id: row.id,
      sourceSignalIds,
      sourceSignals: sourceSignalIds
        .map((id) => signalsById.get(id))
        .filter((signal): signal is SignalRow => Boolean(signal))
        .map((signal) => ({
          id: signal.id,
          sourceType: signal.source_type,
          sourceLocator: signal.source_locator,
          sourceRef: signal.source_ref,
          title: signal.title,
        })),
      title: row.title,
      topic: row.topic?.trim() ?? "",
      opportunity: row.opportunity,
      rationale: row.rationale,
      storyType: row.story_type,
      storyDraft: normalizeStoryDraft(row.story_draft),
      format: row.format,
      designFamily: row.design_family,
      archetypeKey: row.archetype_key,
      priority: row.priority,
      confidence: Number(row.confidence),
      status: row.status,
      provider: row.provider,
      model: row.model,
      generationFingerprint: row.generation_fingerprint,
      acceptedAt: row.accepted_at,
      dismissedAt: row.dismissed_at,
      convertedAt: row.converted_at,
      convertedIdeaId: row.converted_idea_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getSuggestionRecommendation(
  suggestionId: string,
): Promise<SuggestionRecommendation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,topic,story_type,story_draft,format,design_family,archetype_key,status,converted_idea_id",
    )
    .eq("id", suggestionId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la recomendación de la sugerencia: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    topic:
      typeof data.topic === "string" && data.topic.trim() ? data.topic.trim() : null,
    storyType: data.story_type as StoryTypeKey,
    storyDraft: normalizeStoryDraft(data.story_draft),
    format: data.format as PublicationFormat,
    designFamily: data.design_family as DesignFamilyKey,
    archetypeKey: data.archetype_key as string,
    status: data.status as SuggestionStatus,
    convertedIdeaId: data.converted_idea_id as string | null,
  };
}
