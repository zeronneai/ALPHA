"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";

export default function EntrarForm() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || enviando) return;
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/participantes/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      if (res.ok) {
        router.replace("/participantes");
        router.refresh();
        return;
      }
      setError(res.status === 401 ? "Código incorrecto, pídelo a tu líder" : "Hubo un problema, intenta de nuevo");
    } catch (err) {
      console.error("Error al entrar al portal:", err);
      setError("Hubo un problema, intenta de nuevo");
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField
        label="Código de acceso"
        name="codigo"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        error={error ?? undefined}
      />
      <button
        type="submit"
        disabled={enviando || !codigo.trim()}
        className="flex w-full items-center justify-center rounded-xl bg-alpha px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
