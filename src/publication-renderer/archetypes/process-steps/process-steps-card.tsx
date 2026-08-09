import type { CSSProperties } from "react";

import type { RenderablePublication } from "../../contracts";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

function value(publication: RenderablePublication, key: string) {
  const candidate = publication.structuredContent[key];
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

export function ProcessStepsCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { palette, typography } = publication.identity;
  const steps = [
    ["01", "Contexto", value(publication, "problem")],
    ["02", "Intentos", value(publication, "attempts")],
    ["03", "Decisión", value(publication, "solution")],
    ["04", "Resultado", value(publication, "result")],
    ["05", "Aprendizaje", value(publication, "learning") ?? value(publication, "insight")],
  ].filter((step): step is [string, string, string] => Boolean(step[2]));

  const visibleSteps = steps.slice(0, 5);

  return (
    <article
      data-publication-canvas="process-steps"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "66px 72px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 36,
          paddingBottom: 30,
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
              textTransform: "uppercase",
              color: palette.accent,
            }}
          >
            PROCESS / STEPS
          </p>
          <h1
            style={{
              ...clamp(3),
              margin: "22px 0 0",
              maxWidth: 790,
              fontFamily: typography.display,
              fontSize: 64,
              lineHeight: 1.03,
              fontWeight: 600,
              letterSpacing: "-0.038em",
            }}
          >
            {publication.title}
          </h1>
        </div>

        <div
          style={{
            minWidth: 118,
            height: 76,
            borderRadius: 20,
            background: palette.accent,
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: typography.mono,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          {visibleSteps.length || 1} STEPS
        </div>
      </header>

      <main
        style={{
          marginTop: 38,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {visibleSteps.length > 0 ? (
          visibleSteps.map(([number, label, body], index) => (
            <section
              key={number}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "96px 1fr",
                gap: 22,
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {index < visibleSteps.length - 1 ? (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 56,
                      bottom: -24,
                      width: 3,
                      background: palette.line,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: 62,
                    height: 62,
                    borderRadius: 20,
                    display: "grid",
                    placeItems: "center",
                    background: index === 0 ? palette.accent : palette.accentSoft,
                    color: index === 0 ? "#ffffff" : palette.accent,
                    fontFamily: typography.mono,
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  {number}
                </div>
              </div>

              <div
                style={{
                  minHeight: 124,
                  borderRadius: 24,
                  background: palette.surface,
                  border: `2px solid ${palette.line}`,
                  padding: "22px 28px 24px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: typography.mono,
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: palette.accent,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    ...clamp(3),
                    margin: "10px 0 0",
                    fontSize: 23,
                    lineHeight: 1.37,
                    fontWeight: 550,
                  }}
                >
                  {body}
                </p>
              </div>
            </section>
          ))
        ) : (
          <section
            style={{
              borderRadius: 28,
              background: palette.surface,
              border: `2px dashed ${palette.line}`,
              padding: 44,
              textAlign: "center",
              color: palette.muted,
              fontSize: 26,
              lineHeight: 1.4,
            }}
          >
            Completa la historia para convertirla en una secuencia de decisiones.
          </section>
        )}
      </main>

      <footer
        style={{
          marginTop: 30,
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
          método · decisiones · resultado
        </span>
      </footer>
    </article>
  );
}
