"use client";

import { useState } from "react";

const MAX = 500;

const campo =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus-visible:border-alpha focus-visible:ring-2 focus-visible:ring-alpha";

export default function PreguntaForm({ episodio }: { episodio: number }) {
  const [pregunta, setPregunta] = useState("");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valida = pregunta.trim().length >= 3;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valida || enviando) return;
    setError(null);
    setEnviada(false);
    setEnviando(true);
    try {
      const res = await fetch("/api/participantes/preguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodio, pregunta, nombre }),
      });
      if (res.ok) {
        setEnviada(true);
        setPregunta("");
        return;
      }
      const cuerpo = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(res.status === 429 || res.status === 400 ? (cuerpo?.error ?? "Hubo un problema, intenta de nuevo") : "Hubo un problema, intenta de nuevo");
    } catch (err) {
      console.error("Error al enviar la pregunta:", err);
      setError("Hubo un problema, intenta de nuevo");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="pregunta" className="mb-1.5 block text-sm font-semibold text-neutral-800">
          Tu pregunta
        </label>
        <textarea
          id="pregunta"
          rows={4}
          maxLength={MAX}
          value={pregunta}
          onChange={(e) => {
            setPregunta(e.target.value);
            setEnviada(false);
          }}
          placeholder="Escribe aquí lo que quieras preguntar"
          className={campo}
        />
        <p className="mt-1 text-right text-xs text-neutral-500" aria-live="polite">
          {pregunta.length}/{MAX}
        </p>
      </div>
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-semibold text-neutral-800">
          Tu nombre (opcional)
        </label>
        <input id="nombre" type="text" maxLength={80} autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {error}
        </p>
      )}
      {enviada && (
        <p role="status" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-semibold text-alpha-dark">
          ¡Gracias! Tu pregunta se responderá en la siguiente sesión
        </p>
      )}

      <button
        type="submit"
        disabled={!valida || enviando}
        className="flex w-full items-center justify-center rounded-xl bg-alpha px-4 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar pregunta"}
      </button>
    </form>
  );
}
