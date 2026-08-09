import type { Metadata } from "next";

import { getIdentityProfile } from "@/features/identity/data";
import { IdentityForm } from "@/features/identity/identity-form";
import { BufferConnectionCard } from "@/features/publishing/buffer-connection-card";
import { getBufferConnectionStatus } from "@/lib/publishing/buffer/account";

export const metadata: Metadata = {
  title: "Identidad y publicación",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profile, bufferStatus] = await Promise.all([
    getIdentityProfile(),
    getBufferConnectionStatus(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Settings
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Identidad y publicación
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          La identidad se guarda una sola vez y alimenta todos los arquetipos. Las integraciones externas se mantienen separadas y sus secretos nunca llegan al navegador.
        </p>
      </header>

      <IdentityForm profile={profile} />
      <BufferConnectionCard status={bufferStatus} />
    </div>
  );
}
