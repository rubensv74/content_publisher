import type { IdeaSourceType, IdeaStatus } from "@/domain/content";

export type IdeaRecord = {
  id: string;
  title: string;
  notes: string | null;
  topic: string | null;
  source_type: IdeaSourceType;
  source_ref: string | null;
  priority: number;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
