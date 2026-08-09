"use client";

import { CheckCircle2, FileDown, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CaseStudySlide } from "../archetypes/case-study/case-study-slide";
import { buildCaseStudySlides } from "../archetypes/case-study/slides";
import type { RenderablePublication } from "../contracts";
import { browserPublicationExporter } from "../export/browser-exporter";
import type { FinalRenderPersistenceHandler } from "../export/final-render";

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

  return `${safe || "content-publisher"}.pdf`;
}

export function CaseStudyPreview({
  publication,
  persistFinalRender,
}: {
  publication: RenderablePublication;
  persistFinalRender?: FinalRenderPersistenceHandler;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [scale, setScale] = useState(0.42);
  const [isExporting, setIsExporting] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const slides = buildCaseStudySlides(publication);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      setScale(Math.min(0.58, viewport.clientWidth / CANVAS_WIDTH));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function getReadyNodes() {
    const nodes = nodeRefs.current.filter(
      (node): node is HTMLDivElement => node !== null,
    );
    if (nodes.length !== slides.length) {
      throw new Error("Todavía no están listas todas las páginas del caso.");
    }
    return nodes;
  }

  async function createPdfBlob(nodes = getReadyNodes()) {
    return browserPublicationExporter.exportCarousel(nodes, {
      pixelRatio: 1,
      backgroundColor: publication.identity.palette.background,
      title: publication.title,
    });
  }

  async function exportPdf() {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await createPdfBlob();
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
          : "No se pudo exportar el caso.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function saveFinalRender() {
    if (!persistFinalRender) return;

    setIsPersisting(true);
    setError(null);
    setPublicUrl(null);
    try {
      const nodes = getReadyNodes();
      const [blob, thumbnailBlob] = await Promise.all([
        createPdfBlob(nodes),
        browserPublicationExporter.exportImage(nodes[0], {
          pixelRatio: 1,
          backgroundColor: publication.identity.palette.background,
        }),
      ]);
      const result = await persistFinalRender({
        blob,
        renderType: "pdf",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pageCount: slides.length,
        companionThumbnail: {
          blob: thumbnailBlob,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        },
      });
      setPublicUrl(result.publicUrl);
    } catch (persistError) {
      setError(
        persistError instanceof Error
          ? persistError.message
          : "No se pudo guardar el render final.",
      );
    } finally {
      setIsPersisting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Case Study · v1</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {slides.length} páginas · problema, decisión, resultado y aprendizaje.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportPdf}
            disabled={isExporting || isPersisting}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <FileDown size={16} />
            {isExporting ? "Generando PDF…" : "Exportar PDF"}
          </button>
          {persistFinalRender ? (
            <button
              type="button"
              onClick={saveFinalRender}
              disabled={isExporting || isPersisting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              <Globe2 size={16} />
              {isPersisting ? "Guardando…" : "Crear render final"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {publicUrl ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
          <div>
            <p className="font-medium">Case Study guardado como PDF final.</p>
            <p className="mt-1 text-xs leading-5">
              La portada también se guardó como miniatura pública para Buffer.
            </p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block underline underline-offset-2"
            >
              Abrir archivo público
            </a>
          </div>
        </div>
      ) : null}

      <div ref={viewportRef} className="space-y-5">
        {slides.map((slide, index) => (
          <div key={slide.key}>
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Página {index + 1}</span>
              <span>{slide.kicker}</span>
            </div>
            <div
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
                <div
                  ref={(node) => {
                    nodeRefs.current[index] = node;
                  }}
                  style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                >
                  <CaseStudySlide
                    slide={slide}
                    identity={publication.identity}
                    assets={publication.assets}
                    page={index + 1}
                    total={slides.length}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
