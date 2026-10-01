import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Tema = {
  episodio: number;
  slug: string;
  titulo: string;
  pregunta_central: string;
  resumen: string;
  puntos_clave: string[];
  versiculos: string[];
  pdf: string;
};

// Contenido privado: vive en /content (no en /public) y solo se sirve desde rutas de servidor.
const DIRECTORIO = path.join(process.cwd(), "content", "episodios");
let cache: Tema[] | null = null;

export function leerTemas(): Tema[] {
  if (!cache) {
    const crudo = fs.readFileSync(path.join(DIRECTORIO, "temas.json"), "utf8");
    cache = (JSON.parse(crudo) as Tema[]).sort((a, b) => a.episodio - b.episodio);
  }
  return cache;
}

export const TOTAL_EPISODIOS = 13;

/** Convierte el parámetro de la URL en un número de episodio válido (1 a 13), o null. */
export function parseEpisodio(valor: string): number | null {
  if (!/^\d{1,2}$/.test(valor)) return null;
  const n = Number(valor);
  return n >= 1 && n <= TOTAL_EPISODIOS ? n : null;
}

export function getTema(episodio: number): Tema | undefined {
  return leerTemas().find((t) => t.episodio === episodio);
}

/** Ruta del PDF a partir del nombre guardado en temas.json (nunca de la URL), sin subcarpetas. */
export function rutaPdf(tema: Tema): string {
  return path.join(DIRECTORIO, path.basename(tema.pdf));
}
