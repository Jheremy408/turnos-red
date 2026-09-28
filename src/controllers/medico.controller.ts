import type { Request, Response } from "express";

import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../errors/error-code.js";
import { logger } from "../config/logger.js";
import {
  crearMedicoActualizacionSchema,
  medicoQuerySchema,
  medicoSchema,
} from "../schemas/medico.schema.js";
import {
  actualizarMedico as actualizarMedicoEnServicio,
  crearMedico as crearMedicoEnServicio,
  eliminarMedico as eliminarMedicoEnServicio,
  obtenerMedicoPorId as obtenerMedicoPorIdEnServicio,
  obtenerMedicos as obtenerMedicosEnServicio,
} from "../services/medico.service.js";

export function obtenerMedicos(req: Request, res: Response) {
  const filtros = medicoQuerySchema.parse(req.query);

  res.status(200).json(obtenerMedicosEnServicio(filtros));
}

export function obtenerMedicoPorId(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);
  const medico = obtenerMedicoPorIdEnServicio(id);

  res.status(200).json(medico);
}

export function crearMedico(req: Request, res: Response) {
  const nuevoMedico = medicoSchema.parse(req.body);
  const medicoCreado = crearMedicoEnServicio(nuevoMedico);

  logger.info(
    {
      event: "medico_created",
      medicoId: medicoCreado.id,
      userId: req.user?.id,
    },
    "Médico creado",
  );

  res.status(201).json(medicoCreado);
}

export function actualizarMedico(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);
  const datosValidados = crearMedicoActualizacionSchema(id).parse(req.body);
  const datos = { ...datosValidados, id };
  const medicoActualizado = actualizarMedicoEnServicio(id, datos);

  logger.info(
    {
      event: "medico_updated",
      medicoId: medicoActualizado.id,
      userId: req.user?.id,
    },
    "Médico actualizado",
  );

  res.status(200).json(medicoActualizado);
}

export function eliminarMedico(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);

  eliminarMedicoEnServicio(id);

  logger.info(
    {
      event: "medico_deleted",
      medicoId: id,
      userId: req.user?.id,
    },
    "Médico eliminado",
  );

  res.status(204).send();
}

function obtenerIdValido(valor: string | string[] | undefined): number {
  if (typeof valor !== "string" || !/^\d+$/.test(valor)) {
    throw new AppError(
      400,
      "El ID debe ser un entero positivo",
      ERROR_CODES.INVALID_ID,
    );
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(
      400,
      "El ID debe ser un entero positivo",
      ERROR_CODES.INVALID_ID,
    );
  }

  return id;
}
