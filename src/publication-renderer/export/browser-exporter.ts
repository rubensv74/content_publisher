"use client";

import { toBlob } from "html-to-image";
import { PDFDocument } from "pdf-lib";

import type {
  CarouselExportOptions,
  ImageExportOptions,
  PublicationExportAdapter,
} from "./types";

async function nodeToPngBlob(
  node: HTMLElement,
  options: ImageExportOptions = {},
): Promise<Blob> {
  await document.fonts.ready;

  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: options.pixelRatio ?? 2,
    backgroundColor: options.backgroundColor,
  });

  if (!blob) {
    throw new Error("No se pudo generar la imagen de la publicación.");
  }

  return blob;
}

export const browserPublicationExporter: PublicationExportAdapter = {
  async exportImage(node, options) {
    return nodeToPngBlob(node, options);
  },

  async exportCarousel(nodes, options: CarouselExportOptions = {}) {
    if (nodes.length === 0) {
      throw new Error("El carrusel necesita al menos una página.");
    }

    await document.fonts.ready;

    const pdf = await PDFDocument.create();

    if (options.title) {
      pdf.setTitle(options.title);
    }

    for (const node of nodes) {
      const blob = await nodeToPngBlob(node, options);
      const imageBytes = await blob.arrayBuffer();
      const image = await pdf.embedPng(imageBytes);
      const page = pdf.addPage([image.width, image.height]);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const bytes = await pdf.save();
    const normalizedBytes = new Uint8Array(bytes.byteLength);
    normalizedBytes.set(bytes);

    return new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  },
};
