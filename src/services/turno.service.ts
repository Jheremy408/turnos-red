import { readFile } from "node:fs/promises";

import type { Turno, TurnoCrudo } from "../models/turno.model.js";
import { normalizarTurno } from "../utils/normalizarTurno.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../errors/error-code.js";
import { logger } from "../config/logger.js";
import { existeMedico } from "./medico.service.js";

type FiltrosTurno = Partial<Pick<Turno, "especialidad" | "fecha" | "medicoId">>;

export function filtrarTurnos(turnos: Turno[], filtros: FiltrosTurno): Turno[] {
  return turnos.filter(
    (turno) =>
      (filtros.especialidad === undefined ||
        turno.especialidad === filtros.especialidad) &&
      (filtros.fecha === undefined || turno.fecha === filtros.fecha) &&
      (filtros.medicoId === undefined || turno.medicoId === filtros.medicoId),
  );
}

export function validarMedicoAsignado(medicoId: number): void {
  if (!existeMedico(medicoId)) {
    throw new AppError(
      404,
      "El médico indicado no existe",
      ERROR_CODES.RESOURCE_NOT_FOUND,
      [
        {
          field: "medicoId",
          message: "medicoId debe corresponder a un médico existente",
        },
      ],
    );
  }
}

export async function cargarTurnos(ruta: string): Promise<Turno[]> {
  try {
    const contenido = await readFile(ruta, "utf-8");

    const datos: unknown = JSON.parse(contenido);

    if (!Array.isArray(datos)) {
      throw new Error("El archivo turnos.json debe contener un arreglo.");
    }

    const turnos: Turno[] = [];
    let aceptados = 0;
    let rechazados = 0;

    for (const dato of datos) {
      const turno = normalizarTurno(dato as TurnoCrudo);

      if (turno) {
        turnos.push(turno);
        aceptados++;
      } else {
        rechazados++;
      }
    }

    logger.info(
      {
        event: "turnos_loaded",
        acceptedCount: aceptados,
        rejectedCount: rechazados,
      },
      "Carga inicial de turnos completada",
    );

    return turnos;
  } catch (error) {
    logger.error(
      {
        event: "turnos_load_failed",
        err: error,
      },
      "Error al leer o procesar turnos.json",
    );
    throw error;
  }
}
