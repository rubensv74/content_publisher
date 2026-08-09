"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function deleteVisualAsset(formData: FormData) {
  const assetId = formData.get("assetId");

  if (typeof assetId !== "string" || !assetId) {
    throw new Error("No se ha indicado el recurso que debe eliminarse.");
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id,storage_path")
    .eq("id", assetId)
    .eq("user_id", userId)
    .maybeSingle();

  if (assetError || !asset) {
    throw new Error(
      `No se pudo localizar el recurso: ${assetError?.message ?? "no encontrado"}`,
    );
  }

  const { error: deleteRecordError } = await supabase
    .from("assets")
    .delete()
    .eq("id", asset.id)
    .eq("user_id", userId);

  if (deleteRecordError) {
    throw new Error(`No se pudo eliminar el recurso: ${deleteRecordError.message}`);
  }

  const { error: storageError } = await supabase.storage
    .from("content-publisher")
    .remove([asset.storage_path]);

  if (storageError) {
    console.error("Asset storage cleanup failed", storageError.message);
  }

  revalidatePath("/assets");
}
