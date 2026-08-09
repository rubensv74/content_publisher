import { createClient } from "@/lib/supabase/server";

import type { PublicationRecord } from "./types";

const publicationSelect = [
  "id",
  "source_idea_id",
  "title",
  "topic",
  "story_type",
  "format",
  "status",
  "structured_content",
  "visual_config",
  "content_schema_version",
  "linkedin_text",
  "archetype_key",
  "archetype_version",
  "variant_key",
  "created_at",
  "updated_at",
  "scheduled_at",
  "published_at",
].join(",");

export async function getPublications(): Promise<PublicationRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publications")
    .select(publicationSelect)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las publicaciones: ${error.message}`);
  }

  return (data ?? []) as unknown as PublicationRecord[];
}

export async function getPublication(
  publicationId: string,
): Promise<PublicationRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publications")
    .select(publicationSelect)
    .eq("id", publicationId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la publicación: ${error.message}`);
  }

  return (data as unknown as PublicationRecord | null) ?? null;
}
