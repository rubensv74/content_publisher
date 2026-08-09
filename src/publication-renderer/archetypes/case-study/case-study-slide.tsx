import type { CSSProperties } from "react";

import type { IdentitySnapshot, PublicationAsset } from "../../contracts";
import type { CaseStudySlideModel } from "./slides";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

export function CaseStudySlide({
  slide,
  identity,
  assets,
  page,
  total,
}: {
  slide: CaseStudySlideModel;
  identity: IdentitySnapshot;
  assets: PublicationAsset[];
  page: number;
  total: number;
}) {
  const { palette, typography } = identity;
  const asset = slide.assetRole
    ? assets.find((candidate) => candidate.role === slide.assetRole)
    : undefined;
  const isCover = slide.kind === "cover";
  const isDecision = slide.kind === "decision";
  const isResult = slide.kind === "result";
  const isClosing = slide.kind === "closing";

  return (
    <article
      data-publication-canvas="case-study"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: isDecision || isClosing ? palette.foreground : palette.background,
        color: isDecision || isClosing ? palette.background : palette.foreground,
        padding: "68px 72px 58px",
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
          paddingBottom: 25,
          borderBottom: `2px solid ${
            isDecision || isClosing ? "rgba(255,255,255,.22)" : palette.line
          }`,
        }}
      >
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: isDecision || isClosing ? palette.accentSoft : palette.accent,
            textTransform: "uppercase",
          }}
        >
          {slide.kicker}
        </span>
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 16,
            opacity: 0.65,
          }}
        >
          {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "58px 0 48px",
        }}
      >
        {isCover ? (
          <>
            <div
              style={{
                width: 110,
                height: 12,
                borderRadius: 999,
                background: palette.accent,
                marginBottom: 46,
              }}
            />
            <h1
              style={{
                ...clamp(6),
                margin: 0,
                maxWidth: 900,
                fontFamily: typography.display,
                fontSize: 86,
                lineHeight: 1.01,
                fontWeight: 600,
                letterSpacing: "-0.045em",
              }}
            >
              {slide.title}
            </h1>
            {slide.body ? (
              <p
                style={{
                  ...clamp(4),
                  margin: "50px 0 0",
                  maxWidth: 760,
                  fontSize: 30,
                  lineHeight: 1.4,
                  color: palette.muted,
                }}
              >
                {slide.body}
              </p>
            ) : null}
          </>
        ) : isResult && asset ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.85fr 1.15fr",
              gap: 30,
              alignItems: "stretch",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h1
                style={{
                  ...clamp(4),
                  margin: 0,
                  fontFamily: typography.display,
                  fontSize: 66,
                  lineHeight: 1.04,
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                }}
              >
                {slide.title}
              </h1>
              {slide.body ? (
                <p
                  style={{
                    ...clamp(6),
                    margin: "34px 0 0",
                    fontSize: 27,
                    lineHeight: 1.45,
                    color: palette.muted,
                  }}
                >
                  {slide.body}
                </p>
              ) : null}
            </div>
            <div
              style={{
                borderRadius: 30,
                border: `2px solid ${palette.line}`,
                background: palette.surface,
                padding: 14,
                boxShadow: "0 24px 60px rgba(23,25,29,.12)",
              }}
            >
              <div
                role="img"
                aria-label={asset.alt ?? "Resultado visual"}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 620,
                  borderRadius: 20,
                  backgroundImage: `url("${asset.url}")`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: palette.accentSoft,
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                ...clamp(4),
                margin: 0,
                maxWidth: 900,
                fontFamily: typography.display,
                fontSize: isClosing ? 72 : 70,
                lineHeight: 1.04,
                fontWeight: 600,
                letterSpacing: "-0.04em",
              }}
            >
              {slide.title}
            </h1>
            {slide.body ? (
              <div
                style={{
                  marginTop: 42,
                  maxWidth: 900,
                  borderRadius: 28,
                  background: isDecision || isClosing
                    ? "rgba(255,255,255,.08)"
                    : palette.surface,
                  border: `2px solid ${
                    isDecision || isClosing ? "rgba(255,255,255,.14)" : palette.line
                  }`,
                  padding: "32px 36px",
                }}
              >
                <p
                  style={{
                    ...clamp(isClosing ? 5 : 7),
                    margin: 0,
                    fontSize: isClosing ? 31 : 30,
                    lineHeight: 1.46,
                    fontWeight: isDecision ? 600 : 500,
                  }}
                >
                  {slide.body}
                </p>
              </div>
            ) : null}
            {slide.emphasis ? (
              <p
                style={{
                  ...clamp(3),
                  margin: "42px 0 0",
                  maxWidth: 840,
                  fontFamily: typography.mono,
                  fontSize: 23,
                  lineHeight: 1.45,
                  fontWeight: 800,
                  color: palette.accentSoft,
                }}
              >
                {slide.emphasis}
              </p>
            ) : null}
          </>
        )}
      </main>

      <footer
        style={{
          paddingTop: 24,
          borderTop: `2px solid ${
            isDecision || isClosing ? "rgba(255,255,255,.22)" : palette.line
          }`,
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
            color: isDecision || isClosing ? palette.accentSoft : palette.accent,
          }}
        >
          {identity.signatureLabel ?? identity.displayName}
        </span>
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 15,
            opacity: 0.62,
            textTransform: "uppercase",
          }}
        >
          case study · decisiones reales
        </span>
      </footer>
    </article>
  );
}
