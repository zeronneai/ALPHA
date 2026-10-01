import { z } from "zod";

export const OPCIONES_ORIGEN = [
  "Un amigo o familiar",
  "Redes sociales",
  "Iglesia",
  "Evento",
  "Otro",
] as const;

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

/** Días máximos por mes (Febrero permite 29 por los años bisiestos). */
export const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const registroSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "Escribe tu nombre completo")
      .min(3, "El nombre es muy corto")
      .refine((v) => v.split(/\s+/).length >= 2, "Escribe tu nombre y apellido"),
    edad: z
      .string()
      .min(1, "Escribe tu edad")
      .refine((v) => /^\d+$/.test(v) && Number(v) > 0, "Escribe un número entero mayor a 0"),
    telefono: z
      .string()
      .min(1, "Escribe tu teléfono")
      .refine((v) => v.replace(/\D/g, "").length === 10, "Ingresa un teléfono de 10 dígitos"),
    dia: z.string().min(1, "Selecciona el día"),
    mes: z.string().min(1, "Selecciona el mes"),
    como_se_entero: z
      .string()
      .min(1, "Selecciona una opción")
      .refine((v) => (OPCIONES_ORIGEN as readonly string[]).includes(v), "Selecciona una opción"),
    como_se_entero_otro: z.string().trim().max(120, "Máximo 120 caracteres").optional(),
  })
  .superRefine((d, ctx) => {
    if (d.dia && d.mes && Number(d.dia) > DIAS_POR_MES[Number(d.mes) - 1]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dia"],
        message: `${MESES[Number(d.mes) - 1]} tiene máximo ${DIAS_POR_MES[Number(d.mes) - 1]} días`,
      });
    }
    if (d.como_se_entero === "Otro" && !d.como_se_entero_otro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["como_se_entero_otro"],
        message: "Cuéntanos cómo te enteraste",
      });
    }
  });

export type RegistroFormValues = z.infer<typeof registroSchema>;
