import type { ArchetypeDefinition } from "../../contracts";

export const codeFocusDefinition: ArchetypeDefinition = {
  key: "code-focus",
  version: 1,
  name: "Code Focus",
  family: "technical",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["build", "problem-solution", "tutorial", "lesson-learned", "professional-insight"],
  variants: ["code-first"],
};
