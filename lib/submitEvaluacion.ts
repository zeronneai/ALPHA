import { getSupabase } from "@/lib/supabase";
import type { Evaluacion } from "@/types/evaluacion";

/**
 * Inserta la evaluación en la tabla "evaluaciones".
 * No usar .select() después del insert: la RLS solo permite INSERT.
 */
export async function submitEvaluacion(data: Evaluacion): Promise<void> {
  const { error } = await getSupabase().from("evaluaciones").insert({
    sesion: data.sesion,
    bienvenida: data.bienvenida,
    comida: data.comida,
    tema: data.tema,
    grupo_mesa: data.grupo_mesa,
    ambiente: data.ambiente,
    volvera: data.volvera,
    comentario: data.comentario,
  });
  if (error) throw error;
}
