import type { CSSProperties } from "react";

import type { RenderablePublication } from "../../contracts";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

function text(
  publication: RenderablePublication,
  key: "problem" | "solution" | "result" | "learning" | "insight" | "cta",
) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function BoldStatementCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { palette, typography } = publication.identity;
  const statement =
    text(publication, "insight") ??
    text(publication, "learning") ??
    text(publication, "result") ??
    publication.title;
  const support =
    text(publication, "solution") ??
    text(publication, "problem") ??
    text(publication, "cta");

  return (
    <article
      data-publication-canvas="bold-statement"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        padding: "72px 74px 64px",
        fontFamily: typography.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -140,
          right: -80,
          width: 380,
          height: 380,
          borderRadius: 999,
          background: palette.accentSoft,
        }}
      />

      <header
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          paddingBottom: 26,
          borderBottom: `2px solid ${palette.line}`,
          fontFamily: typography.mono,
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: palette.accent }}>POINT / 01</span>
        <span style={{ color: palette.muted }}>
          {publication.storyType.replaceAll("-", " ")}
        </span>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          justifyContent: "center",
          padding: "70px 0 58px",
        }}
      >
        <div
          style={{
            width: 86,
            height: 10,
            borderRadius: 999,
            background: palette.accent,
            marginBottom: 42,
          }}
        />

        <h1
          style={{
            ...clamp(7),
            margin: 0,
            maxWidth: 900,
            fontFamily: typography.display,
            fontSize: 88,
            lineHeight: 1.01,
            fontWeight: 600,
            letterSpacing: "-0.045em",
          }}
        >
          {statement}
        </h1>

        {support && support !== statement ? (
          <p
            style={{
              ...clamp(4),
              margin: "50px 0 0",
              maxWidth: 810,
              fontSize: 29,
              lineHeight: 1.42,
              color: palette.muted,
            }}
          >
            {support}
          </p>
        ) : null}
      </main>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 30,
          paddingTop: 26,
          borderTop: `2px solid ${palette.line}`,
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
            {publication.identity.signatureLabel ?? publication.identity.displayName}
          </p>
          <p style={{ margin: "9px 0 0", fontSize: 17, color: palette.muted }}>
            idea · decisión · aprendizaje
          </p>
        </div>

        <span
          style={{
            maxWidth: 340,
            textAlign: "right",
            fontFamily: typography.mono,
            fontSize: 16,
            lineHeight: 1.35,
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
