import { designFamilies } from "@/config/design-families";
import { v1ArchetypePlan } from "@/config/v1-archetype-plan";
import { publicationArchetypes } from "@/publication-renderer/archetypes/registry";

function familyLabel(key: string) {
  return designFamilies.find((family) => family.key === key)?.label ?? key;
}

export default function DesignsPage() {
  const implementedKeys = new Set(publicationArchetypes.map((design) => design.key));
  const implementedV1 = v1ArchetypePlan.filter(
    (item) => item.implementationKey && implementedKeys.has(item.implementationKey),
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 max-w-4xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Design Library
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Biblioteca visual</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Content Publisher no usa un lienzo libre. Trabaja con arquetipos versionados: eliges una composición adecuada al contenido y la identidad central aporta coherencia entre publicaciones distintas.
        </p>
      </header>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operativos
            </p>
            <h2 className="mt-2 text-xl font-semibold">Diseños disponibles hoy</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {publicationArchetypes.length} activos
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {publicationArchetypes.map((design) => (
            <article
              key={design.key}
              className="rounded-2xl border border-[var(--border)] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {familyLabel(design.family)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{design.name}</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Operativo
                </span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formato</dt>
                  <dd className="mt-1">{design.supportedFormats.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variantes</dt>
                  <dd className="mt-1">{design.variants.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Versión</dt>
                  <dd className="mt-1">v{design.version}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Objetivo V1
            </p>
            <h2 className="mt-2 text-xl font-semibold">Cobertura de arquetipos</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              La V1 persigue doce composiciones base y varias variantes controladas. Se incorporan por bloques y se validan con contenido real antes de considerarlas cerradas.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {implementedV1} / {v1ArchetypePlan.length} V1
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {v1ArchetypePlan.map((item) => {
            const implemented = Boolean(
              item.implementationKey && implementedKeys.has(item.implementationKey),
            );

            return (
              <article
                key={item.code}
                className={`rounded-2xl border p-5 ${
                  implemented
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-slate-500">{item.code}</p>
                    <h3 className="mt-1 font-semibold">{item.name}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      implemented
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {implemented ? "Implementado" : "Pendiente"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.use}</p>
                <p className="mt-4 text-xs text-slate-500">
                  {familyLabel(item.family)} · {item.variants.length} variantes objetivo
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
        <p className="text-sm leading-6 text-[var(--muted)]">
          <strong className="text-slate-900">Build Note</strong> permanece como arquetipo editorial operativo adicional. No se fuerza a encajar artificialmente en ED-01: se conserva porque resuelve bien publicaciones sobre decisiones y aprendizajes de construcción.
        </p>
      </section>
    </div>
  );
}
