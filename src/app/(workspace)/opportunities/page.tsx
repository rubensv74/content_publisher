import type { Metadata } from "next";
import Link from "next/link";

import { SubmitButton } from "@/components/application/submit-button";
import {
  updateOpportunityEvaluationAction,
  updateOpportunityResearchAction,
  updateOpportunityStatusAction,
} from "@/features/opportunities/actions";
import { getOpportunities } from "@/features/opportunities/data";
import {
  allowedOpportunityTransitions,
  opportunityScoreFormula,
} from "@/features/opportunities/scoring";
import {
  opportunityPriorityLabels,
  opportunityStatusLabels,
  type OpportunityPriority,
  type OpportunityStatus,
} from "@/features/opportunities/types";

export const metadata: Metadata = { title: "Oportunidades" };

type Props = {
  searchParams: Promise<{ created?: string }>;
};

const scoreFields = [
  ["professionalRelevance", "Relevancia"],
  ["actionability", "Accionabilidad"],
  ["learningPotential", "Aprendizaje"],
  ["projectPotential", "Proyecto"],
  ["caseStudyPotential", "Caso de estudio"],
  ["editorialPotential", "Editorial"],
  ["novelty", "Novedad"],
  ["effort", "Esfuerzo"],
] as const;

function statusClass(status: OpportunityStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "case_study") return "bg-violet-50 text-violet-700";
  if (status === "researching" || status === "project_candidate") {
    return "bg-blue-50 text-blue-700";
  }
  if (status === "dismissed" || status === "archived") {
    return "bg-slate-100 text-slate-500";
  }
  if (status === "shortlisted") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function priorityClass(priority: OpportunityPriority) {
  if (priority === "high") return "bg-rose-50 text-rose-700";
  if (priority === "medium") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function scoreValue(
  opportunity: Awaited<ReturnType<typeof getOpportunities>>[number],
  key: (typeof scoreFields)[number][0],
) {
  return opportunity[key];
}

function showsResearchWorkspace(status: OpportunityStatus) {
  return ["researching", "project_candidate", "active", "case_study"].includes(status);
}

const researchFieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-blue-300";

export default async function OpportunitiesPage({ searchParams }: Props) {
  const [opportunities, params] = await Promise.all([getOpportunities(), searchParams]);
  const highPriority = opportunities.filter((item) => item.priority === "high").length;
  const inProgress = opportunities.filter((item) =>
    ["researching", "project_candidate", "active"].includes(item.status),
  ).length;
  const caseStudies = opportunities.filter((item) => item.status === "case_study").length;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Opportunity Radar · Backlog
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Oportunidades</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Aquí solo llegan temas que has decidido convertir en trabajo. Las noticias se leen y filtran antes en el Radar; una Opportunity ya implica investigar, probar, diseñar un prototipo o generar evidencia profesional.
          </p>
        </div>
        <Link
          href="/news"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Revisar noticias
        </Link>
      </header>

      {params.created === "1" ? (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-950">
          Oportunidad creada. Revisa su relevancia y puntuaciones antes de seleccionarla.
        </section>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Backlog</p>
          <p className="mt-2 text-3xl font-semibold">{opportunities.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">oportunidades registradas</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Prioridad alta</p>
          <p className="mt-2 text-3xl font-semibold">{highPriority}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">según scoring explicable</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">En trabajo</p>
          <p className="mt-2 text-3xl font-semibold">{inProgress}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">investigación o proyecto</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">Caso de estudio</p>
          <p className="mt-2 text-3xl font-semibold">{caseStudies}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">con evidencia suficiente</p>
        </div>
      </section>

      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold">Cómo se calcula la prioridad</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {opportunityScoreFormula}. Cada dimensión se puntúa de 1 a 5. La prioridad es alta desde 45 puntos, media desde 30 y baja por debajo de 30. Las puntuaciones son visibles y editables; no existe un ranking opaco.
        </p>
      </section>

      {opportunities.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Todavía no hay oportunidades</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Revisa Noticias y convierte únicamente aquello que merezca investigación, aprendizaje o un prototipo real.
          </p>
          <Link href="/news" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            Ir a Noticias
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(opportunity.status)}`}>
                      {opportunityStatusLabels[opportunity.status]}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass(opportunity.priority)}`}>
                      Prioridad {opportunityPriorityLabels[opportunity.priority]}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Score {opportunity.priorityScore}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">{opportunity.title}</h2>
                  {opportunity.summary ? (
                    <p className="mt-3 text-sm leading-6 text-slate-700">{opportunity.summary}</p>
                  ) : null}
                  {opportunity.relevanceReason ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      <span className="font-semibold text-slate-700">Por qué puede importar: </span>
                      {opportunity.relevanceReason}
                    </p>
                  ) : null}
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{opportunity.signals.length} señal(es) vinculada(s)</p>
                  <p className="mt-1">Actualizada {new Date(opportunity.updatedAt).toLocaleString("es-ES")}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Trazabilidad · fuente original</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opportunity.signals.map((signal) => (
                    <span key={signal.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                      {signal.sourceType} · {signal.title}
                    </span>
                  ))}
                </div>
              </div>

              <form action={updateOpportunityEvaluationAction} className="mt-5 border-t border-slate-100 pt-5">
                <input type="hidden" name="opportunityId" value={opportunity.id} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {scoreFields.map(([key, label]) => (
                    <label key={key} className="text-xs font-semibold text-slate-600">
                      {label}
                      <select
                        name={key}
                        defaultValue={scoreValue(opportunity, key)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <label className="mt-4 block text-xs font-semibold text-slate-600">
                  Motivo de relevancia
                  <textarea
                    name="relevanceReason"
                    rows={3}
                    defaultValue={opportunity.relevanceReason ?? ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6"
                  />
                </label>

                <div className="mt-3 flex justify-end">
                  <SubmitButton
                    pendingLabel="Guardando evaluación…"
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    Guardar evaluación
                  </SubmitButton>
                </div>
              </form>

              {opportunity.status === "shortlisted" ? (
                <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 text-sm leading-6 text-blue-950">
                  <p className="font-semibold">Lista para investigar</p>
                  <p className="mt-1">
                    Cambia el estado a <strong>Investigando</strong> para abrir un cuaderno estructurado donde separar preguntas, plan, evidencias, hallazgos y conclusiones.
                  </p>
                </section>
              ) : null}

              {showsResearchWorkspace(opportunity.status) ? (
                <section className="mt-5 border-t border-slate-100 pt-5">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Research Workspace</p>
                        <h3 className="mt-2 text-lg font-semibold">Cuaderno de investigación</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          Registra qué quieres validar, cómo lo comprobarás y qué evidencia has encontrado. Una oportunidad solo debería avanzar a proyecto cuando exista una conclusión explícita.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
                        {opportunityStatusLabels[opportunity.status]}
                      </span>
                    </div>

                    <form action={updateOpportunityResearchAction} className="mt-5">
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <div className="grid gap-4 lg:grid-cols-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Qué quiero averiguar o validar
                          <textarea
                            name="researchObjective"
                            rows={3}
                            defaultValue={opportunity.researchWorkspace.objective ?? ""}
                            placeholder="Ej.: determinar qué datos gobernados puede consultar Copilot y qué cambia para el diseño funcional de una solución Power BI."
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Preguntas que debo resolver
                          <textarea
                            name="researchQuestions"
                            rows={3}
                            defaultValue={opportunity.researchWorkspace.questions ?? ""}
                            placeholder="Una pregunta por línea. Qué está disponible, requisitos, límites, seguridad, escenarios de uso…"
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Cómo lo voy a comprobar
                          <textarea
                            name="researchValidationPlan"
                            rows={4}
                            defaultValue={opportunity.researchWorkspace.validationPlan ?? ""}
                            placeholder="Documentación oficial, prueba controlada, comparación, prototipo, preguntas a resolver…"
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Evidencias y enlaces
                          <textarea
                            name="researchEvidence"
                            rows={4}
                            defaultValue={opportunity.researchWorkspace.evidence ?? ""}
                            placeholder="URLs oficiales, capturas, resultados de pruebas, restricciones observadas…"
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Hallazgos
                          <textarea
                            name="researchFindings"
                            rows={4}
                            defaultValue={opportunity.researchWorkspace.findings ?? ""}
                            placeholder="Solo lo observado o confirmado; separa hechos de hipótesis."
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Conclusión
                          <textarea
                            name="researchConclusion"
                            rows={4}
                            defaultValue={opportunity.researchWorkspace.conclusion ?? ""}
                            placeholder="Qué has aprendido y si la oportunidad merece avanzar."
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700 lg:col-span-2">
                          Siguiente paso
                          <textarea
                            name="researchNextStep"
                            rows={2}
                            defaultValue={opportunity.researchWorkspace.nextStep ?? ""}
                            placeholder="Continuar investigando, construir un prototipo, convertir en candidata a proyecto o descartar."
                            className={researchFieldClass}
                          />
                        </label>
                        <label className="text-xs font-semibold text-slate-700 lg:col-span-2">
                          Notas libres
                          <textarea
                            name="researchNotes"
                            rows={3}
                            defaultValue={opportunity.researchNotes ?? ""}
                            placeholder="Apuntes auxiliares que no encajan todavía en una conclusión estructurada."
                            className={researchFieldClass}
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <SubmitButton
                          pendingLabel="Guardando investigación…"
                          className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                        >
                          Guardar investigación
                        </SubmitButton>
                      </div>
                    </form>
                  </div>
                </section>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400">Estado desde {new Date(opportunity.statusChangedAt).toLocaleString("es-ES")}</p>
                <div className="flex flex-wrap gap-2">
                  {allowedOpportunityTransitions[opportunity.status].map((nextStatus) => (
                    <form key={nextStatus} action={updateOpportunityStatusAction}>
                      <input type="hidden" name="opportunityId" value={opportunity.id} />
                      <input type="hidden" name="status" value={nextStatus} />
                      <SubmitButton
                        pendingLabel="Actualizando…"
                        className={
                          nextStatus === "active" || nextStatus === "case_study"
                            ? "rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                            : "rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 disabled:cursor-wait disabled:opacity-60"
                        }
                      >
                        {opportunityStatusLabels[nextStatus]}
                      </SubmitButton>
                    </form>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
