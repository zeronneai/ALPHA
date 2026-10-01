"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = { numero: number; titulo: string; url: string };

export default function QrCard({ numero, titulo, url }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const descargar = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `alpha-evaluacion-sesion-${numero}.png`;
    a.click();
  };

  return (
    <li className="rounded-2xl border border-neutral-200 p-4 text-center">
      <h2 className="text-lg font-extrabold text-neutral-900">{titulo}</h2>
      <div ref={ref} className="mx-auto mt-3 w-fit rounded-xl border border-neutral-200 bg-white p-2">
        <QRCodeCanvas
          value={url}
          size={512}
          marginSize={2}
          fgColor="#D7141A"
          bgColor="#FFFFFF"
          level="M"
          style={{ width: 176, height: 176 }}
          aria-label={`Código QR de la evaluación de la sesión ${numero}`}
        />
      </div>
      <p className="mt-2 break-all text-xs text-neutral-500">{url}</p>
      <button
        type="button"
        onClick={descargar}
        className="mt-3 w-full rounded-xl bg-alpha px-4 py-2.5 text-sm font-bold text-white transition hover:bg-alpha-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha focus-visible:ring-offset-2"
      >
        Descargar PNG
      </button>
    </li>
  );
}
