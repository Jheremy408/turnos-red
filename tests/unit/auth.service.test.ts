import { readFile, writeFile } from "node:fs/promises";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";

import { ERROR_CODES } from "../../src/errors/error-code.js";
import {
  autenticarUsuario,
  registrarUsuario,
} from "../../src/services/auth.service.js";

jest.mock("node:fs/promises");
jest.mock("bcryptjs");

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const hashMock = jest.mocked(bcrypt.hash);
const compareMock = jest.mocked(bcrypt.compare);

describe("auth.service", () => {
  beforeEach(() => {
    readFileMock.mockReset();
    writeFileMock.mockReset();
    hashMock.mockReset();
    compareMock.mockReset();
  });

  it("rechaza un registro duplicado sin volver a cifrar ni persistir", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          email: "usuario@ejemplo.com",
          passwordHash: "$2b$10$hash-existente",
          rol: "usuario",
        },
      ]),
    );

    const operacion = registrarUsuario({
      email: "usuario@ejemplo.com",
      password: "password-segura",
    });

    await expect(operacion).rejects.toMatchObject({
      status: 409,
      code: ERROR_CODES.RESOURCE_CONFLICT,
    });
    expect(hashMock).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it("rechaza una contraseña incorrecta con un mensaje genérico", async () => {
    readFileMock.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          email: "usuario@ejemplo.com",
          passwordHash: "$2b$10$hash-existente",
          rol: "usuario",
        },
      ]),
    );
    compareMock.mockResolvedValue(false);

    const operacion = autenticarUsuario({
      email: "usuario@ejemplo.com",
      password: "password-incorrecta",
    });

    await expect(operacion).rejects.toMatchObject({
      status: 401,
      code: ERROR_CODES.AUTH_CREDENTIALS_INVALID,
      message: "Credenciales inválidas",
    });
    expect(compareMock).toHaveBeenCalledTimes(1);
  });

  it("aborta el registro cuando falla la persistencia", async () => {
    readFileMock.mockResolvedValue("[]");
    hashMock.mockResolvedValue("$2b$10$hash-generado");
    writeFileMock.mockRejectedValue(new Error("fallo de escritura controlado"));

    await expect(
      registrarUsuario({
        email: "nuevo@ejemplo.com",
        password: "password-segura",
      }),
    ).rejects.toThrow("fallo de escritura controlado");

    expect(hashMock).toHaveBeenCalledTimes(1);
    expect(writeFileMock).toHaveBeenCalledTimes(1);
  });
});
