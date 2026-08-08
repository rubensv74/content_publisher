import type {
  PublicationFormat,
  PublicationStatus,
  StoryTypeKey,
} from "@/domain/content";

export type PublicationStoryContent = {
  problem?: string | null;
  attempts?: string | null;
  solution?: string | null;
  learning?: string | null;
  insight?: string | null;
};

export type PublicationRecord = {
  id: string;
  source_idea_id: string | null;
  title: string;
  topic: string | null;
  story_type: StoryTypeKey;
  format: PublicationFormat;
  status: PublicationStatus;
  structured_content: PublicationStoryContent;
  content_schema_version: number;
  linkedin_text: string | null;
  archetype_key: string | null;
  archetype_version: number | null;
  variant_key: string | null;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  published_at: string | null;
};
