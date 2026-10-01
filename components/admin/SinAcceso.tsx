"use client";

import { getSupabase } from "@/lib/supabase";

type Props = { titulo?: string; detalle: string; onReintentar?: () => void; mostrarSalir?: boolean };

export default function SinAcceso({ titulo = "No tienes acceso", detalle, onReintentar, mostrarSalir = true }: Props) {
  return (
    <div className="mx-auto max-w-md py-12 text-center" role="alert">
      <p className="text-5xl" aria-hidden="true">
        🔒
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">{titulo}</h1>
      <p className="mt-2 text-neutral-600">{detalle}</p>
      <div className="mt-6 flex flex-col gap-3">
        {onReintentar && (
          <button type="button" onClick={onReintentar} className={botonRojo}>
            Reintentar
          </button>
        )}
        {mostrarSalir && (
          <button type="button" onClick={() => void getSupabase().auth.signOut()} className={botonBorde}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2";
export const botonRojo = `w-full rounded-xl bg-alpha px-4 py-3 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark disabled:cursor-not-allowed disabled:opacity-60 ${foco}`;
export const botonBorde = `w-full rounded-xl border-2 border-alpha px-4 py-3 text-base font-bold text-alpha transition hover:bg-alpha-soft disabled:cursor-not-allowed disabled:opacity-60 ${foco}`;
