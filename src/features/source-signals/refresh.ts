import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { editorialHistorySourceAdapter } from "./adapters/editorial-history";
import { githubSourceAdapter } from "./adapters/github";
import { knowledgeBaseSourceAdapter } from "./adapters/knowledge-base";
import { manualIdeasSourceAdapter } from "./adapters/manual-ideas";
import { technologyRssSourceAdapter } from "./adapters/technology-rss";
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

const githubAdapters: SourceSignalAdapter[] = [
  githubSourceAdapter,
  knowledgeBaseSourceAdapter,
];

const technologyAdapters: SourceSignalAdapter[] = [technologyRssSourceAdapter];

function deduplicate(candidates: SourceSignalCandidate[]) {
  return [...new Map(candidates.map((candidate) => [candidate.fingerprint, candidate])).values()];
}

async function getContext() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

async function refreshAdapters(
  adapters: SourceSignalAdapter[],
): Promise<SourceSignalRefreshSummary> {
  const context = await getContext();
  const batches = await Promise.all(
    adapters.map((adapter) => adapter.collect(context)),
  );
  const observed = batches.flat();
  const unique = deduplicate(observed);
  const persisted = await upsertSourceSignals(context.userId, unique);

  return {
    adapters: adapters.length,
    observed: observed.length,
    persisted,
  };
}

export async function refreshLocalSourceSignals() {
  return refreshAdapters(localAdapters);
}

export async function refreshExternalSourceSignals() {
  return refreshAdapters(githubAdapters);
}

export async function refreshTechnologySourceSignals() {
  return refreshAdapters(technologyAdapters);
}
