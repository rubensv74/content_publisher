"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CreateIdeaState = {
  error: string | null;
  success: boolean;
};

const initialError: CreateIdeaState = { error: null, success: false };

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    return { supabase, userId: null };
  }

  return { supabase, userId };
}

export async function createIdea(
  _previousState: CreateIdeaState,
  formData: FormData,
): Promise<CreateIdeaState> {
  const title = formData.get("title");
  const topic = formData.get("topic");
  const notes = formData.get("notes");

  if (typeof title !== "string" || !title.trim()) {
    return { ...initialError, error: "La idea necesita un título." };
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return { ...initialError, error: "La sesión ya no es válida. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("ideas").insert({
    user_id: userId,
    title: title.trim(),
    topic: typeof topic === "string" && topic.trim() ? topic.trim() : null,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    source_type: "manual",
    status: "idea",
  });

  if (error) {
    return { ...initialError, error: `No se pudo guardar la idea: ${error.message}` };
  }

  revalidatePath("/ideas");
  return { error: null, success: true };
}

export async function archiveIdea(formData: FormData) {
  const ideaId = formData.get("ideaId");

  if (typeof ideaId !== "string" || !ideaId) {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  await supabase
    .from("ideas")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", ideaId)
    .eq("user_id", userId);

  revalidatePath("/ideas");
}
