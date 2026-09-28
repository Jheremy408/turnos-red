import { rm, writeFile } from "node:fs/promises";

import { establecerTurnos } from "../../src/controllers/turno.controller.js";
import type { Medico } from "../../src/models/medico.model.js";
import { establecerMedicos } from "../../src/services/medico.service.js";

const MEDICOS_DE_PRUEBA: Medico[] = [
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
];

export async function restablecerEstadoDePrueba(): Promise<void> {
  establecerTurnos([]);
  establecerMedicos(MEDICOS_DE_PRUEBA);
  await writeFile(obtenerRutaUsuarios(), "[]\n", "utf-8");
}

export async function limpiarEstadoDePrueba(): Promise<void> {
  establecerTurnos([]);
  establecerMedicos(MEDICOS_DE_PRUEBA);
  await rm(obtenerRutaUsuarios(), { force: true });
}

function obtenerRutaUsuarios(): string {
  const ruta = process.env.USERS_DATA_PATH;

  if (!ruta) {
    throw new Error("USERS_DATA_PATH no está configurada para las pruebas");
  }

  return ruta;
}
