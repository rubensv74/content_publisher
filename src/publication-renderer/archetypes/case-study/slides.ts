import type { RenderablePublication } from "../../contracts";

export type CaseStudySlideModel = {
  key: string;
  kicker: string;
  title: string;
  body?: string;
  emphasis?: string;
  kind: "cover" | "context" | "decision" | "result" | "learning" | "closing";
  assetRole?: string;
};

function text(publication: RenderablePublication, key: string) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function buildCaseStudySlides(
  publication: RenderablePublication,
): CaseStudySlideModel[] {
  const candidates: Array<CaseStudySlideModel | null> = [
    {
      key: "cover",
      kicker: "CASE STUDY",
      title: publication.title,
      body: "Un caso real contado desde el problema hasta el aprendizaje reutilizable.",
      kind: "cover",
    },
    text(publication, "problem")
      ? {
          key: "context",
          kicker: "01 · CONTEXTO",
          title: "Qué estaba pasando",
          body: text(publication, "problem") ?? undefined,
          kind: "context",
        }
      : null,
    text(publication, "attempts")
      ? {
          key: "attempts",
          kicker: "02 · FRICCIÓN",
          title: "Lo que no resolvía el problema",
          body: text(publication, "attempts") ?? undefined,
          kind: "context",
        }
      : null,
    text(publication, "solution")
      ? {
          key: "decision",
          kicker: "03 · DECISIÓN",
          title: "El cambio de enfoque",
          body: text(publication, "solution") ?? undefined,
          kind: "decision",
        }
      : null,
    text(publication, "result") || publication.assets.some((asset) => asset.role === "hero")
      ? {
          key: "result",
          kicker: "04 · RESULTADO",
          title: "Qué cambió después",
          body:
            text(publication, "result") ??
            "El resultado se puede revisar sobre la evidencia visual del proyecto.",
          kind: "result",
          assetRole: publication.assets.some((asset) => asset.role === "hero")
            ? "hero"
            : undefined,
        }
      : null,
    text(publication, "learning")
      ? {
          key: "learning",
          kicker: "05 · APRENDIZAJE",
          title: "Lo que me llevo del proceso",
          body: text(publication, "learning") ?? undefined,
          kind: "learning",
        }
      : null,
    {
      key: "closing",
      kicker: "06 · PARA LLEVAR",
      title: "La idea que merece quedarse",
      body:
        text(publication, "insight") ??
        text(publication, "learning") ??
        "El valor de un caso no está solo en el resultado, sino en hacer visible la decisión que lo produjo.",
      emphasis:
        text(publication, "cta") ??
        "¿Qué parte de este proceso aplicarías en tu siguiente proyecto?",
      kind: "closing",
    },
  ];

  return candidates.filter(
    (slide): slide is CaseStudySlideModel => slide !== null,
  );
}
