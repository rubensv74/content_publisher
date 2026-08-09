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
  technology: "Radar tecnológico",
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
    (signal) =>
      signal.sourceType === "manual-idea" || signal.sourceType === "editorial-history",
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
            Opportunity Radar · Source Signals
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Señales</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Memoria ligera de hechos que podrían convertirse en oportunidades profesionales o editoriales. La fuente original sigue siendo la verdad; aquí guardamos referencias, resumen y trazabilidad.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={refreshSourceSignalsAction}>
            <SubmitButton
              pendingLabel="Refrescando…"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              Refrescar locales
            </SubmitButton>
          </form>

          {githubStatus.configured ? (
            <form action={refreshGitHubSourceSignalsAction}>
              <SubmitButton
                pendingLabel="Leyendo GitHub…"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
              >
                Refrescar GitHub
              </SubmitButton>
            </form>
          ) : null}

          <form action={refreshTechnologySourceSignalsAction}>
            <SubmitButton
              pendingLabel="Leyendo fuentes…"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              Refrescar tecnología
            </SubmitButton>
          </form>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Memoria</p>
          <p className="mt-2 text-3xl font-semibold">{signals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">señales registradas</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fuentes locales</p>
          <p className="mt-2 text-3xl font-semibold">{localSignals.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">ideas + historial editorial</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Radar tecnológico</p>
          <p className="mt-2 text-3xl font-semibold">{technologySignals.length}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            señales de fuentes oficiales gratuitas
          </p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            githubStatus.configured
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-amber-200 bg-amber-50/60"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${
              githubStatus.configured ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            GitHub Source Reader
          </p>
          <p className="mt-2 text-lg font-semibold">
            {githubStatus.configured ? "Preparado" : "Pendiente de configurar"}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {githubStatus.configured
              ? `${githubStatus.repositories.length} repositorio(s) en allowlist · ${githubSignals.length} señal(es) GitHub/Knowledge Base.`
              : "Añade el token read-only y la allowlist en Vercel. El secreto nunca se almacena en Supabase ni llega al navegador."}
          </p>
        </div>
      </section>

      {signals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay señales registradas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Refresca las fuentes locales o el radar tecnológico. Las fuentes tecnológicas iniciales son oficiales, públicas y no generan coste adicional.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => {
            const url = itemUrl(signal.metadata);

            return (
              <article
                key={signal.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 max-w-4xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sourceClass(signal.sourceType)}`}
                      >
                        {sourceLabels[signal.sourceType]}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{signal.signalType}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold">{signal.title}</h2>
                    {signal.summary ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{signal.summary}</p>
                    ) : null}
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-900"
                      >
                        Abrir fuente original ↗
                      </a>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>
                      {signal.occurredAt
                        ? new Date(signal.occurredAt).toLocaleString("es-ES")
                        : "Sin fecha fuente"}
                    </p>
                    <p className="mt-1">{signal.analysisStatus}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="truncate">Fuente: {signal.sourceLocator}</span>
                  <span className="truncate">Ref: {signal.sourceRef}</span>
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
