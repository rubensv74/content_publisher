export type FinalRenderType = "png" | "pdf";

export type CompanionThumbnailPayload = {
  blob: Blob;
  width: number;
  height: number;
};

export type FinalRenderPayload = {
  blob: Blob;
  renderType: FinalRenderType;
  width: number;
  height: number;
  pageCount: number;
  companionThumbnail?: CompanionThumbnailPayload;
};

export type FinalRenderPersistenceResult = {
  renderId: string;
  publicUrl: string;
  thumbnailRenderId?: string;
  thumbnailUrl?: string;
};

export type FinalRenderPersistenceHandler = (
  payload: FinalRenderPayload,
) => Promise<FinalRenderPersistenceResult>;
