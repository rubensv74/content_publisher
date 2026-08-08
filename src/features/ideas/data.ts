import { createClient } from "@/lib/supabase/server";

import type { IdeaRecord } from "./types";

export async function getIdeas(): Promise<IdeaRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select(
      "id,title,notes,topic,source_type,source_ref,priority,status,created_at,updated_at,archived_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar las ideas: ${error.message}`);
  }

  return (data ?? []) as IdeaRecord[];
}
