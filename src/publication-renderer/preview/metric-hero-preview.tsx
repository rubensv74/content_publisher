"use client";

import { MetricHeroCard } from "../archetypes/metric-hero/metric-hero-card";
import type { RenderablePublication } from "../contracts";
import type { FinalRenderPersistenceHandler } from "../export/final-render";
import { SingleCanvasPreview } from "./single-canvas-preview";

export function MetricHeroPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  return (
    <SingleCanvasPreview
      label="Metric Hero"
      publication={publication}
      persistFinalRender={persistFinalRender}
    >
      <MetricHeroCard publication={publication} />
    </SingleCanvasPreview>
  );
}
