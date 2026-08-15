import { SubmitButton } from "@/components/application/submit-button";

import { importChatGPTOpportunitiesAction } from "./manual-actions";

export function AssistedCurationPanel({
  imported,
  persisted,
  skipped,
  importError,
}: {
  imported: number | null;
  persisted: number | null;
  skipped: number | null;
  importError: string | null;
}) {
  return (
    <section className="mb-7 rounded-2xl border border-violet-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Curación profesional · ChatGPT Plus
          </p>
          <h2 className="mt-2 text-xl font-semibold">Power Platform primero, en español</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Las fuentes originales pueden estar en inglés. El paquete prioriza Power Platform, Power Apps, Power Automate, Dataverse, Copilot Studio, gobierno, ALM e integraciones. ChatGPT descarta novedades genéricas y devuelve solo oportunidades accionables redactadas en español.
          </p>
        </div>
        <a
          href="/opportunities/chatgpt-packet"
          className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          1. Descargar paquete para ChatGPT
        </a>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-violet-50/70 p-4">
          <p className="font-semibold">1 · Preparar</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Refresca el radar y pone primero las señales de Power Platform que todavía no están vinculadas a una oportunidad.
          </p>
        </div>
        <div className="rounded-xl bg-violet-50/70 p-4">
          <p className="font-semibold">2 · Curar</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Adjunta el TXT a ChatGPT Plus. Puede devolver hasta cinco oportunidades; no tiene que llenar el cupo si las señales no aportan valor.
          </p>
        </div>
        <div className="rounded-xl bg-violet-50/70 p-4">
          <p className="font-semibold">3 · Importar</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Content Publisher valida IDs y puntuaciones antes de persistir la oportunidad y conservar su trazabilidad a la fuente original.
          </p>
        </div>
      </div>

      {importError ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">
          <p className="font-semibold">No se pudo importar la curación.</p>
          <p className="mt-1">{importError}</p>
        </div>
      ) : null}

      {imported !== null ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          ChatGPT devolvió {imported} oportunidad(es). Se guardaron {persisted ?? 0}
          {skipped ? ` y se omitieron ${skipped} duplicada(s)` : ""}.
        </div>
      ) : null}

      <form
        action={importChatGPTOpportunitiesAction}
        encType="multipart/form-data"
        className="mt-5"
      >
        <label htmlFor="opportunitiesJson" className="text-sm font-semibold">
          JSON devuelto por ChatGPT
        </label>
        <textarea
          id="opportunitiesJson"
          name="opportunitiesJson"
          rows={8}
          placeholder={'{"opportunities":[...] }'}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 outline-none focus:border-violet-400"
        />

        <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          o subir archivo
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <input
          type="file"
          name="opportunitiesFile"
          accept=".json,.txt,application/json,text/plain"
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-3xl text-xs leading-5 text-[var(--muted)]">
            Los titulares originales permanecen en Señales para auditoría. Aquí se guarda la interpretación profesional en español, no una copia literal de la noticia.
          </p>
          <SubmitButton
            pendingLabel="Validando e importando…"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            3. Importar oportunidades
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
