export type Sesion = { numero: number; titulo: string };

/** Edita aquí los títulos de las 10 sesiones. */
export const SESIONES: Sesion[] = [
  { numero: 1, titulo: "Sesión 1" },
  { numero: 2, titulo: "Sesión 2" },
  { numero: 3, titulo: "Sesión 3" },
  { numero: 4, titulo: "Sesión 4" },
  { numero: 5, titulo: "Sesión 5" },
  { numero: 6, titulo: "Sesión 6" },
  { numero: 7, titulo: "Sesión 7" },
  { numero: 8, titulo: "Sesión 8" },
  { numero: 9, titulo: "Sesión 9" },
  { numero: 10, titulo: "Sesión 10" },
];

export const ULTIMA_SESION = SESIONES.length;

/** Devuelve la sesión si `valor` es un entero entre 1 y 10; si no, undefined. */
export function getSesion(valor: string): Sesion | undefined {
  if (!/^\d+$/.test(valor)) return undefined;
  return SESIONES.find((s) => s.numero === Number(valor));
}
