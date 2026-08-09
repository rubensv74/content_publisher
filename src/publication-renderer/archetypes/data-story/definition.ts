import type { ArchetypeDefinition } from "../../contracts";

export const dataStoryDefinition: ArchetypeDefinition = {
  key: "data-story",
  version: 1,
  name: "Data Story",
  family: "data",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["data-story", "build", "problem-solution", "professional-insight"],
  variants: ["bars"],
};
