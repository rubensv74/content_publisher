type FeedEntry = {
  id: string | null;
  title: string;
  link: string | null;
  summary: string | null;
  publishedAt: string | null;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function stripMarkup(value: string) {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tagValue(block: string, names: string[]) {
  for (const name of names) {
    const pattern = new RegExp(
      `<${escapeRegExp(name)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegExp(name)}>`,
      "i",
    );
    const match = block.match(pattern);
    if (match?.[1]) return decodeXml(match[1]);
  }

  return null;
}

function atomLink(block: string) {
  const alternate = block.match(/<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
  if (alternate?.[1]) return decodeXml(alternate[1]);

  const anyLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return anyLink?.[1] ? decodeXml(anyLink[1]) : null;
}

function toIsoDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeSummary(value: string | null) {
  if (!value) return null;
  const summary = stripMarkup(value);
  return summary ? summary.slice(0, 700) : null;
}

function parseRssItems(xml: string): FeedEntry[] {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => {
    const block = match[0];
    return {
      id: tagValue(block, ["guid", "id"]),
      title: stripMarkup(tagValue(block, ["title"]) ?? "Actualización tecnológica"),
      link: tagValue(block, ["link"]),
      summary: normalizeSummary(tagValue(block, ["description", "summary", "content:encoded"])),
      publishedAt: toIsoDate(tagValue(block, ["pubDate", "published", "updated", "dc:date"])),
    };
  });
}

function parseAtomEntries(xml: string): FeedEntry[] {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => {
    const block = match[0];
    return {
      id: tagValue(block, ["id"]),
      title: stripMarkup(tagValue(block, ["title"]) ?? "Actualización tecnológica"),
      link: atomLink(block),
      summary: normalizeSummary(tagValue(block, ["summary", "content"])),
      publishedAt: toIsoDate(tagValue(block, ["published", "updated"])),
    };
  });
}

export function parseFeed(xml: string) {
  const rssItems = parseRssItems(xml);
  if (rssItems.length > 0) return rssItems;
  return parseAtomEntries(xml);
}

export async function readFeed(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      "User-Agent": "ContentPublisher-OpportunityRadar/1.0",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Feed ${url} respondió HTTP ${response.status}`);
  }

  const xml = await response.text();
  const entries = parseFeed(xml);

  if (entries.length === 0) {
    throw new Error(`Feed ${url} no contiene items RSS/Atom reconocibles`);
  }

  return entries;
}
