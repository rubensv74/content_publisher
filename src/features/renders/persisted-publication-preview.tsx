"use client";

import { useRouter } from "next/navigation";

import type { RenderablePublication } from "@/publication-renderer/contracts";
import type { FinalRenderPayload } from "@/publication-renderer/export/final-render";
import { BuildNotePreview } from "@/publication-renderer/preview/build-note-preview";
import { HeroScreenshotPreview } from "@/publication-renderer/preview/hero-screenshot-preview";
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

  if (publication.archetypeKey === "hero-screenshot") {
    return (
      <HeroScreenshotPreview
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
