import { boldStatementDefinition } from "./bold-statement/definition";
import { buildNoteDefinition } from "./build-note/definition";
import { heroScreenshotDefinition } from "./hero-screenshot/definition";
import { processStepsDefinition } from "./process-steps/definition";
import { splitScreenshotDefinition } from "./split-screenshot/definition";
import { stepByStepDefinition } from "./step-by-step/definition";

export const publicationArchetypes = [
  buildNoteDefinition,
  boldStatementDefinition,
  heroScreenshotDefinition,
  splitScreenshotDefinition,
  processStepsDefinition,
  stepByStepDefinition,
] as const;

export function getArchetypeDefinition(key: string) {
  return publicationArchetypes.find((archetype) => archetype.key === key) ?? null;
}
