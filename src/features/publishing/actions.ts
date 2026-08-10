"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getBufferConnectionStatus } from "@/lib/publishing/buffer/account";
import {
  createBufferPost,
  deleteBufferPost,
  type BufferPublishAction,
} from "@/lib/publishing/buffer/post";
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

  const linkedinText = publication.linkedin_text?.trim() ?? "";

  if (!linkedinText) {
    throw new Error(
      "La publicación todavía no tiene texto de LinkedIn. Guarda los cambios para generar o persistir el borrador antes de enviarlo a Buffer.",
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

  if (action === "draft") {
    const { data: existingDraft, error: existingDraftError } = await supabase
      .from("publishing_jobs")
      .select("id,external_id")
      .eq("user_id", userId)
      .eq("publication_id", publicationId)
      .eq("render_id", renderId)
      .eq("provider", "buffer")
      .eq("action", "draft")
      .eq("status", "sent")
      .contains("provider_payload", { channelId })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingDraftError) {
      throw new Error(
        `No se pudo comprobar si ya existe un draft en Buffer: ${existingDraftError.message}`,
      );
    }

    if (existingDraft?.external_id) {
      return {
        ok: true as const,
        action,
        externalId: existingDraft.external_id,
        providerStatus: "draft",
        reused: true as const,
      };
    }
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
      text: linkedinText,
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
    revalidatePath("/history");

    return {
      ok: true as const,
      action,
      externalId: post.id,
      providerStatus: post.status ?? null,
      reused: false as const,
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

    revalidatePath("/history");
    throw error;
  }
}

export async function deleteBufferDraft(jobId: string) {
  if (!jobId) {
    throw new Error("No se ha indicado el draft que debe eliminarse.");
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { data: job, error: jobError } = await supabase
    .from("publishing_jobs")
    .select("id,publication_id,action,status,external_id,provider_payload")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error(
      `No se pudo localizar el draft: ${jobError?.message ?? "no encontrado"}`,
    );
  }

  if (job.action !== "draft") {
    throw new Error("Solo se pueden eliminar desde aquí los drafts creados en Buffer.");
  }

  if (job.status === "cancelled") {
    return { ok: true as const, alreadyDeleted: true as const };
  }

  if (!job.external_id) {
    throw new Error("Este registro no contiene el identificador del draft en Buffer.");
  }

  await deleteBufferPost(job.external_id);

  const currentPayload =
    job.provider_payload && typeof job.provider_payload === "object"
      ? job.provider_payload
      : {};

  const { error: updateError } = await supabase
    .from("publishing_jobs")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      error_message: null,
      provider_payload: {
        ...currentPayload,
        deletedFromBufferAt: new Date().toISOString(),
      },
    })
    .eq("id", job.id)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(
      `Buffer eliminó el draft, pero no se pudo actualizar el historial local: ${updateError.message}`,
    );
  }

  revalidatePath("/history");
  revalidatePath(`/publications/${job.publication_id}/studio`);

  return { ok: true as const, alreadyDeleted: false as const };
}
