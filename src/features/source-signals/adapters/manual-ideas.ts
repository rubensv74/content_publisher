import type { SourceSignalAdapter } from "../types";

type IdeaRow = {
  id: string;
  title: string;
  notes: string | null;
  topic: string | null;
  source_type: string;
  source_ref: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const manualIdeasSourceAdapter: SourceSignalAdapter = {
  key: "manual-ideas",
  sourceType: "manual-idea",
  async collect({ supabase, userId }) {
    const { data, error } = await supabase
      .from("ideas")
      .select(
        "id,title,notes,topic,source_type,source_ref,priority,status,created_at,updated_at",
      )
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`No se pudieron leer las ideas como fuente: ${error.message}`);
    }

    return ((data ?? []) as unknown as IdeaRow[]).map((idea) => ({
      sourceType: "manual-idea" as const,
      sourceLocator: "content-publisher/ideas",
      sourceRef: idea.id,
      fingerprint: `manual-idea:${idea.id}`,
      signalType: "idea",
      title: idea.title,
      summary: idea.notes?.trim() || null,
      occurredAt: idea.updated_at,
      metadata: {
        topic: idea.topic,
        priority: idea.priority,
        status: idea.status,
        originalSourceType: idea.source_type,
        originalSourceRef: idea.source_ref,
        createdAt: idea.created_at,
        updatedAt: idea.updated_at,
      },
    }));
  },
};
