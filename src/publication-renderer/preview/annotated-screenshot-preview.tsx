"use client";

import { AnnotatedScreenshotCard } from "../archetypes/annotated-screenshot/annotated-screenshot-card";
import type { RenderablePublication } from "../contracts";
import type { FinalRenderPersistenceHandler } from "../export/final-render";
import { SingleCanvasPreview } from "./single-canvas-preview";

export function AnnotatedScreenshotPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  return (
    <SingleCanvasPreview
      label="Annotated Screenshot"
      publication={publication}
      persistFinalRender={persistFinalRender}
    >
      <AnnotatedScreenshotCard publication={publication} />
    </SingleCanvasPreview>
  );
}
