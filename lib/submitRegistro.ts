import type { Registro } from "@/types/registro";

/**
 * Punto único de envío del registro.
 * TODO: reemplazar por Supabase:
 *   const { error } = await supabase.from("registros").insert(data);
 *   if (error) throw error;
 */
export async function submitRegistro(data: Registro): Promise<void> {
  console.log("Registro recibido:", data);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
