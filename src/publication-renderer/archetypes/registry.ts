import { annotatedScreenshotDefinition } from "./annotated-screenshot/definition";
import { architectureFlowDefinition } from "./architecture-flow/definition";
import { beforeAfterDefinition } from "./before-after/definition";
import { boldStatementDefinition } from "./bold-statement/definition";
import { buildNoteDefinition } from "./build-note/definition";
import { caseStudyDefinition } from "./case-study/definition";
import { codeFocusDefinition } from "./code-focus/definition";
import { dataStoryDefinition } from "./data-story/definition";
import { heroScreenshotDefinition } from "./hero-screenshot/definition";
import { metricHeroDefinition } from "./metric-hero/definition";
import { processStepsDefinition } from "./process-steps/definition";
import { splitScreenshotDefinition } from "./split-screenshot/definition";
import { stepByStepDefinition } from "./step-by-step/definition";

export const publicationArchetypes = [
  buildNoteDefinition,
  boldStatementDefinition,
  metricHeroDefinition,
  heroScreenshotDefinition,
  splitScreenshotDefinition,
  annotatedScreenshotDefinition,
  beforeAfterDefinition,
  architectureFlowDefinition,
  codeFocusDefinition,
  processStepsDefinition,
  dataStoryDefinition,
  stepByStepDefinition,
  caseStudyDefinition,
] as const;

export function getArchetypeDefinition(key: string) {
  return publicationArchetypes.find((archetype) => archetype.key === key) ?? null;
}
