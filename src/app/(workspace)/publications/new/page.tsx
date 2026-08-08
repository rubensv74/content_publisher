import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { storyTypes } from "@/config/story-types";
import { createPublicationFromIdea } from "@/features/publications/actions";
import { getIdea } from "@/features/ideas/data";

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
                  defaultValue={idea.topic ?? ""}
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
                  defaultValue="problem-solution"
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
            </div>

            <div className="grid gap-4">
              {[
                ["problem", "Problema o contexto", "¿Qué estaba ocurriendo y por qué importaba?"],
                ["attempts", "Qué intentaste", "Enfoques previos, limitaciones o alternativas consideradas."],
                ["solution", "Decisión o solución", "¿Qué hiciste finalmente y por qué?"],
                ["learning", "Aprendizaje", "¿Qué cambió en tu forma de entender el problema?"],
                ["insight", "Idea transferible", "¿Qué puede llevarse otra persona a su propio contexto?"],
              ].map(([name, label, placeholder]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-medium" htmlFor={name}>
                    {label}
                  </label>
                  <textarea
                    id={name}
                    name={name}
                    rows={3}
                    placeholder={placeholder}
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
              {formats.map((format, index) => (
                <label
                  key={format.key}
                  className="cursor-pointer rounded-2xl border border-[var(--border)] p-4 transition hover:border-slate-400"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="format"
                      value={format.key}
                      defaultChecked={index === 0}
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
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Crear borrador y abrir Content Studio →
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-white p-5 lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Idea de origen
          </p>
          <h2 className="mt-3 font-semibold">{idea.title}</h2>
          {idea.topic ? (
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {idea.topic}
            </span>
          ) : null}
          {idea.notes ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
              {idea.notes}
            </p>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">La idea no contiene notas adicionales.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
