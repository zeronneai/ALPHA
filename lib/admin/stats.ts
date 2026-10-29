import { SESIONES } from "@/lib/sesiones";
import { PREGUNTAS_EVALUACION, type CampoPregunta } from "@/lib/admin/preguntas";
import { partesFecha } from "@/lib/admin/formato";
import type { AsistenciaRow, EvaluacionRow, RegistroRow } from "@/types/admin";

export const pct = (n: number, total: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

/** Asistentes por sesión; el índice 0 es la sesión 1. */
export function asistentesPorSesion(asistencias: AsistenciaRow[]): number[] {
  const conteo = Array<number>(SESIONES.length).fill(0);
  for (const a of asistencias) if (a.sesion >= 1 && a.sesion <= conteo.length) conteo[a.sesion - 1]++;
  return conteo;
}

/** Última sesión (1-based) con al menos un elemento, o null. */
export function ultimaSesionCon(conteos: number[]): number | null {
  for (let i = conteos.length - 1; i >= 0; i--) if (conteos[i] > 0) return i + 1;
  return null;
}

export function evaluacionesPorSesion(evaluaciones: EvaluacionRow[]): EvaluacionRow[][] {
  const grupos: EvaluacionRow[][] = SESIONES.map(() => []);
  for (const e of evaluaciones) if (e.sesion >= 1 && e.sesion <= grupos.length) grupos[e.sesion - 1].push(e);
  return grupos;
}

export type Conteo = { mal: number; bien: number; super: number };

export function conteoPregunta(evals: EvaluacionRow[], campo: CampoPregunta): Conteo {
  const c: Conteo = { mal: 0, bien: 0, super: 0 };
  for (const e of evals) c[e[campo]]++;
  return c;
}

export function resumenPreguntas(evals: EvaluacionRow[]) {
  return PREGUNTAS_EVALUACION.map((p) => ({ ...p, conteo: conteoPregunta(evals, p.campo) }));
}

export function conteoVolvera(evals: EvaluacionRow[]) {
  const si = evals.filter((e) => e.volvera).length;
  return { si, no: evals.length - si };
}

export function cumpleanosDelMes(registros: RegistroRow[], mes: number) {
  return registros
    .map((r) => ({ registro: r, ...partesFecha(r.fecha_nacimiento) }))
    .filter((x) => x.mes === mes)
    .sort((a, b) => a.dia - b.dia || a.registro.nombre.localeCompare(b.registro.nombre, "es"));
}

/** registro_id → sesiones a las que asistió. */
export function sesionesPorRegistro(asistencias: AsistenciaRow[]): Map<string, Set<number>> {
  const mapa = new Map<string, Set<number>>();
  for (const a of asistencias) {
    const k = String(a.registro_id);
    if (!mapa.has(k)) mapa.set(k, new Set());
    mapa.get(k)!.add(a.sesion);
  }
  return mapa;
}

/**
 * Calificación de 0 a 100 que combina las tres respuestas:
 * Mal = 0, Bien = 50, Súper = 100. Null si no hay respuestas.
 */
export function calificacion(c: Conteo): number | null {
  const total = c.mal + c.bien + c.super;
  return total === 0 ? null : Math.round((c.bien * 50 + c.super * 100) / total);
}

/** Suma de todas las respuestas de valoración (las 5 preguntas) de un grupo de evaluaciones. */
export function conteoGeneral(evals: EvaluacionRow[]): Conteo {
  const c: Conteo = { mal: 0, bien: 0, super: 0 };
  for (const p of PREGUNTAS_EVALUACION) {
    const x = conteoPregunta(evals, p.campo);
    c.mal += x.mal;
    c.bien += x.bien;
    c.super += x.super;
  }
  return c;
}

/** Día (hora de Chihuahua) en que más se contestó la encuesta; sirve para identificar la sesión. */
export function fechaSesion(evals: EvaluacionRow[]): string | null {
  if (evals.length === 0) return null;
  const conteo = new Map<string, number>();
  for (const e of evals) {
    const dia = new Date(e.created_at).toLocaleDateString("en-CA", { timeZone: "America/Chihuahua" });
    conteo.set(dia, (conteo.get(dia) ?? 0) + 1);
  }
  const [dia] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0];
  const [anio, mes, d] = dia.split("-").map(Number);
  return new Date(anio, mes - 1, d).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export type Nivel = { etiqueta: string; fondo: string; texto: string };

/** Semáforo de la calificación para colorear tarjetas y la tabla. */
export function nivel(cal: number | null): Nivel {
  if (cal === null) return { etiqueta: "Sin datos", fondo: "#F5F5F5", texto: "#737373" };
  if (cal >= 80) return { etiqueta: "Excelente", fondo: "#D7141A", texto: "#FFFFFF" };
  if (cal >= 65) return { etiqueta: "Bien", fondo: "#F4A6A9", texto: "#5C0A0D" };
  return { etiqueta: "A mejorar", fondo: "#404040", texto: "#FFFFFF" };
}
