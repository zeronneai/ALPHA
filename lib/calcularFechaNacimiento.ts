const esBisiesto = (anio: number) => (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Calcula la fecha de nacimiento (YYYY-MM-DD) a partir de la edad y del día/mes de cumpleaños.
 * - Si el cumpleaños de este año ya pasó o es hoy: año = año actual - edad.
 * - Si todavía no llega: año = año actual - edad - 1.
 * - Si es 29 de febrero y el año resultante no es bisiesto, se guarda como 28 de febrero.
 */
export function calcularFechaNacimiento(
  edad: number,
  dia: number,
  mes: number,
  hoy: Date = new Date(),
): string {
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth() + 1;
  const diaActual = hoy.getDate();

  const yaPaso = mes < mesActual || (mes === mesActual && dia <= diaActual);
  const anio = anioActual - edad - (yaPaso ? 0 : 1);

  const diaFinal = mes === 2 && dia === 29 && !esBisiesto(anio) ? 28 : dia;

  return `${String(anio).padStart(4, "0")}-${pad(mes)}-${pad(diaFinal)}`;
}
