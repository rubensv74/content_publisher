import type {
  DesignFamilyKey,
  PublicationFormat,
  StoryTypeKey,
  StructuredContent,
} from "@/domain/content";

export type IdentitySnapshot = {
  displayName: string;
  signatureLabel?: string;
  palette: Record<string, string>;
  typography: Record<string, string>;
  series?: {
    key: string;
    number?: number;
  };
};

export type PublicationAsset = {
  id: string;
  role: string;
  url: string;
  alt?: string;
  metadata?: Record<string, unknown>;
};

export type RenderablePublication = {
  id: string;
  title: string;
  storyType: StoryTypeKey;
  format: PublicationFormat;
  structuredContent: StructuredContent;
  archetypeKey: string;
  archetypeVersion: number;
  variantKey: string;
  identity: IdentitySnapshot;
  assets: PublicationAsset[];
};

export type ArchetypeDefinition = {
  key: string;
  version: number;
  name: string;
  family: DesignFamilyKey;
  supportedFormats: PublicationFormat[];
  supportedStoryTypes?: StoryTypeKey[];
  variants: string[];
};
