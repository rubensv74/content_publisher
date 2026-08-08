import type { Metadata } from "next";

import { getIdeas } from "@/features/ideas/data";
import { IdeaForm } from "@/features/ideas/idea-form";
import { IdeaList } from "@/features/ideas/idea-list";

export const metadata: Metadata = {
  title: "Ideas",
};

export default async function IdeasPage() {
  const ideas = await getIdeas();
  const activeIdeas = ideas.filter((idea) => idea.status !== "archived");

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Ideas
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Bandeja de ideas</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Guarda oportunidades de contenido sin obligarte a convertirlas todavía en una publicación. El trabajo editorial viene después.
        </p>
      </header>

      <IdeaForm />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Pendientes
          </h2>
          <span className="text-sm text-[var(--muted)]">{activeIdeas.length}</span>
        </div>
        <IdeaList ideas={activeIdeas} />
      </section>
    </div>
  );
}
