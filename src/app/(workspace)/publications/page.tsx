import Link from "next/link";

import { storyTypes } from "@/config/story-types";
import { DraftDeleteButton } from "@/features/publications/draft-delete-button";
import { getPublications } from "@/features/publications/data";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; deleteError?: string }>;
}) {
  const publications = await getPublications();
  const { deleted, deleteError } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Content Studio
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Publicaciones</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Aquí viven los borradores que ya han superado la fase de idea. Cada publicación conserva su historia, formato y evolución hasta llegar a preview y publicación.
        </p>
      </header>

      {deleted === "1" ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Borrador eliminado correctamente.
        </div>
      ) : null}

      {deleteError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {deleteError}
        </div>
      ) : null}

      {publications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <p className="font-medium">Todavía no hay publicaciones.</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Elige una idea y conviértela en el primer borrador de Content Studio.
          </p>
          <Link
            href="/ideas"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Ir a ideas
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {publications.map((publication) => {
            const storyLabel =
              storyTypes.find((story) => story.key === publication.story_type)?.label ??
              publication.story_type;

            return (
              <article
                key={publication.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {storyLabel}
                  </span>
                  <span>
                    {publication.format === "carousel" ? "Carrusel" : "Imagen única"}
                  </span>
                  <span>·</span>
                  <span>{dateFormatter.format(new Date(publication.updated_at))}</span>
                </div>

                <h2 className="mt-4 text-xl font-semibold tracking-tight">
                  {publication.title}
                </h2>
                {publication.topic ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">{publication.topic}</p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {publication.status}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {publication.status === "draft" ? (
                      <DraftDeleteButton
                        publicationId={publication.id}
                        title={publication.title}
                      />
                    ) : null}
                    <Link
                      href={`/publications/${publication.id}/studio`}
                      className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Abrir Content Studio →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
