import type { ArchetypeDefinition } from "../../contracts";

export const caseStudyDefinition: ArchetypeDefinition = {
  key: "case-study",
  version: 1,
  name: "Case Study",
  family: "carousel",
  supportedFormats: ["carousel"],
  supportedStoryTypes: [
    "build",
    "problem-solution",
    "architecture",
    "lesson-learned",
    "comparison",
    "data-story",
    "professional-insight",
  ],
  variants: ["product"],
};
