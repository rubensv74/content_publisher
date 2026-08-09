"use client";

import { CodeFocusCard } from "../archetypes/code-focus/code-focus-card";
import type { RenderablePublication } from "../contracts";
import type { FinalRenderPersistenceHandler } from "../export/final-render";
import { SingleCanvasPreview } from "./single-canvas-preview";

export function CodeFocusPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  return (
    <SingleCanvasPreview
      label="Code Focus"
      publication={publication}
      persistFinalRender={persistFinalRender}
    >
      <CodeFocusCard publication={publication} />
    </SingleCanvasPreview>
  );
}
