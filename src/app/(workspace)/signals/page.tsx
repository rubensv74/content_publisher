import { SubmitButton } from "@/components/application/submit-button";
import { refreshSourceSignalsAction } from "@/features/source-signals/actions";
import { getSourceSignals } from "@/features/source-signals/data";
import type { SourceSignalSourceType } from "@/features/source-signals/types";

const sourceLabels: Record<SourceSignalSourceType, string> = {
  github: "GitHub",
  "knowledge-base": "Knowledge Base",
  "editorial-history": "Historial editorial",
  "manual-idea": "Ideas",
};

function sourceClass(sourceType: SourceSignalSourceType) {
  if (sourceType === "editorial-history") return "bg-emerald-50 text-emerald-700";
  if (sourceType === "manual-idea") return "bg-amber-50 text-amber-800";
  if (sourceType === "knowledge-base") return "bg-violet-50 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

export default async function SignalsPage() {
  const signals = await getSourceSignals();
  const localSignals = signals.filter(
    (signal) =>
      signal.sourceType === "manual-idea" || signal.sourceType === "editorial-history",
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Suggestion Engine · Foundation
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Señales</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Memoria ligera de hechos que podrían convertirse más adelante en oportunidades de contenido. La fuente original sigue siendo la verdad; aquí solo guardamos referencias, resumen y trazabilidad.
          </p>
        </div>

        <form action={refreshSourceSignalsAction}>
          <SubmitButton
            pendingLabel="Refrescando…"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            Refrescar señales locales
          </SubmitButton>
        </form>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Siguiente conexión</p>
          <p className="mt-2 text-lg font-semibold text-amber-950">GitHub + Knowledge Base</p>
          <p className="mt-1 text-sm leading-6 text-amber-900/75">
            Pendiente de cerrar la estrategia de autenticación server-side para repositorios privados.
          </p>
        </div>
      </section>

      {signals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay señales registradas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Pulsa “Refrescar señales locales” para registrar de forma incremental las ideas actuales y el historial editorial disponible.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
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
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{signal.occurredAt ? new Date(signal.occurredAt).toLocaleString("es-ES") : "Sin fecha fuente"}</p>
                  <p className="mt-1">{signal.analysisStatus}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="truncate">Fuente: {signal.sourceLocator}</span>
                <span className="truncate">Ref: {signal.sourceRef}</span>
                <span>Última detección: {new Date(signal.lastSeenAt).toLocaleString("es-ES")}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
