"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-slate-500"
          id="email"
          name="email"
          type="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-slate-500"
          id="password"
          name="password"
          type="password"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Accediendo…" : "Entrar"}
      </button>
    </form>
  );
}
