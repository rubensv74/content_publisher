import type { RenderablePublication } from "../../contracts";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(config: Record<string, unknown>, key: string, fallback: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function BeforeAfterCard({ publication }: { publication: RenderablePublication }) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const before = publication.assets.find((asset) => asset.role === "before");
  const after = publication.assets.find((asset) => asset.role === "after");
  const config = asRecord(publication.visualConfig["before-after"]);
  const beforeLabel = text(config, "beforeLabel", "Antes");
  const afterLabel = text(config, "afterLabel", "Después");
  const summary = text(config, "summary", "El cambio importa cuando se puede explicar con claridad.");

  const panels = [
    { key: "before", label: beforeLabel, asset: before },
    { key: "after", label: afterLabel, asset: after },
  ];

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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32 }}>
        <div style={{ maxWidth: 790 }}>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontSize: 18, fontWeight: 800, letterSpacing: "0.11em" }}>
            PRODUCT / BEFORE-AFTER
          </p>
          <h1 style={{ margin: "18px 0 0", fontFamily: typography.display, fontSize: 60, lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 600 }}>
            {publication.title}
          </h1>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>PR-04</span>
      </header>

      <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, height: 760 }}>
        {panels.map((panel, index) => (
          <section
            key={panel.key}
            style={{
              borderRadius: 28,
              overflow: "hidden",
              background: palette.surface,
              border: `2px solid ${palette.line}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                background: index === 1 ? palette.accent : palette.surface,
                color: index === 1 ? "#fff" : palette.foreground,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong style={{ fontFamily: typography.mono, fontSize: 19, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {panel.label}
              </strong>
              <span style={{ fontFamily: typography.mono, fontSize: 15, opacity: 0.72 }}>0{index + 1}</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, background: "#eef1f4", display: "grid", placeItems: "center" }}>
              {panel.asset ? (
                <img
                  src={panel.asset.url}
                  alt={panel.asset.alt ?? panel.label}
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              ) : (
                <span style={{ color: palette.muted, fontSize: 24 }}>Imagen pendiente</span>
              )}
            </div>
          </section>
        ))}
      </div>

      <section
        style={{
          marginTop: 30,
          borderRadius: 22,
          background: palette.accentSoft,
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "160px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <span style={{ fontFamily: typography.mono, color: palette.accent, fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Cambio clave
        </span>
        <p style={{ margin: 0, fontSize: 26, lineHeight: 1.32 }}>{summary}</p>
      </section>

      <footer style={{ marginTop: "auto", paddingTop: 26, borderTop: `2px solid ${palette.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontWeight: 800, fontSize: 21 }}>
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 17 }}>evolución · producto · aprendizaje</p>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>01 / CHANGE</span>
      </footer>
    </article>
  );
}
