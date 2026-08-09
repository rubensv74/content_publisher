import type { ArchetypeDefinition } from "../../contracts";

export const annotatedScreenshotDefinition: ArchetypeDefinition = {
  key: "annotated-screenshot",
  version: 1,
  name: "Annotated Screenshot",
  family: "product",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["build", "problem-solution", "architecture", "tutorial", "comparison", "professional-insight"],
  variants: ["numbered"],
  requiredAssetRoles: ["hero"],
};
