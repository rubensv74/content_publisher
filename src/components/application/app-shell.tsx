import {
  BookOpenText,
  FileText,
  History,
  Image,
  LayoutTemplate,
  Lightbulb,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { signOut } from "@/features/auth/actions";

const navigation = [
  { href: "/", label: "Inicio", icon: BookOpenText },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/publications", label: "Publicaciones", icon: FileText },
  { href: "/designs", label: "Diseños", icon: LayoutTemplate },
  { href: "/assets", label: "Recursos", icon: Image },
  { href: "/history", label: "Historial", icon: History },
  { href: "/settings", label: "Identidad", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-[var(--border)] bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
          <Link href="/" className="block">
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Content
            </span>
            <span className="mt-1 block text-xl font-semibold tracking-tight">Publisher</span>
          </Link>

          <form action={signOut} className="lg:hidden">
            <button
              aria-label="Cerrar sesión"
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)]"
              type="submit"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon size={17} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden px-4 pb-6 pt-8 lg:block">
          <form action={signOut}>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              type="submit"
            >
              <LogOut size={17} strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
