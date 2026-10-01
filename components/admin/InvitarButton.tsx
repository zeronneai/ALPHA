"use client";

import { useAdminData } from "./AdminDataProvider";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_GROUP_CONFIGURADO } from "@/lib/config";
import { invitacionUrl } from "@/lib/admin/invitacion";
import type { RegistroRow } from "@/types/admin";

export const AVISO_INVITACION = "Se abrió WhatsApp, pero no se pudo guardar que ya se invitó.";

type Props = {
  registro: RegistroRow;
  /** Se llama si no se pudo guardar invitado_whatsapp (la fila puede haberse desmontado, por eso el aviso lo muestra quien la contiene). */
  onError?: () => void;
  /** "texto": botón verde chico con etiqueta; "grande": igual pero a todo lo ancho; "icono": solo el ícono. */
  variante?: "texto" | "icono" | "grande";
  etiqueta?: string;
};

/**
 * Abre WhatsApp con el mensaje de invitación y marca a la persona como invitada.
 * Es un enlace real (target _blank), así el navegador no lo bloquea como ventana emergente.
 */
export default function InvitarButton({ registro, onError, variante = "texto", etiqueta = "Invitar" }: Props) {
  const { marcarInvitado } = useAdminData();
  if (!WHATSAPP_GROUP_CONFIGURADO) return null;

  const alHacerClic = () => {
    marcarInvitado(registro.id).catch(() => onError?.());
  };

  const base =
    "inline-flex items-center justify-center gap-1.5 bg-[#15803D] font-bold text-white transition hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2";

  return (
    <a
      href={invitacionUrl(registro.telefono, registro.nombre)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={alHacerClic}
      aria-label={variante === "icono" ? `Invitar a ${registro.nombre} al grupo de WhatsApp` : undefined}
      title={variante === "icono" ? "Invitar al grupo de WhatsApp" : undefined}
      className={
        variante === "icono"
          ? `${base} h-11 w-11 shrink-0 rounded-full`
          : variante === "grande"
            ? `${base} w-full rounded-xl px-4 py-3 text-base`
            : `${base} rounded-lg px-3 py-1.5 text-sm`
      }
    >
      <WhatsAppIcon className={variante === "icono" ? "h-6 w-6" : variante === "grande" ? "h-5 w-5" : "h-4 w-4"} />
      {variante !== "icono" && etiqueta}
    </a>
  );
}
