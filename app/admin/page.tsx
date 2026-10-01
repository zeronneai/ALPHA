"use client";

import { useMemo } from "react";
import StatCard from "@/components/admin/StatCard";
import AsistenciaChart from "@/components/admin/AsistenciaChart";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { MESES } from "@/lib/schema";
import { SESIONES } from "@/lib/sesiones";
import { asistentesPorSesion, conteoVolvera, cumpleanosDelMes, evaluacionesPorSesion, pct, ultimaSesionCon } from "@/lib/admin/stats";

export default function AdminInicioPage() {
  const { registros, asistencias, evaluaciones } = useAdminData();

  const datos = useMemo(() => {
    const asistentes = asistentesPorSesion(asistencias);
    const ultimaAsist = ultimaSesionCon(asistentes);
    const conAsistencia = asistentes.filter((n) => n > 0);
    const promedio = conAsistencia.length ? conAsistencia.reduce((a, b) => a + b, 0) / conAsistencia.length : null;

    const evals = evaluacionesPorSesion(evaluaciones);
    const ultimaEval = ultimaSesionCon(evals.map((e) => e.length));
    const volvera = ultimaEval ? conteoVolvera(evals[ultimaEval - 1]) : null;

    const mes = new Date().getMonth() + 1;
    return {
      asistentes,
      ultimaAsist,
      promedio,
      ultimaEval,
      pctVolvera: volvera ? pct(volvera.si, volvera.si + volvera.no) : null,
      mes,
      cumples: cumpleanosDelMes(registros, mes),
      hoy: new Date().getDate(),
    };
  }, [registros, asistencias, evaluaciones]);

  const grafica = SESIONES.map((s, i) => ({
    sesion: `S${s.numero}`,
    asistentes: datos.ultimaAsist && s.numero <= datos.ultimaAsist ? datos.asistentes[i] : null,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-neutral-900">Inicio</h1>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard etiqueta="Registrados" valor={String(registros.length)} />
        <StatCard
          etiqueta="Asistentes"
          valor={datos.ultimaAsist ? String(datos.asistentes[datos.ultimaAsist - 1]) : "—"}
          detalle={datos.ultimaAsist ? `Sesión ${datos.ultimaAsist} (la más reciente)` : "Aún sin asistencias"}
        />
        <StatCard
          etiqueta="Promedio de asistencia"
          valor={datos.promedio === null ? "—" : datos.promedio.toLocaleString("es-MX", { maximumFractionDigits: 1 })}
          detalle="personas por sesión"
        />
        <StatCard
          etiqueta="Volverán"
          valor={datos.pctVolvera === null ? "—" : `${datos.pctVolvera}%`}
          detalle={datos.ultimaEval ? `Sesión ${datos.ultimaEval}` : "Aún sin evaluaciones"}
        />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-extrabold text-neutral-900">Asistencia por sesión</h2>
        <AsistenciaChart datos={grafica} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-extrabold text-neutral-900">Cumpleaños de este mes ({MESES[datos.mes - 1]})</h2>
        {datos.cumples.length === 0 ? (
          <p className="text-neutral-600">Nadie cumple años este mes.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {datos.cumples.map(({ registro, dia }) => (
              <li key={String(registro.id)} className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-medium text-neutral-900">{registro.nombre}</span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${dia === datos.hoy ? "bg-alpha text-white" : "bg-alpha-soft text-alpha-dark"}`}>
                  {dia === datos.hoy ? "¡Hoy! " : ""}
                  {dia} de {MESES[datos.mes - 1]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
