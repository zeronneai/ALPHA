import { WHATSAPP_GROUP_LINK } from "@/lib/config";
import { soloDigitos } from "@/lib/admin/formato";

/** Teléfono para wa.me: solo dígitos y con lada 52 (sin duplicarla si ya la trae). */
export function telefonoParaWhatsapp(telefono: string): string {
  const d = soloDigitos(telefono);
  return d.length === 12 && d.startsWith("52") ? d : `52${d}`;
}

export function mensajeInvitacion(nombre: string): string {
  const primerNombre = nombre.trim().split(/\s+/)[0] ?? "";
  return `¡Hola ${primerNombre}! Qué gusto que estés en Alpha 🙌 Únete a nuestro grupo de WhatsApp para enterarte de todo: ${WHATSAPP_GROUP_LINK}`;
}

export function invitacionUrl(telefono: string, nombre: string): string {
  return `https://wa.me/${telefonoParaWhatsapp(telefono)}?text=${encodeURIComponent(mensajeInvitacion(nombre))}`;
}
