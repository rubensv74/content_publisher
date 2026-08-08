import { buildNoteDefinition } from "./build-note/definition";
import { stepByStepDefinition } from "./step-by-step/definition";

export const publicationArchetypes = [
  buildNoteDefinition,
  stepByStepDefinition,
] as const;

export function getArchetypeDefinition(key: string) {
  return publicationArchetypes.find((archetype) => archetype.key === key) ?? null;
}
