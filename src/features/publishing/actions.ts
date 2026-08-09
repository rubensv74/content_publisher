"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createBufferPost, type BufferPublishAction } from "@/lib/publishing/buffer/post";
import { getBufferConnectionStatus } from "@/lib/publishing/buffer/account";
import { createClient } from "@/lib/supabase/server";

import { getPublishableRenders } from "./data";

function isPublishAction(value: FormDataEntryValue | null): value is BufferPublishAction {
  return (
    value === "publish-now" || value === "schedule" || value === "draft"
  );
}

async function assertPublicUrl(url: string) {
  if (!url.startsWith("https://")) {
    throw new Error("El render no dispone de una URL HTTPS publicable.");
  }

  const response = await fetch(url, {
    method: "HEAD",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `El recurso público no está disponible para Buffer (HTTP ${response.status}).`,
    );
  }
}

export async function publishPublication(formData: FormData) {
  const publicationId = formData.get("publicationId");
  const renderId = formData.get("renderId");
  const channelId = formData.get("channelId");
  const action = formData.get("publishAction");
  const scheduledForValue = formData.get("scheduledFor");

  if (
    typeof publicationId !== "string" ||
    !publicationId ||
    typeof renderId !== "string" ||
    !renderId ||
    typeof channelId !== "string" ||
    !channelId ||
    !isPublishAction(action)
  ) {
    throw new Error("Faltan datos obligatorios para crear el trabajo de publicación.");
  }

  let scheduledFor: string | undefined;

  if (action === "schedule") {
    if (
      typeof scheduledForValue !== "string" ||
      !scheduledForValue ||
      Number.isNaN(Date.parse(scheduledForValue))
    ) {
      throw new Error("Selecciona una fecha y hora válida para programar.");
    }

    scheduledFor = new Date(scheduledForValue).toISOString();

    if (Date.parse(scheduledFor) <= Date.now()) {
      throw new Error("La fecha programada debe estar en el futuro.");
    }
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const [{ data: publication, error: publicationError }, renders, bufferStatus] =
    await Promise.all([
      supabase
        .from("publications")
        .select("id,title,linkedin_text")
        .eq("id", publicationId)
        .eq("user_id", userId)
        .maybeSingle(),
      getPublishableRenders(publicationId),
      getBufferConnectionStatus(),
    ]);

  if (publicationError || !publication) {
    throw new Error(
      `No se pudo cargar la publicación: ${publicationError?.message ?? "no encontrada"}`,
    );
  }

  if (!bufferStatus.connected) {
    throw new Error(
      bufferStatus.error ||
        "Buffer no está conectado. Configura BUFFER_API_KEY en el servidor.",
    );
  }

  const channel = bufferStatus.linkedinChannels.find(
    (candidate) => candidate.id === channelId,
  );

  if (!channel || channel.isDisconnected || channel.isLocked) {
    throw new Error("El canal LinkedIn seleccionado no está disponible en Buffer.");
  }

  const render = renders.find((candidate) => candidate.id === renderId);

  if (!render) {
    throw new Error("El render seleccionado no existe o todavía no está listo.");
  }

  await assertPublicUrl(render.publicUrl);

  if (render.renderType === "pdf") {
    if (!render.thumbnailUrl) {
      throw new Error(
        "Este PDF no tiene miniatura pública. Genera de nuevo el render final del carrusel.",
      );
    }

    await assertPublicUrl(render.thumbnailUrl);
  }

  const { data: job, error: jobError } = await supabase
    .from("publishing_jobs")
    .insert({
      user_id: userId,
      publication_id: publicationId,
      render_id: renderId,
      destination: "linkedin",
      provider: "buffer",
      action,
      status: "pending",
      scheduled_for: scheduledFor ?? null,
      provider_payload: {
        channelId,
        renderType: render.renderType,
      },
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error(
      `No se pudo registrar el trabajo de publicación: ${jobError?.message ?? "respuesta vacía"}`,
    );
  }

  try {
    const post = await createBufferPost({
      channelId,
      text: publication.linkedin_text?.trim() ?? "",
      action,
      scheduledFor,
      media:
        render.renderType === "png"
          ? {
              kind: "image",
              url: render.publicUrl,
            }
          : {
              kind: "document",
              url: render.publicUrl,
              thumbnailUrl: render.thumbnailUrl as string,
              title: publication.title,
            },
    });

    const jobStatus = action === "schedule" ? "scheduled" : "sent";
    const completedAt = new Date().toISOString();
    const { error: completeError } = await supabase
      .from("publishing_jobs")
      .update({
        status: jobStatus,
        external_id: post.id,
        external_url: post.externalLink ?? null,
        completed_at: completedAt,
        provider_payload: {
          channelId,
          channelName: channel.displayName || channel.name,
          organizationId: channel.organizationId,
          renderType: render.renderType,
          renderUrl: render.publicUrl,
          thumbnailUrl: render.thumbnailUrl ?? null,
          bufferStatus: post.status ?? null,
          shareMode: post.shareMode ?? null,
          dueAt: post.dueAt ?? null,
        },
      })
      .eq("id", job.id)
      .eq("user_id", userId);

    if (completeError) {
      throw new Error(
        `Buffer aceptó la publicación, pero no se pudo actualizar el historial local: ${completeError.message}`,
      );
    }

    if (action === "schedule") {
      await supabase
        .from("publications")
        .update({ status: "scheduled", scheduled_at: scheduledFor })
        .eq("id", publicationId)
        .eq("user_id", userId);
    } else if (action === "publish-now" && post.status === "sent") {
      await supabase
        .from("publications")
        .update({ status: "published", published_at: completedAt })
        .eq("id", publicationId)
        .eq("user_id", userId);
    }

    revalidatePath("/publications");
    revalidatePath(`/publications/${publicationId}/studio`);

    return {
      ok: true as const,
      action,
      externalId: post.id,
      providerStatus: post.status ?? null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Buffer rechazó la publicación.";

    await supabase
      .from("publishing_jobs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .eq("user_id", userId);

    throw error;
  }
}
