import { readFile } from "node:fs/promises";

import type { Turno, TurnoCrudo } from "../models/turno.model.js";
import { normalizarTurno } from "../utils/normalizarTurno.js";

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

    console.log(`Registros aceptados: ${aceptados}`);
    console.log(`Registros rechazados: ${rechazados}`);

    return turnos;
  } catch (error) {
    console.error("Error al leer o procesar turnos.json:", error);
    throw error;
  }
}
