import type { ArchetypeDefinition } from "../../contracts";

export const processStepsDefinition: ArchetypeDefinition = {
  key: "process-steps",
  version: 1,
  name: "Process Steps",
  family: "technical",
  supportedFormats: ["single-image"],
  supportedStoryTypes: [
    "build",
    "problem-solution",
    "architecture",
    "tutorial",
    "lesson-learned",
  ],
  variants: ["vertical"],
};
