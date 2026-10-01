import { z } from "zod";

export const OPCIONES_ORIGEN = [
  "Un amigo o familiar",
  "Redes sociales",
  "Iglesia",
  "Evento",
  "Otro",
] as const;

const hoy = () => new Date().toISOString().slice(0, 10);

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
      .refine((v) => /^\d+$/.test(v), "Escribe solo números")
      .refine((v) => Number(v) >= 12 && Number(v) <= 30, "La edad debe estar entre 12 y 30 años"),
    telefono: z
      .string()
      .min(1, "Escribe tu teléfono")
      .refine((v) => v.replace(/\D/g, "").length === 10, "Ingresa un teléfono de 10 dígitos"),
    fecha_nacimiento: z
      .string()
      .min(1, "Selecciona tu fecha de cumpleaños")
      .refine((v) => v >= "1900-01-01" && v <= hoy(), "Selecciona una fecha válida"),
    como_se_entero: z
      .string()
      .min(1, "Selecciona una opción")
      .refine((v) => (OPCIONES_ORIGEN as readonly string[]).includes(v), "Selecciona una opción"),
    como_se_entero_otro: z.string().trim().max(120, "Máximo 120 caracteres").optional(),
  })
  .superRefine((d, ctx) => {
    if (d.como_se_entero === "Otro" && !d.como_se_entero_otro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["como_se_entero_otro"],
        message: "Cuéntanos cómo te enteraste",
      });
    }
  });

export type RegistroFormValues = z.infer<typeof registroSchema>;
