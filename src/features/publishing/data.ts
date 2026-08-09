import { createClient } from "@/lib/supabase/server";

const PUBLISHED_BUCKET = "content-publisher-published";

export type PublishableRender = {
  id: string;
  renderType: "png" | "pdf";
  publicUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  pageCount?: number | null;
  archetypeKey?: string | null;
  variantKey?: string | null;
};

type RenderRow = {
  id: string;
  render_type: "png" | "pdf";
  storage_path: string | null;
  status: string;
  page_count: number | null;
  render_context: unknown;
  created_at: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function outputRole(context: unknown) {
  const root = asRecord(context);
  const output = asRecord(root?.output);
  return typeof output?.role === "string" ? output.role : null;
}

function thumbnailRenderId(context: unknown) {
  const root = asRecord(context);
  const companion = asRecord(root?.companion);
  return typeof companion?.thumbnailRenderId === "string"
    ? companion.thumbnailRenderId
    : null;
}

function designSnapshot(context: unknown) {
  const root = asRecord(context);
  const design = asRecord(root?.design);

  return {
    archetypeKey:
      typeof design?.archetypeKey === "string" ? design.archetypeKey : null,
    variantKey: typeof design?.variantKey === "string" ? design.variantKey : null,
  };
}

export async function getPublishableRenders(
  publicationId: string,
): Promise<PublishableRender[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("renders")
    .select(
      "id,render_type,storage_path,status,page_count,render_context,created_at",
    )
    .eq("publication_id", publicationId)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los renders listos: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as RenderRow[];
  const byId = new Map(rows.map((row) => [row.id, row]));

  return rows
    .filter(
      (row) =>
        row.storage_path && outputRole(row.render_context) !== "document-thumbnail",
    )
    .map((row) => {
      const publicUrl = supabase.storage
        .from(PUBLISHED_BUCKET)
        .getPublicUrl(row.storage_path as string).data.publicUrl;
      const thumbnailId = thumbnailRenderId(row.render_context);
      const thumbnail = thumbnailId ? byId.get(thumbnailId) : undefined;
      const thumbnailUrl = thumbnail?.storage_path
        ? supabase.storage
            .from(PUBLISHED_BUCKET)
            .getPublicUrl(thumbnail.storage_path).data.publicUrl
        : undefined;
      const design = designSnapshot(row.render_context);

      return {
        id: row.id,
        renderType: row.render_type,
        publicUrl,
        thumbnailUrl,
        createdAt: row.created_at,
        pageCount: row.page_count,
        archetypeKey: design.archetypeKey,
        variantKey: design.variantKey,
      };
    });
}
