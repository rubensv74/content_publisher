import type {
  OpportunityEvaluation,
  OpportunityPriority,
  OpportunityStatus,
} from "./types";

export const opportunityScoreFormula =
  "relevancia×3 + accionabilidad×2 + aprendizaje×2 + proyecto×2 + caso de estudio×2 + editorial + novedad − esfuerzo";

export function calculateOpportunityScore(evaluation: OpportunityEvaluation) {
  return (
    evaluation.professionalRelevance * 3 +
    evaluation.actionability * 2 +
    evaluation.learningPotential * 2 +
    evaluation.projectPotential * 2 +
    evaluation.caseStudyPotential * 2 +
    evaluation.editorialPotential +
    evaluation.novelty -
    evaluation.effort
  );
}

export function priorityFromScore(score: number): OpportunityPriority {
  if (score >= 45) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export const defaultOpportunityEvaluation: OpportunityEvaluation = {
  professionalRelevance: 3,
  actionability: 3,
  learningPotential: 3,
  projectPotential: 3,
  caseStudyPotential: 3,
  editorialPotential: 3,
  novelty: 3,
  effort: 3,
};

export const technologyOpportunityEvaluation: OpportunityEvaluation = {
  professionalRelevance: 4,
  actionability: 3,
  learningPotential: 4,
  projectPotential: 3,
  caseStudyPotential: 3,
  editorialPotential: 3,
  novelty: 4,
  effort: 3,
};

export const allowedOpportunityTransitions: Record<OpportunityStatus, OpportunityStatus[]> = {
  new: ["shortlisted", "dismissed", "archived"],
  shortlisted: ["researching", "dismissed", "archived"],
  researching: ["project_candidate", "shortlisted", "dismissed", "archived"],
  project_candidate: ["active", "researching", "dismissed", "archived"],
  active: ["case_study", "archived"],
  case_study: ["archived"],
  dismissed: ["shortlisted", "archived"],
  archived: ["shortlisted"],
};
