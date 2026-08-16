import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type {
  NewsCategory,
  NewsItemRecord,
  NewsSignalSummary,
  NewsStatus,
} from "./types";

type NewsRow = {
  id: string;
  category: NewsCategory;
  title: string;
  summary: string;
  relevance_reason: string;
  relevance_score: number;
  source_url: string | null;
  published_at: string | null;
  status: NewsStatus;
  converted_opportunity_id: string | null;
  curated_at: string;
  created_at: string;
  updated_at: string;
};

type LinkRow = {
  news_item_id: string;
  source_signal_id: string;
};

type SignalRow = {
  id: string;
  source_type: NewsSignalSummary["sourceType"];
  source_locator: string;
  source_ref: string;
  title: string;
  occurred_at: string | null;
  metadata: Record<string, unknown> | null;
};

export async function getNewsAuthContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

function metadataText(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function getNewsItems(): Promise<NewsItemRecord[]> {
  const { supabase, userId } = await getNewsAuthContext();
  const { data, error } = await supabase
    .from("news_items")
    .select(
      "id,category,title,summary,relevance_reason,relevance_score,source_url,published_at,status,converted_opportunity_id,curated_at,created_at,updated_at",
    )
    .eq("user_id", userId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("curated_at", { ascending: false })
    .limit(250);

  if (error) {
    throw new Error(`No se pudieron cargar las noticias: ${error.message}`);
  }

  const rows = (data ?? []) as NewsRow[];
  if (rows.length === 0) return [];

  const newsIds = rows.map((row) => row.id);
  const { data: linkData, error: linkError } = await supabase
    .from("news_item_source_signals")
    .select("news_item_id,source_signal_id")
    .eq("user_id", userId)
    .in("news_item_id", newsIds);

  if (linkError) {
    throw new Error(`No se pudo cargar la trazabilidad de noticias: ${linkError.message}`);
  }

  const links = (linkData ?? []) as LinkRow[];
  const signalIds = [...new Set(links.map((link) => link.source_signal_id))];
  const signalsById = new Map<string, NewsSignalSummary>();

  if (signalIds.length > 0) {
    const { data: signalData, error: signalError } = await supabase
      .from("source_signals")
      .select("id,source_type,source_locator,source_ref,title,occurred_at,metadata")
      .eq("user_id", userId)
      .in("id", signalIds);

    if (signalError) {
      throw new Error(`No se pudieron cargar las fuentes de noticias: ${signalError.message}`);
    }

    for (const signal of (signalData ?? []) as SignalRow[]) {
      signalsById.set(signal.id, {
        id: signal.id,
        sourceType: signal.source_type,
        sourceLocator: signal.source_locator,
        sourceRef: signal.source_ref,
        title: signal.title,
        occurredAt: signal.occurred_at,
        itemUrl: metadataText(signal.metadata, "itemUrl"),
        sourceName: metadataText(signal.metadata, "sourceName"),
      });
    }
  }

  const signalsByNews = new Map<string, NewsSignalSummary[]>();
  for (const link of links) {
    const signal = signalsById.get(link.source_signal_id);
    if (!signal) continue;
    const current = signalsByNews.get(link.news_item_id) ?? [];
    current.push(signal);
    signalsByNews.set(link.news_item_id, current);
  }

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    summary: row.summary,
    relevanceReason: row.relevance_reason,
    relevanceScore: row.relevance_score,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    status: row.status,
    convertedOpportunityId: row.converted_opportunity_id,
    curatedAt: row.curated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signals: signalsByNews.get(row.id) ?? [],
  }));
}

export async function getLinkedNewsSignalIds(userId: string) {
  const { supabase } = await getNewsAuthContext();
  const { data, error } = await supabase
    .from("news_item_source_signals")
    .select("source_signal_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudieron revisar las señales ya curadas: ${error.message}`);
  }

  return new Set(
    (data ?? []).map((row) => row.source_signal_id as string).filter(Boolean),
  );
}
