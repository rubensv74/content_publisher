import { readFeed } from "../rss";
import { technologySources } from "../technology-sources";
import type { SourceSignalAdapter, SourceSignalCandidate } from "../types";

function normalizeSourceRef(sourceId: string, itemId: string | null, link: string | null, title: string, occurredAt: string | null) {
  return itemId?.trim() || link?.trim() || `${sourceId}:${title}:${occurredAt ?? "undated"}`;
}

function resolveLink(link: string | null, sourceUrl: string) {
  if (!link) return sourceUrl;

  try {
    return new URL(link, sourceUrl).toString();
  } catch {
    return sourceUrl;
  }
}

export const technologyRssSourceAdapter: SourceSignalAdapter = {
  key: "technology-rss",
  sourceType: "technology",
  async collect() {
    const candidates: SourceSignalCandidate[] = [];

    for (const source of technologySources.filter((item) => item.active)) {
      if (!source.zeroAdditionalCost || source.billingRequired) {
        continue;
      }

      try {
        const entries = (await readFeed(source.feedUrl)).slice(0, 25);

        for (const entry of entries) {
          const link = resolveLink(entry.link, source.sourceUrl);
          const sourceRef = normalizeSourceRef(
            source.id,
            entry.id,
            link,
            entry.title,
            entry.publishedAt,
          );

          candidates.push({
            sourceType: "technology",
            sourceLocator: source.id,
            sourceRef,
            fingerprint: `technology:rss:${source.id}:${sourceRef}`,
            signalType: "technology-update",
            title: entry.title,
            summary: entry.summary,
            occurredAt: entry.publishedAt,
            metadata: {
              sourceId: source.id,
              sourceName: source.name,
              provider: source.provider,
              sourceUrl: source.sourceUrl,
              feedUrl: source.feedUrl,
              itemUrl: link,
              professionalAreas: source.professionalAreas,
              priority: source.priority,
              zeroAdditionalCost: true,
              billingRequired: false,
            },
          });
        }
      } catch (error) {
        console.error(`[Opportunity Radar] No se pudo leer ${source.id} (${source.name})`, error);
      }
    }

    return candidates;
  },
};
