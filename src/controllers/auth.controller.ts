import type { Request, Response } from "express";

import { loginSchema, registroSchema } from "../schemas/auth.schema.js";
import {
  autenticarUsuario,
  registrarUsuario as registrarUsuarioEnServicio,
} from "../services/auth.service.js";

export async function registrarUsuario(
  req: Request,
  res: Response,
): Promise<void> {
  const datos = registroSchema.parse(req.body);
  const usuario = await registrarUsuarioEnServicio(datos);

  res.status(201).json(usuario);
}

export async function iniciarSesion(
  req: Request,
  res: Response,
): Promise<void> {
  const datos = loginSchema.parse(req.body);
  const resultado = await autenticarUsuario(datos);

  res.status(200).json(resultado);
}
