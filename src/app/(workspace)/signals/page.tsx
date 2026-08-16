import Link from "next/link";

import { SubmitButton } from "@/components/application/submit-button";
import {
  refreshGitHubSourceSignalsAction,
  refreshSourceSignalsAction,
  refreshTechnologySourceSignalsAction,
} from "@/features/source-signals/actions";
import { getSourceSignals } from "@/features/source-signals/data";
import type { SourceSignalSourceType } from "@/features/source-signals/types";
import { getGitHubSourceConnectionStatus } from "@/lib/github-source/client";

const sourceLabels: Record<SourceSignalSourceType, string> = {
  github: "GitHub",
  "knowledge-base": "Knowledge Base",
  "editorial-history": "Historial editorial",
  "manual-idea": "Ideas",
  technology: "Fuente tecnológica",
};

function sourceClass(sourceType: SourceSignalSourceType) {
  if (sourceType === "editorial-history") return "bg-emerald-50 text-emerald-700";
  if (sourceType === "manual-idea") return "bg-amber-50 text-amber-800";
  if (sourceType === "knowledge-base") return "bg-violet-50 text-violet-700";
  if (sourceType === "technology") return "bg-sky-50 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

function itemUrl(metadata: Record<string, unknown>) {
  return typeof metadata.itemUrl === "string" ? metadata.itemUrl : null;
}

export default async function SignalsPage() {
  const signals = await getSourceSignals();
  const githubStatus = getGitHubSourceConnectionStatus();
  const localSignals = signals.filter(
    (signal) => signal.sourceType === "manual-idea" || signal.sourceType === "editorial-history",
  );
  const githubSignals = signals.filter(
    (signal) => signal.sourceType === "github" || signal.sourceType === "knowledge-base",
  );
  const technologySignals = signals.filter((signal) => signal.sourceType === "technology");

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Source Signals
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Señales</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Memoria técnica de hechos detectados. Aquí conservamos referencias y trazabilidad; las noticias profesionales se curan después y las oportunidades requieren una decisión humana.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={refreshSourceSignalsAction}>
            <SubmitButton pendingLabel="Refrescando…" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-60">
              Refrescar locales
            </SubmitButton>
          </form>
          {githubStatus.configured ? (
            <form action={refreshGitHubSourceSignalsAction}>
              <SubmitButton pendingLabel="Leyendo GitHub…" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-60">
                Refrescar GitHub
              </SubmitButton>
            </form>
          ) : null}
          <form action={refreshTechnologySourceSignalsAction}>
            <SubmitButton pendingLabel="Leyendo fuentes…" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
              Refrescar fuentes
            </SubmitButton>
          </form>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Memoria</p>
          <p className="mt-2 text-3xl font-semibold">{signals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">señales registradas</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trabajo propio</p>
          <p className="mt-2 text-3xl font-semibold">{localSignals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">ideas + historial</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Fuentes profesionales</p>
          <p className="mt-2 text-3xl font-semibold">{technologySignals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Power Apps · Power BI · IA + secundarias</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">GitHub / KB</p>
          <p className="mt-2 text-3xl font-semibold">{githubSignals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">contexto técnico propio</p>
        </div>
      </section>

      {technologySignals.length > 0 ? (
        <section className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/60 p-5 text-sm leading-6 text-violet-950">
          <p className="font-semibold">Las fuentes tecnológicas se consumen ahora desde Noticias.</p>
          <p className="mt-1">
            El titular original puede estar en inglés. El Radar de Noticias lo filtra, sintetiza en español y lo clasifica como Power Apps, Power BI o IA aplicada antes de que decidas convertirlo en Opportunity.
          </p>
          <Link href="/news" className="mt-3 inline-flex font-semibold underline underline-offset-4">
            Ir a Noticias →
          </Link>
        </section>
      ) : null}

      {signals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay señales registradas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Refresca las fuentes. Después utiliza Noticias para la curación profesional en español.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => {
            const url = itemUrl(signal.metadata);
            return (
              <article key={signal.id} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceClass(signal.sourceType)}`}>
                        {sourceLabels[signal.sourceType]}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{signal.signalType}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold">{signal.title}</h2>
                    {signal.summary ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{signal.summary}</p> : null}
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-900">
                        Abrir fuente original ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{signal.occurredAt ? new Date(signal.occurredAt).toLocaleString("es-ES") : "Sin fecha fuente"}</p>
                    <p className="mt-1">{signal.analysisStatus}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Fuente: {signal.sourceLocator}</span>
                  <span>Última detección: {new Date(signal.lastSeenAt).toLocaleString("es-ES")}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
