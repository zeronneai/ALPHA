"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import SesionInvalida from "@/components/admin/SesionInvalida";
import StackedBar from "@/components/admin/StackedBar";
import { ULTIMA_SESION, getSesion, type Sesion } from "@/lib/sesiones";
import { fechaCorta } from "@/lib/admin/formato";
import { conteoVolvera, resumenPreguntas } from "@/lib/admin/stats";

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
      </div>

      {datos.total === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-600">Todavía no hay evaluaciones de esta sesión</p>
      ) : (
        <>
          <p className="text-lg font-extrabold text-alpha">
            {datos.total} de {datos.asistentes} contestaron
          </p>

          <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            {datos.preguntas.map((p) => (
              <StackedBar
                key={p.campo}
                titulo={p.etiqueta}
                segmentos={[
                  { etiqueta: "Mal", valor: p.conteo.mal, fondo: "#404040", texto: "#FFFFFF" },
                  { etiqueta: "Bien", valor: p.conteo.bien, fondo: "#F4A6A9", texto: "#5C0A0D" },
                  { etiqueta: "Súper", valor: p.conteo.super, fondo: "#D7141A", texto: "#FFFFFF" },
                ]}
              />
            ))}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <StackedBar
              titulo={sesion.numero === ULTIMA_SESION ? "¿Quieren seguir participando en Alpha?" : "¿Volverán la siguiente sesión?"}
              segmentos={[
                { etiqueta: "Sí", valor: datos.volvera.si, fondo: "#D7141A", texto: "#FFFFFF" },
                { etiqueta: "No", valor: datos.volvera.no, fondo: "#404040", texto: "#FFFFFF" },
              ]}
            />
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
