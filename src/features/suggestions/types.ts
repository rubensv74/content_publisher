import type {
  DesignFamilyKey,
  PublicationFormat,
  StoryTypeKey,
} from "@/domain/content";

import type { SourceSignalSourceType } from "@/features/source-signals/types";

export const SUGGESTION_PRIORITIES = ["low", "medium", "high"] as const;
export type SuggestionPriority = (typeof SUGGESTION_PRIORITIES)[number];

export type SuggestionModelSignal = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  signalType: string;
  title: string;
  summary: string | null;
  occurredAt: string | null;
};

export type SuggestionCandidate = {
  sourceSignalIds: string[];
  title: string;
  opportunity: string;
  rationale: string;
  storyType: StoryTypeKey;
  format: PublicationFormat;
  designFamily: DesignFamilyKey;
  archetypeKey: string;
  priority: SuggestionPriority;
  confidence: number;
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
