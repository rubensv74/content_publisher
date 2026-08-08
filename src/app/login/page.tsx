import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Acceso",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Content Publisher
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Acceso privado</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Tu espacio para transformar ideas y proyectos en publicaciones profesionales.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
