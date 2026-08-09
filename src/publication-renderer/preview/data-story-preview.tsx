"use client";

import { DataStoryCard } from "../archetypes/data-story/data-story-card";
import type { RenderablePublication } from "../contracts";
import type { FinalRenderPersistenceHandler } from "../export/final-render";
import { SingleCanvasPreview } from "./single-canvas-preview";

export function DataStoryPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  return (
    <SingleCanvasPreview
      label="Data Story"
      publication={publication}
      persistFinalRender={persistFinalRender}
    >
      <DataStoryCard publication={publication} />
    </SingleCanvasPreview>
  );
}
