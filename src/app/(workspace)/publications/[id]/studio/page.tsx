import Link from "next/link";
import { notFound } from "next/navigation";

import { storyTypes } from "@/config/story-types";
import { updatePublicationStory } from "@/features/publications/actions";
import { getPublication } from "@/features/publications/data";
import type { RenderablePublication } from "@/publication-renderer/contracts";
import { defaultIdentity } from "@/publication-renderer/identity/default-identity";
import { BuildNotePreview } from "@/publication-renderer/preview/build-note-preview";

const workflow = ["Idea", "Story", "Format", "Design", "Preview", "Publish"];

export default async function PublicationStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publication = await getPublication(id);

  if (!publication) {
    notFound();
  }

  const storyLabel =
    storyTypes.find((story) => story.key === publication.story_type)?.label ??
    publication.story_type;
  const story = publication.structured_content ?? {};

  const renderablePublication: RenderablePublication = {
    id: publication.id,
    title: publication.title,
    storyType: publication.story_type,
    format: publication.format,
    structuredContent: story,
    archetypeKey: "build-note",
    archetypeVersion: 1,
    variantKey: "editorial-light",
    identity: defaultIdentity,
    assets: [],
  };

  const previewAvailable = publication.format === "single-image";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/publications"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Publicaciones
        </Link>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {publication.status}
        </span>
      </div>

      <header className="mb-7">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Content Studio
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{publication.title}</h1>
      </header>

      <div className="mb-7 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white p-3">
        <ol className="flex min-w-max items-center gap-2">
          {workflow.map((step, index) => {
            const active = previewAvailable ? index <= 4 : index <= 2;
            return (
              <li
                key={step}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {index + 1}. {step}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form action={updatePublicationStory} className="space-y-6">
          <input type="hidden" name="publicationId" value={publication.id} />

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Story
                </p>
                <h2 className="mt-2 text-xl font-semibold">Historia estructurada</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {storyLabel}
              </span>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="title">
                  Título de trabajo
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  maxLength={180}
                  defaultValue={publication.title}
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
                  maxLength={100}
                  defaultValue={publication.topic ?? ""}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
                />
              </div>

              {[
                ["problem", "Problema o contexto", story.problem],
                ["attempts", "Qué intentaste", story.attempts],
                ["solution", "Decisión o solución", story.solution],
                ["learning", "Aprendizaje", story.learning],
                ["insight", "Idea transferible", story.insight],
              ].map(([name, label, value]) => (
                <div key={name as string}>
                  <label className="mb-2 block text-sm font-medium" htmlFor={name as string}>
                    {label}
                  </label>
                  <textarea
                    id={name as string}
                    name={name as string}
                    rows={3}
                    defaultValue={(value as string | null | undefined) ?? ""}
                    className="w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              LinkedIn caption
            </p>
            <h2 className="mt-2 text-xl font-semibold">Texto de acompañamiento</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Aquí construiremos Hook → Contexto → Problema → Decisión → Resultado → Aprendizaje → CTA.
              Por ahora puedes redactarlo o guardar notas de trabajo.
            </p>
            <textarea
              id="linkedinText"
              name="linkedinText"
              rows={12}
              defaultValue={publication.linkedin_text ?? ""}
              className="mt-5 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 leading-7 outline-none transition focus:border-slate-500"
              placeholder="Escribe el borrador del texto de LinkedIn…"
            />
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Design + Preview
              </p>
              <h2 className="mt-2 text-xl font-semibold">Primer arquetipo visual real</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Build Note v1 utiliza componentes React y tokens visuales propios. Es una dirección provisional para validar el motor, no una identidad cerrada.
              </p>
            </div>

            {previewAvailable ? (
              <BuildNotePreview publication={renderablePublication} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-[var(--muted)]">
                El renderer de carrusel se implementará como un arquetipo multipágina. Este primer Build Note valida primero el camino de imagen única.
              </div>
            )}
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Guardar Content Studio
            </button>
          </div>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-8 xl:h-fit">
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Formato
            </p>
            <p className="mt-3 text-lg font-semibold">
              {publication.format === "carousel" ? "Carrusel PDF" : "Imagen única"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              El contenido sigue separado del diseño. El preview actual se construye a partir de los mismos datos estructurados que guardamos en PostgreSQL.
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Arquetipo de validación
            </p>
            <h2 className="mt-3 font-semibold">Build Note · editorial-light</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              1080 × 1350 · relación 4:5 · pensado para una publicación orgánica con una sola imagen.
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Próximo paso
            </p>
            <h2 className="mt-3 font-semibold">Persistir Design + export</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Después de validar visualmente este arquetipo, guardaremos la selección y su versión en la publicación y ampliaremos el motor hacia carruseles.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
