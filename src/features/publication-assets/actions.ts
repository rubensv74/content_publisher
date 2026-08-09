"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

async function touchPublication(
  supabase: Awaited<ReturnType<typeof createClient>>,
  publicationId: string,
  userId: string,
) {
  const { error } = await supabase
    .from("publications")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", publicationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `El recurso cambió, pero no se pudo invalidar el render anterior: ${error.message}`,
    );
  }
}

export async function setPublicationHeroAsset(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const assetId = formData.get("assetId");

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    typeof assetId !== "string" ||
    !assetId
  ) {
    throw new Error("Selecciona una publicación y un recurso válidos.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const [{ data: publication }, { data: asset }] = await Promise.all([
    supabase
      .from("publications")
      .select("id")
      .eq("id", publicationId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("assets")
      .select("id")
      .eq("id", assetId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!publication || !asset) {
    throw new Error("La publicación o el recurso seleccionado no están disponibles.");
  }

  const { error: removeError } = await supabase
    .from("publication_assets")
    .delete()
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .eq("role", "hero");

  if (removeError) {
    throw new Error(`No se pudo reemplazar el recurso anterior: ${removeError.message}`);
  }

  const { error: insertError } = await supabase.from("publication_assets").insert({
    user_id: userId,
    publication_id: publicationId,
    asset_id: assetId,
    role: "hero",
    sort_order: 0,
    usage_config: {},
  });

  if (insertError) {
    throw new Error(`No se pudo asociar el recurso: ${insertError.message}`);
  }

  await touchPublication(supabase, publicationId, userId);
  revalidatePath(`/publications/${publicationId}/studio`);
}

export async function removePublicationHeroAsset(formData: FormData) {
  const publicationId = formData.get("publicationId");

  if (typeof publicationId !== "string" || !publicationId) {
    throw new Error("No se ha indicado la publicación.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("publication_assets")
    .delete()
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .eq("role", "hero");

  if (error) {
    throw new Error(`No se pudo retirar el recurso: ${error.message}`);
  }

  await touchPublication(supabase, publicationId, userId);
  revalidatePath(`/publications/${publicationId}/studio`);
}
