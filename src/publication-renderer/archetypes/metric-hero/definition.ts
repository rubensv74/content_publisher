import type { ArchetypeDefinition } from "../../contracts";

export const metricHeroDefinition: ArchetypeDefinition = {
  key: "metric-hero",
  version: 1,
  name: "Metric Hero",
  family: "editorial",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["build", "problem-solution", "data-story", "professional-insight"],
  variants: ["single-metric"],
};
