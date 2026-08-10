"use server";

import { deleteBufferDraft } from "./actions";

type SafeDeleteDraftResult =
  | {
      ok: true;
      alreadyDeleted: boolean;
    }
  | {
      ok: false;
      error: string;
    };

function safeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "No se pudo eliminar el draft de Buffer.";
  }

  const message = error.message.trim();

  if (!message || message.includes("Server Components render")) {
    return "Buffer rechazó la eliminación del draft. Vuelve a intentarlo y, si persiste, revisaremos el motivo exacto.";
  }

  return message.slice(0, 320);
}

export async function deleteBufferDraftSafely(
  jobId: string,
): Promise<SafeDeleteDraftResult> {
  try {
    const result = await deleteBufferDraft(jobId);
    return {
      ok: true,
      alreadyDeleted: result.alreadyDeleted,
    };
  } catch (error) {
    return {
      ok: false,
      error: safeErrorMessage(error),
    };
  }
}
