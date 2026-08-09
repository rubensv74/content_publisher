import Link from "next/link";

import { DeleteDraftButton } from "@/features/publishing/delete-draft-button";
import { getPublishingHistory } from "@/features/publishing/history";

function actionLabel(action: string) {
  if (action === "publish-now") return "Publicar ahora";
  if (action === "schedule") return "Programada";
  if (action === "draft") return "Draft en Buffer";
  return action;
}

function statusLabel(action: string, status: string) {
  if (action === "draft" && status === "sent") return "Draft creado";
  if (action === "draft" && status === "cancelled") return "Draft eliminado";
  if (status === "scheduled") return "Programada";
  if (status === "published") return "Publicada";
  if (status === "failed") return "Error";
  if (status === "pending") return "Procesando";
  return status;
}

function statusClass(status: string) {
  if (status === "published" || status === "sent" || status === "scheduled") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700";
  }

  if (status === "cancelled") {
    return "bg-slate-100 text-slate-500";
  }

  return "bg-slate-100 text-slate-600";
}

export default async function HistoryPage() {
  const history = await getPublishingHistory();
  const activeDrafts = history.filter(
    (item) => item.action === "draft" && item.status === "sent" && item.externalId,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Editorial History
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Historial</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Aquí puedes comprobar qué se envió a Buffer, qué render se utilizó y el resultado de cada operación.
        </p>
      </header>

      {activeDrafts.length > 1 ? (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Hay {activeDrafts.length} drafts activos en Buffer.</p>
          <p className="mt-1">
            Durante la prueba se generaron varios borradores al pulsar el botón repetidamente. Puedes conservar uno y eliminar los demás desde este historial sin publicar nada en LinkedIn.
          </p>
        </section>
      ) : null}

      {history.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay actividad de publicación</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Cuando envíes, programes o guardes un draft mediante Buffer, aparecerá aquí con el render exacto utilizado y su estado.
          </p>
          <Link
            href="/publications"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ir a Publicaciones
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/publications/${item.publicationId}/studio`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {item.publicationTitle}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.publicationTopic || "Sin tema"}
                    {item.renderType ? ` · ${item.renderType.toUpperCase()}` : ""}
                    {item.archetypeKey ? ` · ${item.archetypeKey}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                  {statusLabel(item.action, item.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Acción
                  </p>
                  <p className="mt-1 font-medium">{actionLabel(item.action)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Creado
                  </p>
                  <p className="mt-1 font-medium">
                    {new Date(item.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Programado
                  </p>
                  <p className="mt-1 font-medium">
                    {item.scheduledFor
                      ? new Date(item.scheduledFor).toLocaleString("es-ES")
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Buffer ID
                  </p>
                  <p className="mt-1 truncate font-medium">{item.externalId || "—"}</p>
                </div>
              </div>

              {item.errorMessage ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {item.errorMessage}
                </p>
              ) : null}

              {item.externalUrl ? (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4"
                >
                  Abrir publicación externa ↗
                </a>
              ) : null}

              {item.action === "draft" && item.status === "sent" && item.externalId ? (
                <DeleteDraftButton jobId={item.id} />
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
