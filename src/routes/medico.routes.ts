import { Router } from "express";

import {
  actualizarMedico,
  crearMedico,
  eliminarMedico,
  obtenerMedicoPorId,
  obtenerMedicos,
} from "../controllers/medico.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /medicos:
 *   get:
 *     summary: Listar médicos
 *     description: Devuelve los médicos en memoria y permite combinar los filtros implementados.
 *     tags:
 *       - Médicos
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: string
 *           enum: [Clínica médica, Pediatría, Odontología, Nutrición]
 *         description: Especialidad exacta del médico.
 *         example: Odontología
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Se recibe como el texto "true" o "false" y se transforma internamente a booleano.
 *         example: 'true'
 *     responses:
 *       '200':
 *         description: Lista de médicos. Puede ser un arreglo vacío.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medico'
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
 *     summary: Crear un médico
 *     tags:
 *       - Médicos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medico'
 *           example:
 *             id: 5
 *             nombre: Laura Fernández
 *             especialidad: Nutrición
 *             disponible: true
 *     responses:
 *       '201':
 *         description: Médico creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       '400':
 *         description: Cuerpo inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '409':
 *         $ref: '#/components/responses/ResourceConflict'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/medicos", obtenerMedicos);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     summary: Obtener un médico por ID
 *     tags:
 *       - Médicos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del médico.
 *         example: 2
 *     responses:
 *       '200':
 *         description: Médico encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       '400':
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         $ref: '#/components/responses/ResourceNotFound'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Reemplazar un médico
 *     description: Reemplaza completamente un médico. El ID del cuerpo es opcional; si se incluye, debe coincidir con el ID de la ruta.
 *     tags:
 *       - Médicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del médico.
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoActualizacion'
 *           example:
 *             nombre: Carlos Rojas
 *             especialidad: Pediatría
 *             disponible: false
 *     responses:
 *       '200':
 *         description: Médico reemplazado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       '400':
 *         description: ID o cuerpo inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/ResourceNotFound'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Eliminar un médico
 *     tags:
 *       - Médicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identificador entero positivo del médico.
 *         example: 2
 *     responses:
 *       '204':
 *         description: Médico eliminado. La respuesta no contiene cuerpo.
 *       '400':
 *         description: ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/ResourceNotFound'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/medicos/:id", obtenerMedicoPorId);
router.post("/medicos", verificarToken, crearMedico);
router.put("/medicos/:id", verificarToken, actualizarMedico);
router.delete("/medicos/:id", verificarToken, eliminarMedico);

export default router;
