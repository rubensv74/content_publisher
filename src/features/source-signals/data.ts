import { createClient } from "@/lib/supabase/server";

import type {
  SourceSignalCandidate,
  SourceSignalRecord,
  SourceSignalSourceType,
} from "./types";

type SourceSignalRow = {
  id: string;
  source_type: SourceSignalSourceType;
  source_locator: string;
  source_ref: string;
  fingerprint: string;
  signal_type: string;
  title: string;
  summary: string | null;
  occurred_at: string | null;
  metadata: Record<string, unknown> | null;
  analysis_status: SourceSignalRecord["analysisStatus"];
  first_seen_at: string;
  last_seen_at: string;
};

export async function getSourceSignals(): Promise<SourceSignalRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_signals")
    .select(
      "id,source_type,source_locator,source_ref,fingerprint,signal_type,title,summary,occurred_at,metadata,analysis_status,first_seen_at,last_seen_at",
    )
    .order("occurred_at", { ascending: false, nullsFirst: false })
    .order("last_seen_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`No se pudieron cargar las señales: ${error.message}`);
  }

  return ((data ?? []) as unknown as SourceSignalRow[]).map((row) => ({
    id: row.id,
    sourceType: row.source_type,
    sourceLocator: row.source_locator,
    sourceRef: row.source_ref,
    fingerprint: row.fingerprint,
    signalType: row.signal_type,
    title: row.title,
    summary: row.summary,
    occurredAt: row.occurred_at,
    metadata: row.metadata ?? {},
    analysisStatus: row.analysis_status,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  }));
}

export async function upsertSourceSignals(
  userId: string,
  candidates: SourceSignalCandidate[],
) {
  if (candidates.length === 0) {
    return 0;
  }

  const supabase = await createClient();
  const observedAt = new Date().toISOString();
  const rows = candidates.map((candidate) => ({
    user_id: userId,
    source_type: candidate.sourceType,
    source_locator: candidate.sourceLocator,
    source_ref: candidate.sourceRef,
    fingerprint: candidate.fingerprint,
    signal_type: candidate.signalType,
    title: candidate.title,
    summary: candidate.summary ?? null,
    occurred_at: candidate.occurredAt ?? null,
    metadata: candidate.metadata ?? {},
    last_seen_at: observedAt,
  }));

  const { error } = await supabase.from("source_signals").upsert(rows, {
    onConflict: "user_id,fingerprint",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`No se pudieron persistir las señales: ${error.message}`);
  }

  return rows.length;
}
