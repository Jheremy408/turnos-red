import { readFile } from "node:fs/promises";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { ERROR_CODES } from "../../src/errors/error-code.js";
import type { Turno } from "../../src/models/turno.model.js";
import { existeMedico } from "../../src/services/medico.service.js";
import {
  cargarTurnos,
  filtrarTurnos,
  validarMedicoAsignado,
} from "../../src/services/turno.service.js";

jest.mock("node:fs/promises");
jest.mock("../../src/services/medico.service.js", () => ({
  existeMedico: jest.fn(),
}));

const readFileMock = jest.mocked(readFile);
const existeMedicoMock = jest.mocked(existeMedico);

const TURNOS: Turno[] = [
  {
    id: 1,
    paciente: "Paciente Uno",
    documento: "11111111",
    especialidad: "Pediatría",
    fecha: "2026-10-01",
    hora: "09:00",
    confirmado: true,
    medicoId: 2,
  },
  {
    id: 2,
    paciente: "Paciente Dos",
    documento: "22222222",
    especialidad: "Nutrición",
    fecha: "2026-10-02",
    hora: "10:00",
    confirmado: false,
    medicoId: 4,
  },
];

describe("turno.service", () => {
  beforeEach(() => {
    readFileMock.mockReset();
    existeMedicoMock.mockReset();
  });

  it("rechaza un médico inexistente antes de aceptar la operación", () => {
    existeMedicoMock.mockReturnValue(false);

    expect(() => validarMedicoAsignado(999)).toThrow(
      expect.objectContaining({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
      }),
    );
    expect(existeMedicoMock).toHaveBeenCalledWith(999);
  });

  it("acepta la precondición cuando el médico existe", () => {
    existeMedicoMock.mockReturnValue(true);

    expect(() => validarMedicoAsignado(2)).not.toThrow();
  });

  it("combina los filtros del servicio", () => {
    expect(
      filtrarTurnos(TURNOS, {
        especialidad: "Pediatría",
        fecha: "2026-10-01",
        medicoId: 2,
      }),
    ).toEqual([TURNOS[0]]);
  });

  it("normaliza registros válidos y descarta registros inválidos al cargar", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify([
        {
          id: "10",
          paciente: "Paciente Cargado",
          documento: 12345678,
          especialidad: "PEDIATRÍA",
          fecha: "01/10/2026",
          hora: "9:30",
          confirmado: "si",
        },
        {
          id: -1,
          paciente: "",
          documento: "",
          especialidad: "Nutrición",
          fecha: "01/10/2026",
          hora: "10:00",
          confirmado: "no",
        },
      ]),
    );

    await expect(cargarTurnos("archivo-de-prueba.json")).resolves.toEqual([
      expect.objectContaining({
        id: 10,
        documento: "12345678",
        especialidad: "Pediatría",
        medicoId: 2,
      }),
    ]);
  });
});
