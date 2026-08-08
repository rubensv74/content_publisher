"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  IDENTITY_PRESET_KEYS,
  getIdentityPreset,
  type IdentityPresetKey,
} from "@/publication-renderer/identity/presets";

export type SaveIdentityState = {
  error: string | null;
  success: boolean;
};

function isPresetKey(value: FormDataEntryValue | null): value is IdentityPresetKey {
  return (
    typeof value === "string" &&
    (IDENTITY_PRESET_KEYS as readonly string[]).includes(value)
  );
}

export async function saveIdentityProfile(
  _previousState: SaveIdentityState,
  formData: FormData,
): Promise<SaveIdentityState> {
  const displayName = formData.get("displayName");
  const signatureLabel = formData.get("signatureLabel");
  const presetKey = formData.get("presetKey");

  if (typeof displayName !== "string" || !displayName.trim()) {
    return { error: "La identidad necesita un nombre visible.", success: false };
  }

  if (!isPresetKey(presetKey)) {
    return { error: "Selecciona una dirección visual válida.", success: false };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || !userId) {
    return { error: "La sesión ya no es válida.", success: false };
  }

  const preset = getIdentityPreset(presetKey);
  const { error } = await supabase.from("identity_profiles").upsert(
    {
      user_id: userId,
      display_name: displayName.trim(),
      signature_label:
        typeof signatureLabel === "string" && signatureLabel.trim()
          ? signatureLabel.trim()
          : null,
      identity_config: {
        preset_key: preset.key,
        palette: preset.palette,
        typography: preset.typography,
      },
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return {
      error: `No se pudo guardar la identidad: ${error.message}`,
      success: false,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/publications");
  return { error: null, success: true };
}
