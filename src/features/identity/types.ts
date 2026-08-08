import type { IdentityPresetKey } from "@/publication-renderer/identity/presets";

export type IdentityProfileRecord = {
  id: string;
  display_name: string;
  signature_label: string | null;
  identity_config: {
    preset_key?: IdentityPresetKey;
    palette?: Record<string, string>;
    typography?: Record<string, string>;
  };
  created_at: string;
  updated_at: string;
};
