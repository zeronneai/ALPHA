"use client";

import { useParams } from "next/navigation";
import Cargando from "@/components/admin/Cargando";
import QrProyeccion from "@/components/admin/QrProyeccion";
import SesionInvalida from "@/components/admin/SesionInvalida";
import { useOrigen } from "@/components/admin/useOrigen";
import { getSesion } from "@/lib/sesiones";
import { evaluacionUrl } from "@/lib/qr";

export default function QrSesionPage() {
  const { sesion: valor } = useParams<{ sesion: string }>();
  const sesion = getSesion(valor);
  const origen = useOrigen();

  if (!sesion) return <SesionInvalida volverA="/admin/qr" />;
  if (!origen) return <Cargando />;
  return (
    <QrProyeccion
      arriba="¿Cómo estuvo la sesión de hoy?"
      abajo={`Escanea y cuéntanos · Sesión ${sesion.numero}`}
      url={evaluacionUrl(origen, sesion.numero)}
    />
  );
}
