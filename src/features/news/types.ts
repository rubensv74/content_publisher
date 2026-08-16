import type { SourceSignalSourceType } from "@/features/source-signals/types";

export const newsCategories = ["power-apps", "power-bi", "ai-applied"] as const;
export type NewsCategory = (typeof newsCategories)[number];

export const newsStatuses = [
  "unread",
  "read",
  "saved",
  "dismissed",
  "converted",
] as const;
export type NewsStatus = (typeof newsStatuses)[number];

export type NewsSignalSummary = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  title: string;
  occurredAt: string | null;
  itemUrl: string | null;
  sourceName: string | null;
};

export type NewsItemRecord = {
  id: string;
  category: NewsCategory;
  title: string;
  summary: string;
  relevanceReason: string;
  relevanceScore: number;
  sourceUrl: string | null;
  publishedAt: string | null;
  status: NewsStatus;
  convertedOpportunityId: string | null;
  curatedAt: string;
  createdAt: string;
  updatedAt: string;
  signals: NewsSignalSummary[];
};

export const newsCategoryLabels: Record<NewsCategory, string> = {
  "power-apps": "Power Apps",
  "power-bi": "Power BI",
  "ai-applied": "IA aplicada",
};

export const newsStatusLabels: Record<NewsStatus, string> = {
  unread: "Nueva",
  read: "Leída",
  saved: "Guardada",
  dismissed: "Descartada",
  converted: "Convertida en oportunidad",
};
