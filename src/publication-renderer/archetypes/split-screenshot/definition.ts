import type { ArchetypeDefinition } from "../../contracts";

export const splitScreenshotDefinition: ArchetypeDefinition = {
  key: "split-screenshot",
  version: 1,
  name: "Split Screenshot",
  family: "product",
  supportedFormats: ["single-image"],
  supportedStoryTypes: [
    "build",
    "problem-solution",
    "architecture",
    "tutorial",
    "comparison",
    "professional-insight",
  ],
  variants: ["left-right"],
};
