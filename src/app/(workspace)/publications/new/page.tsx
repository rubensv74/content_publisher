import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmitButton } from "@/components/application/submit-button";
import { storyTypes } from "@/config/story-types";
import { getIdea } from "@/features/ideas/data";
import { createPublicationFromIdea } from "@/features/publications/actions";
import { getSuggestionRecommendation } from "@/features/suggestions/data";

const formats = [
  {
    key: "single-image",
    label: "Imagen única",
    description: "Una pieza visual principal acompañada por el texto de LinkedIn.",
  },
  {
    key: "carousel",
    label: "Carrusel",
    description: "Una historia dividida en varias páginas y exportada como PDF.",
  },
] as const;

const storyFields = [
  {
    name: "problem",
    label: "Problema o contexto",
    placeholder: "¿Qué estaba ocurriendo y por qué importaba?",
  },
  {
    name: "attempts",
    label: "Qué intentaste",
    placeholder: "Enfoques previos, limitaciones o alternativas consideradas.",
  },
  {
    name: "solution",
    label: "Decisión o solución",
    placeholder: "¿Qué hiciste finalmente y por qué?",
  },
  {
    name: "result",
    label: "Resultado",
    placeholder: "¿Qué resultado concreto se obtuvo? Déjalo vacío si aún no existe.",
  },
  {
    name: "learning",
    label: "Aprendizaje",
    placeholder: "¿Qué cambió en tu forma de entender el problema?",
  },
  {
    name: "insight",
    label: "Idea transferible",
    placeholder: "¿Qué puede llevarse otra persona a su propio contexto?",
  },
  {
    name: "cta",
    label: "Pregunta o CTA",
    placeholder: "¿Qué conversación quieres abrir al final?",
  },
] as const;

export default async function NewPublicationPage({
  searchParams,
}: {
  searchParams: Promise<{ idea?: string }>;
}) {
  const { idea: ideaId } = await searchParams;

  if (!ideaId) {
    redirect("/ideas");
  }

  const idea = await getIdea(ideaId);

  if (!idea) {
    notFound();
  }

  const sourceRecommendation =
    idea.source_type === "suggestion-engine" && idea.source_ref
      ? await getSuggestionRecommendation(idea.source_ref)
      : null;

  const recommendation =
    sourceRecommendation?.status === "converted" &&
    sourceRecommendation.convertedIdeaId === idea.id
      ? sourceRecommendation
      : null;

  const defaultStoryType = recommendation?.storyType ?? "problem-solution";
  const defaultFormat = recommendation?.format ?? "single-image";
  const defaultTopic =
    recommendation?.topic?.trim() ||
    (idea.source_type === "suggestion-engine" ? "" : idea.topic ?? "");
  const storyDraft = recommendation?.storyDraft ?? null;
  const prefilledStoryCount = storyDraft
    ? Object.values(storyDraft).filter((value) => Boolean(value)).length
    : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link
          href="/ideas"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Volver a ideas
        </Link>
      </div>

      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Content Studio · Idea → Story → Format
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Convertir idea en publicación
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Primero damos forma a la historia. El diseño y la previsualización vendrán después,
          sin mezclar todavía contenido y apariencia.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form action={createPublicationFromIdea} className="space-y-6">
          <input type="hidden" name="ideaId" value={idea.id} />

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                1 · Base
              </p>
              <h2 className="mt-2 text-xl font-semibold">Qué vamos a contar</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium" htmlFor="title">
                  Título de trabajo
                </label>
                <input
                  id="title"
                  name="title"
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
                  maxLength={100}
                  defaultValue={defaultTopic}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="storyType">
                  Tipo de historia
                </label>
                <select
                  id="storyType"
                  name="storyType"
                  defaultValue={defaultStoryType}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                >
                  {storyTypes.map((story) => (
                    <option key={story.key} value={story.key}>
                      {story.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                2 · Story
              </p>
              <h2 className="mt-2 text-xl font-semibold">Estructura la experiencia</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                No hace falta escribir bonito todavía. Queremos capturar hechos, decisiones y aprendizaje.
              </p>
              {recommendation ? (
                <p className="mt-3 rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm leading-6 text-violet-950">
                  ChatGPT Plus ha preparado {prefilledStoryCount} de {storyFields.length} bloques con la evidencia disponible. Revísalos y completa únicamente lo que conozcas; los bloques sin respaldo se dejan vacíos a propósito.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
              {storyFields.map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-medium" htmlFor={field.name}>
                    {field.label}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={3}
                    defaultValue={storyDraft?.[field.name] ?? ""}
                    placeholder={field.placeholder}
                    className="w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                3 · Format
              </p>
              <h2 className="mt-2 text-xl font-semibold">Elige el formato inicial</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {formats.map((format) => (
                <label
                  key={format.key}
                  className="cursor-pointer rounded-2xl border border-[var(--border)] p-4 transition hover:border-slate-400"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="format"
                      value={format.key}
                      defaultChecked={format.key === defaultFormat}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{format.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                        {format.description}
                      </span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <SubmitButton
              pendingLabel="Creando borrador…"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              Crear borrador y abrir Content Studio →
            </SubmitButton>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-white p-5 lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Idea de origen
          </p>
          <h2 className="mt-3 font-semibold">{idea.title}</h2>
          {defaultTopic ? (
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {defaultTopic}
            </span>
          ) : null}
          {idea.notes ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
              {idea.notes}
            </p>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">La idea no contiene notas adicionales.</p>
          )}

          {recommendation ? (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">
                Recomendación de Suggestion Engine
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Historia</dt>
                  <dd className="font-medium">{recommendation.storyType}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Story</dt>
                  <dd className="font-medium">{prefilledStoryCount}/{storyFields.length} bloques</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Formato</dt>
                  <dd className="font-medium">{recommendation.format}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--muted)]">Diseño</dt>
                  <dd className="text-right font-medium">
                    {recommendation.designFamily} · {recommendation.archetypeKey}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Tema, historia, formato y STORY se precargan como punto de partida. El diseño sigue siendo editable en Content Studio y ningún bloque STORY debe tomarse como hecho sin revisión humana.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
