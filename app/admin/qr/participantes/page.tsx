"use client";

import Cargando from "@/components/admin/Cargando";
import QrProyeccion from "@/components/admin/QrProyeccion";
import { useOrigen } from "@/components/admin/useOrigen";

export default function QrParticipantesPage() {
  const origen = useOrigen();
  if (!origen) return <Cargando />;
  return <QrProyeccion arriba="Entra al portal de participantes" abajo="Escanea el código con tu celular" url={`${origen}/participantes`} />;
}
