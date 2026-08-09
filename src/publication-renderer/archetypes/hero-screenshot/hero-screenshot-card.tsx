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
  key: "problem" | "solution" | "learning" | "insight",
) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function HeroScreenshotCard({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const { identity } = publication;
  const { palette, typography } = identity;
  const hero = publication.assets.find((asset) => asset.role === "hero");
  const context =
    storyText(publication, "solution") ??
    storyText(publication, "problem") ??
    storyText(publication, "insight");
  const learning = storyText(publication, "learning");

  return (
    <article
      data-publication-canvas="hero-screenshot"
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: palette.background,
        color: palette.foreground,
        fontFamily: typography.body,
        padding: "62px 68px 58px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: typography.mono,
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: palette.accent,
              textTransform: "uppercase",
            }}
          >
            PRODUCT / BUILD
          </p>
          <h1
            style={{
              ...clamp(3),
              margin: "26px 0 0",
              maxWidth: 770,
              fontFamily: typography.display,
              fontSize: 67,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.038em",
            }}
          >
            {publication.title}
          </h1>
        </div>

        <div
          style={{
            width: 116,
            height: 116,
            borderRadius: 28,
            background: palette.accent,
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontFamily: typography.mono,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "0.05em",
          }}
        >
          UI
        </div>
      </header>

      <main
        style={{
          marginTop: 44,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <section
          style={{
            borderRadius: 34,
            background: palette.surface,
            border: `2px solid ${palette.line}`,
            padding: 16,
            boxShadow: "0 28px 70px rgba(23,25,29,0.12)",
          }}
        >
          <div
            style={{
              height: 48,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              borderBottom: `1px solid ${palette.line}`,
            }}
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: dot === 0 ? palette.accent : palette.accentSoft,
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 10,
                fontFamily: typography.mono,
                fontSize: 14,
                color: palette.muted,
              }}
            >
              product-preview
            </span>
          </div>

          <div
            role="img"
            aria-label={hero?.alt ?? "Screenshot de la publicación"}
            style={{
              height: 540,
              marginTop: 16,
              borderRadius: 22,
              overflow: "hidden",
              backgroundColor: palette.accentSoft,
              backgroundImage: hero ? `url("${hero.url}")` : undefined,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: hero ? "block" : "grid",
              placeItems: "center",
              color: palette.muted,
              fontFamily: typography.mono,
              fontSize: 20,
              textAlign: "center",
              padding: hero ? 0 : 48,
            }}
          >
            {hero ? null : "Añade un screenshot desde Recursos para completar este diseño."}
          </div>
        </section>

        <div
          style={{
            marginTop: 34,
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: 22,
          }}
        >
          <section
            style={{
              borderRadius: 24,
              background: palette.surface,
              border: `2px solid ${palette.line}`,
              padding: "26px 30px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: typography.mono,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: palette.accent,
                textTransform: "uppercase",
              }}
            >
              Qué estamos viendo
            </p>
            <p
              style={{
                ...clamp(4),
                margin: "15px 0 0",
                fontSize: 24,
                lineHeight: 1.38,
                fontWeight: 600,
              }}
            >
              {context ?? "Una pantalla real como evidencia del trabajo construido."}
            </p>
          </section>

          <section
            style={{
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
              Aprendizaje
            </p>
            <p
              style={{
                ...clamp(5),
                margin: "15px 0 0",
                fontFamily: typography.display,
                fontSize: 23,
                lineHeight: 1.32,
              }}
            >
              {learning ?? "Mostrar el producto también forma parte de explicar la decisión."}
            </p>
          </section>
        </div>
      </main>

      <footer
        style={{
          marginTop: 30,
          paddingTop: 22,
          borderTop: `2px solid ${palette.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
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
          {identity.signatureLabel ?? identity.displayName}
        </span>
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: 15,
            color: palette.muted,
            textTransform: "uppercase",
          }}
        >
          {hero?.alt ?? "CONTENT PUBLISHER"}
        </span>
      </footer>
    </article>
  );
}
