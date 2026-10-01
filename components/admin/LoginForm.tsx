"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import { botonRojo } from "./SinAcceso";
import { getSupabase } from "@/lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithPassword({ email: correo.trim(), password: contrasena });
      if (err) {
        console.error("Error al iniciar sesión:", err);
        setError(err.status === 400 ? "Correo o contraseña incorrectos" : "Hubo un problema, intenta de nuevo");
        return;
      }
      router.replace("/admin");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Hubo un problema, intenta de nuevo");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="Correo" name="correo" type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
      <FormField label="Contraseña" name="contrasena" type="password" autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
      {error && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}
      <button type="submit" disabled={enviando || !correo || !contrasena} className={botonRojo}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
