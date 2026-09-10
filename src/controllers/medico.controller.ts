import type { Request, Response } from "express";

import { AppError } from "../errors/app.error.js";
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

  res.status(201).json(medicoCreado);
}

export function actualizarMedico(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);
  const datosValidados = crearMedicoActualizacionSchema(id).parse(req.body);
  const datos = { ...datosValidados, id };
  const medicoActualizado = actualizarMedicoEnServicio(id, datos);

  res.status(200).json(medicoActualizado);
}

export function eliminarMedico(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);

  eliminarMedicoEnServicio(id);

  res.status(204).send();
}

function obtenerIdValido(valor: string | string[] | undefined): number {
  if (typeof valor !== "string" || !/^\d+$/.test(valor)) {
    throw new AppError(400, "El ID debe ser un entero positivo", "INVALID_ID");
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(400, "El ID debe ser un entero positivo", "INVALID_ID");
  }

  return id;
}
