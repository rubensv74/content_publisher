"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteBufferDraft } from "./actions";

export function DeleteDraftButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function removeDraft() {
    if (isPending) {
      return;
    }

    const confirmed = window.confirm(
      "Este borrador se eliminará de Buffer. No se publicará en LinkedIn. ¿Continuar?",
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await deleteBufferDraft(jobId);
        setMessage(
          result.alreadyDeleted
            ? "Este draft ya estaba eliminado."
            : "Draft eliminado de Buffer.",
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el draft de Buffer.",
        );
      }
    });
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={removeDraft}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
      >
        <Trash2 size={15} />
        {isPending ? "Eliminando…" : "Eliminar draft de Buffer"}
      </button>
      {message ? (
        <p className="mt-2 text-xs text-[var(--muted)]" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
