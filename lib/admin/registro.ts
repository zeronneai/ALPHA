import { calcularFechaNacimiento } from "@/lib/calcularFechaNacimiento";
import { partesFecha, soloDigitos } from "@/lib/admin/formato";
import type { RegistroFormValues } from "@/lib/schema";
import type { Registro } from "@/types/registro";
import type { RegistroRow } from "@/types/admin";

/** Convierte los valores del formulario al tipo Registro (igual que el registro público). */
export function armarRegistro(v: RegistroFormValues, original?: RegistroRow): Registro {
  const edad = Number(v.edad);
  const dia = Number(v.dia);
  const mes = Number(v.mes);
  let fecha = calcularFechaNacimiento(edad, dia, mes);
  if (original) {
    // Si no cambió ni la edad ni el cumpleaños, se conserva el año ya guardado.
    const p = partesFecha(original.fecha_nacimiento);
    if (p.dia === dia && p.mes === mes && original.edad === edad) fecha = original.fecha_nacimiento;
  }
  return {
    nombre: v.nombre.trim(),
    edad,
    telefono: soloDigitos(v.telefono),
    fecha_nacimiento: fecha,
    como_se_entero: v.como_se_entero,
    como_se_entero_otro: v.como_se_entero === "Otro" ? v.como_se_entero_otro?.trim() || null : null,
  };
}

export function valoresIniciales(r?: RegistroRow): RegistroFormValues {
  if (!r) return { nombre: "", edad: "", telefono: "", dia: "", mes: "", como_se_entero: "", como_se_entero_otro: "" };
  const { dia, mes } = partesFecha(r.fecha_nacimiento);
  return {
    nombre: r.nombre,
    edad: String(r.edad),
    telefono: r.telefono,
    dia: String(dia),
    mes: String(mes),
    como_se_entero: r.como_se_entero,
    como_se_entero_otro: r.como_se_entero_otro ?? "",
  };
}
