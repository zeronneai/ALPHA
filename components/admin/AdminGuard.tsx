"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminShell from "./AdminShell";
import AdminDataProvider from "./AdminDataProvider";
import Cargando from "./Cargando";
import { getSupabase } from "@/lib/supabase";

type Sesion = "cargando" | "sin_sesion" | "con_sesion";

/** Verifica la sesión de Supabase Auth; la seguridad real de los datos la da RLS. */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const esLogin = usePathname() === "/admin/login";
  const [sesion, setSesion] = useState<Sesion>("cargando");

  useEffect(() => {
    try {
      const supabase = getSupabase();
      void supabase.auth.getSession().then(({ data }) => setSesion(data.session ? "con_sesion" : "sin_sesion"));
      const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s ? "con_sesion" : "sin_sesion"));
      return () => data.subscription.unsubscribe();
    } catch (err) {
      console.error(err);
      setSesion("sin_sesion");
    }
  }, []);

  useEffect(() => {
    if (sesion === "sin_sesion" && !esLogin) router.replace("/admin/login");
    if (sesion === "con_sesion" && esLogin) router.replace("/admin");
  }, [sesion, esLogin, router]);

  if (esLogin) return <>{sesion === "con_sesion" ? <Cargando /> : children}</>;
  if (sesion !== "con_sesion") return <Cargando />;

  return (
    <AdminShell>
      <AdminDataProvider>{children}</AdminDataProvider>
    </AdminShell>
  );
}
