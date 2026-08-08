import Link from "next/link";
import { notFound } from "next/navigation";

import { storyTypes } from "@/config/story-types";
import { getIdentitySnapshot } from "@/features/identity/data";
import {
  selectPublicationDesign,
  updatePublicationStory,
} from "@/features/publications/actions";
import { getPublication } from "@/features/publications/data";
import { getPublishableRenders } from "@/features/publishing/data";
import { PublishingPanel } from "@/features/publishing/publishing-panel";
import { PersistedPublicationPreview } from "@/features/renders/persisted-publication-preview";
import { getBufferConnectionStatus } from "@/lib/publishing/buffer/account";
import type { RenderablePublication } from "@/publication-renderer/contracts";

const workflow = ["Idea", "Story", "Format", "Design", "Preview", "Publish"];

export default async function PublicationStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [publication, identity, publishableRenders, bufferStatus] =
    await Promise.all([
      getPublication(id),
      getIdentitySnapshot(),
      getPublishableRenders(id),
      getBufferConnectionStatus(),
    ]);

  if (!publication) {
    notFound();
  }

  const storyLabel =
    storyTypes.find((story) => story.key === publication.story_type)?.label ??
    publication.story_type;
  const story = publication.structured_content ?? {};

  const candidateDesign =
    publication.format === "carousel"
      ? {
          key: "step-by-step",
          version: 1,
          variant: "editorial-light",
          name: "Step by Step",
          description:
            "Carrusel editorial multipágina construido a partir de la historia estructurada.",
        }
      : {
          key: "build-note",
          version: 1,
          variant: "editorial-light",
          name: "Build Note",
          description:
            "Pieza editorial 4:5 para explicar una decisión y el aprendizaje que deja.",
        };

  const designSelected =
    publication.archetype_key === candidateDesign.key &&
    publication.archetype_version === candidateDesign.version &&
    publication.variant_key === candidateDesign.variant;

  const renderablePublication: RenderablePublication = {
    id: publication.id,
    title: publication.title,
    storyType: publication.story_type,
    format: publication.format,
    structuredContent: story,
    contentSchemaVersion: publication.content_schema_version,
    archetypeKey: candidateDesign.key,
    archetypeVersion: candidateDesign.version,
    variantKey: candidateDesign.variant,
    identity,
    assets: [],
  };

  const workflowActiveIndex = publishableRenders.length > 0 ? 5 : 4;

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
          {workflow.map((step, index) => (
            <li
              key={step}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                index <= workflowActiveIndex
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {index + 1}. {step}
            </li>
          ))}
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
              <h2 className="mt-2 text-xl font-semibold">{candidateDesign.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {candidateDesign.description} Los tokens de identidad proceden de la configuración central de Identity.
              </p>
            </div>

            <PersistedPublicationPreview
              publication={renderablePublication}
              canPersist={designSelected}
            />

            {!designSelected ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Puedes exportar el preview localmente, pero antes de crear un render final público debes guardar este diseño como selección de la publicación.
              </p>
            ) : null}
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
              El contenido permanece separado del diseño. Ambos formatos usan los datos estructurados guardados en PostgreSQL.
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Diseño
              </p>
              {designSelected ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Seleccionado
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 font-semibold">
              {candidateDesign.name} · {candidateDesign.variant}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              1080 × 1350 · relación 4:5 · versión {candidateDesign.version}.
            </p>

            {!designSelected ? (
              <form action={selectPublicationDesign} className="mt-4">
                <input type="hidden" name="publicationId" value={publication.id} />
                <input type="hidden" name="archetypeKey" value={candidateDesign.key} />
                <input
                  type="hidden"
                  name="archetypeVersion"
                  value={candidateDesign.version}
                />
                <input type="hidden" name="variantKey" value={candidateDesign.variant} />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium transition hover:bg-slate-50"
                >
                  Usar este diseño
                </button>
              </form>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Identidad aplicada
            </p>
            <h2 className="mt-3 font-semibold">
              {identity.signatureLabel ?? identity.displayName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              La firma, paleta y tipografía se cargan desde Identity y se comparten entre arquetipos.
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              Ajustar identidad →
            </Link>
          </section>

          <PublishingPanel
            publicationId={publication.id}
            renders={publishableRenders}
            bufferStatus={bufferStatus}
          />

          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Estado del flujo
            </p>
            <h2 className="mt-3 font-semibold">
              {publishableRenders.length > 0
                ? "Render Ready → Publish preparado"
                : "Preview → Render Ready operativo"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {publishableRenders.length > 0
                ? "Existe al menos un archivo final con URL pública estable. Cuando Buffer esté conectado puede enviarse, programarse o guardarse como draft."
                : "Una vez seleccionado el diseño, el PNG/PDF final puede guardarse en Storage público con una ruta inmutable y una fila trazable en renders."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
