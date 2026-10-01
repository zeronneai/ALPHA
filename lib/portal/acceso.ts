import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, sesionValida } from "@/lib/portal/session";

/** Defensa en profundidad: además del middleware, cada página y ruta valida la cookie. */
export async function haySesion(): Promise<boolean> {
  return sesionValida((await cookies()).get(COOKIE_SESION)?.value);
}

export async function exigirSesion(): Promise<void> {
  if (!(await haySesion())) redirect("/participantes/entrar");
}

/** Rechaza peticiones POST que vengan de otro sitio (Origin distinto al host). */
export function mismoOrigen(req: Request): boolean {
  const origen = req.headers.get("origin");
  if (!origen) return true;
  try {
    return new URL(origen).host === req.headers.get("host");
  } catch {
    return false;
  }
}
