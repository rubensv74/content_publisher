export const STORY_TYPE_KEYS = [
  "build",
  "problem-solution",
  "architecture",
  "tutorial",
  "lesson-learned",
  "comparison",
  "data-story",
  "professional-insight",
] as const;

export type StoryTypeKey = (typeof STORY_TYPE_KEYS)[number];

export const PUBLICATION_FORMATS = ["single-image", "carousel"] as const;
export type PublicationFormat = (typeof PUBLICATION_FORMATS)[number];

export const DESIGN_FAMILY_KEYS = [
  "editorial",
  "product",
  "technical",
  "data",
  "carousel",
] as const;

export type DesignFamilyKey = (typeof DESIGN_FAMILY_KEYS)[number];

export const IDEA_SOURCE_TYPES = [
  "manual",
  "github",
  "knowledge-base",
  "suggestion-engine",
  "trend",
  "other",
] as const;

export type IdeaSourceType = (typeof IDEA_SOURCE_TYPES)[number];

export const IDEA_STATUSES = ["idea", "archived", "converted"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const PUBLICATION_STATUSES = [
  "draft",
  "ready",
  "scheduled",
  "published",
  "archived",
] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export type StructuredContent = Record<string, unknown>;
