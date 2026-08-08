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
  const extension = extensionFor(payload.renderType);
  const storagePath = `${user.id}/${publication.id}/${renderId}.${extension}`;

  const renderContext = {
    rendererVersion: RENDERER_VERSION,
    exportedAt: new Date().toISOString(),
    publication: {
      id: publication.id,
      title: publication.title,
      storyType: publication.storyType,
      format: publication.format,
      structuredContent: publication.structuredContent,
      contentSchemaVersion: publication.contentSchemaVersion,
    },
    design: {
      archetypeKey: publication.archetypeKey,
      archetypeVersion: publication.archetypeVersion,
      variantKey: publication.variantKey,
    },
    identity: publication.identity,
    output: {
      renderType: payload.renderType,
      width: payload.width,
      height: payload.height,
      pageCount: payload.pageCount,
    },
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

  const { error: uploadError } = await supabase.storage
    .from(PUBLISHED_BUCKET)
    .upload(storagePath, payload.blob, {
      cacheControl: "31536000",
      contentType: contentTypeFor(payload.renderType),
      upsert: false,
    });

  if (uploadError) {
    await supabase
      .from("renders")
      .update({ status: "failed" })
      .eq("id", renderId)
      .eq("user_id", user.id);

    throw new Error(`No se pudo subir el render final: ${uploadError.message}`);
  }

  const { error: readyError } = await supabase
    .from("renders")
    .update({ status: "ready" })
    .eq("id", renderId)
    .eq("user_id", user.id);

  if (readyError) {
    await supabase.storage.from(PUBLISHED_BUCKET).remove([storagePath]);
    await supabase
      .from("renders")
      .update({ status: "failed" })
      .eq("id", renderId)
      .eq("user_id", user.id);

    throw new Error(`El archivo se generó, pero no pudo marcarse como listo: ${readyError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PUBLISHED_BUCKET)
    .getPublicUrl(storagePath);

  if (!publicUrlData.publicUrl.startsWith("https://")) {
    throw new Error("El render final no obtuvo una URL HTTPS válida.");
  }

  return {
    renderId,
    publicUrl: publicUrlData.publicUrl,
  };
}
