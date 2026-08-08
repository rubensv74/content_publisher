export type FinalRenderType = "png" | "pdf";

export type FinalRenderPayload = {
  blob: Blob;
  renderType: FinalRenderType;
  width: number;
  height: number;
  pageCount: number;
};

export type FinalRenderPersistenceResult = {
  renderId: string;
  publicUrl: string;
};

export type FinalRenderPersistenceHandler = (
  payload: FinalRenderPayload,
) => Promise<FinalRenderPersistenceResult>;
