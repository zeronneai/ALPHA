import { getSupabase } from "@/lib/supabase";
import type { Registro } from "@/types/registro";
import type { AsistenciaRow, EpisodioEstadoRow, EvaluacionRow, Id, PreguntaRow, RegistroRow } from "@/types/admin";

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

/** Marca a la persona como invitada al grupo de WhatsApp (registros.invitado_whatsapp = true). */
export async function guardarInvitado(id: Id): Promise<void> {
  const { data, error } = await getSupabase().from("registros").update({ invitado_whatsapp: true }).eq("id", id).select("id");
  if (error) throw error;
  // Con RLS, un update sin permiso no da error: simplemente no modifica nada.
  if (!data || data.length === 0) throw new Error("No se actualizó el registro (¿falta permiso?)");
}

// Portal de participantes: el admin lee y escribe con su sesión (la RLS solo deja a admins).
export async function leerEpisodiosEstado(): Promise<EpisodioEstadoRow[]> {
  const { data, error } = await getSupabase().from("episodios_estado").select("episodio, desbloqueado, desbloqueado_at").order("episodio");
  if (error) throw error;
  return (data ?? []) as EpisodioEstadoRow[];
}

export const leerPreguntas = () => leerTodo<PreguntaRow>("preguntas_participantes");

export async function guardarEstadoEpisodio(episodio: number, desbloqueado: boolean): Promise<EpisodioEstadoRow> {
  const fila = { episodio, desbloqueado, desbloqueado_at: desbloqueado ? new Date().toISOString() : null };
  const { data, error } = await getSupabase().from("episodios_estado").upsert(fila, { onConflict: "episodio" }).select("episodio");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No se actualizó el episodio (¿falta permiso?)");
  return fila;
}

export async function guardarRespondida(id: Id, respondida: boolean): Promise<string | null> {
  const respondida_at = respondida ? new Date().toISOString() : null;
  const { data, error } = await getSupabase().from("preguntas_participantes").update({ respondida, respondida_at }).eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No se actualizó la pregunta (¿falta permiso?)");
  return respondida_at;
}

export async function borrarPregunta(id: Id): Promise<void> {
  const { data, error } = await getSupabase().from("preguntas_participantes").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No se eliminó la pregunta (¿falta permiso?)");
}
