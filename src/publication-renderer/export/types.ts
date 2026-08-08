export type ImageExportOptions = {
  pixelRatio?: number;
  backgroundColor?: string;
};

export type CarouselExportOptions = ImageExportOptions & {
  title?: string;
};

export interface PublicationExportAdapter {
  exportImage(node: HTMLElement, options?: ImageExportOptions): Promise<Blob>;
  exportCarousel(
    nodes: HTMLElement[],
    options?: CarouselExportOptions,
  ): Promise<Blob>;
}
