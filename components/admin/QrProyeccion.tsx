"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type Props = { arriba: string; abajo: string; url: string };

const botonDiscreto =
  "rounded-lg border border-white/40 px-3 py-1.5 text-sm font-semibold text-white/70 transition hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/** Pantalla roja para proyectar: texto arriba, QR enorme al centro y texto abajo. */
export default function QrProyeccion({ arriba, abajo, url }: Props) {
  const router = useRouter();
  const [completa, setCompleta] = useState(false);

  useEffect(() => {
    const alCambiar = () => setCompleta(!!document.fullscreenElement);
    alCambiar();
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, []);

  const alternarPantallaCompleta = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const salir = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    router.push("/admin/qr");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-[3vh] bg-alpha px-4 py-6 text-center text-white">
      <div className="absolute right-3 top-3 flex gap-2">
        <button type="button" onClick={alternarPantallaCompleta} className={botonDiscreto}>
          {completa ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
        <button type="button" onClick={salir} className={botonDiscreto}>
          Salir
        </button>
      </div>

      <h1 className="text-[clamp(1.75rem,5vw,4.5rem)] font-extrabold leading-tight">{arriba}</h1>

      <div className="aspect-square w-[min(58vh,88vw)] rounded-[4%] bg-white p-[3%] shadow-2xl">
        <QRCodeSVG value={url} size={1024} marginSize={0} fgColor="#D7141A" bgColor="#FFFFFF" level="Q" className="h-full w-full" role="img" aria-label={abajo} />
      </div>

      <p className="text-[clamp(1.25rem,3.5vw,3rem)] font-bold leading-tight">{abajo}</p>
    </main>
  );
}
