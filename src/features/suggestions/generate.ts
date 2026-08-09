import { createHash } from "node:crypto";

import { redirect } from "next/navigation";

import { getSourceSignals } from "@/features/source-signals/data";
import { createClient } from "@/lib/supabase/server";

import { enrichSuggestionSignals } from "./context";
import {
  MAX_SIGNALS_PER_SUGGESTION_RUN,
  MAX_SUGGESTIONS_PER_RUN,
  selectSignalsForSuggestionModel,
} from "./input";
import { suggestionModel } from "./model";
import type { SuggestionCandidate } from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function fingerprintSuggestion(candidate: SuggestionCandidate) {
  const payload = [
    [...candidate.sourceSignalIds].sort().join(","),
    normalize(candidate.title),
    candidate.storyType,
    candidate.format,
    candidate.designFamily,
    candidate.archetypeKey,
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
}

export async function generateAndPersistSuggestions() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const allSignals = await getSourceSignals();
  const selectedSignals = selectSignalsForSuggestionModel(allSignals).slice(
    0,
    MAX_SIGNALS_PER_SUGGESTION_RUN,
  );

  if (selectedSignals.length === 0) {
    return {
      observedSignals: 0,
      enrichedSignals: 0,
      generated: 0,
      persisted: 0,
      provider: null,
      model: null,
    };
  }

  const contextResolution = await enrichSuggestionSignals(selectedSignals);
  const result = await suggestionModel.generate({
    signals: contextResolution.signals,
    maxSuggestions: MAX_SUGGESTIONS_PER_RUN,
  });

  if (result.suggestions.length === 0) {
    return {
      observedSignals: selectedSignals.length,
      enrichedSignals: contextResolution.enrichedCount,
      generated: 0,
      persisted: 0,
      provider: result.provider,
      model: result.model,
    };
  }

  const prepared = result.suggestions.map((suggestion) => ({
    suggestion,
    fingerprint: fingerprintSuggestion(suggestion),
  }));

  const rows = prepared.map(({ suggestion, fingerprint }) => ({
    user_id: userId,
    title: suggestion.title,
    opportunity: suggestion.opportunity,
    rationale: suggestion.rationale,
    story_type: suggestion.storyType,
    format: suggestion.format,
    design_family: suggestion.designFamily,
    archetype_key: suggestion.archetypeKey,
    priority: suggestion.priority,
    confidence: suggestion.confidence,
    status: "new",
    provider: result.provider,
    model: result.model,
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
    (persistedRows ?? []).map((row) => [row.generation_fingerprint as string, row.id as string]),
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
      throw new Error(`No se pudo guardar la trazabilidad de las sugerencias: ${linkError.message}`);
    }

    const usedSignalIds = [...new Set(linkRows.map((row) => row.source_signal_id))];
    const { error: signalError } = await supabase
      .from("source_signals")
      .update({ analysis_status: "suggested" })
      .eq("user_id", userId)
      .in("id", usedSignalIds);

    if (signalError) {
      throw new Error(`No se pudieron actualizar las señales analizadas: ${signalError.message}`);
    }
  }

  return {
    observedSignals: selectedSignals.length,
    enrichedSignals: contextResolution.enrichedCount,
    generated: result.suggestions.length,
    persisted: suggestionIdByFingerprint.size,
    provider: result.provider,
    model: result.model,
  };
}
