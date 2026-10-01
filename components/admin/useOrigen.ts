"use client";

import { useEffect, useState } from "react";

/** window.location.origin (null mientras se hidrata), para que los links funcionen en cualquier dominio. */
export function useOrigen(): string | null {
  const [origen, setOrigen] = useState<string | null>(null);
  useEffect(() => setOrigen(window.location.origin), []);
  return origen;
}
