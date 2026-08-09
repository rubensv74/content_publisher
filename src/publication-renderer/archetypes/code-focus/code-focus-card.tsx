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

export function CodeFocusCard({ publication }: { publication: RenderablePublication }) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const config = asRecord(publication.visualConfig["code-focus"]);
  const language = text(config, "language", "code");
  const snippet = text(config, "snippet", "// Configura un fragmento de código");
  const explanation = text(
    config,
    "explanation",
    typeof publication.structuredContent.learning === "string"
      ? publication.structuredContent.learning
      : "El código importa cuando la decisión que contiene se puede explicar.",
  );
  const highlighted = new Set(
    Array.isArray(config.highlightLines)
      ? config.highlightLines.filter((line): line is number => typeof line === "number")
      : [],
  );
  const lines = snippet.split("\n").slice(0, 18);

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
      <header style={{ display: "flex", justifyContent: "space-between", gap: 32 }}>
        <div style={{ maxWidth: 780 }}>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontWeight: 800, fontSize: 18, letterSpacing: "0.11em" }}>
            TECH / CODE FOCUS
          </p>
          <h1 style={{ margin: "18px 0 0", fontFamily: typography.display, fontSize: 58, lineHeight: 1.02, letterSpacing: "-0.04em", fontWeight: 600 }}>
            {publication.title}
          </h1>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>TE-02</span>
      </header>

      <section
        style={{
          marginTop: 42,
          borderRadius: 28,
          overflow: "hidden",
          background: "#111827",
          color: "#e5e7eb",
          boxShadow: "0 28px 70px rgba(15,23,42,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", background: "#0b1220", borderBottom: "1px solid #283244" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["#ef6a6a", "#e9c46a", "#76c893"].map((color) => (
              <span key={color} style={{ width: 12, height: 12, borderRadius: 999, background: color }} />
            ))}
          </div>
          <span style={{ fontFamily: typography.mono, fontSize: 16, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {language}
          </span>
        </div>
        <div style={{ padding: "24px 0", minHeight: 600 }}>
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlighted.has(lineNumber);
            return (
              <div
                key={`${lineNumber}-${line}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "58px 1fr",
                  gap: 16,
                  padding: "6px 24px",
                  background: isHighlighted ? "rgba(47,111,115,0.28)" : "transparent",
                  borderLeft: isHighlighted ? `5px solid ${palette.accent}` : "5px solid transparent",
                }}
              >
                <span style={{ textAlign: "right", fontFamily: typography.mono, fontSize: 16, lineHeight: 1.55, color: "#64748b", userSelect: "none" }}>
                  {lineNumber}
                </span>
                <code style={{ fontFamily: typography.mono, fontSize: 18, lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {line || " "}
                </code>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: 28, display: "grid", gridTemplateColumns: "170px 1fr", gap: 26, alignItems: "start", padding: "24px 26px", borderRadius: 22, background: palette.accentSoft }}>
        <span style={{ color: palette.accent, fontFamily: typography.mono, fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Por qué importa
        </span>
        <p style={{ margin: 0, fontSize: 25, lineHeight: 1.35 }}>{explanation}</p>
      </section>

      <footer style={{ marginTop: "auto", paddingTop: 26, borderTop: `2px solid ${palette.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ margin: 0, color: palette.accent, fontFamily: typography.mono, fontWeight: 800, fontSize: 21 }}>
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 17 }}>código · contexto · decisión</p>
        </div>
        <span style={{ color: palette.muted, fontFamily: typography.mono, fontSize: 16 }}>01 / CODE</span>
      </footer>
    </article>
  );
}
