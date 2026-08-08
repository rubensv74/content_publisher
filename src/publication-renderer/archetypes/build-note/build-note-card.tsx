import type { CSSProperties } from "react";

import type { RenderablePublication } from "../../contracts";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

function storyText(
  publication: RenderablePublication,
  key: "problem" | "attempts" | "solution" | "learning" | "insight",
) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function BuildNoteCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { identity } = publication;
  const palette = identity.palette;
  const typography = identity.typography;
  const problem = storyText(publication, "problem");
  const solution = storyText(publication, "solution");
  const learning = storyText(publication, "learning");
  const insight = storyText(publication, "insight");
  const category = publication.storyType.replaceAll("-", " ").toUpperCase();

  return (
    <article
      data-publication-canvas="build-note"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "72px 76px 64px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: 999,
          right: -170,
          top: -155,
          border: `72px solid ${palette.accentSoft}`,
          opacity: 0.9,
        }}
      />

      <header style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            paddingBottom: 28,
            borderBottom: `2px solid ${palette.line}`,
            fontFamily: typography.mono,
            fontSize: 22,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: palette.accent, fontWeight: 700 }}>
            BUILD / NOTE
          </span>
          <span style={{ color: palette.muted }}>{category}</span>
        </div>

        <h1
          style={{
            ...clamp(3),
            margin: "58px 0 0",
            maxWidth: 900,
            fontFamily: typography.display,
            fontSize: 82,
            lineHeight: 0.98,
            fontWeight: 500,
            letterSpacing: "-0.045em",
          }}
        >
          {publication.title}
        </h1>

        {problem ? (
          <p
            style={{
              ...clamp(4),
              maxWidth: 840,
              margin: "34px 0 0",
              fontSize: 30,
              lineHeight: 1.38,
              color: palette.muted,
            }}
          >
            {problem}
          </p>
        ) : null}
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1.25fr 0.75fr",
          gap: 28,
          marginTop: 52,
          flex: 1,
          minHeight: 0,
        }}
      >
        <section
          style={{
            borderRadius: 28,
            background: palette.surface,
            border: `2px solid ${palette.line}`,
            padding: "38px 40px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: palette.accent,
              textTransform: "uppercase",
            }}
          >
            La decisión
          </p>
          <p
            style={{
              ...clamp(8),
              margin: "22px 0 0",
              fontSize: 34,
              lineHeight: 1.32,
              fontWeight: 650,
              letterSpacing: "-0.018em",
            }}
          >
            {solution ?? insight ?? "Una decisión concreta, explicada sin ruido."}
          </p>
          <div
            style={{
              width: 72,
              height: 8,
              borderRadius: 999,
              background: palette.accent,
              marginTop: "auto",
            }}
          />
        </section>

        <section
          style={{
            borderRadius: 28,
            background: palette.accent,
            color: "#ffffff",
            padding: "38px 34px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.76,
            }}
          >
            Lo que me llevo
          </p>
          <p
            style={{
              ...clamp(9),
              margin: "24px 0 0",
              fontFamily: typography.display,
              fontSize: 34,
              lineHeight: 1.25,
              letterSpacing: "-0.022em",
            }}
          >
            {learning ?? insight ?? "El aprendizaje importa más que la herramienta."}
          </p>
          <span
            style={{
              marginTop: "auto",
              fontFamily: typography.mono,
              fontSize: 19,
              opacity: 0.84,
            }}
          >
            01 / BUILD
          </span>
        </section>
      </main>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 36,
          paddingTop: 26,
          borderTop: `2px solid ${palette.line}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 28,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              fontSize: 22,
              fontWeight: 800,
              color: palette.accent,
              letterSpacing: "0.04em",
            }}
          >
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 18, color: palette.muted }}>
            decisiones · sistemas · aprendizaje
          </p>
        </div>
        <span
          style={{
            maxWidth: 320,
            textAlign: "right",
            fontFamily: typography.mono,
            fontSize: 17,
            lineHeight: 1.4,
            color: palette.muted,
            textTransform: "uppercase",
          }}
        >
          {publication.identity.series?.key ?? "CONTENT PUBLISHER"}
        </span>
      </footer>
    </article>
  );
}
