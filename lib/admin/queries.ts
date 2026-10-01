import { getSupabase } from "@/lib/supabase";
import type { Registro } from "@/types/registro";
import type { AsistenciaRow, EvaluacionRow, Id, RegistroRow } from "@/types/admin";

const PAGINA = 1000;

/** Lee toda una tabla paginando (Supabase devuelve máximo 1000 filas por consulta). */
async function leerTodo<T>(tabla: string, columnas = "*"): Promise<T[]> {
  const filas: T[] = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await getSupabase()
      .from(tabla)
      .select(columnas)
      .order("id", { ascending: true })
      .range(desde, desde + PAGINA - 1);
    if (error) throw error;
    filas.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGINA) break;
  }
  return filas;
}

export const leerRegistros = () => leerTodo<RegistroRow>("registros");
export const leerAsistencias = () => leerTodo<AsistenciaRow>("asistencias", "registro_id, sesion");
export const leerEvaluaciones = () => leerTodo<EvaluacionRow>("evaluaciones");

// El admin sí puede leer, así que aquí se permite .select() después de escribir.
export async function crearRegistro(data: Registro): Promise<RegistroRow> {
  const { data: fila, error } = await getSupabase().from("registros").insert(data).select().single();
  if (error) throw error;
  return fila as RegistroRow;
}

export async function editarRegistro(id: Id, data: Registro): Promise<RegistroRow> {
  const { data: fila, error } = await getSupabase().from("registros").update(data).eq("id", id).select().single();
  if (error) throw error;
  return fila as RegistroRow;
}

export async function crearAsistencia(registroId: Id, sesion: number): Promise<void> {
  const { error } = await getSupabase().from("asistencias").insert({ registro_id: registroId, sesion });
  // 23505 = ya existía (unique registro_id + sesion): el resultado es el mismo.
  if (error && error.code !== "23505") throw error;
}

export async function borrarAsistencia(registroId: Id, sesion: number): Promise<void> {
  const { data, error } = await getSupabase()
    .from("asistencias")
    .delete()
    .eq("registro_id", registroId)
    .eq("sesion", sesion)
    .select("registro_id");
  if (error) throw error;
  // Con RLS, un delete sin permiso no da error: simplemente no borra nada.
  if (!data || data.length === 0) throw new Error("No se eliminó la asistencia (¿falta permiso?)");
}

export async function crearAsistencias(registroIds: Id[], sesion: number): Promise<void> {
  for (let i = 0; i < registroIds.length; i += 500) {
    const filas = registroIds.slice(i, i + 500).map((registro_id) => ({ registro_id, sesion }));
    const { error } = await getSupabase()
      .from("asistencias")
      .upsert(filas, { onConflict: "registro_id,sesion", ignoreDuplicates: true });
    if (error) throw error;
  }
}
