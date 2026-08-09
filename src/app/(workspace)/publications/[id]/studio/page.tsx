import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/application/submit-button";
import { designFamilies } from "@/config/design-families";
import { storyTypes } from "@/config/story-types";
import { getVisualAssets } from "@/features/assets/data";
import { getIdentitySnapshot } from "@/features/identity/data";
import {
  removePublicationHeroAsset,
  setPublicationHeroAsset,
} from "@/features/publication-assets/actions";
import { getPublicationAssets } from "@/features/publication-assets/data";
import {
  selectPublicationDesign,
  updatePublicationStory,
} from "@/features/publications/actions";
import { getPublication } from "@/features/publications/data";
import { getPublishableRenders } from "@/features/publishing/data";
import { PublishingPanel } from "@/features/publishing/publishing-panel";
import { PersistedPublicationPreview } from "@/features/renders/persisted-publication-preview";
import { getBufferConnectionStatus } from "@/lib/publishing/buffer/account";
import { publicationArchetypes } from "@/publication-renderer/archetypes/registry";
import type { RenderablePublication } from "@/publication-renderer/contracts";

const workflow = ["Idea", "Story", "Format", "Design", "Preview", "Publish"];

export default async function PublicationStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; design?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [
    publication,
    identity,
    publishableRenders,
    bufferStatus,
    availableAssets,
    linkedAssets,
  ] = await Promise.all([
    getPublication(id),
    getIdentitySnapshot(),
    getPublishableRenders(id),
    getBufferConnectionStatus(),
    getVisualAssets(),
    getPublicationAssets(id),
  ]);

  if (!publication) {
    notFound();
  }

  const storyLabel =
    storyTypes.find((story) => story.key === publication.story_type)?.label ??
    publication.story_type;
  const story = publication.structured_content ?? {};

  const compatibleDesigns = publicationArchetypes.filter((design) => {
    const supportsFormat = design.supportedFormats.includes(publication.format);
    const supportsStory =
      !design.supportedStoryTypes ||
      design.supportedStoryTypes.includes(publication.story_type);
    return supportsFormat && supportsStory;
  });

  const savedDesign = compatibleDesigns.find(
    (design) =>
      design.key === publication.archetype_key &&
      design.version === publication.archetype_version,
  );
  const requestedDesign = compatibleDesigns.find(
    (design) => design.key === query.design,
  );
  const fallbackKey = publication.format === "carousel" ? "step-by-step" : "build-note";
  const previewDesign =
    requestedDesign ??
    savedDesign ??
    compatibleDesigns.find((design) => design.key === fallbackKey) ??
    compatibleDesigns[0];

  if (!previewDesign) {
    throw new Error("No existe un diseño compatible con esta publicación.");
  }

  const savedVariant =
    savedDesign?.key === previewDesign.key &&
    publication.variant_key &&
    previewDesign.variants.includes(publication.variant_key)
      ? publication.variant_key
      : null;
  const previewVariant = savedVariant ?? previewDesign.variants[0];

  if (!previewVariant) {
    throw new Error("El diseño seleccionado no tiene una variante activa.");
  }

  const designSelected =
    publication.archetype_key === previewDesign.key &&
    publication.archetype_version === previewDesign.version &&
    publication.variant_key === previewVariant;
  const heroAsset = linkedAssets.find((asset) => asset.role === "hero") ?? null;
  const designNeedsHeroAsset = previewDesign.key === "hero-screenshot";
  const canPersistFinalRender = designSelected && (!designNeedsHeroAsset || Boolean(heroAsset));
  const designFamily = designFamilies.find((family) => family.key === previewDesign.family);

  const currentPublishableRenders = publishableRenders.filter((render) => {
    if (!publication.archetype_key || !publication.variant_key) return false;

    const designMatches =
      render.archetypeKey === publication.archetype_key &&
      render.variantKey === publication.variant_key;
    const renderedAfterLastEdit =
      Date.parse(render.createdAt) >= Date.parse(publication.updated_at);

    return designMatches && renderedAfterLastEdit;
  });
  const staleRenderCount = publishableRenders.length - currentPublishableRenders.length;

  const renderablePublication: RenderablePublication = {
    id: publication.id,
    title: publication.title,
    storyType: publication.story_type,
    format: publication.format,
    structuredContent: story,
    contentSchemaVersion: publication.content_schema_version,
    archetypeKey: previewDesign.key,
    archetypeVersion: previewDesign.version,
    variantKey: previewVariant,
    identity,
    assets: linkedAssets,
  };

  const workflowActiveIndex = currentPublishableRenders.length > 0 ? 5 : 4;

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

      {query.saved === "content" ? (
        <div
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          role="status"
        >
          Cambios guardados correctamente. La historia y el texto de LinkedIn ya están persistidos.
        </div>
      ) : null}

      {query.saved === "design" ? (
        <div
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          role="status"
        >
          Diseño seleccionado correctamente. Genera un render final nuevo antes de publicar.
        </div>
      ) : null}

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                ["result", "Resultado", story.result],
                ["learning", "Aprendizaje", story.learning],
                ["insight", "Idea transferible", story.insight],
                ["cta", "Cierre o llamada final", story.cta],
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
              Hook → Contexto → Problema → Decisión → Resultado → Aprendizaje → CTA. El texto siempre puede revisarse manualmente antes de publicar.
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
              <h2 className="mt-2 text-xl font-semibold">{previewDesign.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {designFamily?.label ?? previewDesign.family} · {previewVariant} · versión {previewDesign.version}. Los tokens visuales proceden de Identity.
              </p>
            </div>

            <PersistedPublicationPreview
              publication={renderablePublication}
              canPersist={canPersistFinalRender}
            />

            {!designSelected ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Estás previsualizando un diseño distinto al guardado. Selecciónalo en el panel derecho antes de crear un render final.
              </p>
            ) : null}

            {designNeedsHeroAsset && !heroAsset ? (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Hero Screenshot necesita un screenshot. Súbelo en Recursos y asígnalo desde el panel derecho.
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap items-center justify-end gap-4">
            <p className="text-xs text-[var(--muted)]">
              Este botón guarda historia y caption. Diseño y recursos se gestionan en el panel derecho.
            </p>
            <SubmitButton
              pendingLabel="Guardando…"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              Guardar cambios
            </SubmitButton>
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
              El contenido permanece separado del diseño. Cambiar de arquetipo no modifica la historia guardada.
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Diseños compatibles
              </p>
              <Link href="/designs" className="text-xs font-semibold text-slate-600 hover:text-slate-950">
                Biblioteca →
              </Link>
            </div>

            <div className="mt-4 grid gap-2">
              {compatibleDesigns.map((design) => {
                const isPreview = design.key === previewDesign.key;
                const isSaved = design.key === savedDesign?.key;
                const needsAsset = design.key === "hero-screenshot" && !heroAsset;

                return (
                  <Link
                    key={design.key}
                    href={`/publications/${publication.id}/studio?design=${design.key}`}
                    className={`rounded-xl border p-3 transition ${
                      isPreview
                        ? "border-slate-900 bg-slate-50"
                        : "border-[var(--border)] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{design.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {designFamilies.find((family) => family.key === design.family)?.label ?? design.family}
                        </p>
                      </div>
                      {isSaved ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                          Guardado
                        </span>
                      ) : null}
                    </div>
                    {needsAsset ? (
                      <p className="mt-2 text-xs font-medium text-amber-700">Necesita screenshot</p>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            {!designSelected ? (
              <form action={selectPublicationDesign} className="mt-4">
                <input type="hidden" name="publicationId" value={publication.id} />
                <input type="hidden" name="archetypeKey" value={previewDesign.key} />
                <input
                  type="hidden"
                  name="archetypeVersion"
                  value={previewDesign.version}
                />
                <input type="hidden" name="variantKey" value={previewVariant} />
                <SubmitButton
                  pendingLabel="Seleccionando…"
                  className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                >
                  Usar {previewDesign.name}
                </SubmitButton>
              </form>
            ) : (
              <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">
                Este es el diseño guardado actualmente.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Screenshot / imagen
              </p>
              <Link href="/assets" className="text-xs font-semibold text-slate-600 hover:text-slate-950">
                Recursos →
              </Link>
            </div>

            {heroAsset ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="truncate text-sm font-semibold">{heroAsset.alt ?? "Recurso asociado"}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Rol: hero · original privado</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                No hay un recurso principal asociado a esta publicación.
              </p>
            )}

            {availableAssets.length > 0 ? (
              <form action={setPublicationHeroAsset} className="mt-4 space-y-3">
                <input type="hidden" name="publicationId" value={publication.id} />
                <select
                  name="assetId"
                  required
                  defaultValue={heroAsset?.id ?? availableAssets[0]?.id}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
                >
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.original_filename}
                    </option>
                  ))}
                </select>
                <SubmitButton
                  pendingLabel="Asociando…"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {heroAsset ? "Cambiar recurso" : "Usar como recurso principal"}
                </SubmitButton>
              </form>
            ) : (
              <Link
                href="/assets"
                className="mt-4 inline-flex w-full justify-center rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium transition hover:bg-slate-50"
              >
                Subir primer recurso
              </Link>
            )}

            {heroAsset ? (
              <form action={removePublicationHeroAsset} className="mt-2">
                <input type="hidden" name="publicationId" value={publication.id} />
                <SubmitButton
                  pendingLabel="Retirando…"
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  Retirar de esta publicación
                </SubmitButton>
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
              Firma, paleta y tipografía se cargan desde Identity y se comparten entre arquetipos.
            </p>
            <Link
              href="/settings"
              className="mt-4 inline-flex text-sm font-medium text-slate-700 hover:text-slate-950"
            >
              Ajustar identidad →
            </Link>
          </section>

          {staleRenderCount > 0 ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Render anterior
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                Hay {staleRenderCount} render{staleRenderCount === 1 ? "" : "s"} anterior{staleRenderCount === 1 ? "" : "es"}. No se ofrecen para publicar porque el contenido, diseño o recurso cambió después de generarlos.
              </p>
            </section>
          ) : null}

          <PublishingPanel
            publicationId={publication.id}
            renders={currentPublishableRenders}
            bufferStatus={bufferStatus}
          />

          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Estado del flujo
            </p>
            <h2 className="mt-3 font-semibold">
              {currentPublishableRenders.length > 0
                ? "Render actual → Publish preparado"
                : "Preview → nuevo render necesario"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {currentPublishableRenders.length > 0
                ? "Existe un archivo final coherente con la última edición y el diseño guardado. Ya puede enviarse, programarse o guardarse como draft."
                : "Solo los renders generados después de la última edición y con el diseño actualmente guardado se habilitan para publicar."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
