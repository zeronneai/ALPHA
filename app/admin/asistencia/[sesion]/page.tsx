"use client";

import { useParams } from "next/navigation";
import AsistenciaLista from "@/components/admin/AsistenciaLista";
import SesionInvalida from "@/components/admin/SesionInvalida";
import { getSesion } from "@/lib/sesiones";

export default function AsistenciaSesionPage() {
  const { sesion: valor } = useParams<{ sesion: string }>();
  const sesion = getSesion(valor);
  if (!sesion) return <SesionInvalida volverA="/admin/asistencia" />;
  return <AsistenciaLista sesion={sesion} />;
}
