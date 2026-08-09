import { SubmitButton } from "@/components/application/submit-button";
import type { VisualConfig } from "@/publication-renderer/contracts";

import { savePublicationVisualConfig } from "./actions";
import { getArchetypeVisualConfig } from "./config";

const inputClass =
  "w-full rounded-xl border border-[var(--border)] px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-500";

function value(config: Record<string, unknown>, key: string, fallback = "") {
  const item = config[key];
  return typeof item === "string" ? item : fallback;
}

export function VisualConfigEditor({
  publicationId,
  archetypeKey,
  visualConfig,
}: {
  publicationId: string;
  archetypeKey: string;
  visualConfig: VisualConfig;
}) {
  const config = getArchetypeVisualConfig(visualConfig, archetypeKey);

  if (
    ![
      "metric-hero",
      "annotated-screenshot",
      "before-after",
      "code-focus",
      "data-story",
    ].includes(archetypeKey)
  ) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Visual config
        </p>
        <h2 className="mt-2 text-xl font-semibold">Datos específicos del diseño</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Estos datos pertenecen al diseño, no a la historia. Se conservan aunque cambies temporalmente de arquetipo.
        </p>
      </div>

      <form action={savePublicationVisualConfig} className="space-y-4">
        <input type="hidden" name="publicationId" value={publicationId} />
        <input type="hidden" name="archetypeKey" value={archetypeKey} />

        {archetypeKey === "metric-hero" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Valor principal
              <input
                name="metricValue"
                required
                maxLength={40}
                defaultValue={value(config, "value")}
                className={`mt-2 ${inputClass}`}
                placeholder="42%"
              />
            </label>
            <label className="text-sm font-medium">
              Qué significa
              <input
                name="metricLabel"
                required
                maxLength={100}
                defaultValue={value(config, "label")}
                className={`mt-2 ${inputClass}`}
                placeholder="menos tiempo de preparación"
              />
            </label>
            <label className="text-sm font-medium">
              Delta opcional
              <input
                name="metricDelta"
                maxLength={40}
                defaultValue={value(config, "delta")}
                className={`mt-2 ${inputClass}`}
                placeholder="-18% vs. proceso anterior"
              />
            </label>
            <label className="text-sm font-medium">
              Contexto breve
              <input
                name="metricContext"
                maxLength={120}
                defaultValue={value(config, "context")}
                className={`mt-2 ${inputClass}`}
                placeholder="medido durante la demo"
              />
            </label>
          </div>
        ) : null}

        {archetypeKey === "annotated-screenshot" ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Posiciones expresadas como porcentaje del screenshot: X desde la izquierda, Y desde arriba.
            </p>
            {[1, 2, 3, 4].map((index) => {
              const annotations = Array.isArray(config.annotations) ? config.annotations : [];
              const current =
                typeof annotations[index - 1] === "object" && annotations[index - 1] !== null
                  ? (annotations[index - 1] as Record<string, unknown>)
                  : {};
              return (
                <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_100px_100px]">
                  <label className="text-sm font-medium">
                    Anotación {index}
                    <input
                      name={`annotation${index}Label`}
                      maxLength={90}
                      defaultValue={value(current, "label")}
                      className={`mt-2 ${inputClass}`}
                      placeholder={index === 1 ? "Filtro interactivo" : "Opcional"}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    X %
                    <input
                      name={`annotation${index}X`}
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={typeof current.x === "number" ? current.x : 25 + (index - 1) * 15}
                      className={`mt-2 ${inputClass}`}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Y %
                    <input
                      name={`annotation${index}Y`}
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={typeof current.y === "number" ? current.y : 25 + (index - 1) * 12}
                      className={`mt-2 ${inputClass}`}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        ) : null}

        {archetypeKey === "before-after" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Etiqueta estado anterior
              <input
                name="beforeLabel"
                required
                maxLength={40}
                defaultValue={value(config, "beforeLabel", "Antes")}
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-sm font-medium">
              Etiqueta estado actual
              <input
                name="afterLabel"
                required
                maxLength={40}
                defaultValue={value(config, "afterLabel", "Después")}
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Cambio principal
              <textarea
                name="changeSummary"
                rows={3}
                maxLength={240}
                defaultValue={value(config, "summary")}
                className={`mt-2 ${inputClass}`}
                placeholder="Qué cambió y por qué importa"
              />
            </label>
          </div>
        ) : null}

        {archetypeKey === "code-focus" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Lenguaje
                <input
                  name="codeLanguage"
                  required
                  maxLength={40}
                  defaultValue={value(config, "language", "typescript")}
                  className={`mt-2 ${inputClass}`}
                  placeholder="typescript"
                />
              </label>
              <label className="text-sm font-medium">
                Líneas destacadas
                <input
                  name="highlightLines"
                  maxLength={60}
                  defaultValue={Array.isArray(config.highlightLines) ? config.highlightLines.join(", ") : ""}
                  className={`mt-2 ${inputClass}`}
                  placeholder="3, 4, 5"
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Fragmento de código
              <textarea
                name="codeSnippet"
                required
                rows={10}
                maxLength={4000}
                defaultValue={value(config, "snippet")}
                className={`mt-2 font-mono ${inputClass}`}
                placeholder="const result = ..."
              />
            </label>
            <label className="block text-sm font-medium">
              Explicación breve
              <textarea
                name="codeExplanation"
                rows={3}
                maxLength={300}
                defaultValue={value(config, "explanation")}
                className={`mt-2 ${inputClass}`}
                placeholder="Qué resuelve este fragmento"
              />
            </label>
          </div>
        ) : null}

        {archetypeKey === "data-story" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Título del dato
                <input
                  name="dataTitle"
                  required
                  maxLength={100}
                  defaultValue={value(config, "title")}
                  className={`mt-2 ${inputClass}`}
                  placeholder="Tiempo medio por publicación"
                />
              </label>
              <label className="text-sm font-medium">
                Unidad
                <input
                  name="dataUnit"
                  maxLength={30}
                  defaultValue={value(config, "unit")}
                  className={`mt-2 ${inputClass}`}
                  placeholder="min"
                />
              </label>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((index) => {
                const series = Array.isArray(config.series) ? config.series : [];
                const current =
                  typeof series[index - 1] === "object" && series[index - 1] !== null
                    ? (series[index - 1] as Record<string, unknown>)
                    : {};
                return (
                  <div key={index} className="grid gap-3 sm:grid-cols-[1fr_160px]">
                    <input
                      name={`data${index}Label`}
                      maxLength={60}
                      defaultValue={value(current, "label")}
                      className={inputClass}
                      placeholder={index <= 2 ? `Categoría ${index}` : "Opcional"}
                    />
                    <input
                      name={`data${index}Value`}
                      inputMode="decimal"
                      defaultValue={typeof current.value === "number" ? current.value : ""}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
            <label className="block text-sm font-medium">
              Insight principal
              <textarea
                name="dataTakeaway"
                rows={3}
                maxLength={300}
                defaultValue={value(config, "takeaway")}
                className={`mt-2 ${inputClass}`}
                placeholder="Qué decisión o aprendizaje sale de estos datos"
              />
            </label>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <SubmitButton
            pendingLabel="Guardando configuración…"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            Guardar configuración visual
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
