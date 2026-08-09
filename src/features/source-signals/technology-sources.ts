export type TechnologySourceDefinition = {
  id: string;
  name: string;
  provider: string;
  sourceUrl: string;
  feedUrl: string;
  accessType: "rss" | "atom";
  professionalAreas: string[];
  priority: "P0" | "P1";
  active: boolean;
  zeroAdditionalCost: true;
  billingRequired: false;
};

export const technologySources: TechnologySourceDefinition[] = [
  {
    id: "SRC-001",
    name: "GitHub Changelog",
    provider: "GitHub",
    sourceUrl: "https://github.blog/changelog/",
    feedUrl: "https://github.blog/changelog/feed/",
    accessType: "rss",
    professionalAreas: ["github", "git", "copilot", "actions", "projects", "software-development"],
    priority: "P0",
    active: true,
    zeroAdditionalCost: true,
    billingRequired: false,
  },
  {
    id: "SRC-002",
    name: "Supabase Changelog",
    provider: "Supabase",
    sourceUrl: "https://supabase.com/changelog",
    feedUrl: "https://supabase.com/changelog-rss.xml",
    accessType: "rss",
    professionalAreas: ["supabase", "postgresql", "backend", "auth", "storage", "realtime"],
    priority: "P0",
    active: true,
    zeroAdditionalCost: true,
    billingRequired: false,
  },
  {
    id: "SRC-003",
    name: "OpenAI Product Release Notes",
    provider: "OpenAI",
    sourceUrl: "https://openai.com/products/release-notes/",
    feedUrl: "https://openai.com/products/release-notes/rss.xml",
    accessType: "rss",
    professionalAreas: ["chatgpt", "codex", "ai", "agents", "software-development"],
    priority: "P0",
    active: true,
    zeroAdditionalCost: true,
    billingRequired: false,
  },
];
