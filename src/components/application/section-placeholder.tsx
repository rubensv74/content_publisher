type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  next: string;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
  next,
}: SectionPlaceholderProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">{description}</p>
      </header>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Siguiente entrega
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{next}</p>
      </div>
    </div>
  );
}
