"use client";

import { useRouter } from "next/navigation";

import type { RenderablePublication } from "@/publication-renderer/contracts";
import type { FinalRenderPayload } from "@/publication-renderer/export/final-render";
import { BoldStatementPreview } from "@/publication-renderer/preview/bold-statement-preview";
import { BuildNotePreview } from "@/publication-renderer/preview/build-note-preview";
import { HeroScreenshotPreview } from "@/publication-renderer/preview/hero-screenshot-preview";
import { ProcessStepsPreview } from "@/publication-renderer/preview/process-steps-preview";
import { SplitScreenshotPreview } from "@/publication-renderer/preview/split-screenshot-preview";
import { StepByStepPreview } from "@/publication-renderer/preview/step-by-step-preview";

import { persistFinalRender } from "./persist-final-render";

export function PersistedPublicationPreview({
  publication,
  canPersist,
}: {
  publication: RenderablePublication;
  canPersist: boolean;
}) {
  const router = useRouter();

  async function persist(payload: FinalRenderPayload) {
    const result = await persistFinalRender(publication, payload);
    router.refresh();
    return result;
  }

  const persistenceHandler = canPersist ? persist : undefined;

  if (publication.archetypeKey === "bold-statement") {
    return (
      <BoldStatementPreview
        publication={publication}
        persistFinalRender={persistenceHandler}
      />
    );
  }

  if (publication.archetypeKey === "hero-screenshot") {
    return (
      <HeroScreenshotPreview
        publication={publication}
        persistFinalRender={persistenceHandler}
      />
    );
  }

  if (publication.archetypeKey === "split-screenshot") {
    return (
      <SplitScreenshotPreview
        publication={publication}
        persistFinalRender={persistenceHandler}
      />
    );
  }

  if (publication.archetypeKey === "process-steps") {
    return (
      <ProcessStepsPreview
        publication={publication}
        persistFinalRender={persistenceHandler}
      />
    );
  }

  if (publication.format === "carousel") {
    return (
      <StepByStepPreview
        publication={publication}
        persistFinalRender={persistenceHandler}
      />
    );
  }

  return (
    <BuildNotePreview
      publication={publication}
      persistFinalRender={persistenceHandler}
    />
  );
}
