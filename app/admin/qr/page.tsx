"use client";

import QrTarjeta from "@/components/admin/QrTarjeta";
import Cargando from "@/components/admin/Cargando";
import { useOrigen } from "@/components/admin/useOrigen";
import { SESIONES } from "@/lib/sesiones";
import { REGISTRO_URL, evaluacionUrl } from "@/lib/qr";

export default function AdminQrPage() {
  const origen = useOrigen();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-neutral-900">QRs</h1>
      {!origen ? (
        <Cargando />
      ) : (
        <>
          <ul>
            <QrTarjeta
              destacada
              titulo="Registro en Alpha"
              url={REGISTRO_URL}
              textoPng="Regístrate en Alpha"
              archivo="alpha-qr-registro.png"
              proyectarHref="/admin/qr/registro"
            />
          </ul>
          <h2 className="text-lg font-extrabold text-neutral-900">Evaluación de cada sesión</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SESIONES.map((s) => (
              <QrTarjeta
                key={s.numero}
                titulo={s.titulo}
                url={evaluacionUrl(origen, s.numero)}
                textoPng={`Evaluación · Sesión ${s.numero}`}
                archivo={`alpha-qr-evaluacion-sesion-${s.numero}.png`}
                proyectarHref={`/admin/qr/${s.numero}`}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
