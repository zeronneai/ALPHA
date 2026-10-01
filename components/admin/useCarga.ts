"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

type Carga<T> = {
  datos: T | null;
  setDatos: Dispatch<SetStateAction<T | null>>;
  cargando: boolean;
  error: boolean;
  recargar: () => void;
};

/** Carga datos una vez al montar (y a pedido) con el cliente de Supabase del navegador. */
export function useCarga<T>(leer: () => Promise<T>): Carga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const recargar = useCallback(() => {
    setCargando(true);
    setError(false);
    leer()
      .then(setDatos)
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        setError(true);
      })
      .finally(() => setCargando(false));
    // `leer` es una función estable del módulo de consultas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, setDatos, cargando, error, recargar };
}
