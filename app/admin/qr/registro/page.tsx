"use client";

import QrProyeccion from "@/components/admin/QrProyeccion";
import { REGISTRO_URL } from "@/lib/qr";

export default function QrRegistroPage() {
  return <QrProyeccion arriba="Regístrate en Alpha" abajo="Escanea el código con tu celular" url={REGISTRO_URL} />;
}
