import { Archive, FilePlus2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { archiveIdea, deleteIdea } from "./actions";
import type { IdeaRecord } from "./types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function IdeaList({ ideas }: { ideas: IdeaRecord[] }) {
  if (ideas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
        <p className="font-medium">Aún no hay ideas.</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Añade la primera arriba. La bandeja está pensada para capturar antes de editar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <article
          key={idea.id}
          className="rounded-2xl border border-[var(--border)] bg-white p-5"
        >
          <div className="flex gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                {idea.topic ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {idea.topic}
                  </span>
                ) : null}
                {idea.status === "converted" ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                    Convertida
                  </span>
                ) : null}
                <span>{dateFormatter.format(new Date(idea.created_at))}</span>
              </div>

              <h2 className="mt-3 text-lg font-semibold tracking-tight">{idea.title}</h2>

              {idea.notes ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
                  {idea.notes}
                </p>
              ) : null}

              {idea.status === "idea" ? (
                <div className="mt-4">
                  <Link
                    href={`/publications/new?idea=${idea.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <FilePlus2 size={16} />
                    Convertir en publicación
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-1">
              <Link
                href={`/ideas/${idea.id}/edit`}
                title="Editar idea"
                aria-label={`Editar ${idea.title}`}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil size={17} />
              </Link>

              {idea.status === "idea" ? (
                <form action={archiveIdea}>
                  <input type="hidden" name="ideaId" value={idea.id} />
                  <button
                    type="submit"
                    title="Archivar idea"
                    aria-label={`Archivar ${idea.title}`}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Archive size={17} />
                  </button>
                </form>
              ) : null}

              <form action={deleteIdea}>
                <input type="hidden" name="ideaId" value={idea.id} />
                <button
                  type="submit"
                  title="Eliminar idea"
                  aria-label={`Eliminar ${idea.title}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={17} />
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
