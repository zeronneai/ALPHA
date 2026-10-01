/**
 * Cookies firmadas con HMAC-SHA256 (Web Crypto, funciona en el middleware y en rutas de servidor).
 * Solo servidor: usa SESSION_SECRET, que nunca debe tener el prefijo NEXT_PUBLIC_.
 */

export const COOKIE_SESION = "alpha_portal";
export const COOKIE_PREGUNTAS = "alpha_pq";
export const DURACION_SESION_SEG = 60 * 60 * 24 * 90; // 90 días

const encoder = new TextEncoder();

function secreto(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

async function llave(usos: KeyUsage[]): Promise<CryptoKey> {
  const s = secreto();
  if (!s) throw new Error("Falta SESSION_SECRET (mínimo 16 caracteres)");
  return crypto.subtle.importKey("raw", encoder.encode(s), { name: "HMAC", hash: "SHA-256" }, false, usos);
}

function aBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array<ArrayBuffer> | null {
  try {
    const bin = atob(texto.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Devuelve "payload.firma". */
export async function firmar(payload: string): Promise<string> {
  const firma = await crypto.subtle.sign("HMAC", await llave(["sign"]), encoder.encode(payload));
  return `${payload}.${aBase64Url(firma)}`;
}

/** Devuelve el payload si la firma es válida (comparación en tiempo constante); si no, null. */
export async function verificar(valor: string | undefined | null): Promise<string | null> {
  if (!valor || !secreto()) return null;
  const i = valor.lastIndexOf(".");
  if (i < 1) return null;
  const payload = valor.slice(0, i);
  const firma = deBase64Url(valor.slice(i + 1));
  if (!firma) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await llave(["verify"]), firma, encoder.encode(payload));
    return ok ? payload : null;
  } catch {
    return null;
  }
}

/** Valor de la cookie de sesión del portal (vence en 90 días). */
export async function crearValorSesion(ahora = Date.now()): Promise<string> {
  return firmar(`sesion:${ahora + DURACION_SESION_SEG * 1000}`);
}

export async function sesionValida(valor: string | undefined | null, ahora = Date.now()): Promise<boolean> {
  const payload = await verificar(valor);
  if (!payload?.startsWith("sesion:")) return false;
  const vence = Number(payload.slice("sesion:".length));
  return Number.isFinite(vence) && vence > ahora;
}

export const opcionesCookie = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

// Límite de preguntas por hora, guardado en una cookie firmada con las marcas de tiempo recientes.
export const MAX_PREGUNTAS_POR_HORA = 5;
const HORA_MS = 60 * 60 * 1000;

export async function leerMarcasPreguntas(valor: string | undefined, ahora = Date.now()): Promise<number[]> {
  const payload = await verificar(valor);
  if (!payload?.startsWith("pq:")) return [];
  return payload
    .slice(3)
    .split(",")
    .map(Number)
    .filter((t) => Number.isFinite(t) && t > ahora - HORA_MS && t <= ahora);
}

export async function valorMarcasPreguntas(marcas: number[]): Promise<string> {
  return firmar(`pq:${marcas.join(",")}`);
}
