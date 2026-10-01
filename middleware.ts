import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, sesionValida } from "@/lib/portal/session";

/** Protege /participantes/* y /api/participantes/* (excepto el acceso) con la cookie firmada. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const esApi = pathname.startsWith("/api/");
  const esAcceso = pathname === "/participantes/entrar" || pathname === "/api/participantes/login";
  const conSesion = await sesionValida(req.cookies.get(COOKIE_SESION)?.value);

  if (esAcceso) {
    // Quien ya entró no necesita ver la pantalla de acceso.
    if (conSesion && !esApi) return NextResponse.redirect(new URL("/participantes", req.url));
    return NextResponse.next();
  }
  if (conSesion) return NextResponse.next();

  if (esApi) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.redirect(new URL("/participantes/entrar", req.url));
}

export const config = { matcher: ["/participantes/:path*", "/api/participantes/:path*"] };
