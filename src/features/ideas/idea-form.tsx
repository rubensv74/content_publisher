"use client";

import { useActionState, useEffect, useRef } from "react";

import { createIdea, type CreateIdeaState } from "./actions";

const initialState: CreateIdeaState = { error: null, success: false };

export function IdeaForm() {
  const [state, formAction, isPending] = useActionState(createIdea, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-[var(--border)] bg-white p-6"
    >
      <div className="mb-5">
        <p className="text-sm font-semibold">Nueva idea</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Captúrala rápido. Ya habrá tiempo de convertirla en una historia.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={180}
            placeholder="Ej. Por qué dejé de cargar 45.000 registros de una vez"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="topic">
            Tema
          </label>
          <input
            id="topic"
            name="topic"
            type="text"
            maxLength={100}
            placeholder="Power Platform, SQL, React…"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium" htmlFor="notes">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Qué ocurrió, por qué puede ser útil, qué no quieres olvidar…"
            className="w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
          />
        </div>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar idea"}
        </button>
      </div>
    </form>
  );
}
