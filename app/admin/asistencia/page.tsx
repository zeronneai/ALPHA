"use client";

import Link from "next/link";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { SESIONES } from "@/lib/sesiones";
import { asistentesPorSesion } from "@/lib/admin/stats";

export default function AsistenciaIndexPage() {
  const { asistencias, registros } = useAdminData();
  const conteos = asistentesPorSesion(asistencias);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-neutral-900">Asistencia</h1>
      <p className="text-neutral-600">Elige una sesión para pasar lista.</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SESIONES.map((s, i) => (
          <li key={s.numero}>
            <Link
              href={`/admin/asistencia/${s.numero}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition hover:border-alpha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha"
            >
              <span className="block font-extrabold text-neutral-900">{s.titulo}</span>
              <span className="mt-1 block text-3xl font-extrabold text-alpha">{conteos[i]}</span>
              <span className="block text-xs text-neutral-500">de {registros.length} asistieron</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
