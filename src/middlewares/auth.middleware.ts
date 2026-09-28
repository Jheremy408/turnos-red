import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { obtenerJwtSecret } from "../config/env.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../errors/error-code.js";
import { ROL_USUARIO } from "../models/usuario.model.js";

export function verificarToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.get("authorization");

  if (!authorization) {
    throw crearErrorTokenAusente();
  }

  const coincidencia = /^Bearer\s+(\S+)$/i.exec(authorization.trim());

  if (!coincidencia?.[1]) {
    if (/^Bearer\s*$/i.test(authorization.trim())) {
      throw crearErrorTokenAusente();
    }

    throw crearErrorTokenInvalido();
  }

  const secret = obtenerJwtSecret();

  try {
    const payload = jwt.verify(coincidencia[1], secret, {
      algorithms: ["HS256"],
    });

    if (!esPayloadValido(payload)) {
      throw crearErrorTokenInvalido();
    }

    req.user = {
      id: payload.id,
      rol: payload.rol,
    };

    next();
  } catch {
    throw crearErrorTokenInvalido();
  }
}

function esPayloadValido(payload: string | JwtPayload): payload is JwtPayload & {
  id: number;
  rol: typeof ROL_USUARIO;
} {
  if (typeof payload === "string") {
    return false;
  }

  const id: unknown = payload.id;
  const rol: unknown = payload.rol;

  return (
    typeof id === "number" &&
    Number.isSafeInteger(id) &&
    id > 0 &&
    rol === ROL_USUARIO
  );
}

function crearErrorTokenAusente(): AppError {
  return new AppError(
    401,
    "Token de autenticación ausente",
    ERROR_CODES.AUTH_TOKEN_MISSING,
  );
}

function crearErrorTokenInvalido(): AppError {
  return new AppError(
    401,
    "Token de autenticación inválido o expirado",
    ERROR_CODES.AUTH_TOKEN_INVALID,
  );
}
