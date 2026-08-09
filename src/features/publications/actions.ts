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
import { getArchetypeDefinition } from "@/publication-renderer/archetypes/registry";

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
    result: optionalText(formData.get("result")),
    learning: optionalText(formData.get("learning")),
    insight: optionalText(formData.get("insight")),
    cta: optionalText(formData.get("cta")),
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
  redirect(`/publications/${publicationId}/studio?saved=content`);
}

export async function selectPublicationDesign(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const archetypeKey = formData.get("archetypeKey");
  const variantKey = formData.get("variantKey");
  const archetypeVersion = Number(formData.get("archetypeVersion"));

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    typeof archetypeKey !== "string" ||
    !archetypeKey ||
    typeof variantKey !== "string" ||
    !variantKey ||
    !Number.isInteger(archetypeVersion) ||
    archetypeVersion < 1
  ) {
    redirect("/publications");
  }

  const definition = getArchetypeDefinition(archetypeKey);

  if (
    !definition ||
    definition.version !== archetypeVersion ||
    !definition.variants.includes(variantKey)
  ) {
    throw new Error("El diseño seleccionado no pertenece a la biblioteca activa.");
  }

  const { supabase, userId } = await getAuthenticatedContext();
  const { data: publication, error: publicationError } = await supabase
    .from("publications")
    .select("format,story_type")
    .eq("id", publicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (publicationError || !publication) {
    throw new Error(
      `No se pudo validar la publicación: ${publicationError?.message ?? "no encontrada"}`,
    );
  }

  const formatCompatible = definition.supportedFormats.includes(
    publication.format as PublicationFormat,
  );
  const storyCompatible =
    !definition.supportedStoryTypes ||
    definition.supportedStoryTypes.includes(publication.story_type as StoryTypeKey);

  if (!formatCompatible || !storyCompatible) {
    throw new Error("El diseño no es compatible con el formato o la historia seleccionados.");
  }

  const { error } = await supabase
    .from("publications")
    .update({
      archetype_key: archetypeKey,
      archetype_version: archetypeVersion,
      variant_key: variantKey,
    })
    .eq("id", publicationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo guardar el diseño: ${error.message}`);
  }

  revalidatePath("/publications");
  revalidatePath(`/publications/${publicationId}/studio`);
  redirect(`/publications/${publicationId}/studio?saved=design`);
}
