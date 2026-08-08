import type { ArchetypeDefinition } from "../../contracts";

export const buildNoteDefinition: ArchetypeDefinition = {
  key: "build-note",
  version: 1,
  name: "Build Note",
  family: "editorial",
  supportedFormats: ["single-image"],
  supportedStoryTypes: [
    "build",
    "problem-solution",
    "lesson-learned",
    "professional-insight",
  ],
  variants: ["editorial-light"],
};
