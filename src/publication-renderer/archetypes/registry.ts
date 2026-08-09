import { buildNoteDefinition } from "./build-note/definition";
import { heroScreenshotDefinition } from "./hero-screenshot/definition";
import { stepByStepDefinition } from "./step-by-step/definition";

export const publicationArchetypes = [
  buildNoteDefinition,
  heroScreenshotDefinition,
  stepByStepDefinition,
] as const;

export function getArchetypeDefinition(key: string) {
  return publicationArchetypes.find((archetype) => archetype.key === key) ?? null;
}
