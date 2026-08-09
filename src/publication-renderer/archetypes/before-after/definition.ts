import type { ArchetypeDefinition } from "../../contracts";

export const beforeAfterDefinition: ArchetypeDefinition = {
  key: "before-after",
  version: 1,
  name: "Before / After",
  family: "product",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["build", "problem-solution", "comparison", "professional-insight"],
  variants: ["split"],
  requiredAssetRoles: ["before", "after"],
};
