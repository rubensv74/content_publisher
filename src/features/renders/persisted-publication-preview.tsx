"use client";

import { useRouter } from "next/navigation";

import { getArchetypeDefinition } from "@/publication-renderer/archetypes/registry";
import type { RenderablePublication } from "@/publication-renderer/contracts";
import type { FinalRenderPayload } from "@/publication-renderer/export/final-render";
import { AnnotatedScreenshotPreview } from "@/publication-renderer/preview/annotated-screenshot-preview";
import { ArchitectureFlowPreview } from "@/publication-renderer/preview/architecture-flow-preview";
import { BeforeAfterPreview } from "@/publication-renderer/preview/before-after-preview";
import { BoldStatementPreview } from "@/publication-renderer/preview/bold-statement-preview";
import { BuildNotePreview } from "@/publication-renderer/preview/build-note-preview";
import { CaseStudyPreview } from "@/publication-renderer/preview/case-study-preview";
import { CodeFocusPreview } from "@/publication-renderer/preview/code-focus-preview";
import { DataStoryPreview } from "@/publication-renderer/preview/data-story-preview";
import { HeroScreenshotPreview } from "@/publication-renderer/preview/hero-screenshot-preview";
import { MetricHeroPreview } from "@/publication-renderer/preview/metric-hero-preview";
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
  const definition = getArchetypeDefinition(publication.archetypeKey);
  const requiredAssetRoles = definition?.requiredAssetRoles ?? [];
  const hasRequiredAssets = requiredAssetRoles.every((role) =>
    publication.assets.some((asset) => asset.role === role),
  );

  async function persist(payload: FinalRenderPayload) {
    const result = await persistFinalRender(publication, payload);
    router.refresh();
    return result;
  }

  const persistenceHandler = canPersist && hasRequiredAssets ? persist : undefined;

  switch (publication.archetypeKey) {
    case "bold-statement":
      return <BoldStatementPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "metric-hero":
      return <MetricHeroPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "hero-screenshot":
      return <HeroScreenshotPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "split-screenshot":
      return <SplitScreenshotPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "annotated-screenshot":
      return <AnnotatedScreenshotPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "before-after":
      return <BeforeAfterPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "architecture-flow":
      return <ArchitectureFlowPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "code-focus":
      return <CodeFocusPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "process-steps":
      return <ProcessStepsPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "data-story":
      return <DataStoryPreview publication={publication} persistFinalRender={persistenceHandler} />;
    case "case-study":
      return <CaseStudyPreview publication={publication} persistFinalRender={persistenceHandler} />;
    default:
      if (publication.format === "carousel") {
        return <StepByStepPreview publication={publication} persistFinalRender={persistenceHandler} />;
      }
      return <BuildNotePreview publication={publication} persistFinalRender={persistenceHandler} />;
  }
}
