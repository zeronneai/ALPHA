import "server-only";
import { supabaseServidor } from "@/lib/portal/supabaseServidor";
import { TOTAL_EPISODIOS } from "@/lib/portal/temas";

export type EstadoEpisodio = { episodio: number; desbloqueado: boolean; desbloqueado_at: string | null };

/** Estado de los 13 episodios (los que no tienen fila se consideran bloqueados). */
export async function leerEstados(): Promise<EstadoEpisodio[]> {
  const { data, error } = await supabaseServidor().from("episodios_estado").select("episodio, desbloqueado, desbloqueado_at");
  if (error) throw error;
  const porNumero = new Map((data ?? []).map((f) => [f.episodio as number, f as EstadoEpisodio]));
  return Array.from({ length: TOTAL_EPISODIOS }, (_, i) => {
    const n = i + 1;
    return porNumero.get(n) ?? { episodio: n, desbloqueado: false, desbloqueado_at: null };
  });
}

export async function episodioDesbloqueado(episodio: number): Promise<boolean> {
  const { data, error } = await supabaseServidor()
    .from("episodios_estado")
    .select("desbloqueado")
    .eq("episodio", episodio)
    .maybeSingle();
  if (error) throw error;
  return data?.desbloqueado === true;
}

/** El desbloqueado más reciente: por fecha de desbloqueo y, si empatan o no hay fecha, el de número mayor. */
export function masReciente(estados: EstadoEpisodio[]): number | null {
  const abiertos = estados.filter((e) => e.desbloqueado);
  if (abiertos.length === 0) return null;
  const marca = (e: EstadoEpisodio) => (e.desbloqueado_at ? Date.parse(e.desbloqueado_at) || 0 : 0);
  return abiertos.reduce((mejor, e) => (marca(e) > marca(mejor) || (marca(e) === marca(mejor) && e.episodio > mejor.episodio) ? e : mejor)).episodio;
}
