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

export function MetricHeroCard({ publication }: { publication: RenderablePublication }) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const config = asRecord(publication.visualConfig["metric-hero"]);
  const value = text(config, "value", "42%");
  const label = text(config, "label", "menos fricción");
  const delta = text(config, "delta");
  const context = text(config, "context");
  const insight =
    typeof publication.structuredContent.insight === "string"
      ? publication.structuredContent.insight
      : typeof publication.structuredContent.learning === "string"
        ? publication.structuredContent.learning
        : "Una cifra merece espacio cuando ayuda a entender una decisión.";

  return (
    <article
      style={{
        width: 1080,
        height: 1350,
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "72px 76px 64px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -140,
          top: 150,
          width: 470,
          height: 470,
          borderRadius: 999,
          border: `76px solid ${palette.accentSoft}`,
        }}
      />

      <header
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${palette.line}`,
          paddingBottom: 28,
          fontFamily: typography.mono,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: 20,
        }}
      >
        <span style={{ color: palette.accent, fontWeight: 800 }}>METRIC / HERO</span>
        <span style={{ color: palette.muted }}>DATA SIGNAL</span>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingTop: 70,
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: 760,
            fontFamily: typography.display,
            fontSize: 62,
            lineHeight: 1.03,
            letterSpacing: "-0.04em",
          }}
        >
          {publication.title}
        </p>

        <div style={{ marginTop: 88 }}>
          <div
            style={{
              fontFamily: typography.display,
              fontSize: 210,
              lineHeight: 0.82,
              letterSpacing: "-0.075em",
              color: palette.accent,
              fontWeight: 700,
            }}
          >
            {value}
          </div>
          <p
            style={{
              margin: "28px 0 0",
              maxWidth: 700,
              fontSize: 42,
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            {label}
          </p>
          {delta || context ? (
            <div style={{ display: "flex", gap: 14, marginTop: 26, flexWrap: "wrap" }}>
              {delta ? (
                <span
                  style={{
                    borderRadius: 999,
                    background: palette.accent,
                    color: "#fff",
                    padding: "10px 18px",
                    fontFamily: typography.mono,
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {delta}
                </span>
              ) : null}
              {context ? (
                <span
                  style={{
                    borderRadius: 999,
                    background: palette.surface,
                    border: `2px solid ${palette.line}`,
                    padding: "10px 18px",
                    fontSize: 18,
                    color: palette.muted,
                  }}
                >
                  {context}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <section
          style={{
            marginTop: "auto",
            maxWidth: 840,
            borderLeft: `8px solid ${palette.accent}`,
            padding: "4px 0 4px 30px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              color: palette.muted,
              fontSize: 17,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Lo que significa
          </p>
          <p style={{ margin: "14px 0 0", fontSize: 29, lineHeight: 1.35 }}>
            {insight}
          </p>
        </section>
      </main>

      <footer
        style={{
          marginTop: 44,
          paddingTop: 24,
          borderTop: `2px solid ${palette.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
        }}
      >
        <div>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontWeight: 800, fontSize: 22 }}>
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 17 }}>
            decisiones · sistemas · aprendizaje
          </p>
        </div>
        <span style={{ fontFamily: typography.mono, color: palette.muted, fontSize: 17 }}>
          01 / METRIC
        </span>
      </footer>
    </article>
  );
}
