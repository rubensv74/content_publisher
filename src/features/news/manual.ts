import { createHash } from "node:crypto";

import { getSourceSignals } from "@/features/source-signals/data";
import { refreshTechnologySourceSignals } from "@/features/source-signals/refresh";
import type { SourceSignalRecord } from "@/features/source-signals/types";

import { getLinkedNewsSignalIds, getNewsAuthContext } from "./data";
import {
  buildChatGPTNewsPacket,
  MAX_ASSISTED_NEWS,
  MAX_NEWS_SIGNALS,
  parseChatGPTNewsResponse,
  type NewsPacketSignal,
} from "./manual-contract";

const POWER_APPS_SOURCE_IDS = new Set(["SRC-005"]);
const POWER_BI_SOURCE_IDS = new Set(["SRC-007"]);
const AI_SOURCE_IDS = new Set(["SRC-008"]);
const AI_PATTERN = /\b(ai|artificial intelligence|copilot|agent|agents|agentic|mcp|prompt|model|models|work iq)\b/i;
const PER_STREAM_LIMIT = Math.floor(MAX_NEWS_SIGNALS / 3);

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("es").replace(/\s+/g, " ");
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function metadataText(signal: SourceSignalRecord, key: string) {
  const value = signal.metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function occurredAtValue(signal: SourceSignalRecord) {
  const timestamp = Date.parse(signal.occurredAt ?? signal.lastSeenAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isAiAppliedCandidate(signal: SourceSignalRecord) {
  if (AI_SOURCE_IDS.has(signal.sourceLocator)) {
    return AI_PATTERN.test(`${signal.title} ${signal.summary ?? ""}`);
  }

  if (!["SRC-004", "SRC-005", "SRC-006", "SRC-007", "SRC-003"].includes(signal.sourceLocator)) {
    return false;
  }

  return AI_PATTERN.test(`${signal.title} ${signal.summary ?? ""}`);
}

function packetSignal(signal: SourceSignalRecord): NewsPacketSignal {
  return {
    id: signal.id,
    title: signal.title,
    summary: signal.summary,
    occurredAt: signal.occurredAt,
    sourceLocator: signal.sourceLocator,
    metadata: {
      sourceName: metadataText(signal, "sourceName"),
      provider: metadataText(signal, "provider"),
      itemUrl: metadataText(signal, "itemUrl"),
      professionalAreas: stringArray(signal.metadata.professionalAreas),
      priority: metadataText(signal, "priority"),
    },
  };
}

function sourceIdentity(signal: SourceSignalRecord) {
  const itemUrl = metadataText(signal, "itemUrl");
  return itemUrl ?? signal.sourceRef;
}

function takeUnique(
  candidates: SourceSignalRecord[],
  seen: Set<string>,
  limit: number,
) {
  const selected: SourceSignalRecord[] = [];
  for (const signal of candidates) {
    const identity = sourceIdentity(signal);
    if (seen.has(identity)) continue;
    seen.add(identity);
    selected.push(signal);
    if (selected.length >= limit) break;
  }
  return selected;
}

export async function prepareChatGPTNewsPacket() {
  await refreshTechnologySourceSignals();

  const { userId } = await getNewsAuthContext();
  const [allSignals, linkedSignalIds] = await Promise.all([
    getSourceSignals(),
    getLinkedNewsSignalIds(userId),
  ]);

  const available = allSignals
    .filter(
      (signal) =>
        signal.sourceType === "technology" && !linkedSignalIds.has(signal.id),
    )
    .sort((left, right) => occurredAtValue(right) - occurredAtValue(left));

  const seen = new Set<string>();
  const powerApps = takeUnique(
    available.filter((signal) => POWER_APPS_SOURCE_IDS.has(signal.sourceLocator)),
    seen,
    PER_STREAM_LIMIT,
  );
  const powerBi = takeUnique(
    available.filter((signal) => POWER_BI_SOURCE_IDS.has(signal.sourceLocator)),
    seen,
    PER_STREAM_LIMIT,
  );
  const aiApplied = takeUnique(
    available.filter(isAiAppliedCandidate),
    seen,
    PER_STREAM_LIMIT,
  );

  const selected = [...powerApps, ...powerBi, ...aiApplied].slice(0, MAX_NEWS_SIGNALS);

  return {
    content: buildChatGPTNewsPacket(selected.map(packetSignal), MAX_ASSISTED_NEWS),
    signalCount: selected.length,
    streamCounts: {
      powerApps: powerApps.length,
      powerBi: powerBi.length,
      aiApplied: aiApplied.length,
    },
  };
}

function generationFingerprint(
  sourceSignalIds: string[],
  category: string,
  title: string,
) {
  const payload = [
    "news-v1",
    [...sourceSignalIds].sort().join(","),
    category,
    normalize(title),
  ].join("|");
  return createHash("sha256").update(payload).digest("hex");
}

function latestOccurredAt(signals: SourceSignalRecord[]) {
  const values = signals
    .map((signal) => signal.occurredAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left));
  return values[0] ?? null;
}

export async function persistChatGPTNewsResponse(raw: string) {
  const { supabase, userId } = await getNewsAuthContext();
  const [allSignals, alreadyLinkedSignalIds] = await Promise.all([
    getSourceSignals(),
    getLinkedNewsSignalIds(userId),
  ]);
  const technologySignals = allSignals.filter((signal) => signal.sourceType === "technology");
  const technologySignalIds = new Set(technologySignals.map((signal) => signal.id));
  const signalById = new Map(technologySignals.map((signal) => [signal.id, signal]));

  const candidates = parseChatGPTNewsResponse(
    raw,
    technologySignalIds,
    MAX_ASSISTED_NEWS,
  );

  let persisted = 0;
  let skipped = 0;
  const usedSignalIds = new Set<string>();

  for (const candidate of candidates) {
    if (candidate.sourceSignalIds.some((id) => alreadyLinkedSignalIds.has(id))) {
      skipped += 1;
      continue;
    }

    const linkedSignals = candidate.sourceSignalIds
      .map((id) => signalById.get(id))
      .filter((signal): signal is SourceSignalRecord => Boolean(signal));
    if (linkedSignals.length === 0) {
      skipped += 1;
      continue;
    }

    const fingerprint = generationFingerprint(
      candidate.sourceSignalIds,
      candidate.category,
      candidate.title,
    );
    const primarySourceUrl = linkedSignals
      .map((signal) => metadataText(signal, "itemUrl"))
      .find((value): value is string => Boolean(value)) ?? null;

    const { data: newsItem, error: newsError } = await supabase
      .from("news_items")
      .insert({
        user_id: userId,
        category: candidate.category,
        title: candidate.title,
        summary: candidate.summary,
        relevance_reason: candidate.relevanceReason,
        relevance_score: candidate.relevanceScore,
        source_url: primarySourceUrl,
        published_at: latestOccurredAt(linkedSignals),
        status: "unread",
        generation_fingerprint: fingerprint,
      })
      .select("id")
      .single();

    if (newsError) {
      if (newsError.code === "23505") {
        skipped += 1;
        continue;
      }
      throw new Error(`No se pudo guardar una noticia: ${newsError.message}`);
    }
    if (!newsItem) {
      throw new Error("No se pudo guardar una noticia: respuesta vacía.");
    }

    const links = candidate.sourceSignalIds.map((sourceSignalId) => ({
      news_item_id: newsItem.id,
      source_signal_id: sourceSignalId,
      user_id: userId,
    }));
    const { error: linkError } = await supabase
      .from("news_item_source_signals")
      .insert(links);

    if (linkError) {
      await supabase.from("news_items").delete().eq("id", newsItem.id).eq("user_id", userId);
      throw new Error(`No se pudo guardar la trazabilidad de la noticia: ${linkError.message}`);
    }

    candidate.sourceSignalIds.forEach((id) => {
      usedSignalIds.add(id);
      alreadyLinkedSignalIds.add(id);
    });
    persisted += 1;
  }

  if (usedSignalIds.size > 0) {
    const { error: signalError } = await supabase
      .from("source_signals")
      .update({ analysis_status: "reviewed" })
      .eq("user_id", userId)
      .in("id", [...usedSignalIds]);

    if (signalError) {
      throw new Error(`No se pudieron actualizar las señales: ${signalError.message}`);
    }
  }

  return { imported: candidates.length, persisted, skipped };
}
