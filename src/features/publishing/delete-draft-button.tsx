"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteBufferDraftSafely } from "./delete-draft-action";

export function DeleteDraftButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

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
    setIsError(false);

    startTransition(async () => {
      const result = await deleteBufferDraftSafely(jobId);

      if (!result.ok) {
        setIsError(true);
        setMessage(result.error);
        return;
      }

      setMessage(
        result.alreadyDeleted
          ? "Este draft ya estaba eliminado."
          : "Draft eliminado de Buffer. El registro se conserva en el historial.",
      );
      router.refresh();
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
        <p
          className={`mt-2 rounded-lg px-3 py-2 text-xs ${
            isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
