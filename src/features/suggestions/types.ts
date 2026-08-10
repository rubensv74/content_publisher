import type {
  DesignFamilyKey,
  PublicationFormat,
  StoryTypeKey,
} from "@/domain/content";

import type { SourceSignalSourceType } from "@/features/source-signals/types";

export const SUGGESTION_PRIORITIES = ["low", "medium", "high"] as const;
export type SuggestionPriority = (typeof SUGGESTION_PRIORITIES)[number];

export const SUGGESTION_STATUSES = [
  "new",
  "accepted",
  "dismissed",
  "converted",
] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type SuggestionStoryDraft = {
  problem: string | null;
  attempts: string | null;
  solution: string | null;
  result: string | null;
  learning: string | null;
  insight: string | null;
  cta: string | null;
};

export type SuggestionSignalContext = {
  kind: "source-commit";
  repository: string;
  commitMessage: string;
  changeStats: {
    additions: number;
    deletions: number;
    filesChanged: number;
  };
  changedFiles: Array<{
    path: string;
    status: string;
    additions: number;
    deletions: number;
  }>;
  documentation: Array<{
    path: string;
    excerpt: string;
  }>;
  truncated: boolean;
};

export type SuggestionModelSignal = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  signalType: string;
  title: string;
  summary: string | null;
  occurredAt: string | null;
  context?: SuggestionSignalContext;
};

export type SuggestionCandidate = {
  sourceSignalIds: string[];
  title: string;
  topic: string;
  opportunity: string;
  rationale: string;
  storyType: StoryTypeKey;
  storyDraft: SuggestionStoryDraft;
  format: PublicationFormat;
  designFamily: DesignFamilyKey;
  archetypeKey: string;
  priority: SuggestionPriority;
  confidence: number;
};

export type SuggestionSourceSummary = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  title: string;
};

export type SuggestionRecord = SuggestionCandidate & {
  id: string;
  sourceSignals: SuggestionSourceSummary[];
  status: SuggestionStatus;
  provider: string;
  model: string;
  generationFingerprint: string;
  acceptedAt: string | null;
  dismissedAt: string | null;
  convertedAt: string | null;
  convertedIdeaId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SuggestionModelRequest = {
  signals: SuggestionModelSignal[];
  maxSuggestions: number;
};

export type SuggestionModelUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type SuggestionModelResult = {
  provider: string;
  model: string;
  responseId?: string;
  suggestions: SuggestionCandidate[];
  usage?: SuggestionModelUsage;
};

export interface SuggestionModel {
  readonly key: string;
  generate(request: SuggestionModelRequest): Promise<SuggestionModelResult>;
}
