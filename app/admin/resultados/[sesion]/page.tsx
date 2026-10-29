"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import SesionInvalida from "@/components/admin/SesionInvalida";
import Dona, { Leyenda, segmentosValoracion } from "@/components/admin/Dona";
import { ULTIMA_SESION, getSesion, type Sesion } from "@/lib/sesiones";
import { fechaCorta } from "@/lib/admin/formato";
import { calificacion, conteoGeneral, conteoVolvera, fechaSesion, nivel, pct, resumenPreguntas } from "@/lib/admin/stats";

export default function ResultadosSesionPage() {
  const { sesion: valor } = useParams<{ sesion: string }>();
  const sesion = getSesion(valor);
  if (!sesion) return <SesionInvalida volverA="/admin/resultados" />;
  return <ResultadosSesion sesion={sesion} />;
}

function ResultadosSesion({ sesion }: { sesion: Sesion }) {
  const { evaluaciones, asistencias } = useAdminData();

  const datos = useMemo(() => {
    const evals = evaluaciones.filter((e) => e.sesion === sesion.numero);
    return {
      total: evals.length,
      asistentes: asistencias.filter((a) => a.sesion === sesion.numero).length,
      preguntas: resumenPreguntas(evals),
      volvera: conteoVolvera(evals),
      general: conteoGeneral(evals),
      fecha: fechaSesion(evals),
      comentarios: evals
        .filter((e) => e.comentario && e.comentario.trim())
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  }, [evaluaciones, asistencias, sesion.numero]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/resultados" className="text-sm font-semibold text-alpha hover:underline">
          ← Todas las sesiones
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-neutral-900">Resultados · {sesion.titulo}</h1>
        {datos.fecha && <p className="text-sm capitalize text-neutral-500">{datos.fecha}</p>}
      </div>

      {datos.total === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-600">Todavía no hay evaluaciones de esta sesión</p>
      ) : (
        <>
          {/* Resumen general */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="mb-2 font-bold text-neutral-900">Calificación general</p>
              <Dona segmentos={segmentosValoracion(datos.general)} centro={String(calificacion(datos.general) ?? "-")} subcentro="de 100" tamano={170} titulo="Calificación general" />
              <span
                className="mt-2 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ backgroundColor: nivel(calificacion(datos.general)).fondo, color: nivel(calificacion(datos.general)).texto }}
              >
                {nivel(calificacion(datos.general)).etiqueta}
              </span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="mb-2 font-bold text-neutral-900">{sesion.numero === ULTIMA_SESION ? "¿Seguirán en Alpha?" : "¿Volverán?"}</p>
              <Dona
                segmentos={[
                  { etiqueta: "Sí", valor: datos.volvera.si, color: "#D7141A" },
                  { etiqueta: "No", valor: datos.volvera.no, color: "#404040" },
                ]}
                centro={`${pct(datos.volvera.si, datos.total)}%`}
                subcentro="dice que sí"
                tamano={170}
                titulo="Volverán"
              />
              <p className="mt-2 text-sm text-neutral-600">
                Sí <strong>{datos.volvera.si}</strong> · No <strong>{datos.volvera.no}</strong>
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <p className="font-bold text-neutral-900">Participación</p>
              <p className="mt-2 text-5xl font-extrabold text-alpha">{datos.total}</p>
              <p className="text-sm text-neutral-600">{datos.asistentes > 0 ? `de ${datos.asistentes} asistentes contestaron` : "respuestas"}</p>
              {datos.asistentes > 0 && <p className="mt-1 text-sm font-semibold text-neutral-900">{pct(datos.total, datos.asistentes)}%</p>}
            </div>
          </section>

          {/* Dona por pregunta */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-neutral-900">Por aspecto</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
              {datos.preguntas.map((p) => {
                const cal = calificacion(p.conteo);
                const nv = nivel(cal);
                return (
                  <div key={p.campo} className="flex flex-col items-center gap-2">
                    <p className="text-center text-sm font-bold text-neutral-900">{p.etiqueta}</p>
                    <Dona segmentos={segmentosValoracion(p.conteo)} centro={String(cal ?? "-")} tamano={120} titulo={p.etiqueta} />
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: nv.fondo, color: nv.texto }}>
                      {nv.etiqueta}
                    </span>
                    <Leyenda segmentos={segmentosValoracion(p.conteo)} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-extrabold text-neutral-900">Comentarios ({datos.comentarios.length})</h2>
            {datos.comentarios.length === 0 ? (
              <p className="text-neutral-600">Nadie dejó comentarios.</p>
            ) : (
              <ul className="space-y-3">
                {datos.comentarios.map((c) => (
                  <li key={String(c.id)} className="rounded-xl bg-neutral-50 p-3">
                    <p className="whitespace-pre-wrap break-words text-neutral-900">{c.comentario}</p>
                    <p className="mt-1 text-xs text-neutral-500">{fechaCorta(c.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
