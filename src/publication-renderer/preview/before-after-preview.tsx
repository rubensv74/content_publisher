"use client";

import { BeforeAfterCard } from "../archetypes/before-after/before-after-card";
import type { RenderablePublication } from "../contracts";
import type { FinalRenderPersistenceHandler } from "../export/final-render";
import { SingleCanvasPreview } from "./single-canvas-preview";

export function BeforeAfterPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  return (
    <SingleCanvasPreview
      label="Before / After"
      publication={publication}
      persistFinalRender={persistFinalRender}
    >
      <BeforeAfterCard publication={publication} />
    </SingleCanvasPreview>
  );
}
