export type VisualAssetRecord = {
  id: string;
  storage_path: string;
  asset_type: string;
  mime_type: string;
  original_filename: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  previewUrl: string | null;
};
