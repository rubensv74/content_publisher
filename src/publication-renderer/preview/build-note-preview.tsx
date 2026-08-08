"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { RenderablePublication } from "../contracts";
import { browserPublicationExporter } from "../export/browser-exporter";
import { BuildNoteCard } from "../archetypes/build-note/build-note-card";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

function fileNameFromTitle(title: string) {
  const safe = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  return `${safe || "content-publisher"}.png`;
}

export function BuildNotePreview({
  publication,
}: {
  publication: RenderablePublication;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const exportNodeRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateScale = () => {
      const available = viewport.clientWidth;
      setScale(Math.min(1, available / CANVAS_WIDTH));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  async function exportPng() {
    const node = exportNodeRef.current;

    if (!node) {
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const blob = await browserPublicationExporter.exportImage(node, {
        pixelRatio: 1,
        backgroundColor: publication.identity.palette.background,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameFromTitle(publication.title);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "No se pudo exportar la publicación.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Build Note · v1</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Preview y PNG usan exactamente el mismo árbol React.
          </p>
        </div>
        <button
          type="button"
          onClick={exportPng}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <Download size={16} />
          {isExporting ? "Exportando…" : "Exportar PNG"}
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div
        ref={viewportRef}
        className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-slate-200/70"
        style={{ height: CANVAS_HEIGHT * scale }}
      >
        <div
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div ref={exportNodeRef} style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <BuildNoteCard publication={publication} />
          </div>
        </div>
      </div>
    </div>
  );
}
