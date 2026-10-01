// Genera los iconos de la app a partir del logo rojo de Alpha.
// Uso: node scripts/generar-iconos.mjs
// Salida: app/icon.png (512), app/apple-icon.png (180) y app/favicon.ico (32).
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const ORIGEN = new URL("./alpha-logo-rojo.png", import.meta.url);
const APP = new URL("../app/", import.meta.url);
const MARGEN = 0.1; // 10% de margen por lado

/** Centra el logo (que no es cuadrado) sobre un fondo blanco cuadrado con margen. */
async function icono(tamano) {
  const interior = Math.round(tamano * (1 - MARGEN * 2));
  const logo = await sharp(ORIGEN.pathname)
    .resize(interior, interior, { fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: tamano, height: tamano, channels: 4, background: "#FFFFFF" } })
    .composite([{ input: logo, gravity: "center" }])
    .flatten({ background: "#FFFFFF" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Un .ico con una sola imagen PNG (válido en todos los navegadores modernos). */
function empaquetarIco(png, tamano) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // tipo: icono
  cabecera.writeUInt16LE(1, 4); // cantidad de imágenes
  const entrada = Buffer.alloc(16);
  entrada.writeUInt8(tamano === 256 ? 0 : tamano, 0); // ancho
  entrada.writeUInt8(tamano === 256 ? 0 : tamano, 1); // alto
  entrada.writeUInt8(0, 2); // colores de paleta
  entrada.writeUInt8(0, 3); // reservado
  entrada.writeUInt16LE(1, 4); // planos
  entrada.writeUInt16LE(32, 6); // bits por pixel
  entrada.writeUInt32LE(png.length, 8); // tamaño de los datos
  entrada.writeUInt32LE(6 + 16, 12); // posición de los datos
  return Buffer.concat([cabecera, entrada, png]);
}

await writeFile(new URL("icon.png", APP), await icono(512));
await writeFile(new URL("apple-icon.png", APP), await icono(180));
await writeFile(new URL("favicon.ico", APP), empaquetarIco(await icono(32), 32));
console.log("Iconos generados en app/");
