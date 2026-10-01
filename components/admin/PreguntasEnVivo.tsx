"use client";

import { useState } from "react";
import type { Id, PreguntaRow } from "@/types/admin";

type Props = {
  preguntas: PreguntaRow[];
  /** Ids de las preguntas pendientes al empezar, en el orden en que se van a mostrar. */
  cola: Id[];
  onResponder: (id: Id) => Promise<void>;
  onSalir: () => void;
};

/** Primera pregunta pendiente después de `desde`; si no hay, da la vuelta; -1 si no queda ninguna. */
function siguiente(cola: Id[], pendientes: Set<string>, desde: number): number {
  for (let i = desde + 1; i < cola.length; i++) if (pendientes.has(String(cola[i]))) return i;
  for (let i = 0; i <= desde && i < cola.length; i++) if (pendientes.has(String(cola[i]))) return i;
  return -1;
}

const botonBlanco =
  "rounded-2xl px-6 py-4 text-lg font-extrabold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 disabled:opacity-50 sm:text-xl";

/** Pantalla roja a pantalla completa: una pregunta pendiente a la vez. */
export default function PreguntasEnVivo({ preguntas, cola, onResponder, onSalir }: Props) {
  const porId = new Map(preguntas.map((p) => [String(p.id), p]));
  const pendientes = new Set(preguntas.filter((p) => !p.respondida).map((p) => String(p.id)));
  const [pos, setPos] = useState(() => siguiente(cola, pendientes, -1));
  const [error, setError] = useState<string | null>(null);

  const actual = pos >= 0 ? porId.get(String(cola[pos])) : undefined;
  const hayActual = actual && !actual.respondida;

  const responder = () => {
    if (!actual) return;
    setError(null);
    const restantes = new Set(pendientes);
    restantes.delete(String(actual.id));
    const numero = pos + 1;
    setPos(siguiente(cola, restantes, pos));
    // La pregunta se marca al instante; si falla vuelve a aparecer más adelante.
    onResponder(actual.id).catch(() => setError(`No se pudo marcar la pregunta ${numero} como respondida. Volverá a aparecer.`));
  };

  const saltar = () => {
    if (!actual) return;
    setError(null);
    setPos(siguiente(cola, pendientes, pos));
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Modo en vivo" className="fixed inset-0 z-[60] !m-0 flex flex-col bg-alpha text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-base font-bold text-white/90 sm:text-lg" aria-live="polite">
          {hayActual ? `${pos + 1} de ${cola.length}` : "Sin pendientes"}
        </p>
        <button
          type="button"
          onClick={onSalir}
          className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Salir
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4 text-center">
        {hayActual ? (
          <>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-white/80 sm:text-base">Episodio {actual.episodio}</p>
            <p className="max-w-5xl whitespace-pre-wrap break-words text-[clamp(1.5rem,4.5vw,4rem)] font-extrabold leading-tight">{actual.pregunta}</p>
            <p className="mt-8 text-lg font-semibold text-white/90 sm:text-2xl">{actual.nombre?.trim() || "Anónimo"}</p>
          </>
        ) : (
          <p className="text-3xl font-extrabold sm:text-5xl">Ya no hay preguntas pendientes</p>
        )}
      </div>

      {error && (
        <p role="alert" className="mx-4 mb-2 rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-alpha-dark">
          {error}
        </p>
      )}

      {hayActual && (
        <div className="grid gap-3 px-4 pb-6 sm:grid-cols-2 sm:px-8">
          <button type="button" onClick={saltar} className={`${botonBlanco} border-2 border-white text-white hover:bg-white/10`}>
            Saltar
          </button>
          <button type="button" onClick={responder} className={`${botonBlanco} bg-white text-alpha hover:bg-alpha-soft`}>
            Respondida, siguiente
          </button>
        </div>
      )}
    </div>
  );
}
