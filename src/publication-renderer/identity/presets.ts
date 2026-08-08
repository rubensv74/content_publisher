import type { IdentitySnapshot } from "../contracts";

export const IDENTITY_PRESET_KEYS = [
  "technical-editorial",
  "structured-signal",
  "product-notebook",
] as const;

export type IdentityPresetKey = (typeof IDENTITY_PRESET_KEYS)[number];

export type IdentityPreset = {
  key: IdentityPresetKey;
  name: string;
  description: string;
  palette: IdentitySnapshot["palette"];
  typography: IdentitySnapshot["typography"];
};

export const identityPresets: IdentityPreset[] = [
  {
    key: "technical-editorial",
    name: "Technical Editorial",
    description:
      "Base clara, jerarquía editorial y acento técnico contenido. Es la dirección recomendada para la identidad V1.",
    palette: {
      background: "#f4f2ed",
      foreground: "#17191d",
      muted: "#626a72",
      accent: "#2f6f73",
      accentSoft: "#dce9e9",
      line: "#cdd1d4",
      surface: "#ffffff",
    },
    typography: {
      display: "Georgia, 'Times New Roman', serif",
      body: "Arial, Helvetica, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  },
  {
    key: "structured-signal",
    name: "Structured Signal",
    description:
      "Más contraste, retícula técnica y sensación de sistema. Pensada para arquitectura, procesos y datos.",
    palette: {
      background: "#12181d",
      foreground: "#f2f5f6",
      muted: "#a6b0b6",
      accent: "#68c7c1",
      accentSoft: "#23383a",
      line: "#39444b",
      surface: "#1b2329",
    },
    typography: {
      display: "Arial, Helvetica, sans-serif",
      body: "Arial, Helvetica, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  },
  {
    key: "product-notebook",
    name: "Product Notebook",
    description:
      "Más cálida y orientada a producto, screenshots y anotaciones, sin perder la firma técnica.",
    palette: {
      background: "#f7f0e7",
      foreground: "#202124",
      muted: "#746d66",
      accent: "#b95f45",
      accentSoft: "#ead8cc",
      line: "#d9d0c8",
      surface: "#fffdf9",
    },
    typography: {
      display: "Georgia, 'Times New Roman', serif",
      body: "Arial, Helvetica, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  },
];

export function getIdentityPreset(key: string | null | undefined) {
  return (
    identityPresets.find((preset) => preset.key === key) ?? identityPresets[0]
  );
}
