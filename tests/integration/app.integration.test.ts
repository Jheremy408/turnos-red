import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../../src/app.js";
import {
  limpiarEstadoDePrueba,
  restablecerEstadoDePrueba,
} from "../helpers/test-state.js";

describe("integración HTTP", () => {
  beforeEach(async () => {
    await restablecerEstadoDePrueba();
  });

  afterAll(async () => {
    await limpiarEstadoDePrueba();
  });

  it("responde 201 al registrar datos válidos", async () => {
    const response = await request(app).post("/auth/registro").send({
      email: "integracion@ejemplo.com",
      password: "password-segura",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      email: "integracion@ejemplo.com",
      rol: "usuario",
    });
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("responde 400 VALIDATION_ERROR con datos malformados", async () => {
    const response = await request(app).post("/auth/registro").send({
      email: "email-invalido",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
    });
    expect(response.body.details).toBeInstanceOf(Array);
  });

  it("responde 401 AUTH_TOKEN_MISSING en una escritura sin JWT", async () => {
    const response = await request(app).post("/turnos").send({
      id: 500,
      paciente: "Paciente sin token",
      documento: "12345678",
      especialidad: "Pediatría",
      fecha: "2026-10-01",
      hora: "09:00",
      confirmado: true,
      medicoId: 2,
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      status: 401,
      code: "AUTH_TOKEN_MISSING",
      details: [],
    });
  });
});
