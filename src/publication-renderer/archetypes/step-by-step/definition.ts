import type { ArchetypeDefinition } from "../../contracts";

export const stepByStepDefinition: ArchetypeDefinition = {
  key: "step-by-step",
  version: 1,
  name: "Step by Step",
  family: "carousel",
  supportedFormats: ["carousel"],
  supportedStoryTypes: [
    "tutorial",
    "problem-solution",
    "build",
    "architecture",
    "lesson-learned",
  ],
  variants: ["editorial-light"],
};
