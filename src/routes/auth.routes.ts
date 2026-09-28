import { Router } from "express";

import {
  iniciarSesion,
  registrarUsuario,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";

const router = Router();

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     summary: Registrar un usuario
 *     description: Registra un usuario con el rol usuario asignado por el servidor. La contraseña se almacena únicamente como hash bcrypt.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *           example:
 *             email: usuario@ejemplo.com
 *             password: Password123
 *     responses:
 *       '201':
 *         description: Usuario registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *             example:
 *               id: 1
 *               email: usuario@ejemplo.com
 *               rol: usuario
 *       '400':
 *         description: Datos de registro inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         $ref: '#/components/responses/ResourceConflict'
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Valida las credenciales y devuelve un JWT con id, rol y expiración.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *           example:
 *             email: usuario@ejemplo.com
 *             password: Password123
 *     responses:
 *       '200':
 *         description: Autenticación exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       '400':
 *         description: Datos de login inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 401
 *               message: Credenciales inválidas
 *               code: AUTH_CREDENTIALS_INVALID
 *               details: []
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/auth/registro", asyncHandler(registrarUsuario));
router.post("/auth/login", asyncHandler(iniciarSesion));

export default router;
