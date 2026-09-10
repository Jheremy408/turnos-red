import { z } from "zod";

export const ESPECIALIDADES = [
  "Clínica médica",
  "Pediatría",
  "Odontología",
  "Nutrición",
] as const;

export const especialidadSchema = z.enum(ESPECIALIDADES, {
  error: "La especialidad no es válida",
});
