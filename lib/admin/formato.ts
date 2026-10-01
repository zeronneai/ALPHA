import { MESES } from "@/lib/schema";

/** Separa "YYYY-MM-DD" sin pasar por Date (evita problemas de zona horaria). */
export function partesFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return { anio, mes, dia };
}

export function cumpleanosTexto(fechaNacimiento: string): string {
  const { dia, mes } = partesFecha(fechaNacimiento);
  return `${dia} de ${MESES[mes - 1]}`;
}

export function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export const soloDigitos = (t: string) => t.replace(/\D/g, "");

export function telefonoLegible(t: string): string {
  const d = soloDigitos(t);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : t;
}

/** Link de WhatsApp con lada de México (52) si el número es de 10 dígitos. */
export function whatsappUrl(t: string): string {
  let d = soloDigitos(t);
  if (d.length === 10) d = `52${d}`;
  return `https://wa.me/${d}`;
}

/** Minúsculas y sin acentos, para búsquedas. */
export const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

export const porNombre = <T extends { nombre: string }>(a: T, b: T) =>
  a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });

export function origenTexto(r: { como_se_entero: string; como_se_entero_otro: string | null }): string {
  return r.como_se_entero === "Otro" && r.como_se_entero_otro ? `Otro: ${r.como_se_entero_otro}` : r.como_se_entero;
}
