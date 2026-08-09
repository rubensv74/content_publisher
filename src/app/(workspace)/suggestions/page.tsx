import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/application/submit-button";
import { getSourceSignals } from "@/features/source-signals/data";
import {
  acceptSuggestionAction,
  convertSuggestionToIdeaAction,
  dismissSuggestionAction,
  generateSuggestionsAction,
} from "@/features/suggestions/actions";
import { getSuggestions } from "@/features/suggestions/data";
import { selectSignalsForSuggestionModel } from "@/features/suggestions/input";
import type {
  SuggestionPriority,
  SuggestionStatus,
} from "@/features/suggestions/types";
import { isOpenAISuggestionConfigured } from "@/lib/ai/openai/client";

export const metadata: Metadata = {
  title: "Sugerencias",
};

const statusLabels: Record<SuggestionStatus, string> = {
  new: "Pendiente",
  accepted: "Aceptada",
  dismissed: "Descartada",
  converted: "Convertida en Idea",
};

const priorityLabels: Record<SuggestionPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

function statusClass(status: SuggestionStatus) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-700";
  if (status === "dismissed") return "bg-slate-100 text-slate-500";
  if (status === "converted") return "bg-violet-50 text-violet-700";
  return "bg-amber-50 text-amber-800";
}

export default async function SuggestionsPage() {
  const [suggestions, signals] = await Promise.all([
    getSuggestions(),
    getSourceSignals(),
  ]);
  const availableSignals = selectSignalsForSuggestionModel(signals);
  const configured = isOpenAISuggestionConfigured();
  const pending = suggestions.filter((suggestion) => suggestion.status === "new").length;
  const accepted = suggestions.filter((suggestion) => suggestion.status === "accepted").length;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Suggestion Engine
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Sugerencias editoriales</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            El motor convierte señales reales en propuestas revisables. Nada entra en Ideas hasta que tú lo aceptas expresamente.
          </p>
        </div>

        {configured && availableSignals.length > 0 ? (
          <form action={generateSuggestionsAction}>
            <SubmitButton
              pendingLabel="Analizando señales…"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              Generar sugerencias
            </SubmitButton>
          </form>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
          >
            Generar sugerencias
          </button>
        )}
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Disponibles</p>
          <p className="mt-2 text-3xl font-semibold">{availableSignals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">señales listas para analizar</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold">{pending}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">propuestas por revisar</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Aceptadas</p>
          <p className="mt-2 text-3xl font-semibold">{accepted}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">listas para convertirse en Idea</p>
        </div>
        <div className={`rounded-2xl border p-5 ${configured ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${configured ? "text-emerald-700" : "text-amber-700"}`}>Motor IA</p>
          <p className="mt-2 text-lg font-semibold">{configured ? "Configurado" : "Pendiente de credencial"}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {configured
              ? "Las ejecuciones son manuales y usan únicamente señales prefiltradas."
              : "El código está preparado. Falta configurar OPENAI_API_KEY y OPENAI_SUGGESTION_MODEL en Vercel."}
          </p>
        </div>
      </section>

      {!configured ? (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-sm leading-6 text-amber-950">
          Suggestion Engine permanece inactivo hasta configurar la credencial de OpenAI en el entorno del servidor. No pegues la API key en el repositorio ni en esta pantalla.
        </section>
      ) : null}

      {suggestions.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay sugerencias</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Refresca primero las señales y, cuando el motor esté configurado, genera un lote pequeño de propuestas. Las sugerencias quedarán guardadas para revisarlas con calma.
          </p>
          <Link href="/signals" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4">
            Ir a Señales
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <article key={suggestion.id} className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(suggestion.status)}`}>
                      {statusLabels[suggestion.status]}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      Prioridad {priorityLabels[suggestion.priority]}
                    </span>
                    <span className="text-xs text-slate-500">
                      Confianza {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight">{suggestion.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-800">{suggestion.opportunity}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    <span className="font-semibold text-slate-700">Por qué puede aportar valor: </span>
                    {suggestion.rationale}
                  </p>
                </div>

                <div className="min-w-52 text-right text-xs text-slate-500">
                  <p>{suggestion.storyType}</p>
                  <p className="mt-1">{suggestion.format}</p>
                  <p className="mt-1">{suggestion.designFamily} · {suggestion.archetypeKey}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Señales que la justifican</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestion.sourceSignals.map((signal) => (
                    <span key={signal.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                      {signal.sourceType} · {signal.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">
                  {suggestion.provider} · {suggestion.model} · {new Date(suggestion.createdAt).toLocaleString("es-ES")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {suggestion.status === "new" ? (
                    <>
                      <form action={acceptSuggestionAction}>
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <button type="submit" className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                          Aceptar
                        </button>
                      </form>
                      <form action={dismissSuggestionAction}>
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <button type="submit" className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          Descartar
                        </button>
                      </form>
                    </>
                  ) : null}

                  {suggestion.status === "accepted" ? (
                    <>
                      <form action={convertSuggestionToIdeaAction}>
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <button type="submit" className="rounded-xl bg-violet-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-600">
                          Convertir en Idea
                        </button>
                      </form>
                      <form action={dismissSuggestionAction}>
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <button type="submit" className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          Descartar
                        </button>
                      </form>
                    </>
                  ) : null}

                  {suggestion.status === "converted" ? (
                    <Link href="/ideas" className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700">
                      Ver en Ideas
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
