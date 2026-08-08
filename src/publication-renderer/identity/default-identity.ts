import type { IdentitySnapshot } from "../contracts";

/**
 * Identidad provisional de V1 para probar el renderer.
 * No sustituye a la futura configuración persistida en identity_profiles.
 */
export const defaultIdentity: IdentitySnapshot = {
  displayName: "Rubén",
  signatureLabel: "R // build",
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
};
