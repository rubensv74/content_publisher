import type { ArchetypeDefinition } from "../../contracts";

export const boldStatementDefinition: ArchetypeDefinition = {
  key: "bold-statement",
  version: 1,
  name: "Bold Statement",
  family: "editorial",
  supportedFormats: ["single-image"],
  supportedStoryTypes: [
    "build",
    "problem-solution",
    "lesson-learned",
    "professional-insight",
  ],
  variants: ["light"],
};
