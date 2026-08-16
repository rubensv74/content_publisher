import type { SourceSignalSourceType } from "@/features/source-signals/types";

export type OpportunityStatus =
  | "new"
  | "shortlisted"
  | "researching"
  | "project_candidate"
  | "active"
  | "case_study"
  | "dismissed"
  | "archived";

export type OpportunityPriority = "low" | "medium" | "high";

export type OpportunityEvaluation = {
  professionalRelevance: number;
  actionability: number;
  learningPotential: number;
  projectPotential: number;
  caseStudyPotential: number;
  editorialPotential: number;
  novelty: number;
  effort: number;
};

export type OpportunityResearchWorkspace = {
  version: 1;
  objective: string | null;
  questions: string | null;
  validationPlan: string | null;
  evidence: string | null;
  findings: string | null;
  conclusion: string | null;
  nextStep: string | null;
};

export const emptyOpportunityResearchWorkspace: OpportunityResearchWorkspace = {
  version: 1,
  objective: null,
  questions: null,
  validationPlan: null,
  evidence: null,
  findings: null,
  conclusion: null,
  nextStep: null,
};

export type OpportunitySignalSummary = {
  id: string;
  sourceType: SourceSignalSourceType;
  sourceLocator: string;
  sourceRef: string;
  title: string;
  occurredAt: string | null;
};

export type OpportunityRecord = OpportunityEvaluation & {
  id: string;
  title: string;
  summary: string | null;
  relevanceReason: string | null;
  status: OpportunityStatus;
  priorityScore: number;
  priority: OpportunityPriority;
  researchNotes: string | null;
  researchWorkspace: OpportunityResearchWorkspace;
  dismissalReason: string | null;
  statusChangedAt: string;
  createdAt: string;
  updatedAt: string;
  signals: OpportunitySignalSummary[];
};

export const opportunityStatuses: OpportunityStatus[] = [
  "new",
  "shortlisted",
  "researching",
  "project_candidate",
  "active",
  "case_study",
  "dismissed",
  "archived",
];

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  new: "Nueva",
  shortlisted: "Seleccionada",
  researching: "Investigando",
  project_candidate: "Candidata a proyecto",
  active: "Proyecto activo",
  case_study: "Lista para caso de estudio",
  dismissed: "Descartada",
  archived: "Archivada",
};

export const opportunityPriorityLabels: Record<OpportunityPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};
