import type { StoryTypeKey } from "@/domain/content";

export type StoryTypeDefinition = {
  key: StoryTypeKey;
  label: string;
  description: string;
};

export const storyTypes: StoryTypeDefinition[] = [
  {
    key: "build",
    label: "Build",
    description: "Explica algo que has construido y las decisiones que lo hicieron posible.",
  },
  {
    key: "problem-solution",
    label: "Problema → solución",
    description: "Parte de un problema concreto y muestra cómo lo resolviste y qué aprendiste.",
  },
  {
    key: "architecture",
    label: "Arquitectura",
    description: "Explica una decisión de diseño de sistema, sus alternativas y consecuencias.",
  },
  {
    key: "tutorial",
    label: "Tutorial",
    description: "Enseña un proceso mediante pasos claros y reutilizables.",
  },
  {
    key: "lesson-learned",
    label: "Aprendizaje",
    description: "Convierte una experiencia real en una lección práctica para otros profesionales.",
  },
  {
    key: "comparison",
    label: "Comparación / Before & After",
    description: "Compara dos enfoques, estados o soluciones y explica por qué cambió el resultado.",
  },
  {
    key: "data-story",
    label: "Data Story",
    description: "Construye una historia alrededor de métricas, gráficos o patrones de datos.",
  },
  {
    key: "professional-insight",
    label: "Reflexión profesional",
    description: "Desarrolla una idea profesional apoyada en experiencia y criterio propios.",
  },
];
