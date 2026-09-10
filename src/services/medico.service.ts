import { AppError } from "../errors/app.error.js";
import type { Medico } from "../models/medico.model.js";

type FiltrosMedico = Partial<Pick<Medico, "especialidad" | "disponible">>;

const medicos: Medico[] = [
  {
    id: 1,
    nombre: "Ana Torres",
    especialidad: "Clínica médica",
    disponible: true,
  },
  {
    id: 2,
    nombre: "Carlos Rojas",
    especialidad: "Pediatría",
    disponible: true,
  },
  {
    id: 3,
    nombre: "Laura Muñoz",
    especialidad: "Odontología",
    disponible: false,
  },
  {
    id: 4,
    nombre: "Diego Soto",
    especialidad: "Nutrición",
    disponible: true,
  },
];

export function obtenerMedicos(filtros: FiltrosMedico = {}): Medico[] {
  return medicos.filter(
    (medico) =>
      (filtros.especialidad === undefined ||
        medico.especialidad === filtros.especialidad) &&
      (filtros.disponible === undefined ||
        medico.disponible === filtros.disponible),
  );
}

export function existeMedico(id: number): boolean {
  return medicos.some((medico) => medico.id === id);
}

export function obtenerMedicoPorId(id: number): Medico {
  const medico = medicos.find((registro) => registro.id === id);

  if (!medico) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  return medico;
}

export function crearMedico(nuevoMedico: Medico): Medico {
  const idExistente = medicos.some(
    (registro) => registro.id === nuevoMedico.id,
  );

  if (idExistente) {
    throw new AppError(
      400,
      "Ya existe un médico con el ID ingresado",
      "MEDICO_ID_ALREADY_EXISTS",
    );
  }

  medicos.push(nuevoMedico);

  return nuevoMedico;
}

export function actualizarMedico(id: number, datos: Medico): Medico {
  const indice = medicos.findIndex((registro) => registro.id === id);

  if (indice === -1) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  const medicoActualizado: Medico = { ...datos, id };
  medicos[indice] = medicoActualizado;

  return medicoActualizado;
}

export function eliminarMedico(id: number): void {
  const indice = medicos.findIndex((registro) => registro.id === id);

  if (indice === -1) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  medicos.splice(indice, 1);
}
