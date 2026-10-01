"use client";

import { useEffect, useState } from "react";
import OpcionesField from "./OpcionesField";
import { submitEvaluacion } from "@/lib/submitEvaluacion";
import { ULTIMA_SESION } from "@/lib/sesiones";
import type { Valoracion } from "@/types/evaluacion";

const VALORACIONES = [
  { valor: "mal", emoji: "😕", texto: "Mal" },
  { valor: "bien", emoji: "🙂", texto: "Bien" },
  { valor: "super", emoji: "🤩", texto: "Súper" },
] as const;

const SI_NO = [
  { valor: "si", emoji: "👍", texto: "Sí" },
  { valor: "no", emoji: "👎", texto: "No" },
] as const;

const PREGUNTAS = [
  { campo: "bienvenida", texto: "¿Cómo te sentiste con la bienvenida?" },
  { campo: "comida", texto: "¿Qué te pareció la comida?" },
  { campo: "tema", texto: "¿Qué te pareció el tema de hoy?" },
  { campo: "grupo_mesa", texto: "¿Cómo te sentiste con tu grupo de mesa?" },
  { campo: "ambiente", texto: "¿Qué te pareció el ambiente y el lugar?" },
] as const;

type Campo = (typeof PREGUNTAS)[number]["campo"];
type Respuestas = Record<Campo, Valoracion | null>;

const respuestasVacias: Respuestas = { bienvenida: null, comida: null, tema: null, grupo_mesa: null, ambiente: null };

const storageKey = (sesion: number) => `alpha_eval_sesion_${sesion}`;

function yaContestada(sesion: number): boolean {
  try {
    return localStorage.getItem(storageKey(sesion)) === "true";
  } catch {
    return false;
  }
}

function marcarContestada(sesion: number) {
  try {
    localStorage.setItem(storageKey(sesion), "true");
  } catch {
    /* sin almacenamiento disponible: se ignora */
  }
}

type Estado = "cargando" | "formulario" | "ya_contestada" | "exito";

export default function EvaluacionForm({ sesion, titulo }: { sesion: number; titulo: string }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [respuestas, setRespuestas] = useState<Respuestas>(respuestasVacias);
  const [volvera, setVolvera] = useState<"si" | "no" | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esUltima = sesion === ULTIMA_SESION;

  useEffect(() => {
    setEstado(yaContestada(sesion) ? "ya_contestada" : "formulario");
  }, [sesion]);

  const completo = PREGUNTAS.every((p) => respuestas[p.campo] !== null) && volvera !== null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo || enviando) return;
    setError(null);
    setEnviando(true);
    try {
      await submitEvaluacion({
        sesion,
        bienvenida: respuestas.bienvenida!,
        comida: respuestas.comida!,
        tema: respuestas.tema!,
        grupo_mesa: respuestas.grupo_mesa!,
        ambiente: respuestas.ambiente!,
        volvera: volvera === "si",
        comentario: comentario.trim() || null,
      });
      marcarContestada(sesion);
      setEstado("exito");
    } catch (err) {
      console.error("Error al enviar la evaluación:", err);
      setError("Hubo un problema, intenta de nuevo");
    } finally {
      setEnviando(false);
    }
  };

  if (estado === "cargando") return <div className="h-64" aria-busy="true" />;

  if (estado === "ya_contestada") {
    return (
      <div className="py-6 text-center" role="status">
        <p className="text-4xl" aria-hidden="true">
          ✅
        </p>
        <h2 className="mt-4 text-xl font-extrabold text-neutral-900">
          Ya contestaste la evaluación de esta sesión, ¡gracias!
        </h2>
      </div>
    );
  }

  if (estado === "exito") {
    return (
      <div className="py-6 text-center" role="status">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-alpha-soft">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-alpha" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-neutral-900">
          {esUltima ? "¡Gracias por ser parte de Alpha!" : "¡Gracias! Nos vemos la próxima sesión"}
        </h2>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <p className="text-center text-sm text-neutral-600">{titulo} · Tus respuestas son anónimas</p>

      {PREGUNTAS.map((p, i) => (
        <OpcionesField
          key={p.campo}
          nombre={p.campo}
          pregunta={`${i + 1}. ${p.texto}`}
          opciones={VALORACIONES}
          valor={respuestas[p.campo]}
          onChange={(v) => setRespuestas((r) => ({ ...r, [p.campo]: v }))}
        />
      ))}

      <OpcionesField
        nombre="volvera"
        pregunta={`6. ${esUltima ? "¿Te gustaría seguir participando en Alpha?" : "¿Volverás la siguiente sesión?"}`}
        opciones={SI_NO}
        valor={volvera}
        onChange={setVolvera}
      />

      <div>
        <label htmlFor="comentario" className="mb-2 block text-base font-bold text-neutral-900">
          7. ¿Algo que quieras decirnos? <span className="font-normal text-neutral-500">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          rows={4}
          maxLength={1000}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe aquí tu comentario"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus-visible:border-alpha focus-visible:ring-2 focus-visible:ring-alpha"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!completo || enviando}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-alpha px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando && (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-30" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {enviando ? "Enviando..." : "Enviar evaluación"}
      </button>
    </form>
  );
}
