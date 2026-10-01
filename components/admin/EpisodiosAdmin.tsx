"use client";

import { useMemo, useState } from "react";
import Cargando from "./Cargando";
import Interruptor from "./Interruptor";
import SinAcceso from "./SinAcceso";
import { useCarga } from "./useCarga";
import { guardarEstadoEpisodio, leerEpisodiosEstado, leerPreguntas } from "@/lib/admin/queries";
import type { EpisodioEstadoRow, PreguntaRow } from "@/types/admin";

type Props = { titulos: { episodio: number; titulo: string }[] };

const leerTodo = () => Promise.all([leerEpisodiosEstado(), leerPreguntas()]);

export default function EpisodiosAdmin({ titulos }: Props) {
  const { datos, setDatos, cargando, error, recargar } = useCarga<[EpisodioEstadoRow[], PreguntaRow[]]>(leerTodo);
  const [pendientes, setPendientes] = useState<Set<number>>(new Set());
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const estados = useMemo(() => new Map((datos?.[0] ?? []).map((e) => [e.episodio, e])), [datos]);
  const preguntasPor = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of datos?.[1] ?? []) m.set(p.episodio, (m.get(p.episodio) ?? 0) + 1);
    return m;
  }, [datos]);

  if (cargando) return <Cargando />;
  if (error || !datos) return <SinAcceso titulo="No se pudieron cargar los episodios" detalle="Revisa tu conexión e inténtalo de nuevo." onReintentar={recargar} mostrarSalir={false} />;

  const cambiar = async (episodio: number, desbloqueado: boolean) => {
    setErrorGuardar(null);
    setPendientes((p) => new Set(p).add(episodio));
    const previo = estados.get(episodio);
    const actualizar = (fila: EpisodioEstadoRow) =>
      setDatos((d) => (d ? [[...d[0].filter((e) => e.episodio !== episodio), fila].sort((a, b) => a.episodio - b.episodio), d[1]] : d));
    actualizar({ episodio, desbloqueado, desbloqueado_at: desbloqueado ? new Date().toISOString() : null });
    try {
      actualizar(await guardarEstadoEpisodio(episodio, desbloqueado));
    } catch (err) {
      console.error("Error al cambiar el estado del episodio:", err);
      actualizar(previo ?? { episodio, desbloqueado: !desbloqueado, desbloqueado_at: null });
      setErrorGuardar("No se pudo guardar el cambio, intenta de nuevo");
    } finally {
      setPendientes((p) => {
        const n = new Set(p);
        n.delete(episodio);
        return n;
      });
    }
  };

  const abiertos = titulos.filter((t) => estados.get(t.episodio)?.desbloqueado).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Episodios</h1>
        <p className="mt-1 text-neutral-600">
          {abiertos} de {titulos.length} desbloqueados para los participantes.
        </p>
      </div>

      {errorGuardar && (
        <p role="alert" className="rounded-xl bg-alpha-soft px-4 py-3 text-sm font-medium text-alpha-dark">
          {errorGuardar}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {titulos.map((t) => {
          const abierto = estados.get(t.episodio)?.desbloqueado === true;
          const preguntas = preguntasPor.get(t.episodio) ?? 0;
          return (
            <li key={t.episodio} className={`rounded-2xl border bg-white p-4 shadow-sm ${abierto ? "border-alpha" : "border-neutral-200"}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${abierto ? "bg-alpha text-white" : "bg-neutral-200 text-neutral-600"}`}>
                  {t.episodio}
                </span>
                <h2 className="text-lg font-extrabold text-neutral-900">{t.titulo}</h2>
              </div>
              <div className="mt-4">
                <Interruptor
                  nombre={`Episodio ${t.episodio}: ${t.titulo}`}
                  activo={abierto}
                  onChange={(v) => void cambiar(t.episodio, v)}
                  deshabilitado={pendientes.has(t.episodio)}
                  etiquetaActivo="Desbloqueado"
                  etiquetaInactivo="Bloqueado"
                />
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                {preguntas === 1 ? "1 pregunta recibida" : `${preguntas} preguntas recibidas`}
              </p>
              <a
                href={`/participantes/${t.episodio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg border-2 border-alpha px-3 py-2 text-sm font-bold text-alpha transition hover:bg-alpha-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
              >
                Ver como participante
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
