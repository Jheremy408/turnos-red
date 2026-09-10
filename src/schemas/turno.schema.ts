import { z } from "zod";

import type { Turno } from "../models/turno.model.js";
import { especialidadSchema } from "./especialidad.schema.js";

const idSchema = z
  .number({ error: "El ID debe ser un número" })
  .int({ error: "El ID debe ser un entero" })
  .positive({ error: "El ID debe ser positivo" });

function esFechaValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  return (
    !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor)
  );
}

export const turnoSchema = z.strictObject({
  id: idSchema,
  paciente: z
    .string({ error: "El paciente debe ser un texto" })
    .trim()
    .min(1, { error: "El paciente es obligatorio" }),
  documento: z
    .string({ error: "El documento debe ser un texto" })
    .trim()
    .min(1, { error: "El documento es obligatorio" }),
  especialidad: especialidadSchema,
  fecha: z
    .string({ error: "La fecha debe ser un texto" })
    .refine(esFechaValida, {
      error: "La fecha debe tener formato YYYY-MM-DD y ser válida",
    }),
  hora: z
    .string({ error: "La hora debe ser un texto" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
      error: "La hora debe tener formato HH:mm y ser válida",
    }),
  confirmado: z.boolean({ error: "Confirmado debe ser booleano" }),
  medicoId: idSchema,
  observaciones: z
    .string({ error: "Las observaciones deben ser un texto" })
    .optional(),
}) satisfies z.ZodType<Turno>;

export const turnoQuerySchema = z.strictObject({
  especialidad: especialidadSchema.optional(),
  fecha: z
    .string({ error: "La fecha debe ser un texto" })
    .refine(esFechaValida, {
      error: "La fecha debe tener formato YYYY-MM-DD y ser válida",
    })
    .optional(),
  medicoId: z
    .string({ error: "medicoId debe ser un entero positivo" })
    .regex(/^\d+$/, { error: "medicoId debe ser un entero positivo" })
    .transform(Number)
    .refine((id) => Number.isSafeInteger(id) && id > 0, {
      error: "medicoId debe ser un entero positivo",
    })
    .optional(),
});

export function crearTurnoActualizacionSchema(idDeRuta: number) {
  return turnoSchema
    .extend({ id: idSchema.optional() })
    .refine((turno) => turno.id === undefined || turno.id === idDeRuta, {
      path: ["id"],
      message: "El ID del cuerpo debe coincidir con el ID de la ruta",
    });
}
