"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";

const MENU = [
  { href: "/admin", etiqueta: "Inicio" },
  { href: "/admin/asistencia", etiqueta: "Asistencia" },
  { href: "/admin/registrados", etiqueta: "Registrados" },
  { href: "/admin/resultados", etiqueta: "Resultados" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activo = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 shadow-sm">
        <div className="bg-alpha text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
            <Link href="/admin" className="flex items-center gap-2 font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <Image src="/logo.png" alt="" width={800} height={722} className="h-8 w-auto" />
              Alpha · Admin
            </Link>
            <button
              type="button"
              onClick={() => void getSupabase().auth.signOut()}
              className="rounded-lg border border-white/70 px-3 py-1.5 text-sm font-semibold transition hover:bg-white hover:text-alpha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        <nav aria-label="Menú del panel" className="border-b border-neutral-200 bg-white">
          <ul className="mx-auto grid max-w-5xl grid-cols-4">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  aria-current={activo(m.href) ? "page" : undefined}
                  className={`block border-b-4 px-1 py-3 text-center text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-alpha sm:text-base ${
                    activo(m.href) ? "border-alpha text-alpha" : "border-transparent text-neutral-600 hover:text-alpha"
                  }`}
                >
                  {m.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
