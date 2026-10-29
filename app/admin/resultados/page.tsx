"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import Dona, { Leyenda, segmentosValoracion } from "@/components/admin/Dona";
import CalificacionChart from "@/components/admin/CalificacionChart";
import { SESIONES } from "@/lib/sesiones";
import { PREGUNTAS_EVALUACION } from "@/lib/admin/preguntas";
import {
  asistentesPorSesion,
  calificacion,
  conteoGeneral,
  conteoPregunta,
  conteoVolvera,
  evaluacionesPorSesion,
  fechaSesion,
  nivel,
  pct,
} from "@/lib/admin/stats";

export default function ResultadosPage() {
  const { evaluaciones, asistencias } = useAdminData();

  const filas = useMemo(() => {
    const asistentes = asistentesPorSesion(asistencias);
    return evaluacionesPorSesion(evaluaciones).map((evals, i) => {
      const n = evals.length;
      const general = conteoGeneral(evals);
      return {
        sesion: SESIONES[i],
        n,
        asistentes: asistentes[i],
        fecha: fechaSesion(evals),
        general,
        cal: calificacion(general),
        porPregunta: PREGUNTAS_EVALUACION.map((p) => calificacion(conteoPregunta(evals, p.campo))),
        volvera: n ? pct(conteoVolvera(evals).si, n) : null,
      };
    });
  }, [evaluaciones, asistencias]);

  const conDatos = filas.filter((f) => f.n > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Resultados</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Calificación de 0 a 100: Mal vale 0, Bien vale 50 y Súper vale 100. Arriba de 80 es excelente.
        </p>
      </div>

      {conDatos.length === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-600">Todavía no hay evaluaciones.</p>
      ) : (
        <>
          {/* Tarjetas con dona por sesión */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conDatos.map((f) => {
              const nv = nivel(f.cal);
              return (
                <Link
                  key={f.sesion.numero}
                  href={`/admin/resultados/${f.sesion.numero}`}
                  className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-alpha hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-extrabold text-neutral-900">{f.sesion.titulo}</p>
                      {f.fecha && <p className="text-sm capitalize text-neutral-500">{f.fecha}</p>}
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: nv.fondo, color: nv.texto }}>
                      {nv.etiqueta}
                    </span>
                  </div>
                  <div className="my-3 flex justify-center">
                    <Dona segmentos={segmentosValoracion(f.general)} centro={String(f.cal ?? "-")} subcentro="de 100" titulo={f.sesion.titulo} />
                  </div>
                  <Leyenda segmentos={segmentosValoracion(f.general)} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-neutral-50 p-2">
                      <p className="text-xl font-extrabold text-neutral-900">
                        {f.n}
                        {f.asistentes > 0 && <span className="text-sm font-semibold text-neutral-500">/{f.asistentes}</span>}
                      </p>
                      <p className="text-xs text-neutral-500">contestaron</p>
                    </div>
                    <div className="rounded-xl bg-alpha-soft p-2">
                      <p className="text-xl font-extrabold text-alpha">{f.volvera}%</p>
                      <p className="text-xs text-neutral-600">volverá</p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-alpha group-hover:underline">Ver detalle →</p>
                </Link>
              );
            })}
          </section>

          {/* Mapa de calor */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-neutral-900">¿Qué salió mejor y peor?</h2>
            <p className="mb-3 text-sm text-neutral-600">Calificación de cada aspecto por sesión. Los cuadros grises son lo que hay que mejorar.</p>
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[620px] border-separate border-spacing-1 text-center text-sm">
                <thead>
                  <tr className="text-neutral-600">
                    <th scope="col" className="px-2 py-1 text-left font-bold">Sesión</th>
                    {PREGUNTAS_EVALUACION.map((p) => (
                      <th key={p.campo} scope="col" className="px-2 py-1 font-bold">
                        {p.etiqueta}
                      </th>
                    ))}
                    <th scope="col" className="px-2 py-1 font-bold">General</th>
                  </tr>
                </thead>
                <tbody>
                  {conDatos.map((f) => (
                    <tr key={f.sesion.numero}>
                      <th scope="row" className="whitespace-nowrap px-2 py-1 text-left">
                        <Link href={`/admin/resultados/${f.sesion.numero}`} className="font-semibold text-alpha underline">
                          {f.sesion.titulo}
                        </Link>
                        {f.fecha && <span className="block text-xs font-normal capitalize text-neutral-500">{f.fecha}</span>}
                      </th>
                      {[...f.porPregunta, f.cal].map((c, i) => {
                        const nv = nivel(c);
                        return (
                          <td
                            key={i}
                            className={`rounded-lg px-2 py-2.5 font-extrabold ${i === f.porPregunta.length ? "ring-2 ring-neutral-900/10" : ""}`}
                            style={{ backgroundColor: nv.fondo, color: nv.texto }}
                          >
                            {c ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
              {[nivel(90), nivel(70), nivel(40)].map((n) => (
                <li key={n.etiqueta} className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: n.fondo }} aria-hidden="true" />
                  {n.etiqueta === "Excelente" ? "Excelente (80 a 100)" : n.etiqueta === "Bien" ? "Bien (65 a 79)" : "A mejorar (menos de 65)"}
                </li>
              ))}
            </ul>
          </section>

          {/* Evolución */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-extrabold text-neutral-900">Cómo vamos sesión a sesión</h2>
            <CalificacionChart datos={filas.map((f) => ({ sesion: `S${f.sesion.numero}`, calificacion: f.cal, volvera: f.volvera }))} />
          </section>
        </>
      )}
    </div>
  );
}
