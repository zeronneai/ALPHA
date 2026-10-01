import { getSupabase } from "@/lib/supabase";
import type { Registro } from "@/types/registro";

/**
 * Inserta el registro en la tabla "registros".
 * No usar .select() después del insert: la RLS solo permite INSERT.
 */
export async function submitRegistro(data: Registro): Promise<void> {
  const { error } = await getSupabase().from("registros").insert({
    nombre: data.nombre,
    edad: data.edad,
    telefono: data.telefono,
    fecha_nacimiento: data.fecha_nacimiento,
    como_se_entero: data.como_se_entero,
    como_se_entero_otro: data.como_se_entero === "Otro" ? data.como_se_entero_otro : null,
  });
  if (error) throw error;
}
