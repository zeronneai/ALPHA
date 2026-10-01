/** Link de invitación al grupo de WhatsApp de Alpha. Reemplaza el texto con el link real. */
export const WHATSAPP_GROUP_LINK: string = "PEGA_AQUI_EL_LINK";

/** Mientras el link siga siendo el de ejemplo, los botones de invitación se ocultan. */
export const WHATSAPP_GROUP_CONFIGURADO: boolean =
  WHATSAPP_GROUP_LINK.trim() !== "" && WHATSAPP_GROUP_LINK !== "PEGA_AQUI_EL_LINK";
