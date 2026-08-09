import type { SourceSignalAdapter } from "../types";

type PublicationRow = {
  id: string;
  title: string;
  topic: string | null;
  story_type: string;
  format: string;
  status: string;
  archetype_key: string | null;
  variant_key: string | null;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  published_at: string | null;
};

export const editorialHistorySourceAdapter: SourceSignalAdapter = {
  key: "editorial-history",
  sourceType: "editorial-history",
  async collect({ supabase, userId }) {
    const { data, error } = await supabase
      .from("publications")
      .select(
        "id,title,topic,story_type,format,status,archetype_key,variant_key,created_at,updated_at,scheduled_at,published_at",
      )
      .eq("user_id", userId)
      .in("status", ["scheduled", "published", "archived"])
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(
        `No se pudo leer el historial editorial como fuente: ${error.message}`,
      );
    }

    return ((data ?? []) as unknown as PublicationRow[]).map((publication) => ({
      sourceType: "editorial-history" as const,
      sourceLocator: "content-publisher/publications",
      sourceRef: publication.id,
      fingerprint: `editorial-history:${publication.id}`,
      signalType: publication.status,
      title: publication.title,
      summary: publication.topic
        ? `${publication.topic} · ${publication.story_type} · ${publication.format}`
        : `${publication.story_type} · ${publication.format}`,
      occurredAt:
        publication.published_at ??
        publication.scheduled_at ??
        publication.updated_at,
      metadata: {
        topic: publication.topic,
        storyType: publication.story_type,
        format: publication.format,
        status: publication.status,
        archetypeKey: publication.archetype_key,
        variantKey: publication.variant_key,
        createdAt: publication.created_at,
        updatedAt: publication.updated_at,
        scheduledAt: publication.scheduled_at,
        publishedAt: publication.published_at,
      },
    }));
  },
};
