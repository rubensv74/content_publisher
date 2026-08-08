import type { RenderablePublication } from "../../contracts";

export type StepByStepSlideModel = {
  key: string;
  kicker: string;
  title: string;
  body?: string;
  emphasis?: string;
  kind: "cover" | "content" | "closing";
};

function text(publication: RenderablePublication, key: string) {
  const value = publication.structuredContent[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function buildStepByStepSlides(
  publication: RenderablePublication,
): StepByStepSlideModel[] {
  const candidates: Array<StepByStepSlideModel | null> = [
    {
      key: "cover",
      kicker: "STEP BY STEP",
      title: publication.title,
      body: "Una experiencia real convertida en decisiones y aprendizajes reutilizables.",
      kind: "cover",
    },
    text(publication, "problem")
      ? {
          key: "problem",
          kicker: "01 · CONTEXTO",
          title: "El problema que había que resolver",
          body: text(publication, "problem") ?? undefined,
          kind: "content",
        }
      : null,
    text(publication, "attempts")
      ? {
          key: "attempts",
          kicker: "02 · EXPLORACIÓN",
          title: "Lo que probé antes de decidir",
          body: text(publication, "attempts") ?? undefined,
          kind: "content",
        }
      : null,
    text(publication, "solution")
      ? {
          key: "solution",
          kicker: "03 · DECISIÓN",
          title: "El enfoque que terminó funcionando",
          body: text(publication, "solution") ?? undefined,
          kind: "content",
        }
      : null,
    text(publication, "learning")
      ? {
          key: "learning",
          kicker: "04 · APRENDIZAJE",
          title: "Lo importante no era solo la solución",
          body: text(publication, "learning") ?? undefined,
          kind: "content",
        }
      : null,
    {
      key: "insight",
      kicker: "05 · PARA LLEVAR",
      title: "La idea que merece quedarse",
      body:
        text(publication, "insight") ??
        text(publication, "learning") ??
        "Documentar la decisión permite reutilizar el aprendizaje, no solo recordar el resultado.",
      emphasis: "Diseña para aprender una vez y reutilizar muchas.",
      kind: "closing",
    },
  ];

  return candidates.filter(
    (slide): slide is StepByStepSlideModel => slide !== null,
  );
}
