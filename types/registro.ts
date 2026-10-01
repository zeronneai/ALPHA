/** Coincide con la futura tabla `registros` de Supabase. */
export type Registro = {
  nombre: string;
  edad: number;
  telefono: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  como_se_entero: string;
  como_se_entero_otro: string | null;
};
