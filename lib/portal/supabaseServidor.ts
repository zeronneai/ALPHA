import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

/**
 * Cliente de Supabase con la service role key. SOLO para rutas y componentes de servidor:
 * se salta la RLS, así que nunca debe importarse desde un componente cliente.
 */
export function supabaseServidor(): SupabaseClient {
  if (!cliente) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    cliente = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return cliente;
}
