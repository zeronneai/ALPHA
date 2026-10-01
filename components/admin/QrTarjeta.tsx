"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { botonBorde, botonRojo } from "./SinAcceso";
import { copiarTexto, descargarQrPng } from "@/lib/qr";

type Props = {
  titulo: string;
  url: string;
  /** Texto que va debajo del QR en el PNG descargado. */
  textoPng: string;
  archivo: string;
  proyectarHref: string;
  destacada?: boolean;
};

export default function QrTarjeta({ titulo, url, textoPng, archivo, proyectarHref, destacada = false }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const descargar = async () => {
    if (!svgRef.current) return;
    setError(null);
    setDescargando(true);
    try {
      await descargarQrPng(svgRef.current, textoPng, url, archivo);
    } catch (err) {
      console.error("Error al descargar el QR:", err);
      setError("No se pudo descargar el PNG");
    } finally {
      setDescargando(false);
    }
  };

  const copiar = async () => {
    setError(null);
    try {
      await copiarTexto(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Error al copiar el link:", err);
      setError("No se pudo copiar el link");
    }
  };

  const proyectar = () => {
    // requestFullscreen necesita el gesto del clic; la pantalla completa se conserva al navegar.
    void document.documentElement.requestFullscreen?.().catch(() => {});
    router.push(proyectarHref);
  };

  return (
    <li
      className={`list-none rounded-2xl bg-white p-4 shadow-sm ${destacada ? "border-2 border-alpha md:flex md:items-center md:gap-8 md:p-6" : "border border-neutral-200"}`}
    >
      <div className={`mx-auto w-fit rounded-xl border border-neutral-200 bg-white p-2 ${destacada ? "md:mx-0 md:shrink-0" : ""}`}>
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={1024}
          marginSize={2}
          fgColor="#D7141A"
          bgColor="#FFFFFF"
          level="M"
          className={destacada ? "h-56 w-56" : "h-44 w-44"}
          role="img"
          aria-label={`Código QR: ${titulo}`}
        />
      </div>

      <div className={`mt-3 text-center ${destacada ? "md:mt-0 md:flex-1 md:text-left" : ""}`}>
        <h2 className={`font-extrabold text-neutral-900 ${destacada ? "text-xl" : "text-lg"}`}>{titulo}</h2>
        <p className="mt-1 break-all text-xs text-neutral-500">{url}</p>

        <div className="mt-3 space-y-2">
          <button type="button" onClick={() => void descargar()} disabled={descargando} className={`${botonRojo} !py-2.5 !text-sm`}>
            {descargando ? "Generando..." : "Descargar PNG"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => void copiar()} className={`${botonBorde} !py-2.5 !text-sm`} aria-live="polite">
              {copiado ? "¡Copiado!" : "Copiar link"}
            </button>
            <button type="button" onClick={proyectar} className={`${botonBorde} !py-2.5 !text-sm`}>
              Proyectar
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-alpha-dark">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
