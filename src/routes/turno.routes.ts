import { Router } from "express";
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
} from "../controllers/turno.controller.js";

const router = Router();

/**
 * @openapi
 * /turnos:
 *   get:
 *     summary: Listar turnos
 *     description: Devuelve los turnos en memoria y permite combinar los filtros implementados.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: string
 *           enum: [Clínica médica, Pediatría, Odontología, Nutrición]
 *         description: Especialidad exacta del turno.
 *         example: Pediatría
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Fecha válida en formato YYYY-MM-DD.
 *         example: '2026-08-14'
 *       - in: query
 *         name: medicoId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del médico asignado.
 *         example: 2
 *     responses:
 *       '200':
 *         description: Lista de turnos. Puede ser un arreglo vacío.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turno'
 *       '400':
 *         description: Query parameters inválidos o desconocidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Crear un turno
 *     description: Crea un turno en memoria y notifica su creación mediante el flujo de eventos existente.
 *     tags:
 *       - Turnos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Turno'
 *           example:
 *             id: 201
 *             paciente: María Pérez
 *             documento: '31654210'
 *             especialidad: Pediatría
 *             fecha: '2026-08-14'
 *             hora: '10:30'
 *             confirmado: true
 *             medicoId: 2
 *             observaciones: Control anual
 *     responses:
 *       '201':
 *         description: Turno creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       '400':
 *         description: Cuerpo inválido, ID duplicado o médico inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/turnos", obtenerTurnos);

/**
 * @openapi
 * /turnos/{id}:
 *   get:
 *     summary: Obtener un turno por ID
 *     tags:
 *       - Turnos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del turno.
 *         example: 101
 *     responses:
 *       '200':
 *         description: Turno encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       '400':
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Turno no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Reemplazar un turno
 *     description: Reemplaza completamente un turno. El ID del cuerpo es opcional; si se incluye, debe coincidir con el ID de la ruta.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del turno.
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoActualizacion'
 *           example:
 *             paciente: María Pérez
 *             documento: '31654210'
 *             especialidad: Pediatría
 *             fecha: '2026-08-15'
 *             hora: '11:00'
 *             confirmado: false
 *             medicoId: 2
 *             observaciones: Horario actualizado
 *     responses:
 *       '200':
 *         description: Turno reemplazado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       '400':
 *         description: ID o cuerpo inválido, o médico inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Turno no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Eliminar un turno
 *     tags:
 *       - Turnos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del turno.
 *         example: 101
 *     responses:
 *       '204':
 *         description: Turno eliminado. La respuesta no contiene cuerpo.
 *       '400':
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Turno no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/turnos/:id", obtenerTurnoPorId);
router.post("/turnos", crearTurno);
router.put("/turnos/:id", actualizarTurno);
router.delete("/turnos/:id", eliminarTurno);

export default router;
