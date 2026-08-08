import Link from "next/link";
import { notFound } from "next/navigation";

import { updateIdea } from "@/features/ideas/actions";
import { getIdea } from "@/features/ideas/data";

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdea(id);

  if (!idea) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/ideas" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          ← Volver a ideas
        </Link>
      </div>

      <header className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Ideas
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Editar idea</h1>
      </header>

      <form action={updateIdea} className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <input type="hidden" name="ideaId" value={idea.id} />

        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="title">
              Título
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={180}
              defaultValue={idea.title}
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
              defaultValue={idea.topic ?? ""}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="notes">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={8}
              defaultValue={idea.notes ?? ""}
              className="w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link href="/ideas" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
