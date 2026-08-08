import type { CSSProperties } from "react";

import type { IdentitySnapshot } from "../../contracts";
import type { StepByStepSlideModel } from "./slides";

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

export function StepByStepSlide({
  slide,
  identity,
  page,
  total,
}: {
  slide: StepByStepSlideModel;
  identity: IdentitySnapshot;
  page: number;
  total: number;
}) {
  const palette = identity.palette;
  const typography = identity.typography;
  const isCover = slide.kind === "cover";
  const isClosing = slide.kind === "closing";

  return (
    <article
      data-publication-canvas="step-by-step"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: isClosing ? palette.accent : palette.background,
        color: isClosing ? "#ffffff" : palette.foreground,
        fontFamily: typography.body,
        padding: "70px 76px 60px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isClosing
            ? "linear-gradient(135deg, rgba(255,255,255,.08) 1px, transparent 1px)"
            : `linear-gradient(135deg, ${palette.line}55 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          opacity: isCover ? 0.45 : 0.18,
        }}
      />

      <header
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          paddingBottom: 26,
          borderBottom: `2px solid ${isClosing ? "rgba(255,255,255,.28)" : palette.line}`,
          fontFamily: typography.mono,
          fontSize: 19,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ fontWeight: 800, color: isClosing ? "#ffffff" : palette.accent }}>
          {slide.kicker}
        </span>
        <span style={{ opacity: 0.62 }}>
          {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: isCover ? "center" : "flex-start",
          paddingTop: isCover ? 90 : 104,
        }}
      >
        {isCover ? (
          <div
            style={{
              width: 96,
              height: 12,
              borderRadius: 999,
              background: palette.accent,
              marginBottom: 44,
            }}
          />
        ) : null}

        <h1
          style={{
            ...clamp(isCover ? 4 : 5),
            margin: 0,
            maxWidth: isCover ? 900 : 820,
            fontFamily: typography.display,
            fontSize: isCover ? 88 : 70,
            lineHeight: isCover ? 0.98 : 1.02,
            fontWeight: 500,
            letterSpacing: "-0.045em",
          }}
        >
          {slide.title}
        </h1>

        {slide.body ? (
          <p
            style={{
              ...clamp(isCover ? 4 : 9),
              margin: isCover ? "42px 0 0" : "52px 0 0",
              maxWidth: 850,
              fontSize: isCover ? 30 : 38,
              lineHeight: isCover ? 1.4 : 1.38,
              color: isClosing ? "rgba(255,255,255,.88)" : palette.muted,
            }}
          >
            {slide.body}
          </p>
        ) : null}

        {slide.emphasis ? (
          <div
            style={{
              marginTop: 58,
              padding: "30px 34px",
              borderRadius: 24,
              border: "2px solid rgba(255,255,255,.28)",
              fontFamily: typography.mono,
              fontSize: 26,
              lineHeight: 1.45,
              fontWeight: 700,
            }}
          >
            {slide.emphasis}
          </div>
        ) : null}
      </main>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          paddingTop: 28,
          borderTop: `2px solid ${isClosing ? "rgba(255,255,255,.28)" : palette.line}`,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              fontSize: 21,
              fontWeight: 800,
              color: isClosing ? "#ffffff" : palette.accent,
            }}
          >
            {identity.signatureLabel ?? identity.displayName}
          </p>
          <p style={{ margin: "7px 0 0", fontSize: 17, opacity: 0.62 }}>
            decisiones · sistemas · aprendizaje
          </p>
        </div>
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 16,
            letterSpacing: "0.08em",
            opacity: 0.56,
          }}
        >
          SWIPE →
        </span>
      </footer>
    </article>
  );
}
