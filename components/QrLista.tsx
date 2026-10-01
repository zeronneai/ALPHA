"use client";

import { useEffect, useState } from "react";
import QrCard from "./QrCard";
import { SESIONES } from "@/lib/sesiones";

export default function QrLista() {
  const [origen, setOrigen] = useState<string | null>(null);

  useEffect(() => setOrigen(window.location.origin), []);

  if (!origen) return <div className="h-40" aria-busy="true" />;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {SESIONES.map((s) => (
        <QrCard key={s.numero} numero={s.numero} titulo={s.titulo} url={`${origen}/evaluacion/${s.numero}`} />
      ))}
    </ul>
  );
}
