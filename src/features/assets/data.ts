import { createClient } from "@/lib/supabase/server";

import type { VisualAssetRecord } from "./types";

const assetSelect =
  "id,storage_path,asset_type,mime_type,original_filename,width,height,file_size,metadata,created_at";

export async function getVisualAssets(): Promise<VisualAssetRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select(assetSelect)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron cargar los recursos: ${error.message}`);
  }

  const assets = (data ?? []) as Omit<VisualAssetRecord, "previewUrl">[];

  return Promise.all(
    assets.map(async (asset) => {
      const { data: signed } = await supabase.storage
        .from("content-publisher")
        .createSignedUrl(asset.storage_path, 60 * 60);

      return {
        ...asset,
        previewUrl: signed?.signedUrl ?? null,
      };
    }),
  );
}
