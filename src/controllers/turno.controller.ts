import { turnoEvents } from "../events/turno.events.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../errors/error-code.js";
import { logger } from "../config/logger.js";
import type { Request, Response } from "express";
import type { Turno } from "../models/turno.model.js";
import {
  crearTurnoActualizacionSchema,
  turnoQuerySchema,
  turnoSchema,
} from "../schemas/turno.schema.js";
import {
  filtrarTurnos,
  validarMedicoAsignado,
} from "../services/turno.service.js";

let turnos: Turno[] = [];

export function establecerTurnos(datos: Turno[]) {
  turnos = datos;
}

export function obtenerTurnos(req: Request, res: Response) {
  const filtros = turnoQuerySchema.parse(req.query);

  res.status(200).json(filtrarTurnos(turnos, filtros));
}

export function obtenerTurnoPorId(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);

  const turno = turnos.find((t) => t.id === id);

  if (!turno) {
    throw new AppError(
      404,
      "Turno no encontrado",
      ERROR_CODES.RESOURCE_NOT_FOUND,
    );
  }

  res.status(200).json(turno);
}

export function crearTurno(req: Request, res: Response) {
  const nuevoTurno = turnoSchema.parse(req.body);

  validarMedicoAsignado(nuevoTurno.medicoId);

  const existe = turnos.some((t) => t.id === nuevoTurno.id);

  if (existe) {
    throw new AppError(
      409,
      "Ya existe un turno con el ID ingresado",
      ERROR_CODES.RESOURCE_CONFLICT,
    );
  }

  turnos.push(nuevoTurno);

  turnoEvents.emit("turno:creado", nuevoTurno);

  logger.info(
    {
      event: "turno_created",
      turnoId: nuevoTurno.id,
      userId: req.user?.id,
    },
    "Turno creado",
  );

  res.status(201).json(nuevoTurno);
}

export function actualizarTurno(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);
  const datos = crearTurnoActualizacionSchema(id).parse(req.body);

  validarMedicoAsignado(datos.medicoId);

  const indice = turnos.findIndex((t) => t.id === id);

  if (indice === -1) {
    throw new AppError(
      404,
      "Turno no encontrado",
      ERROR_CODES.RESOURCE_NOT_FOUND,
    );
  }

  const actualizado: Turno = { ...datos, id };

  turnos[indice] = actualizado;

  turnoEvents.emit("turno:actualizado", actualizado);

  logger.info(
    {
      event: "turno_updated",
      turnoId: actualizado.id,
      userId: req.user?.id,
    },
    "Turno actualizado",
  );

  res.status(200).json(actualizado);
}

export function eliminarTurno(req: Request, res: Response) {
  const id = obtenerIdValido(req.params.id);

  const indice = turnos.findIndex((t) => t.id === id);

  if (indice === -1) {
    throw new AppError(
      404,
      "Turno no encontrado",
      ERROR_CODES.RESOURCE_NOT_FOUND,
    );
  }

  const eliminado = turnos.splice(indice, 1)[0];

  turnoEvents.emit("turno:eliminado", eliminado);

  logger.info(
    {
      event: "turno_deleted",
      turnoId: id,
      userId: req.user?.id,
    },
    "Turno eliminado",
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
