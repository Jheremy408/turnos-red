import { turnoEvents } from "../events/turno.events.js";
import type { Request, Response } from "express";
import type { Turno } from "../models/turno.model.js";

let turnos: Turno[] = [];

export function establecerTurnos(datos: Turno[]) {
  turnos = datos;
}

export function obtenerTurnos(_req: Request, res: Response) {
  res.status(200).json(turnos);
}

export function obtenerTurnoPorId(req: Request, res: Response) {
  const id = Number(req.params.id);

  const turno = turnos.find((t) => t.id === id);

  if (!turno) {
    return res.status(404).json({ mensaje: "Turno no encontrado" });
  }

  res.status(200).json(turno);
}

export function crearTurno(req: Request, res: Response) {
  const nuevoTurno = req.body as Turno;

  if (
    !nuevoTurno.id ||
    !nuevoTurno.paciente ||
    !nuevoTurno.documento ||
    !nuevoTurno.especialidad ||
    !nuevoTurno.fecha ||
    !nuevoTurno.hora
  ) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }

  const existe = turnos.some((t) => t.id === nuevoTurno.id);

  if (existe) {
    return res.status(400).json({ mensaje: "El ID ya existe" });
  }

  turnos.push(nuevoTurno);

  turnoEvents.emit("turno:creado", nuevoTurno);

  res.status(201).json(nuevoTurno);
}

export function actualizarTurno(req: Request, res: Response) {
  const id = Number(req.params.id);

  const indice = turnos.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: "Turno no encontrado" });
  }

  const actualizado: Turno = {
    ...turnos[indice],
    ...req.body,
    id,
  };

  turnos[indice] = actualizado;

  turnoEvents.emit("turno:actualizado", actualizado);

  res.status(200).json(actualizado);
}

export function eliminarTurno(req: Request, res: Response) {
  const id = Number(req.params.id);

  const indice = turnos.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ mensaje: "Turno no encontrado" });
  }

  const eliminado = turnos.splice(indice, 1)[0];

  turnoEvents.emit("turno:eliminado", eliminado);

  res.status(200).json(eliminado);
}
