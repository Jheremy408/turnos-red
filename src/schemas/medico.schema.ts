import { z } from "zod";

import type { Medico } from "../models/medico.model.js";
import { especialidadSchema } from "./especialidad.schema.js";

const idSchema = z
  .number({ error: "El ID debe ser un número" })
  .int({ error: "El ID debe ser un entero" })
  .positive({ error: "El ID debe ser positivo" });

export const medicoSchema = z.strictObject({
  id: idSchema,
  nombre: z
    .string({ error: "El nombre debe ser un texto" })
    .trim()
    .min(1, { error: "El nombre es obligatorio" }),
  especialidad: especialidadSchema,
  disponible: z.boolean({ error: "Disponible debe ser booleano" }),
}) satisfies z.ZodType<Medico>;

export const medicoQuerySchema = z.strictObject({
  especialidad: especialidadSchema.optional(),
  disponible: z
    .enum(["true", "false"], {
      error: "Disponible debe ser true o false",
    })
    .transform((valor) => valor === "true")
    .optional(),
});

export function crearMedicoActualizacionSchema(idDeRuta: number) {
  return medicoSchema
    .extend({ id: idSchema.optional() })
    .refine((medico) => medico.id === undefined || medico.id === idDeRuta, {
      path: ["id"],
      message: "El ID del cuerpo debe coincidir con el ID de la ruta",
    });
}
