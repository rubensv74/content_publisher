"use client";

import { createClient } from "@/lib/supabase/client";
import type { RenderablePublication } from "@/publication-renderer/contracts";
import type {
  FinalRenderPayload,
  FinalRenderPersistenceResult,
} from "@/publication-renderer/export/final-render";

const PUBLISHED_BUCKET = "content-publisher-published";
const RENDERER_VERSION = "browser-dom-v1";

function extensionFor(renderType: FinalRenderPayload["renderType"]) {
  return renderType === "png" ? "png" : "pdf";
}

function contentTypeFor(renderType: FinalRenderPayload["renderType"]) {
  return renderType === "png" ? "image/png" : "application/pdf";
}

export async function persistFinalRender(
  publication: RenderablePublication,
  payload: FinalRenderPayload,
): Promise<FinalRenderPersistenceResult> {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    throw new Error("La sesión no es válida. Vuelve a iniciar sesión antes de guardar el render final.");
  }

  const renderId = crypto.randomUUID();
  const thumbnailRenderId = payload.companionThumbnail
    ? crypto.randomUUID()
    : undefined;
  const extension = extensionFor(payload.renderType);
  const storagePath = `${user.id}/${publication.id}/${renderId}.${extension}`;
  const thumbnailStoragePath = thumbnailRenderId
    ? `${user.id}/${publication.id}/${thumbnailRenderId}.png`
    : undefined;
  const exportedAt = new Date().toISOString();

  const publicationSnapshot = {
    id: publication.id,
    title: publication.title,
    storyType: publication.storyType,
    format: publication.format,
    structuredContent: publication.structuredContent,
    contentSchemaVersion: publication.contentSchemaVersion,
  };

  const designSnapshot = {
    archetypeKey: publication.archetypeKey,
    archetypeVersion: publication.archetypeVersion,
    variantKey: publication.variantKey,
  };

  const assetSnapshot = publication.assets.map((asset) => ({
    id: asset.id,
    role: asset.role,
    alt: asset.alt ?? null,
    metadata: asset.metadata ?? {},
  }));

  const renderContext = {
    rendererVersion: RENDERER_VERSION,
    exportedAt,
    publication: publicationSnapshot,
    design: designSnapshot,
    identity: publication.identity,
    assets: assetSnapshot,
    output: {
      renderType: payload.renderType,
      width: payload.width,
      height: payload.height,
      pageCount: payload.pageCount,
    },
    companion: thumbnailRenderId
      ? {
          thumbnailRenderId,
        }
      : undefined,
  };

  const { error: pendingError } = await supabase.from("renders").insert({
    id: renderId,
    user_id: user.id,
    publication_id: publication.id,
    render_type: payload.renderType,
    storage_path: storagePath,
    status: "pending",
    width: payload.width,
    height: payload.height,
    page_count: payload.pageCount,
    render_context: renderContext,
  });

  if (pendingError) {
    throw new Error(`No se pudo registrar el render: ${pendingError.message}`);
  }

  if (payload.companionThumbnail && thumbnailRenderId && thumbnailStoragePath) {
    const thumbnailContext = {
      rendererVersion: RENDERER_VERSION,
      exportedAt,
      publication: publicationSnapshot,
      design: designSnapshot,
      identity: publication.identity,
      assets: assetSnapshot,
      output: {
        renderType: "png",
        role: "document-thumbnail",
        width: payload.companionThumbnail.width,
        height: payload.companionThumbnail.height,
        pageCount: 1,
      },
      companion: {
        parentRenderId: renderId,
      },
    };

    const { error: thumbnailPendingError } = await supabase
      .from("renders")
      .insert({
        id: thumbnailRenderId,
        user_id: user.id,
        publication_id: publication.id,
        render_type: "png",
        storage_path: thumbnailStoragePath,
        status: "pending",
        width: payload.companionThumbnail.width,
        height: payload.companionThumbnail.height,
        page_count: 1,
        render_context: thumbnailContext,
      });

    if (thumbnailPendingError) {
      await supabase
        .from("renders")
        .update({ status: "failed" })
        .eq("id", renderId)
        .eq("user_id", user.id);

      throw new Error(
        `No se pudo registrar la miniatura del documento: ${thumbnailPendingError.message}`,
      );
    }
  }

  const { error: uploadError } = await supabase.storage
    .from(PUBLISHED_BUCKET)
    .upload(storagePath, payload.blob, {
      cacheControl: "31536000",
      contentType: contentTypeFor(payload.renderType),
      upsert: false,
    });

  if (uploadError) {
    const failedIds = [renderId, thumbnailRenderId].filter(
      (id): id is string => Boolean(id),
    );

    await supabase
      .from("renders")
      .update({ status: "failed" })
      .in("id", failedIds)
      .eq("user_id", user.id);

    throw new Error(`No se pudo subir el render final: ${uploadError.message}`);
  }

  if (payload.companionThumbnail && thumbnailRenderId && thumbnailStoragePath) {
    const { error: thumbnailUploadError } = await supabase.storage
      .from(PUBLISHED_BUCKET)
      .upload(thumbnailStoragePath, payload.companionThumbnail.blob, {
        cacheControl: "31536000",
        contentType: "image/png",
        upsert: false,
      });

    if (thumbnailUploadError) {
      await supabase.storage.from(PUBLISHED_BUCKET).remove([storagePath]);
      await supabase
        .from("renders")
        .update({ status: "failed" })
        .in("id", [renderId, thumbnailRenderId])
        .eq("user_id", user.id);

      throw new Error(
        `No se pudo subir la miniatura del documento: ${thumbnailUploadError.message}`,
      );
    }
  }

  const readyIds = [renderId, thumbnailRenderId].filter(
    (id): id is string => Boolean(id),
  );
  const { error: readyError } = await supabase
    .from("renders")
    .update({ status: "ready" })
    .in("id", readyIds)
    .eq("user_id", user.id);

  if (readyError) {
    const storagePaths = [storagePath, thumbnailStoragePath].filter(
      (path): path is string => Boolean(path),
    );

    await supabase.storage.from(PUBLISHED_BUCKET).remove(storagePaths);
    await supabase
      .from("renders")
      .update({ status: "failed" })
      .in("id", readyIds)
      .eq("user_id", user.id);

    throw new Error(`El archivo se generó, pero no pudo marcarse como listo: ${readyError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PUBLISHED_BUCKET)
    .getPublicUrl(storagePath);
  const thumbnailUrl = thumbnailStoragePath
    ? supabase.storage.from(PUBLISHED_BUCKET).getPublicUrl(thumbnailStoragePath)
        .data.publicUrl
    : undefined;

  if (!publicUrlData.publicUrl.startsWith("https://")) {
    throw new Error("El render final no obtuvo una URL HTTPS válida.");
  }

  if (thumbnailUrl && !thumbnailUrl.startsWith("https://")) {
    throw new Error("La miniatura del documento no obtuvo una URL HTTPS válida.");
  }

  return {
    renderId,
    publicUrl: publicUrlData.publicUrl,
    thumbnailRenderId,
    thumbnailUrl,
  };
}
