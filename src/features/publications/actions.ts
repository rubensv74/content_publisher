"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  PUBLICATION_FORMATS,
  STORY_TYPE_KEYS,
  type PublicationFormat,
  type StoryTypeKey,
} from "@/domain/content";
import { createClient } from "@/lib/supabase/server";

import type { PublicationStoryContent } from "./types";

function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isStoryType(value: FormDataEntryValue | null): value is StoryTypeKey {
  return (
    typeof value === "string" &&
    (STORY_TYPE_KEYS as readonly string[]).includes(value)
  );
}

function isPublicationFormat(
  value: FormDataEntryValue | null,
): value is PublicationFormat {
  return (
    typeof value === "string" &&
    (PUBLICATION_FORMATS as readonly string[]).includes(value)
  );
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

function storyContentFromForm(formData: FormData): PublicationStoryContent {
  return {
    problem: optionalText(formData.get("problem")),
    attempts: optionalText(formData.get("attempts")),
    solution: optionalText(formData.get("solution")),
    learning: optionalText(formData.get("learning")),
    insight: optionalText(formData.get("insight")),
  };
}

export async function createPublicationFromIdea(formData: FormData) {
  const ideaId = formData.get("ideaId");
  const title = formData.get("title");
  const storyType = formData.get("storyType");
  const format = formData.get("format");

  if (
    typeof ideaId !== "string" ||
    !ideaId ||
    typeof title !== "string" ||
    !title.trim() ||
    !isStoryType(storyType) ||
    !isPublicationFormat(format)
  ) {
    redirect("/ideas");
  }

  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("publications")
    .insert({
      user_id: userId,
      source_idea_id: ideaId,
      title: title.trim(),
      topic: optionalText(formData.get("topic")),
      story_type: storyType,
      format,
      status: "draft",
      structured_content: storyContentFromForm(formData),
      content_schema_version: 1,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `No se pudo crear la publicación: ${error?.message ?? "respuesta vacía"}`,
    );
  }

  const { error: ideaError } = await supabase
    .from("ideas")
    .update({ status: "converted" })
    .eq("id", ideaId)
    .eq("user_id", userId);

  if (ideaError) {
    throw new Error(
      `La publicación se creó, pero no se pudo actualizar la idea: ${ideaError.message}`,
    );
  }

  revalidatePath("/ideas");
  revalidatePath("/publications");
  redirect(`/publications/${data.id}/studio`);
}

export async function updatePublicationStory(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const title = formData.get("title");

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    redirect("/publications");
  }

  const { supabase, userId } = await getAuthenticatedContext();
  const { error } = await supabase
    .from("publications")
    .update({
      title: title.trim(),
      topic: optionalText(formData.get("topic")),
      structured_content: storyContentFromForm(formData),
      linkedin_text: optionalText(formData.get("linkedinText")),
    })
    .eq("id", publicationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo guardar la publicación: ${error.message}`);
  }

  revalidatePath("/publications");
  revalidatePath(`/publications/${publicationId}/studio`);
}
