import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { editorialHistorySourceAdapter } from "./adapters/editorial-history";
import { manualIdeasSourceAdapter } from "./adapters/manual-ideas";
import { upsertSourceSignals } from "./data";
import type {
  SourceSignalAdapter,
  SourceSignalCandidate,
  SourceSignalRefreshSummary,
} from "./types";

const localAdapters: SourceSignalAdapter[] = [
  manualIdeasSourceAdapter,
  editorialHistorySourceAdapter,
];

function deduplicate(candidates: SourceSignalCandidate[]) {
  return [...new Map(candidates.map((candidate) => [candidate.fingerprint, candidate])).values()];
}

export async function refreshLocalSourceSignals(): Promise<SourceSignalRefreshSummary> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const batches = await Promise.all(
    localAdapters.map((adapter) => adapter.collect({ supabase, userId })),
  );
  const observed = batches.flat();
  const unique = deduplicate(observed);
  const persisted = await upsertSourceSignals(userId, unique);

  return {
    adapters: localAdapters.length,
    observed: observed.length,
    persisted,
  };
}
