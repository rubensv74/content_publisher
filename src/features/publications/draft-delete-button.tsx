"use client";

import { Trash2 } from "lucide-react";

import { SubmitButton } from "@/components/application/submit-button";

import { deleteDraftPublicationAction } from "./draft-actions";

export function DraftDeleteButton({
  publicationId,
  title,
}: {
  publicationId: string;
  title: string;
}) {
  return (
    <form
      action={deleteDraftPublicationAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Eliminar definitivamente el borrador “${title}”? Esta acción no se puede deshacer.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="publicationId" value={publicationId} />
      <SubmitButton
        pendingLabel="Eliminando…"
        className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 size={16} />
        Eliminar draft
      </SubmitButton>
    </form>
  );
}
