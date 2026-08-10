import { createHash } from "node:crypto";

import { redirect } from "next/navigation";

import { getSourceSignals } from "@/features/source-signals/data";
import {
  refreshExternalSourceSignals,
  refreshLocalSourceSignals,
} from "@/features/source-signals/refresh";
import { createClient } from "@/lib/supabase/server";

import { enrichSuggestionSignals } from "./context";
import {
  MAX_SIGNALS_PER_SUGGESTION_RUN,
  MAX_SUGGESTIONS_PER_RUN,
  selectSignalsForSuggestionModel,
} from "./input";
import {
  buildChatGPTSuggestionPacket,
  parseChatGPTSuggestionResponse,
} from "./manual-contract";
import type { SuggestionCandidate } from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function fingerprintSuggestion(candidate: SuggestionCandidate) {
  const storyFingerprint = Object.values(candidate.storyDraft)
    .map((value) => (value ? normalize(value) : ""))
    .join("|");
  const payload = [
    "story-v2",
    [...candidate.sourceSignalIds].sort().join(","),
    normalize(candidate.title),
    normalize(candidate.topic),
    candidate.storyType,
    storyFingerprint,
    candidate.format,
    candidate.designFamily,
    candidate.archetypeKey,
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

export async function prepareChatGPTSuggestionPacket() {
  await refreshLocalSourceSignals();

  let externalRefreshWarning = false;
  try {
    await refreshExternalSourceSignals();
  } catch {
    externalRefreshWarning = true;
  }

  const allSignals = await getSourceSignals();
  const selectedSignals = selectSignalsForSuggestionModel(allSignals).slice(
    0,
    MAX_SIGNALS_PER_SUGGESTION_RUN,
  );
  const enriched = await enrichSuggestionSignals(selectedSignals);

  return {
    content: buildChatGPTSuggestionPacket(
      enriched.signals,
      MAX_SUGGESTIONS_PER_RUN,
    ),
    signalCount: enriched.signals.length,
    enrichedCount: enriched.enrichedCount,
    externalRefreshWarning,
  };
}

export async function persistChatGPTSuggestionResponse(raw: string) {
  const { supabase, userId } = await getAuthenticatedContext();
  const allSignals = await getSourceSignals();
  const allowedSignalIds = new Set(allSignals.map((signal) => signal.id));
  const suggestions = parseChatGPTSuggestionResponse(
    raw,
    allowedSignalIds,
    MAX_SUGGESTIONS_PER_RUN,
  );

  if (suggestions.length === 0) {
    return { imported: 0, persisted: 0 };
  }

  const prepared = suggestions.map((suggestion) => ({
    suggestion,
    fingerprint: fingerprintSuggestion(suggestion),
  }));

  const rows = prepared.map(({ suggestion, fingerprint }) => ({
    user_id: userId,
    title: suggestion.title,
    topic: suggestion.topic,
    opportunity: suggestion.opportunity,
    rationale: suggestion.rationale,
    story_type: suggestion.storyType,
    story_draft: suggestion.storyDraft,
    format: suggestion.format,
    design_family: suggestion.designFamily,
    archetype_key: suggestion.archetypeKey,
    priority: suggestion.priority,
    confidence: suggestion.confidence,
    status: "new",
    provider: "chatgpt",
    model: "plus-manual",
    generation_fingerprint: fingerprint,
  }));

  const { error: insertError } = await supabase.from("suggestions").upsert(rows, {
    onConflict: "user_id,generation_fingerprint",
    ignoreDuplicates: true,
  });

  if (insertError) {
    throw new Error(`No se pudieron guardar las sugerencias: ${insertError.message}`);
  }

  const fingerprints = prepared.map((item) => item.fingerprint);
  const { data: persistedRows, error: persistedError } = await supabase
    .from("suggestions")
    .select("id,generation_fingerprint")
    .eq("user_id", userId)
    .in("generation_fingerprint", fingerprints);

  if (persistedError) {
    throw new Error(`No se pudieron recuperar las sugerencias guardadas: ${persistedError.message}`);
  }

  const suggestionIdByFingerprint = new Map(
    (persistedRows ?? []).map((row) => [
      row.generation_fingerprint as string,
      row.id as string,
    ]),
  );

  const linkRows = prepared.flatMap(({ suggestion, fingerprint }) => {
    const suggestionId = suggestionIdByFingerprint.get(fingerprint);
    if (!suggestionId) return [];

    return suggestion.sourceSignalIds.map((sourceSignalId) => ({
      suggestion_id: suggestionId,
      source_signal_id: sourceSignalId,
      user_id: userId,
    }));
  });

  if (linkRows.length > 0) {
    const { error: linkError } = await supabase
      .from("suggestion_source_signals")
      .upsert(linkRows, {
        onConflict: "suggestion_id,source_signal_id",
        ignoreDuplicates: true,
      });

    if (linkError) {
      throw new Error(`No se pudo guardar la trazabilidad: ${linkError.message}`);
    }

    const usedSignalIds = [...new Set(linkRows.map((row) => row.source_signal_id))];
    const { error: signalError } = await supabase
      .from("source_signals")
      .update({ analysis_status: "suggested" })
      .eq("user_id", userId)
      .in("id", usedSignalIds);

    if (signalError) {
      throw new Error(`No se pudieron actualizar las señales: ${signalError.message}`);
    }
  }

  return {
    imported: suggestions.length,
    persisted: suggestionIdByFingerprint.size,
  };
}
