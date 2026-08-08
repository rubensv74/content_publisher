import type { Metadata } from "next";

import { getIdentityProfile } from "@/features/identity/data";
import { IdentityForm } from "@/features/identity/identity-form";

export const metadata: Metadata = {
  title: "Identidad visual",
};

export default async function SettingsPage() {
  const profile = await getIdentityProfile();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Identity
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Identidad visual</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          La identidad no vive dentro de una plantilla. Se guarda una sola vez y alimenta todos los arquetipos mediante firma, paleta y tipografía compartidas.
        </p>
      </header>

      <IdentityForm profile={profile} />
    </div>
  );
}
