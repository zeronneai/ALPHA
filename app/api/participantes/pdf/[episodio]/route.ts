import { readFile } from "node:fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESION, sesionValida } from "@/lib/portal/session";
import { episodioDesbloqueado } from "@/lib/portal/episodios";
import { getTema, parseEpisodio, rutaPdf } from "@/lib/portal/temas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

export async function GET(_req: Request, { params }: { params: Promise<{ episodio: string }> }) {
  if (!(await sesionValida((await cookies()).get(COOKIE_SESION)?.value))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: SIN_CACHE });
  }

  const episodio = parseEpisodio((await params).episodio);
  const tema = episodio ? getTema(episodio) : undefined;
  if (!episodio || !tema) return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: SIN_CACHE });

  try {
    if (!(await episodioDesbloqueado(episodio))) {
      return NextResponse.json({ error: "Este episodio todavía no está disponible" }, { status: 403, headers: SIN_CACHE });
    }
    const archivo = await readFile(rutaPdf(tema));
    return new Response(new Uint8Array(archivo), {
      headers: {
        ...SIN_CACHE,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${tema.pdf}"`,
        "Content-Length": String(archivo.length),
      },
    });
  } catch (err) {
    console.error("Error al entregar el PDF:", err);
    return NextResponse.json({ error: "No se pudo descargar el PDF" }, { status: 500, headers: SIN_CACHE });
  }
}
