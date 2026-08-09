import {
  getBufferPost,
  type BufferPostStatus,
} from "@/lib/publishing/buffer/post";
import { createClient } from "@/lib/supabase/server";

const RECONCILABLE_LOCAL_STATUSES = ["pending", "scheduled", "sent"] as const;

type ReconciliationJob = {
  id: string;
  publication_id: string;
  action: string;
  status: string;
  scheduled_for: string | null;
  external_id: string;
  external_url: string | null;
  provider_payload: unknown;
};

export type ReconciliationSummary = {
  checked: number;
  updated: number;
  failed: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function localStatusForBufferStatus(
  status: BufferPostStatus,
  currentStatus: string,
) {
  if (status === "scheduled") return "scheduled";
  if (status === "sending" || status === "needs_approval") return "pending";
  if (status === "sent") return "published";
  if (status === "error") return "failed";
  return currentStatus;
}

function isRemoteNonTerminal(status: unknown) {
  return (
    status === "scheduled" ||
    status === "sending" ||
    status === "needs_approval"
  );
}

export async function reconcilePublishingJobs(): Promise<ReconciliationSummary> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    return { checked: 0, updated: 0, failed: 0 };
  }

  const { data, error } = await supabase
    .from("publishing_jobs")
    .select(
      "id,publication_id,action,status,scheduled_for,external_id,external_url,provider_payload",
    )
    .eq("user_id", userId)
    .eq("provider", "buffer")
    .in("action", ["publish-now", "schedule"])
    .in("status", [...RECONCILABLE_LOCAL_STATUSES])
    .not("external_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`No se pudieron localizar jobs para reconciliar: ${error.message}`);
  }

  const jobs = (data ?? []) as unknown as ReconciliationJob[];
  let updated = 0;
  let failed = 0;

  for (const job of jobs) {
    const currentPayload = asRecord(job.provider_payload);
    const currentRemoteStatus = currentPayload.bufferStatus;

    if (
      job.status === "sent" &&
      currentRemoteStatus !== "sending" &&
      currentRemoteStatus !== "scheduled" &&
      currentRemoteStatus !== "needs_approval"
    ) {
      // Legacy publish-now jobs were stored as `sent` even when Buffer had already
      // confirmed a terminal status. Only reconcile them when the remote snapshot
      // still indicates a non-terminal state.
      if (!isRemoteNonTerminal(currentRemoteStatus)) {
        continue;
      }
    }

    try {
      const remote = await getBufferPost(job.external_id);
      const nextLocalStatus = localStatusForBufferStatus(remote.status, job.status);
      const reconciledAt = new Date().toISOString();
      const completedAt =
        remote.status === "sent"
          ? remote.sentAt ?? reconciledAt
          : remote.status === "error"
            ? reconciledAt
            : null;
      const nextPayload = {
        ...currentPayload,
        bufferStatus: remote.status,
        dueAt: remote.dueAt ?? currentPayload.dueAt ?? null,
        sentAt: remote.sentAt ?? null,
        bufferUpdatedAt: remote.updatedAt ?? null,
        lastReconciledAt: reconciledAt,
      };

      const patch: Record<string, unknown> = {
        status: nextLocalStatus,
        provider_payload: nextPayload,
        external_url: remote.externalLink ?? job.external_url,
      };

      if (completedAt) {
        patch.completed_at = completedAt;
      }

      if (remote.status === "error") {
        patch.error_message =
          "Buffer indica que la publicación no pudo completarse. Revisa el canal y el contenido antes de reintentarlo.";
      } else if (remote.status === "sent") {
        patch.error_message = null;
      }

      const { error: updateError } = await supabase
        .from("publishing_jobs")
        .update(patch)
        .eq("id", job.id)
        .eq("user_id", userId);

      if (updateError) {
        failed += 1;
        continue;
      }

      if (remote.status === "sent") {
        await supabase
          .from("publications")
          .update({
            status: "published",
            published_at: completedAt,
            scheduled_at: null,
          })
          .eq("id", job.publication_id)
          .eq("user_id", userId);
      } else if (remote.status === "error") {
        await supabase
          .from("publications")
          .update({
            status: "ready",
            scheduled_at: null,
          })
          .eq("id", job.publication_id)
          .eq("user_id", userId)
          .eq("status", "scheduled");
      } else if (remote.status === "scheduled") {
        await supabase
          .from("publications")
          .update({
            status: "scheduled",
            scheduled_at: remote.dueAt ?? job.scheduled_for,
          })
          .eq("id", job.publication_id)
          .eq("user_id", userId);
      }

      updated += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    checked: jobs.length,
    updated,
    failed,
  };
}
