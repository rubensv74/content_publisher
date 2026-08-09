import type { createClient } from "@/lib/supabase/server";

export type SourceSignalSourceType =
  | "github"
  | "knowledge-base"
  | "editorial-history"
  | "manual-idea";

export type SourceSignalAnalysisStatus =
  | "new"
  | "reviewed"
  | "ignored"
  | "suggested";

export type SourceSignalCandidate = {
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  fingerprint: string;
  signalType: string;
  title: string;
  summary?: string | null;
  occurredAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type SourceSignalRecord = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  fingerprint: string;
  signalType: string;
  title: string;
  summary?: string | null;
  occurredAt?: string | null;
  metadata: Record<string, unknown>;
  analysisStatus: SourceSignalAnalysisStatus;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type SourceAdapterContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

export type SourceSignalAdapter = {
  key: string;
  sourceType: SourceSignalSourceType;
  collect(context: SourceAdapterContext): Promise<SourceSignalCandidate[]>;
};

export type SourceSignalRefreshSummary = {
  adapters: number;
  observed: number;
  persisted: number;
};
