import type { VisualConfig } from "@/publication-renderer/contracts";

export type ArchetypeVisualConfig = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export function getArchetypeVisualConfig(
  visualConfig: VisualConfig,
  archetypeKey: string,
): ArchetypeVisualConfig {
  return asRecord(visualConfig[archetypeKey]) ?? {};
}

export function isVisualConfigReady(
  archetypeKey: string,
  visualConfig: VisualConfig,
): boolean {
  const config = getArchetypeVisualConfig(visualConfig, archetypeKey);

  switch (archetypeKey) {
    case "metric-hero":
      return nonEmptyString(config.value) && nonEmptyString(config.label);

    case "annotated-screenshot": {
      const annotations = Array.isArray(config.annotations) ? config.annotations : [];
      return (
        annotations.length > 0 &&
        annotations.every((annotation) => {
          const item = asRecord(annotation);
          return Boolean(
            item &&
              nonEmptyString(item.label) &&
              finiteNumber(item.x) &&
              finiteNumber(item.y) &&
              (item.x as number) >= 0 &&
              (item.x as number) <= 100 &&
              (item.y as number) >= 0 &&
              (item.y as number) <= 100,
          );
        })
      );
    }

    case "before-after":
      return nonEmptyString(config.beforeLabel) && nonEmptyString(config.afterLabel);

    case "code-focus":
      return nonEmptyString(config.language) && nonEmptyString(config.snippet);

    case "data-story": {
      const series = Array.isArray(config.series) ? config.series : [];
      return (
        nonEmptyString(config.title) &&
        series.length >= 2 &&
        series.every((entry) => {
          const item = asRecord(entry);
          return Boolean(item && nonEmptyString(item.label) && finiteNumber(item.value));
        })
      );
    }

    default:
      return true;
  }
}

export function visualConfigRequirementLabel(archetypeKey: string) {
  switch (archetypeKey) {
    case "metric-hero":
      return "Configura el valor y la etiqueta de la métrica.";
    case "annotated-screenshot":
      return "Añade al menos una anotación válida sobre el screenshot.";
    case "before-after":
      return "Configura las etiquetas Before y After.";
    case "code-focus":
      return "Indica el lenguaje y el fragmento de código.";
    case "data-story":
      return "Configura el título y al menos dos valores de la serie.";
    default:
      return null;
  }
}
