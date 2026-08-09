import type { ArchetypeDefinition } from "../../contracts";

export const architectureFlowDefinition: ArchetypeDefinition = {
  key: "architecture-flow",
  version: 1,
  name: "Architecture Flow",
  family: "technical",
  supportedFormats: ["single-image"],
  supportedStoryTypes: ["architecture", "build", "problem-solution", "tutorial"],
  variants: ["layered"],
};
