import type { RenderablePublication } from "../../contracts";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(config: Record<string, unknown>, key: string, fallback = "") {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function DataStoryCard({ publication }: { publication: RenderablePublication }) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const config = asRecord(publication.visualConfig["data-story"]);
  const title = text(config, "title", publication.title);
  const unit = text(config, "unit");
  const takeaway = text(
    config,
    "takeaway",
    typeof publication.structuredContent.insight === "string"
      ? publication.structuredContent.insight
      : "Los datos son útiles cuando terminan en una decisión.",
  );
  const series = Array.isArray(config.series)
    ? config.series
        .map((entry) => asRecord(entry))
        .filter((entry) => typeof entry.label === "string" && typeof entry.value === "number")
        .slice(0, 5)
    : [];
  const max = Math.max(1, ...series.map((entry) => Math.abs(entry.value as number)));

  return (
    <article
      style={{
        width: 1080,
        height: 1350,
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "64px 68px 58px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 30, alignItems: "flex-start" }}>
        <div style={{ maxWidth: 790 }}>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontSize: 18, fontWeight: 800, letterSpacing: "0.11em" }}>
            DATA / STORY
          </p>
          <h1 style={{ margin: "18px 0 0", fontFamily: typography.display, fontSize: 58, lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 600 }}>
            {publication.title}
          </h1>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>DA-01</span>
      </header>

      <section
        style={{
          marginTop: 42,
          borderRadius: 30,
          background: palette.surface,
          border: `2px solid ${palette.line}`,
          padding: "34px 36px 32px",
          minHeight: 710,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24 }}>
          <div>
            <p style={{ margin: 0, fontFamily: typography.mono, color: palette.muted, textTransform: "uppercase", letterSpacing: "0.09em", fontSize: 16 }}>
              Lectura principal
            </p>
            <h2 style={{ margin: "10px 0 0", fontFamily: typography.display, fontSize: 40, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              {title}
            </h2>
          </div>
          {unit ? (
            <span style={{ color: palette.accent, fontFamily: typography.mono, fontSize: 18, fontWeight: 800 }}>
              {unit}
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: 44, display: "grid", gap: 24 }}>
          {series.length > 0 ? (
            series.map((entry, index) => {
              const numericValue = entry.value as number;
              const width = Math.max(6, (Math.abs(numericValue) / max) * 100);
              return (
                <div key={`${entry.label}-${index}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "baseline" }}>
                    <span style={{ fontSize: 21, fontWeight: 700 }}>{entry.label as string}</span>
                    <span style={{ fontFamily: typography.mono, fontSize: 22, color: palette.accent, fontWeight: 800 }}>
                      {numericValue.toLocaleString("es-ES", { maximumFractionDigits: 2 })}{unit ? ` ${unit}` : ""}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, height: 30, borderRadius: 999, background: palette.accentSoft, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${width}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: index === 0 ? palette.accent : palette.foreground,
                        opacity: index === 0 ? 1 : Math.max(0.5, 0.86 - index * 0.09),
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ display: "grid", placeItems: "center", minHeight: 360, color: palette.muted, fontSize: 25 }}>
              Configura al menos dos valores para construir la historia de datos.
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 32, borderTop: `2px solid ${palette.line}` }}>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Decisión / insight
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 26, lineHeight: 1.34 }}>{takeaway}</p>
        </div>
      </section>

      <footer style={{ marginTop: "auto", paddingTop: 26, borderTop: `2px solid ${palette.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontWeight: 800, fontSize: 21 }}>
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 17 }}>datos · significado · decisión</p>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>01 / DATA</span>
      </footer>
    </article>
  );
}
