import type { PublicationStoryContent } from "./types";

type LinkedInDraftInput = {
  title: string;
  story: PublicationStoryContent;
};

export function buildLinkedInDraft({ title, story }: LinkedInDraftInput) {
  const blocks = [
    title.trim(),
    story.problem?.trim() ?? "",
    story.solution?.trim() ?? "",
    story.result?.trim() ?? "",
    story.learning?.trim() ?? "",
    story.insight?.trim() ?? "",
    story.cta?.trim() ?? "",
  ].filter(Boolean);

  return blocks.join("\n\n");
}
