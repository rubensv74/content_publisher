import { createClient } from "@/lib/supabase/server";

import type { IdeaRecord } from "./types";

const ideaSelect =
  "id,title,notes,topic,source_type,source_ref,priority,status,created_at,updated_at,archived_at";

export async function getIdeas(): Promise<IdeaRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las ideas: ${error.message}`);
  }

  return (data ?? []) as IdeaRecord[];
}

export async function getIdea(ideaId: string): Promise<IdeaRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaSelect)
    .eq("id", ideaId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la idea: ${error.message}`);
  }

  return (data as IdeaRecord | null) ?? null;
}
