/** URL pública del registro (la que va en el QR de registro). */
export const REGISTRO_URL = "https://alpha-two-nu.vercel.app";

export const evaluacionUrl = (origen: string, sesion: number) => `${origen}/evaluacion/${sesion}`;

const ROJO = "#D7141A";
const ANCHO = 1200;
const QR = 1024;
const MARGEN = (ANCHO - QR) / 2;

/**
 * Compone un PNG de alta resolución (1200 px de ancho, QR de 1024 px) con fondo blanco,
 * el texto debajo y una franja roja de marca, a partir del <svg> del QR.
 */
export async function descargarQrPng(svg: SVGSVGElement, texto: string, url: string, archivo: string): Promise<void> {
  await document.fonts?.ready;
  const familia = getComputedStyle(document.body).fontFamily || "sans-serif";

  const img = new Image();
  const xml = new XMLSerializer().serializeToString(svg);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("No se pudo generar la imagen del QR"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  });

  const alto = MARGEN + QR + 250;
  const canvas = document.createElement("canvas");
  canvas.width = ANCHO;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, ANCHO, alto);
  ctx.drawImage(img, MARGEN, MARGEN, QR, QR);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let tam = 80;
  do {
    ctx.font = `800 ${tam}px ${familia}`;
    tam -= 4;
  } while (ctx.measureText(texto).width > ANCHO - 2 * MARGEN && tam > 24);
  ctx.fillStyle = ROJO;
  ctx.fillText(texto, ANCHO / 2, MARGEN + QR + 100);

  ctx.font = `500 34px ${familia}`;
  ctx.fillStyle = "#737373";
  ctx.fillText(url.replace(/^https?:\/\//, ""), ANCHO / 2, MARGEN + QR + 165);

  ctx.fillStyle = ROJO;
  ctx.fillRect(0, alto - 28, ANCHO, 28);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo crear el PNG");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = archivo;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

/** Copia texto al portapapeles (con plan B para navegadores sin la API moderna). */
export async function copiarTexto(texto: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const t = document.createElement("textarea");
    t.value = texto;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    if (!ok) throw new Error("No se pudo copiar");
  }
}
