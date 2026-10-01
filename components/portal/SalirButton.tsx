"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SalirButton() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  const salir = async () => {
    setSaliendo(true);
    try {
      await fetch("/api/participantes/logout", { method: "POST" });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    router.replace("/participantes/entrar");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void salir()}
      disabled={saliendo}
      className="rounded-lg border border-white/70 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:text-alpha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
    >
      {saliendo ? "Saliendo..." : "Salir"}
    </button>
  );
}
