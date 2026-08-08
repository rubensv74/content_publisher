import Link from "next/link";

const quickActions = [
  {
    title: "Capturar una idea",
    description: "Guarda una oportunidad de contenido antes de que se pierda.",
    href: "/ideas",
  },
  {
    title: "Crear publicación",
    description: "Empieza a convertir una idea en una pieza lista para LinkedIn.",
    href: "/publications",
  },
  {
    title: "Explorar diseños",
    description: "Consulta las familias y arquetipos visuales disponibles.",
    href: "/designs",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Workspace
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Convierte trabajo real en contenido que merezca ser publicado.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
          La V1 recorrerá todo el camino desde la idea hasta la publicación, manteniendo tu contenido y tu identidad visual bajo control.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-2xl border border-[var(--border)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <h2 className="font-semibold tracking-tight group-hover:text-slate-700">
              {action.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {action.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Estado del producto</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Cimentación técnica en curso. El siguiente objetivo funcional es la bandeja de ideas.
            </p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            V1 · Foundation
          </span>
        </div>
      </section>
    </div>
  );
}
