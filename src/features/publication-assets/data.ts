import { createClient } from "@/lib/supabase/server";
import type { PublicationAsset } from "@/publication-renderer/contracts";

type RelationRow = {
  id: string;
  asset_id: string;
  role: string;
  sort_order: number;
  usage_config: Record<string, unknown>;
};

type AssetRow = {
  id: string;
  storage_path: string;
  mime_type: string;
  original_filename: string;
  width: number | null;
  height: number | null;
};

export async function getPublicationAssets(
  publicationId: string,
): Promise<PublicationAsset[]> {
  const supabase = await createClient();
  const { data: relationData, error: relationError } = await supabase
    .from("publication_assets")
    .select("id,asset_id,role,sort_order,usage_config")
    .eq("publication_id", publicationId)
    .order("sort_order", { ascending: true });

  if (relationError) {
    throw new Error(
      `No se pudieron cargar los recursos de la publicación: ${relationError.message}`,
    );
  }

  const relations = (relationData ?? []) as unknown as RelationRow[];
  if (relations.length === 0) return [];

  const assetIds = relations.map((relation) => relation.asset_id);
  const { data: assetData, error: assetError } = await supabase
    .from("assets")
    .select("id,storage_path,mime_type,original_filename,width,height")
    .in("id", assetIds);

  if (assetError) {
    throw new Error(`No se pudieron cargar los archivos asociados: ${assetError.message}`);
  }

  const assets = (assetData ?? []) as unknown as AssetRow[];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  const result = await Promise.all(
    relations.map(async (relation) => {
      const asset = assetById.get(relation.asset_id);
      if (!asset) return null;

      const { data: signed, error: signedError } = await supabase.storage
        .from("content-publisher")
        .createSignedUrl(asset.storage_path, 60 * 60);

      if (signedError || !signed?.signedUrl) return null;

      return {
        id: asset.id,
        role: relation.role,
        url: signed.signedUrl,
        alt: asset.original_filename,
        metadata: {
          relationId: relation.id,
          sortOrder: relation.sort_order,
          usageConfig: relation.usage_config,
          mimeType: asset.mime_type,
          width: asset.width,
          height: asset.height,
        },
      } satisfies PublicationAsset;
    }),
  );

  return result.filter((asset): asset is PublicationAsset => asset !== null);
}
