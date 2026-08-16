import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/application/submit-button";
import {
  convertNewsToOpportunityAction,
  importChatGPTNewsAction,
  updateNewsStatusAction,
} from "@/features/news/actions";
import { getNewsItems } from "@/features/news/data";
import {
  newsCategories,
  newsCategoryLabels,
  newsStatusLabels,
  type NewsCategory,
  type NewsStatus,
} from "@/features/news/types";

export const metadata: Metadata = { title: "Noticias" };

type Props = {
  searchParams: Promise<{
    category?: string;
    state?: string;
    imported?: string;
    persisted?: string;
    skipped?: string;
    importError?: string;
  }>;
};

function categoryClass(category: NewsCategory) {
  if (category === "power-apps") return "bg-emerald-50 text-emerald-700";
  if (category === "power-bi") return "bg-amber-50 text-amber-800";
  return "bg-violet-50 text-violet-700";
}

function statusClass(status: NewsStatus) {
  if (status === "converted") return "bg-blue-50 text-blue-700";
  if (status === "saved") return "bg-emerald-50 text-emerald-700";
  if (status === "dismissed") return "bg-slate-100 text-slate-500";
  if (status === "read") return "bg-slate-100 text-slate-600";
  return "bg-rose-50 text-rose-700";
}

function validCategory(value?: string): NewsCategory | null {
  return newsCategories.includes(value as NewsCategory) ? (value as NewsCategory) : null;
}

export default async function NewsPage({ searchParams }: Props) {
  const [allNews, params] = await Promise.all([getNewsItems(), searchParams]);
  const selectedCategory = validCategory(params.category);
  const selectedState = params.state === "active" ? "active" : params.state === "saved" ? "saved" : null;

  const news = allNews.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedState === "active" && ["dismissed", "converted"].includes(item.status)) return false;
    if (selectedState === "saved" && item.status !== "saved") return false;
    return true;
  });

  const counts = Object.fromEntries(
    newsCategories.map((category) => [
      category,
      allNews.filter(
        (item) => item.category === category && item.status !== "dismissed",
      ).length,
    ]),
  ) as Record<NewsCategory, number>;
  const unread = allNews.filter((item) => item.status === "unread").length;
  const imported = Number.parseInt(params.imported ?? "", 10);
  const persisted = Number.parseInt(params.persisted ?? "", 10);
  const skipped = Number.parseInt(params.skipped ?? "", 10);
  const importError = params.importError?.trim() || null;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Professional News Radar
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Noticias</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Novedades de Power Apps, Power BI e IA aplicada a tu trabajo. Las fuentes originales siguen siendo la verdad; aquí se muestran una síntesis en español y por qué merece tu atención.
          </p>
        </div>
        <a
          href="/news/chatgpt-packet"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          1. Descargar paquete para ChatGPT
        </a>
      </header>

      {Number.isFinite(imported) ? (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-950">
          Curación importada: {persisted} noticia(s) nueva(s), {Number.isFinite(skipped) ? skipped : 0} omitida(s) por duplicado. ChatGPT devolvió {imported} elemento(s).
        </section>
      ) : null}

      {importError ? (
        <section className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-sm leading-6 text-rose-950">
          <p className="font-semibold">No se pudo importar la curación.</p>
          <p className="mt-1">{importError}</p>
        </section>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sin leer</p>
          <p className="mt-2 text-3xl font-semibold">{unread}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">noticias pendientes</p>
        </div>
        {newsCategories.map((category) => (
          <div key={category} className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {newsCategoryLabels[category]}
            </p>
            <p className="mt-2 text-3xl font-semibold">{counts[category]}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">noticias conservadas</p>
          </div>
        ))}
      </section>

      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Curación asistida · ChatGPT Plus</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              La app prepara un paquete equilibrado de fuentes oficiales. ChatGPT traduce y sintetiza únicamente las noticias útiles; no crea oportunidades ni proyectos automáticamente.
            </p>
          </div>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            0 EUR · manual
          </p>
        </div>

        <form action={importChatGPTNewsAction} encType="multipart/form-data" className="mt-5">
          <label htmlFor="newsJson" className="text-sm font-semibold">
            2. JSON devuelto por ChatGPT
          </label>
          <textarea
            id="newsJson"
            name="newsJson"
            rows={7}
            placeholder={'{"news":[...] }'}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 outline-none focus:border-slate-400"
          />
          <div className="my-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">o</div>
          <input
            type="file"
            name="newsFile"
            accept=".json,.txt,application/json,text/plain"
            className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
          />
          <div className="mt-4 flex justify-end">
            <SubmitButton
              pendingLabel="Validando e importando…"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              3. Importar noticias
            </SubmitButton>
          </div>
        </form>
      </section>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/news" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          Todas
        </Link>
        {newsCategories.map((category) => (
          <Link
            key={category}
            href={`/news?category=${category}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${categoryClass(category)}`}
          >
            {newsCategoryLabels[category]}
          </Link>
        ))}
        <Link href="/news?state=active" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          Activas
        </Link>
        <Link href="/news?state=saved" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          Guardadas
        </Link>
      </div>

      {news.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay noticias curadas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Descarga el paquete, analízalo con ChatGPT Plus e importa el JSON. La app priorizará Power Apps, Power BI e IA aplicada.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryClass(item.category)}`}>
                      {newsCategoryLabels[item.category]}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(item.status)}`}>
                      {newsStatusLabels[item.status]}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Relevancia {item.relevanceScore}/5</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    <span className="font-semibold text-slate-700">Por qué te interesa: </span>
                    {item.relevanceReason}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-ES") : "Sin fecha"}</p>
                  <p className="mt-1">{item.signals.length} fuente(s)</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-3 text-xs">
                  {item.sourceUrl ? (
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 hover:text-sky-900">
                      Abrir fuente original ↗
                    </a>
                  ) : null}
                  {item.signals.map((signal) => (
                    <span key={signal.id} className="text-slate-400">
                      {signal.sourceName ?? signal.sourceLocator}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.status !== "converted" ? (
                    <>
                      {item.status !== "read" ? (
                        <form action={updateNewsStatusAction}>
                          <input type="hidden" name="newsId" value={item.id} />
                          <input type="hidden" name="status" value="read" />
                          <SubmitButton pendingLabel="Marcando…" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-wait disabled:opacity-60">
                            Marcar leída
                          </SubmitButton>
                        </form>
                      ) : null}
                      {item.status !== "saved" ? (
                        <form action={updateNewsStatusAction}>
                          <input type="hidden" name="newsId" value={item.id} />
                          <input type="hidden" name="status" value="saved" />
                          <SubmitButton pendingLabel="Guardando…" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-wait disabled:opacity-60">
                            Guardar
                          </SubmitButton>
                        </form>
                      ) : null}
                      <form action={updateNewsStatusAction}>
                        <input type="hidden" name="newsId" value={item.id} />
                        <input type="hidden" name="status" value="dismissed" />
                        <SubmitButton pendingLabel="Descartando…" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 disabled:cursor-wait disabled:opacity-60">
                          Descartar
                        </SubmitButton>
                      </form>
                      <form action={convertNewsToOpportunityAction}>
                        <input type="hidden" name="newsId" value={item.id} />
                        <SubmitButton pendingLabel="Creando oportunidad…" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">
                          Convertir en oportunidad
                        </SubmitButton>
                      </form>
                    </>
                  ) : (
                    <Link href="/opportunities" className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                      Ver oportunidad →
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
