"use client";

import { useMemo, useState } from "react";
import Cargando from "./Cargando";
import Modal from "./Modal";
import PreguntasEnVivo from "./PreguntasEnVivo";
import SinAcceso, { botonBorde, botonRojo } from "./SinAcceso";
import { useCarga } from "./useCarga";
import { borrarPregunta, guardarRespondida, leerPreguntas } from "@/lib/admin/queries";
import type { Id, PreguntaRow } from "@/types/admin";

type Estado = "pendientes" | "respondidas" | "todas";

const ESTADOS: { valor: Estado; etiqueta: string }[] = [
  { valor: "pendientes", etiqueta: "Pendientes" },
  { valor: "respondidas", etiqueta: "Respondidas" },
  { valor: "todas", etiqueta: "Todas" },
];

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const campoSelect =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus-visible:border-alpha focus-visible:ring-2 focus-visible:ring-alpha";

export default function PreguntasAdmin() {
  const { datos, setDatos, cargando, error, recargar } = useCarga<PreguntaRow[]>(leerPreguntas);
  const [episodio, setEpisodio] = useState<"todos" | number>("todos");
  const [estado, setEstado] = useState<Estado>("pendientes");
  const [pendientes, setPendientes] = useState<Set<string>>(new Set());
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<PreguntaRow | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cola, setCola] = useState<Id[] | null>(null);

  const preguntas = useMemo(() => datos ?? [], [datos]);
  const delEpisodio = useMemo(() => preguntas.filter((p) => episodio === "todos" || p.episodio === episodio), [preguntas, episodio]);
  const cuentaPend = delEpisodio.filter((p) => !p.respondida).length;
  const visibles = useMemo(
    () =>
      delEpisodio
        .filter((p) => estado === "todas" || (estado === "pendientes" ? !p.respondida : p.respondida))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [delEpisodio, estado],
  );

  if (cargando) return <Cargando />;
  if (error || !datos) return <SinAcceso titulo="No se pudieron cargar las preguntas" detalle="Revisa tu conexión e inténtalo de nuevo." onReintentar={recargar} mostrarSalir={false} />;

  /** Marca o desmarca como respondida con actualización optimista; si falla, revierte y lanza el error. */
  const marcar = async (p: PreguntaRow, respondida: boolean) => {
    const aplicar = (r: boolean, en: string | null) =>
      setDatos((d) => (d ? d.map((x) => (String(x.id) === String(p.id) ? { ...x, respondida: r, respondida_at: en } : x)) : d));
    aplicar(respondida, respondida ? new Date().toISOString() : null);
    try {
      aplicar(respondida, await guardarRespondida(p.id, respondida));
    } catch (err) {
      console.error("Error al actualizar la pregunta:", err);
      aplicar(p.respondida, p.respondida_at);
      throw err;
    }
  };

  const alternar = async (p: PreguntaRow) => {
    const clave = String(p.id);
    if (pendientes.has(clave)) return;
    setErrorGuardar(null);
    setPendientes((s) => new Set(s).add(clave));
    try {
      await marcar(p, !p.respondida);
    } catch {
      setErrorGuardar("No se pudo guardar el cambio, intenta de nuevo");
    } finally {
      setPendientes((s) => {
        const n = new Set(s);
        n.delete(clave);
        return n;
      });
    }
  };

  const eliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorGuardar(null);
    try {
      await borrarPregunta(aEliminar.id);
      setDatos((d) => (d ? d.filter((x) => String(x.id) !== String(aEliminar.id)) : d));
    } catch (err) {
      console.error("Error al eliminar la pregunta:", err);
      setErrorGuardar("No se pudo eliminar la pregunta, intenta de nuevo");
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  const iniciarEnVivo = () => {
    // Las pendientes del episodio elegido, de la más antigua a la más nueva.
    const ids = delEpisodio
      .filter((p) => !p.respondida)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((p) => p.id);
    if (ids.length === 0) return;
    void document.documentElement.requestFullscreen?.().catch(() => {});
    setCola(ids);
  };

  const salirEnVivo = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    setCola(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-neutral-900">Preguntas</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="filtro-episodio" className="mb-1.5 block text-sm font-semibold text-neutral-800">
            Episodio
          </label>
          <select
            id="filtro-episodio"
            value={episodio}
            onChange={(e) => setEpisodio(e.target.value === "todos" ? "todos" : Number(e.target.value))}
            className={campoSelect}
          >
            <option value="todos">Todos los episodios</option>
            {Array.from({ length: 13 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Episodio {i + 1}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="mb-1.5 block text-sm font-semibold text-neutral-800">Estado</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Estado">
            {ESTADOS.map((e) => (
              <button
                key={e.valor}
                type="button"
                role="radio"
                aria-checked={estado === e.valor}
                onClick={() => setEstado(e.valor)}
                className={`rounded-xl border-2 px-2 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2 ${
                  estado === e.valor ? "border-alpha bg-alpha text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-alpha"
                }`}
              >
                {e.etiqueta}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button type="button" onClick={iniciarEnVivo} disabled={cuentaPend === 0} className={botonRojo}>
        Modo en vivo ({cuentaPend} {cuentaPend === 1 ? "pendiente" : "pendientes"})
      </button>

      {errorGuardar && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {errorGuardar}
        </p>
      )}

      {visibles.length === 0 ? (
        <p className="py-8 text-center text-neutral-600">
          {estado === "pendientes" ? "No hay preguntas pendientes." : estado === "respondidas" ? "Todavía no hay preguntas respondidas." : "Todavía no hay preguntas."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((p) => (
            <li key={String(p.id)} className={`rounded-2xl border bg-white p-4 shadow-sm ${p.respondida ? "border-neutral-200" : "border-alpha"}`}>
              <p className="whitespace-pre-wrap break-words text-base font-semibold text-neutral-900">{p.pregunta}</p>
              <p className="mt-2 text-sm text-neutral-600">
                <strong>{p.nombre?.trim() || "Anónimo"}</strong> · Episodio {p.episodio} · {fechaHora(p.created_at)}
                {p.respondida && <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-bold text-neutral-700">Respondida</span>}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => void alternar(p)} disabled={pendientes.has(String(p.id))} className={`${p.respondida ? botonBorde : botonRojo} !py-2.5 !text-sm`}>
                  {p.respondida ? "Regresar a pendiente" : "Marcar respondida"}
                </button>
                <button type="button" onClick={() => setAEliminar(p)} className={`${botonBorde} !py-2.5 !text-sm`}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aEliminar && (
        <Modal titulo="Eliminar pregunta" onClose={() => !eliminando && setAEliminar(null)}>
          <p className="text-neutral-700">Se va a eliminar esta pregunta de forma permanente:</p>
          <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-800">{aEliminar.pregunta}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setAEliminar(null)} disabled={eliminando} className={botonBorde}>
              Cancelar
            </button>
            <button type="button" onClick={() => void eliminar()} disabled={eliminando} className={botonRojo}>
              {eliminando ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </Modal>
      )}

      {cola && (
        <PreguntasEnVivo
          preguntas={preguntas}
          cola={cola}
          onResponder={(id) => {
            const p = preguntas.find((x) => String(x.id) === String(id));
            return p ? marcar(p, true) : Promise.resolve();
          }}
          onSalir={salirEnVivo}
        />
      )}
    </div>
  );
}
