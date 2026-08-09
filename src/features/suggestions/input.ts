import type { SourceSignalRecord } from "@/features/source-signals/types";

import type { SuggestionModelSignal } from "./types";

export const MAX_SIGNALS_PER_SUGGESTION_RUN = 20;
export const MAX_SUGGESTIONS_PER_RUN = 5;

function signalTime(signal: SourceSignalRecord) {
  return Date.parse(signal.occurredAt ?? signal.lastSeenAt);
}

export function selectSignalsForSuggestionModel(
  signals: SourceSignalRecord[],
): SuggestionModelSignal[] {
  return signals
    .filter(
      (signal) =>
        signal.analysisStatus !== "ignored" &&
        signal.analysisStatus !== "suggested",
    )
    .toSorted((left, right) => signalTime(right) - signalTime(left))
    .slice(0, MAX_SIGNALS_PER_SUGGESTION_RUN)
    .map((signal) => ({
      id: signal.id,
      sourceType: signal.sourceType,
      sourceLocator: signal.sourceLocator,
      sourceRef: signal.sourceRef,
      signalType: signal.signalType,
      title: signal.title,
      summary: signal.summary ?? null,
      occurredAt: signal.occurredAt ?? null,
    }));
}
