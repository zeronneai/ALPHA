import { NextResponse } from "next/server";
import { COOKIE_SESION, opcionesCookie } from "@/lib/portal/session";
import { mismoOrigen } from "@/lib/portal/acceso";

export async function POST(req: Request) {
  if (!mismoOrigen(req)) return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", opcionesCookie(0));
  return res;
}
