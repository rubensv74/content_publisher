"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const ALLOWED_ASSET_ROLES = ["hero", "before", "after"] as const;
type AllowedAssetRole = (typeof ALLOWED_ASSET_ROLES)[number];

function isAllowedRole(value: FormDataEntryValue | null): value is AllowedAssetRole {
  return (
    typeof value === "string" &&
    (ALLOWED_ASSET_ROLES as readonly string[]).includes(value)
  );
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

async function replacePublicationAssetRole(
  publicationId: string,
  assetId: string,
  role: AllowedAssetRole,
) {
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
    .eq("role", role);

  if (removeError) {
    throw new Error(`No se pudo reemplazar el recurso anterior: ${removeError.message}`);
  }

  const { error: insertError } = await supabase.from("publication_assets").insert({
    user_id: userId,
    publication_id: publicationId,
    asset_id: assetId,
    role,
    sort_order: role === "after" ? 1 : 0,
    usage_config: {},
  });

  if (insertError) {
    throw new Error(`No se pudo asociar el recurso: ${insertError.message}`);
  }

  revalidatePath(`/publications/${publicationId}/studio`);
}

async function removePublicationAssetRoleByName(
  publicationId: string,
  role: AllowedAssetRole,
) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("publication_assets")
    .delete()
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .eq("role", role);

  if (error) {
    throw new Error(`No se pudo retirar el recurso: ${error.message}`);
  }

  revalidatePath(`/publications/${publicationId}/studio`);
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

  await replacePublicationAssetRole(publicationId, assetId, "hero");
}

export async function removePublicationHeroAsset(formData: FormData) {
  const publicationId = formData.get("publicationId");

  if (typeof publicationId !== "string" || !publicationId) {
    throw new Error("No se ha indicado la publicación.");
  }

  await removePublicationAssetRoleByName(publicationId, "hero");
}

export async function setPublicationAssetRole(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const assetId = formData.get("assetId");
  const role = formData.get("role");

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    typeof assetId !== "string" ||
    !assetId ||
    !isAllowedRole(role)
  ) {
    throw new Error("Selecciona una publicación, recurso y rol válidos.");
  }

  await replacePublicationAssetRole(publicationId, assetId, role);
}

export async function removePublicationAssetRole(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const role = formData.get("role");

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    !isAllowedRole(role)
  ) {
    throw new Error("No se ha indicado una publicación o rol válido.");
  }

  await removePublicationAssetRoleByName(publicationId, role);
}
