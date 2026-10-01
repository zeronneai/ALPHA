import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { COOKIE_SESION, DURACION_SESION_SEG, crearValorSesion, opcionesCookie } from "@/lib/portal/session";
import { mismoOrigen } from "@/lib/portal/acceso";

export const runtime = "nodejs";

const huella = (t: string) => createHash("sha256").update(t.trim().toLowerCase()).digest();

export async function POST(req: Request) {
  if (!mismoOrigen(req)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });

  const esperado = process.env.PARTICIPANTES_CODIGO;
  if (!esperado || !process.env.SESSION_SECRET) {
    console.error("Faltan PARTICIPANTES_CODIGO o SESSION_SECRET en las variables de entorno");
    return NextResponse.json({ error: "El portal no está configurado" }, { status: 500 });
  }

  let intento = "";
  try {
    const cuerpo = await req.json();
    if (typeof cuerpo?.codigo === "string") intento = cuerpo.codigo.slice(0, 200);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  // Sin distinguir mayúsculas; comparación de huellas en tiempo constante.
  if (!timingSafeEqual(huella(intento), huella(esperado))) {
    await new Promise((r) => setTimeout(r, 400)); // frena un poco los intentos repetidos
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, await crearValorSesion(), opcionesCookie(DURACION_SESION_SEG));
  return res;
}
