"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import VolveranChart from "@/components/admin/VolveranChart";
import { SESIONES } from "@/lib/sesiones";
import { PREGUNTAS_EVALUACION } from "@/lib/admin/preguntas";
import { conteoPregunta, conteoVolvera, evaluacionesPorSesion, pct } from "@/lib/admin/stats";

export default function ResultadosPage() {
  const { evaluaciones } = useAdminData();

  const filas = useMemo(
    () =>
      evaluacionesPorSesion(evaluaciones).map((evals, i) => {
        const n = evals.length;
        const v = conteoVolvera(evals);
        return {
          sesion: SESIONES[i],
          n,
          supers: PREGUNTAS_EVALUACION.map((p) => (n ? pct(conteoPregunta(evals, p.campo).super, n) : null)),
          volvera: n ? pct(v.si, n) : null,
        };
      }),
    [evaluaciones],
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-neutral-900">Resultados</h1>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-neutral-900">Comparativa de sesiones</h2>
        <p className="mb-3 text-sm text-neutral-600">Porcentaje de respuestas «Súper» en cada pregunta.</p>
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-alpha-soft text-alpha-dark">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-bold">Sesión</th>
                <th scope="col" className="px-3 py-2.5 font-bold">Respuestas</th>
                {PREGUNTAS_EVALUACION.map((p) => (
                  <th key={p.campo} scope="col" className="px-3 py-2.5 font-bold">
                    {p.corta}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5 font-bold">Volverán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filas.map((f) => (
                <tr key={f.sesion.numero}>
                  <th scope="row" className="whitespace-nowrap px-3 py-2.5 font-semibold">
                    <Link href={`/admin/resultados/${f.sesion.numero}`} className="text-alpha underline">
                      {f.sesion.titulo}
                    </Link>
                  </th>
                  <td className="px-3 py-2.5">{f.n}</td>
                  {f.supers.map((s, i) => (
                    <td key={i} className="px-3 py-2.5">
                      {s === null ? "—" : `${s}%`}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 font-bold text-alpha">{f.volvera === null ? "—" : `${f.volvera}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-extrabold text-neutral-900">% que volverá por sesión</h2>
        <VolveranChart datos={filas.map((f) => ({ sesion: `S${f.sesion.numero}`, pct: f.volvera }))} />
      </section>
    </div>
  );
}
