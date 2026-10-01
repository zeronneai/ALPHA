import { SESIONES } from "@/lib/sesiones";
import { origenTexto } from "@/lib/admin/formato";
import { sesionesPorRegistro } from "@/lib/admin/stats";
import type { AsistenciaRow, RegistroRow } from "@/types/admin";

/** Escapa una celda; evita que Excel interprete texto como fórmula (=, +, -, @). */
function celda(valor: string | number | null | undefined): string {
  let t = valor === null || valor === undefined ? "" : String(valor);
  if (/^[=+\-@\t\r]/.test(t) && !/^-?\d+(\.\d+)?$/.test(t)) t = `'${t}`;
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function generarCsv(registros: RegistroRow[], asistencias: AsistenciaRow[]): string {
  const porRegistro = sesionesPorRegistro(asistencias);
  const encabezados = [
    "Nombre",
    "Edad",
    "Teléfono",
    "Fecha de nacimiento",
    "Cómo se enteró",
    "Fecha de registro",
    "Asistencias",
    ...SESIONES.map((s) => `S${s.numero}`),
  ];
  const filas = registros.map((r) => {
    const ses = porRegistro.get(String(r.id)) ?? new Set<number>();
    return [
      r.nombre,
      r.edad,
      r.telefono,
      r.fecha_nacimiento,
      origenTexto(r),
      r.created_at.slice(0, 10),
      ses.size,
      ...SESIONES.map((s) => (ses.has(s.numero) ? "Sí" : "")),
    ];
  });
  return [encabezados, ...filas].map((f) => f.map(celda).join(",")).join("\r\n");
}

/** Descarga un CSV con BOM UTF-8 para que Excel muestre bien los acentos. */
export function descargarCsv(nombreArchivo: string, contenido: string) {
  const blob = new Blob(["﻿", contenido], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
