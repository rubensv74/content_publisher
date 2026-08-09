import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/application/submit-button";
import { getSourceSignals } from "@/features/source-signals/data";
import {
  acceptSuggestionAction,
  convertSuggestionToIdeaAction,
  dismissSuggestionAction,
  importChatGPTSuggestionsAction,
} from "@/features/suggestions/actions";
import { getSuggestions } from "@/features/suggestions/data";
import { selectSignalsForSuggestionModel } from "@/features/suggestions/input";
import type { SuggestionPriority, SuggestionStatus } from "@/features/suggestions/types";

export const metadata: Metadata = { title: "Sugerencias" };

const statusLabels: Record<SuggestionStatus, string> = {
  new: "Pendiente",
  accepted: "Aceptada",
  dismissed: "Descartada",
  converted: "Convertida en Idea",
};
const priorityLabels: Record<SuggestionPriority, string> = { low: "Baja", medium: "Media", high: "Alta" };

function statusClass(status: SuggestionStatus) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-700";
  if (status === "dismissed") return "bg-slate-100 text-slate-500";
  if (status === "converted") return "bg-violet-50 text-violet-700";
  return "bg-amber-50 text-amber-800";
}

type Props = { searchParams: Promise<{ imported?: string }> };

export default async function SuggestionsPage({ searchParams }: Props) {
  const [suggestions, signals, params] = await Promise.all([getSuggestions(), getSourceSignals(), searchParams]);
  const availableSignals = selectSignalsForSuggestionModel(signals);
  const pending = suggestions.filter((item) => item.status === "new").length;
  const accepted = suggestions.filter((item) => item.status === "accepted").length;
  const imported = Number.parseInt(params.imported ?? "", 10);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Suggestion Engine</p>
          <h1 className="text-4xl font-semibold tracking-tight">Sugerencias editoriales</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">Content Publisher prepara el contexto y ChatGPT Plus realiza el análisis de forma asistida. No existe una API de IA ni un coste adicional de proveedor dentro de la aplicación.</p>
        </div>
        <a href="/suggestions/chatgpt-packet" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">1. Descargar paquete para ChatGPT</a>
      </header>

      {Number.isFinite(imported) ? (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-950">Se importaron {imported} propuestas desde el flujo asistido con ChatGPT.</section>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Disponibles</p><p className="mt-2 text-3xl font-semibold">{availableSignals.length}</p><p className="mt-1 text-sm text-[var(--muted)]">señales pendientes</p></div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pendientes</p><p className="mt-2 text-3xl font-semibold">{pending}</p><p className="mt-1 text-sm text-[var(--muted)]">propuestas por revisar</p></div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Aceptadas</p><p className="mt-2 text-3xl font-semibold">{accepted}</p><p className="mt-1 text-sm text-[var(--muted)]">listas para convertirse en Idea</p></div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">IA</p><p className="mt-2 text-lg font-semibold">ChatGPT Plus · manual</p><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Sin OPENAI_API_KEY y sin llamadas de pago desde la app.</p></div>
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Flujo asistido</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold">1 · Preparar</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Descarga el TXT. La app refresca las señales y añade contexto técnico limitado y sanitizado.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold">2 · Analizar</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Abre ChatGPT Plus, adjunta el TXT y sigue las instrucciones que contiene. ChatGPT devolverá únicamente JSON.</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold">3 · Importar</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Copia el JSON de la respuesta y pégalo abajo. Content Publisher lo valida antes de guardarlo.</p></div>
        </div>
        <form action={importChatGPTSuggestionsAction} className="mt-5">
          <label htmlFor="suggestionsJson" className="text-sm font-semibold">JSON devuelto por ChatGPT</label>
          <textarea id="suggestionsJson" name="suggestionsJson" rows={10} required placeholder={'{"suggestions":[...] }'} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 outline-none focus:border-slate-400" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">La importación rechaza IDs de señales inexistentes y valores fuera del contrato.</p><SubmitButton pendingLabel="Validando e importando…" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">3. Importar sugerencias</SubmitButton></div>
        </form>
      </section>

      {suggestions.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"><h2 className="text-lg font-semibold">Todavía no hay sugerencias</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Descarga un paquete, procésalo en ChatGPT Plus e importa el JSON resultante.</p><Link href="/signals" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Ver señales</Link></section>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <article key={suggestion.id} className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-4xl"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(suggestion.status)}`}>{statusLabels[suggestion.status]}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Prioridad {priorityLabels[suggestion.priority]}</span><span className="text-xs text-slate-500">Confianza {Math.round(suggestion.confidence * 100)}%</span></div><h2 className="mt-3 text-xl font-semibold tracking-tight">{suggestion.title}</h2><p className="mt-3 text-sm leading-6 text-slate-800">{suggestion.opportunity}</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><span className="font-semibold text-slate-700">Por qué puede aportar valor: </span>{suggestion.rationale}</p></div><div className="min-w-52 text-right text-xs text-slate-500"><p>{suggestion.storyType}</p><p className="mt-1">{suggestion.format}</p><p className="mt-1">{suggestion.designFamily} · {suggestion.archetypeKey}</p></div></div>
              <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Señales que la justifican</p><div className="mt-2 flex flex-wrap gap-2">{suggestion.sourceSignals.map((signal) => <span key={signal.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">{signal.sourceType} · {signal.title}</span>)}</div></div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-400">{suggestion.provider} · {suggestion.model} · {new Date(suggestion.createdAt).toLocaleString("es-ES")}</p><div className="flex flex-wrap gap-2">{suggestion.status === "new" ? <><form action={acceptSuggestionAction}><input type="hidden" name="suggestionId" value={suggestion.id} /><button type="submit" className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white">Aceptar</button></form><form action={dismissSuggestionAction}><input type="hidden" name="suggestionId" value={suggestion.id} /><button type="submit" className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600">Descartar</button></form></> : null}{suggestion.status === "accepted" ? <><form action={convertSuggestionToIdeaAction}><input type="hidden" name="suggestionId" value={suggestion.id} /><button type="submit" className="rounded-xl bg-violet-700 px-3.5 py-2 text-sm font-semibold text-white">Convertir en Idea</button></form><form action={dismissSuggestionAction}><input type="hidden" name="suggestionId" value={suggestion.id} /><button type="submit" className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600">Descartar</button></form></> : null}{suggestion.status === "converted" ? <Link href="/ideas" className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700">Ver en Ideas</Link> : null}</div></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
