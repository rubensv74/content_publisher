"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function percent(formData: FormData, name: string) {
  const raw = text(formData, name);
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;
}

function parseConfig(archetypeKey: string, formData: FormData): Record<string, unknown> {
  switch (archetypeKey) {
    case "metric-hero": {
      const value = text(formData, "metricValue");
      const label = text(formData, "metricLabel");
      if (!value || !label) throw new Error("La métrica necesita valor y etiqueta.");
      return {
        value,
        label,
        delta: optionalText(formData, "metricDelta"),
        context: optionalText(formData, "metricContext"),
      };
    }

    case "annotated-screenshot": {
      const annotations = [1, 2, 3, 4]
        .map((index) => {
          const label = text(formData, `annotation${index}Label`);
          if (!label) return null;
          return {
            label,
            x: percent(formData, `annotation${index}X`),
            y: percent(formData, `annotation${index}Y`),
          };
        })
        .filter((item): item is { label: string; x: number; y: number } => item !== null);

      if (annotations.length === 0) {
        throw new Error("Añade al menos una anotación al screenshot.");
      }

      return { annotations };
    }

    case "before-after": {
      const beforeLabel = text(formData, "beforeLabel");
      const afterLabel = text(formData, "afterLabel");
      if (!beforeLabel || !afterLabel) {
        throw new Error("Before / After necesita las dos etiquetas.");
      }
      return {
        beforeLabel,
        afterLabel,
        summary: optionalText(formData, "changeSummary"),
      };
    }

    case "code-focus": {
      const language = text(formData, "codeLanguage");
      const snippet = text(formData, "codeSnippet");
      if (!language || !snippet) {
        throw new Error("Code Focus necesita lenguaje y fragmento de código.");
      }
      const highlightLines = text(formData, "highlightLines")
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0)
        .slice(0, 12);
      return {
        language,
        snippet,
        highlightLines,
        explanation: optionalText(formData, "codeExplanation"),
      };
    }

    case "data-story": {
      const title = text(formData, "dataTitle");
      const series = [1, 2, 3, 4, 5]
        .map((index) => {
          const label = text(formData, `data${index}Label`);
          const rawValue = text(formData, `data${index}Value`);
          const value = Number(rawValue.replace(",", "."));
          if (!label || !rawValue || !Number.isFinite(value)) return null;
          return { label, value };
        })
        .filter((item): item is { label: string; value: number } => item !== null);

      if (!title || series.length < 2) {
        throw new Error("Data Story necesita un título y al menos dos valores válidos.");
      }

      return {
        title,
        unit: optionalText(formData, "dataUnit"),
        series,
        takeaway: optionalText(formData, "dataTakeaway"),
      };
    }

    default:
      throw new Error("Este diseño no utiliza configuración visual especializada.");
  }
}

export async function savePublicationVisualConfig(formData: FormData) {
  const publicationId = text(formData, "publicationId");
  const archetypeKey = text(formData, "archetypeKey");

  if (!publicationId || !archetypeKey) {
    throw new Error("No se ha indicado una publicación o diseño válido.");
  }

  const config = parseConfig(archetypeKey, formData);
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { data: publication, error: readError } = await supabase
    .from("publications")
    .select("visual_config")
    .eq("id", publicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError || !publication) {
    throw new Error(`No se pudo cargar la configuración actual: ${readError?.message ?? "publicación no encontrada"}`);
  }

  const current =
    typeof publication.visual_config === "object" &&
    publication.visual_config !== null &&
    !Array.isArray(publication.visual_config)
      ? (publication.visual_config as Record<string, unknown>)
      : {};

  const { error } = await supabase
    .from("publications")
    .update({
      visual_config: {
        ...current,
        [archetypeKey]: config,
      },
    })
    .eq("id", publicationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`No se pudo guardar la configuración visual: ${error.message}`);
  }

  revalidatePath(`/publications/${publicationId}/studio`);
  redirect(`/publications/${publicationId}/studio?design=${encodeURIComponent(archetypeKey)}&saved=visual`);
}
