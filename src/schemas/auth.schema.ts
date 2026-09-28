import { z } from "zod";

const emailSchema = z
  .string({ error: "El email debe ser un texto" })
  .trim()
  .email({ error: "El email no es válido" })
  .transform((email) => email.toLowerCase());

export const registroSchema = z.strictObject({
  email: emailSchema,
  password: z
    .string({ error: "La contraseña debe ser un texto" })
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres" }),
});

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z
    .string({ error: "La contraseña debe ser un texto" })
    .min(1, { error: "La contraseña es obligatoria" }),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
