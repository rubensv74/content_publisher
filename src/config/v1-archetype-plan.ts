import type { DesignFamilyKey } from "@/domain/content";

export type V1ArchetypePlanItem = {
  code: string;
  name: string;
  family: DesignFamilyKey;
  use: string;
  variants: string[];
  implementationKey?: string;
};

export const v1ArchetypePlan: V1ArchetypePlanItem[] = [
  {
    code: "ED-01",
    name: "Bold Statement",
    family: "editorial",
    use: "Idea fuerte, aprendizaje, reflexión u opinión técnica.",
    variants: ["light", "dark", "accent"],
    implementationKey: "bold-statement",
  },
  {
    code: "ED-03",
    name: "Metric Hero",
    family: "editorial",
    use: "Resultados, rendimiento, cifras y comparaciones.",
    variants: ["single metric", "metric + delta", "metric + mini chart"],
    implementationKey: "metric-hero",
  },
  {
    code: "PR-01",
    name: "Hero Screenshot",
    family: "product",
    use: "Mostrar una aplicación, pantalla o prototipo como protagonista.",
    variants: ["framed", "edge-to-edge", "floating"],
    implementationKey: "hero-screenshot",
  },
  {
    code: "PR-02",
    name: "Split Screenshot",
    family: "product",
    use: "Explicar una interfaz sin sacrificar contexto.",
    variants: ["left/right", "top/bottom"],
    implementationKey: "split-screenshot",
  },
  {
    code: "PR-03",
    name: "Annotated Screenshot",
    family: "product",
    use: "Explicar decisiones de interfaz o funcionalidades mediante marcadores.",
    variants: ["numbered", "focus zones", "zoom detail"],
    implementationKey: "annotated-screenshot",
  },
  {
    code: "PR-04",
    name: "Before / After",
    family: "product",
    use: "Mostrar evolución de interfaz, arquitectura, código o proceso.",
    variants: ["split", "stacked", "carousel reveal"],
    implementationKey: "before-after",
  },
  {
    code: "TE-01",
    name: "Architecture Flow",
    family: "technical",
    use: "Explicar cómo se conectan varias piezas de una solución.",
    variants: ["vertical flow", "layered", "hub-and-spoke"],
    implementationKey: "architecture-flow",
  },
  {
    code: "TE-02",
    name: "Code Focus",
    family: "technical",
    use: "Mostrar un fragmento de código corto con contexto y aprendizaje.",
    variants: ["code first", "explanation first", "before/after code"],
    implementationKey: "code-focus",
  },
  {
    code: "TE-03",
    name: "Process Steps",
    family: "technical",
    use: "Método de trabajo, proceso o checklist técnico.",
    variants: ["vertical", "horizontal", "timeline"],
    implementationKey: "process-steps",
  },
  {
    code: "DA-01",
    name: "Data Story",
    family: "data",
    use: "Power BI, análisis, métricas, rendimiento y decisiones basadas en datos.",
    variants: ["KPI", "bar/line", "comparison"],
    implementationKey: "data-story",
  },
  {
    code: "CA-01",
    name: "Tutorial Sequence",
    family: "carousel",
    use: "Explicar un procedimiento de forma progresiva en varias páginas.",
    variants: ["short 5-page", "standard 7-page", "deep 9-page"],
    implementationKey: "step-by-step",
  },
  {
    code: "CA-02",
    name: "Case Study",
    family: "carousel",
    use: "Contar un proyecto completo desde el contexto hasta el aprendizaje.",
    variants: ["product", "architecture", "data"],
    implementationKey: "case-study",
  },
];
