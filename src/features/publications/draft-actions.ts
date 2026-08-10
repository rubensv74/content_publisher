"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function redirectWithError(message: string): never {
  const params = new URLSearchParams({ deleteError: message.slice(0, 220) });
  redirect(`/publications?${params.toString()}`);
}

export async function deleteDraftPublicationAction(formData: FormData) {
  const publicationId = formData.get("publicationId");

  if (typeof publicationId !== "string" || !publicationId) {
    redirectWithError("No se pudo identificar el borrador.");
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { data: publication, error: publicationError } = await supabase
    .from("publications")
    .select("id,status,source_idea_id")
    .eq("id", publicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (publicationError || !publication) {
    redirectWithError("El borrador no existe o ya ha sido eliminado.");
  }

  if (publication.status !== "draft") {
    redirectWithError("Solo se pueden eliminar publicaciones que sigan en estado draft.");
  }

  const { data: jobs, error: jobsError } = await supabase
    .from("publishing_jobs")
    .select("id")
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .limit(1);

  if (jobsError) {
    redirectWithError("No se pudo comprobar el historial de publicación del borrador.");
  }

  if ((jobs ?? []).length > 0) {
    redirectWithError(
      "Este borrador tiene actividad registrada en Buffer y no puede eliminarse desde esta pantalla.",
    );
  }

  const { data: renders, error: rendersError } = await supabase
    .from("renders")
    .select("id")
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .limit(1);

  if (rendersError) {
    redirectWithError("No se pudo comprobar si el borrador tiene renders asociados.");
  }

  if ((renders ?? []).length > 0) {
    redirectWithError(
      "Este borrador ya tiene renders asociados. Debe limpiarse desde Content Studio para no dejar archivos huérfanos.",
    );
  }

  const sourceIdeaId = publication.source_idea_id as string | null;
  const { error: deleteError } = await supabase
    .from("publications")
    .delete()
    .eq("id", publicationId)
    .eq("user_id", userId)
    .eq("status", "draft");

  if (deleteError) {
    redirectWithError(`No se pudo eliminar el borrador: ${deleteError.message}`);
  }

  if (sourceIdeaId) {
    const { data: remainingPublications, error: remainingError } = await supabase
      .from("publications")
      .select("id")
      .eq("source_idea_id", sourceIdeaId)
      .eq("user_id", userId)
      .limit(1);

    if (!remainingError && (remainingPublications ?? []).length === 0) {
      await supabase
        .from("ideas")
        .update({ status: "idea" })
        .eq("id", sourceIdeaId)
        .eq("user_id", userId)
        .eq("status", "converted");
    }
  }

  revalidatePath("/ideas");
  revalidatePath("/publications");
  redirect("/publications?deleted=1");
}
