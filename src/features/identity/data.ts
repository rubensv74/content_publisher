import { createClient } from "@/lib/supabase/server";
import type { IdentitySnapshot } from "@/publication-renderer/contracts";
import { defaultIdentity } from "@/publication-renderer/identity/default-identity";
import { getIdentityPreset } from "@/publication-renderer/identity/presets";

import type { IdentityProfileRecord } from "./types";

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export async function getIdentityProfile(): Promise<IdentityProfileRecord | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("identity_profiles")
    .select(
      "id,display_name,signature_label,identity_config,created_at,updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar la identidad: ${error.message}`);
  }

  return (data as unknown as IdentityProfileRecord | null) ?? null;
}

export async function getIdentitySnapshot(): Promise<IdentitySnapshot> {
  const profile = await getIdentityProfile();

  if (!profile) {
    return defaultIdentity;
  }

  const config = profile.identity_config ?? {};
  const preset = getIdentityPreset(config.preset_key);

  return {
    displayName: profile.display_name,
    signatureLabel: profile.signature_label ?? undefined,
    palette: isStringRecord(config.palette) ? config.palette : preset.palette,
    typography: isStringRecord(config.typography)
      ? config.typography
      : preset.typography,
  };
}
