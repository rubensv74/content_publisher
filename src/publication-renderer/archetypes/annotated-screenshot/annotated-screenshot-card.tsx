import type { RenderablePublication } from "../../contracts";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function AnnotatedScreenshotCard({ publication }: { publication: RenderablePublication }) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const hero = publication.assets.find((asset) => asset.role === "hero");
  const config = asRecord(publication.visualConfig["annotated-screenshot"]);
  const annotations = Array.isArray(config.annotations)
    ? config.annotations
        .map((item) => asRecord(item))
        .filter((item) => typeof item.label === "string" && typeof item.x === "number" && typeof item.y === "number")
        .slice(0, 4)
    : [];

  return (
    <article
      style={{
        width: 1080,
        height: 1350,
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "64px 70px 58px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 30, alignItems: "flex-end" }}>
        <div style={{ maxWidth: 760 }}>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontSize: 18, fontWeight: 800, letterSpacing: "0.11em" }}>
            PRODUCT / ANNOTATED
          </p>
          <h1 style={{ margin: "18px 0 0", fontFamily: typography.display, fontSize: 58, lineHeight: 1.02, letterSpacing: "-0.035em", fontWeight: 600 }}>
            {publication.title}
          </h1>
        </div>
        <span style={{ fontFamily: typography.mono, color: palette.muted, fontSize: 16 }}>PR-03</span>
      </header>

      <div
        style={{
          position: "relative",
          marginTop: 42,
          height: 820,
          borderRadius: 30,
          background: palette.surface,
          border: `2px solid ${palette.line}`,
          overflow: "hidden",
          boxShadow: "0 28px 60px rgba(15,23,42,0.12)",
        }}
      >
        {hero ? (
          <img
            src={hero.url}
            alt={hero.alt ?? "Screenshot"}
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: palette.muted, fontSize: 28 }}>
            Screenshot pendiente
          </div>
        )}

        {annotations.map((annotation, index) => (
          <div
            key={`${annotation.label}-${index}`}
            style={{
              position: "absolute",
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: "translate(-22px, -22px)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              maxWidth: 300,
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                flex: "0 0 44px",
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: palette.accent,
                color: "#fff",
                fontFamily: typography.mono,
                fontSize: 18,
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(15,23,42,0.28)",
              }}
            >
              {index + 1}
            </span>
            <span
              style={{
                borderRadius: 14,
                background: "rgba(15,23,42,0.92)",
                color: "#fff",
                padding: "10px 13px",
                fontSize: 17,
                lineHeight: 1.25,
                boxShadow: "0 8px 24px rgba(15,23,42,0.24)",
              }}
            >
              {annotation.label as string}
            </span>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "auto", paddingTop: 28, borderTop: `2px solid ${palette.line}`, display: "flex", justifyContent: "space-between", gap: 24 }}>
        <div>
          <p style={{ margin: 0, fontFamily: typography.mono, color: palette.accent, fontWeight: 800, fontSize: 21 }}>
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 17 }}>producto · decisiones · detalle</p>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>01 / SCREEN</span>
      </footer>
    </article>
  );
}
