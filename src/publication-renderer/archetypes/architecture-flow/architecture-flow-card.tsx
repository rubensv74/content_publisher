import type { CSSProperties } from "react";

import type { RenderablePublication } from "../../contracts";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

function text(publication: RenderablePublication, key: string) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function ArchitectureFlowCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { palette, typography } = publication.identity;
  const layers = [
    ["INPUT", "Problema", text(publication, "problem")],
    ["LOGIC", "Decisión", text(publication, "solution")],
    ["OUTPUT", "Resultado", text(publication, "result") ?? text(publication, "learning")],
  ].filter((layer): layer is [string, string, string] => Boolean(layer[2]));

  return (
    <article
      data-publication-canvas="architecture-flow"
      style={{
        width: 1080,
        height: 1350,
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        padding: "64px 70px 58px",
        fontFamily: typography.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "start",
          paddingBottom: 28,
          borderBottom: `2px solid ${palette.line}`,
        }}
      >
        <div>
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
            ARCHITECTURE / FLOW
          </p>
          <h1
            style={{
              ...clamp(3),
              margin: "22px 0 0",
              maxWidth: 810,
              fontFamily: typography.display,
              fontSize: 61,
              lineHeight: 1.04,
              fontWeight: 600,
              letterSpacing: "-0.037em",
            }}
          >
            {publication.title}
          </h1>
        </div>

        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: 28,
            border: `2px solid ${palette.line}`,
            background: palette.surface,
            display: "grid",
            placeItems: "center",
            fontFamily: typography.mono,
            fontSize: 25,
            fontWeight: 900,
            color: palette.accent,
          }}
        >
          SYS
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "42px 0",
        }}
      >
        {layers.length > 0 ? (
          <div
            style={{
              borderRadius: 34,
              border: `2px solid ${palette.line}`,
              background: palette.surface,
              padding: "34px 34px 36px",
            }}
          >
            {layers.map(([code, label, body], index) => (
              <div key={code}>
                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr",
                    gap: 26,
                    alignItems: "center",
                    minHeight: 190,
                    borderRadius: 26,
                    background: index === 1 ? palette.accentSoft : palette.background,
                    padding: "28px 30px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: typography.mono,
                        fontSize: 16,
                        fontWeight: 900,
                        color: palette.accent,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {code}
                    </p>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontFamily: typography.display,
                        fontSize: 28,
                        lineHeight: 1.1,
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </p>
                  </div>
                  <p
                    style={{
                      ...clamp(4),
                      margin: 0,
                      fontSize: 25,
                      lineHeight: 1.4,
                      fontWeight: 550,
                    }}
                  >
                    {body}
                  </p>
                </section>

                {index < layers.length - 1 ? (
                  <div
                    aria-hidden="true"
                    style={{
                      height: 62,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 32,
                        background: palette.accent,
                      }}
                    />
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "9px solid transparent",
                        borderRight: "9px solid transparent",
                        borderTop: `12px solid ${palette.accent}`,
                        marginTop: -2,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              borderRadius: 30,
              border: `2px dashed ${palette.line}`,
              background: palette.surface,
              padding: 48,
              textAlign: "center",
              color: palette.muted,
              fontSize: 25,
              lineHeight: 1.45,
            }}
          >
            Completa problema, decisión y resultado para construir el flujo de arquitectura.
          </div>
        )}
      </main>

      <footer
        style={{
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
            fontFamily: typography.mono,
            fontSize: 15,
            color: palette.muted,
            textTransform: "uppercase",
          }}
        >
          input → logic → output
        </span>
      </footer>
    </article>
  );
}
