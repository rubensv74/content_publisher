"use client";

import { useActionState } from "react";

import {
  identityPresets,
  type IdentityPresetKey,
} from "@/publication-renderer/identity/presets";

import { saveIdentityProfile, type SaveIdentityState } from "./actions";
import type { IdentityProfileRecord } from "./types";

const initialState: SaveIdentityState = { error: null, success: false };

export function IdentityForm({
  profile,
}: {
  profile: IdentityProfileRecord | null;
}) {
  const [state, formAction, isPending] = useActionState(
    saveIdentityProfile,
    initialState,
  );
  const currentPreset =
    (profile?.identity_config?.preset_key as IdentityPresetKey | undefined) ??
    "technical-editorial";

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Firma
        </p>
        <h2 className="mt-2 text-xl font-semibold">Identidad visible</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Estos elementos se repiten entre diseños para mantener reconocimiento sin obligar a que todas las publicaciones se parezcan.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="displayName">
              Nombre visible
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              maxLength={80}
              defaultValue={profile?.display_name ?? "Rubén"}
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="signatureLabel">
              Firma corta
            </label>
            <input
              id="signatureLabel"
              name="signatureLabel"
              maxLength={40}
              defaultValue={profile?.signature_label ?? "R // build"}
              placeholder="R // build"
              className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Dirección visual
        </p>
        <h2 className="mt-2 text-xl font-semibold">Una identidad, varios registros</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          No son plantillas. Son tres direcciones de identidad que alimentan los arquetipos mediante tokens compartidos.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {identityPresets.map((preset) => (
            <label
              key={preset.key}
              className="cursor-pointer rounded-2xl border border-[var(--border)] p-4 transition hover:border-slate-400"
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="presetKey"
                  value={preset.key}
                  defaultChecked={preset.key === currentPreset}
                  className="mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{preset.name}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                    {preset.description}
                  </span>
                </span>
              </div>

              <div
                className="mt-4 overflow-hidden rounded-xl border"
                style={{
                  borderColor: preset.palette.line,
                  background: preset.palette.background,
                }}
              >
                <div className="flex h-16 items-end gap-2 p-3">
                  <span
                    className="h-8 flex-1 rounded-md"
                    style={{ background: preset.palette.foreground }}
                  />
                  <span
                    className="h-11 w-12 rounded-md"
                    style={{ background: preset.palette.accent }}
                  />
                  <span
                    className="h-6 w-10 rounded-md"
                    style={{ background: preset.palette.accentSoft }}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          Identidad guardada. Los previews utilizarán esta configuración.
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar identidad"}
        </button>
      </div>
    </form>
  );
}
