import type { ArchetypeDefinition } from "../../contracts";

export const heroScreenshotDefinition: ArchetypeDefinition = {
  key: "hero-screenshot",
  version: 1,
  name: "Hero Screenshot",
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
  variants: ["framed"],
  requiredAssetRoles: ["hero"],
};
