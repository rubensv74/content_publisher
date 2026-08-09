import type { CSSProperties } from "react";

import type { RenderablePublication } from "../../contracts";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

function storyText(publication: RenderablePublication, key: string) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function SplitScreenshotCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { palette, typography } = publication.identity;
  const hero = publication.assets.find((asset) => asset.role === "hero");
  const decision = storyText(publication, "solution") ?? storyText(publication, "insight");
  const result = storyText(publication, "result") ?? storyText(publication, "learning");

  return (
    <article
      data-publication-canvas="split-screenshot"
      style={{
        width: 1080,
        height: 1350,
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        padding: "64px 68px 58px",
        fontFamily: typography.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28,
          paddingBottom: 26,
          borderBottom: `2px solid ${palette.line}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: typography.mono,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: palette.accent,
            textTransform: "uppercase",
          }}
        >
          PRODUCT / EXPLAINED
        </p>
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 16,
            color: palette.muted,
            textTransform: "uppercase",
          }}
        >
          {publication.storyType.replaceAll("-", " ")}
        </span>
      </header>

      <main
        style={{
          marginTop: 38,
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 32,
        }}
      >
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <h1
            style={{
              ...clamp(5),
              margin: 0,
              fontFamily: typography.display,
              fontSize: 62,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.038em",
            }}
          >
            {publication.title}
          </h1>

          <div
            style={{
              marginTop: 34,
              borderRadius: 24,
              background: palette.surface,
              border: `2px solid ${palette.line}`,
              padding: "26px 28px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: typography.mono,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: palette.accent,
                textTransform: "uppercase",
              }}
            >
              La decisión
            </p>
            <p
              style={{
                ...clamp(5),
                margin: "14px 0 0",
                fontSize: 24,
                lineHeight: 1.4,
                fontWeight: 600,
              }}
            >
              {decision ?? "Una decisión concreta aplicada sobre una pantalla real."}
            </p>
          </div>

          <div
            style={{
              marginTop: 20,
              borderRadius: 24,
              background: palette.accent,
              color: "#ffffff",
              padding: "26px 28px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: typography.mono,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              Qué cambió
            </p>
            <p
              style={{
                ...clamp(5),
                margin: "14px 0 0",
                fontFamily: typography.display,
                fontSize: 24,
                lineHeight: 1.35,
              }}
            >
              {result ?? "El resultado se entiende mejor cuando la evidencia acompaña a la explicación."}
            </p>
          </div>
        </section>

        <section
          style={{
            display: "flex",
            minWidth: 0,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: 32,
              background: palette.surface,
              border: `2px solid ${palette.line}`,
              padding: 14,
              boxShadow: "0 24px 58px rgba(23,25,29,0.12)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 44,
                borderBottom: `1px solid ${palette.line}`,
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "0 10px",
              }}
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 999,
                    background: dot === 0 ? palette.accent : palette.accentSoft,
                  }}
                />
              ))}
            </div>
            <div
              role="img"
              aria-label={hero?.alt ?? "Screenshot"}
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 14,
                borderRadius: 20,
                background: palette.accentSoft,
                backgroundImage: hero ? `url("${hero.url}")` : undefined,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: hero ? "block" : "grid",
                placeItems: "center",
                padding: hero ? 0 : 36,
                color: palette.muted,
                fontFamily: typography.mono,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              {hero ? null : "Asocia un screenshot desde Recursos."}
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: `2px solid ${palette.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 30,
        }}
      >
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 21,
            fontWeight: 800,
            color: palette.accent,
          }}
        >
          {publication.identity.signatureLabel ?? publication.identity.displayName}
        </span>
        <span
          style={{
            maxWidth: 420,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: typography.mono,
            fontSize: 15,
            color: palette.muted,
          }}
        >
          {hero?.alt ?? "CONTENT PUBLISHER"}
        </span>
      </footer>
    </article>
  );
}
