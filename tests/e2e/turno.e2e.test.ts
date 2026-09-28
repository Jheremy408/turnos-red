import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../../src/app.js";
import {
  limpiarEstadoDePrueba,
  restablecerEstadoDePrueba,
} from "../helpers/test-state.js";

describe("flujo E2E de turnos", () => {
  beforeAll(async () => {
    await restablecerEstadoDePrueba();
  });

  afterAll(async () => {
    await limpiarEstadoDePrueba();
  });

  it("ejecuta registro → login → crear → leer → actualizar → eliminar", async () => {
    const registro = await request(app).post("/auth/registro").send({
      email: "e2e@ejemplo.com",
      password: "password-segura-e2e",
    });
    expect(registro.status).toBe(201);

    const login = await request(app).post("/auth/login").send({
      email: "e2e@ejemplo.com",
      password: "password-segura-e2e",
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));

    const authorization = `Bearer ${String(login.body.token)}`;
    const turnoId = 700;

    const creacion = await request(app)
      .post("/turnos")
      .set("Authorization", authorization)
      .send({
        id: turnoId,
        paciente: "Paciente E2E",
        documento: "30111222",
        especialidad: "Pediatría",
        fecha: "2026-10-10",
        hora: "10:00",
        confirmado: true,
        medicoId: 2,
      });
    expect(creacion.status).toBe(201);

    const lectura = await request(app).get(`/turnos/${turnoId}`);
    expect(lectura.status).toBe(200);
    expect(lectura.body.id).toBe(turnoId);

    const actualizacion = await request(app)
      .put(`/turnos/${turnoId}`)
      .set("Authorization", authorization)
      .send({
        paciente: "Paciente E2E actualizado",
        documento: "30111222",
        especialidad: "Pediatría",
        fecha: "2026-10-11",
        hora: "11:00",
        confirmado: false,
        medicoId: 2,
      });
    expect(actualizacion.status).toBe(200);
    expect(actualizacion.body.paciente).toBe("Paciente E2E actualizado");

    const eliminacion = await request(app)
      .delete(`/turnos/${turnoId}`)
      .set("Authorization", authorization);
    expect(eliminacion.status).toBe(204);
  });
});
