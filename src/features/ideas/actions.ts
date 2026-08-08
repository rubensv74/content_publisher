"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function createIdea(
  _previousState: CreateIdeaState,
  formData: FormData,
): Promise<CreateIdeaState> {
  const title = formData.get("title");

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
    topic: optionalText(formData.get("topic")),
    notes: optionalText(formData.get("notes")),
    source_type: "manual",
    status: "idea",
  });

  if (error) {
    return { ...initialError, error: `No se pudo guardar la idea: ${error.message}` };
  }

  revalidatePath("/ideas");
  return { error: null, success: true };
}

export async function updateIdea(formData: FormData) {
  const ideaId = formData.get("ideaId");
  const title = formData.get("title");

  if (
    typeof ideaId !== "string" ||
    !ideaId ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    redirect("/ideas");
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("ideas")
    .update({
      title: title.trim(),
      topic: optionalText(formData.get("topic")),
      notes: optionalText(formData.get("notes")),
    })
    .eq("id", ideaId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo actualizar la idea: ${error.message}`);
  }

  revalidatePath("/ideas");
  redirect("/ideas");
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

  const { error } = await supabase
    .from("ideas")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", ideaId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo archivar la idea: ${error.message}`);
  }

  revalidatePath("/ideas");
}

export async function deleteIdea(formData: FormData) {
  const ideaId = formData.get("ideaId");

  if (typeof ideaId !== "string" || !ideaId) {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", ideaId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo eliminar la idea: ${error.message}`);
  }

  revalidatePath("/ideas");
}
