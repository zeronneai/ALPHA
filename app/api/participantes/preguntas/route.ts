import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_PREGUNTAS,
  COOKIE_SESION,
  MAX_PREGUNTAS_POR_HORA,
  leerMarcasPreguntas,
  opcionesCookie,
  sesionValida,
  valorMarcasPreguntas,
} from "@/lib/portal/session";
import { mismoOrigen } from "@/lib/portal/acceso";
import { episodioDesbloqueado } from "@/lib/portal/episodios";
import { supabaseServidor } from "@/lib/portal/supabaseServidor";
import { TOTAL_EPISODIOS } from "@/lib/portal/temas";

export const runtime = "nodejs";

const error = (mensaje: string, status: number) => NextResponse.json({ error: mensaje }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const jar = await cookies();
  if (!(await sesionValida(jar.get(COOKIE_SESION)?.value))) return error("No autorizado", 401);
  if (!mismoOrigen(req) || !(req.headers.get("content-type") ?? "").includes("application/json")) return error("Solicitud inválida", 400);

  let cuerpo: { episodio?: unknown; pregunta?: unknown; nombre?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return error("Solicitud inválida", 400);
  }

  const episodio = Number(cuerpo.episodio);
  const pregunta = typeof cuerpo.pregunta === "string" ? cuerpo.pregunta.trim() : "";
  const nombre = typeof cuerpo.nombre === "string" ? cuerpo.nombre.trim().slice(0, 80) : "";

  if (!Number.isInteger(episodio) || episodio < 1 || episodio > TOTAL_EPISODIOS) return error("Episodio inválido", 400);
  if (pregunta.length < 3) return error("Escribe tu pregunta (mínimo 3 caracteres)", 400);
  if (pregunta.length > 500) return error("Tu pregunta es muy larga (máximo 500 caracteres)", 400);

  const marcas = await leerMarcasPreguntas(jar.get(COOKIE_PREGUNTAS)?.value);
  if (marcas.length >= MAX_PREGUNTAS_POR_HORA) {
    return error("Llegaste al límite de preguntas por hora, intenta más tarde", 429);
  }

  try {
    if (!(await episodioDesbloqueado(episodio))) return error("Este episodio todavía no está disponible", 403);
    const { error: err } = await supabaseServidor()
      .from("preguntas_participantes")
      .insert({ episodio, pregunta, nombre: nombre || null });
    if (err) throw err;
  } catch (err) {
    console.error("Error al guardar la pregunta:", err);
    return error("Hubo un problema, intenta de nuevo", 500);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_PREGUNTAS, await valorMarcasPreguntas([...marcas, Date.now()]), opcionesCookie(60 * 60));
  return res;
}
