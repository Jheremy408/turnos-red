import { beforeEach, describe, expect, it } from "@jest/globals";

import { ERROR_CODES } from "../../src/errors/error-code.js";
import type { Medico } from "../../src/models/medico.model.js";
import {
  actualizarMedico,
  crearMedico,
  eliminarMedico,
  establecerMedicos,
  obtenerMedicos,
} from "../../src/services/medico.service.js";

const MEDICOS: Medico[] = [
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

describe("medico.service", () => {
  beforeEach(() => {
    establecerMedicos(MEDICOS);
  });

  it("rechaza una creación duplicada sin modificar el estado", () => {
    expect(() => crearMedico({ ...MEDICOS[0]! })).toThrow(
      expect.objectContaining({
        status: 409,
        code: ERROR_CODES.RESOURCE_CONFLICT,
      }),
    );
    expect(obtenerMedicos()).toHaveLength(2);
  });

  it("rechaza la actualización de un médico inexistente", () => {
    expect(() =>
      actualizarMedico(999, {
        id: 999,
        nombre: "Médico inexistente",
        especialidad: "Nutrición",
        disponible: true,
      }),
    ).toThrow(
      expect.objectContaining({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
      }),
    );
  });

  it("crea, actualiza y elimina un médico válido", () => {
    crearMedico({
      id: 3,
      nombre: "Laura Muñoz",
      especialidad: "Odontología",
      disponible: false,
    });
    actualizarMedico(3, {
      id: 3,
      nombre: "Laura Muñoz",
      especialidad: "Odontología",
      disponible: true,
    });

    expect(obtenerMedicos({ disponible: true })).toHaveLength(3);

    eliminarMedico(3);
    expect(obtenerMedicos()).toHaveLength(2);
  });
});
