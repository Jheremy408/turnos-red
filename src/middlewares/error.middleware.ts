import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app.error.js";
import { ERROR_CODES, type ErrorCode } from "../errors/error-code.js";
import { logger } from "../config/logger.js";

interface ErrorResponse {
  status: number;
  message: string;
  code: ErrorCode;
  details: unknown[];
}

function responderError(
  status: number,
  message: string,
  code: ErrorCode,
  details: unknown[] = [],
): ErrorResponse {
  return { status, message, code, details };
}

function esErrorDeJsonInvalido(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  );
}

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      404,
      `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      ERROR_CODES.RESOURCE_NOT_FOUND,
    ),
  );
};

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (err instanceof AppError) {
    res
      .status(err.status)
      .json(
        responderError(err.status, err.message, err.code, err.details),
      );
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.map(String).join(".") || "body",
      message: issue.message,
    }));

    res
      .status(400)
      .json(
        responderError(
          400,
          "Error de validación en los datos ingresados",
          ERROR_CODES.VALIDATION_ERROR,
          details,
        ),
      );
    return;
  }

  if (esErrorDeJsonInvalido(err)) {
    res
      .status(400)
      .json(
        responderError(
          400,
          "Error de validación en los datos ingresados",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      );
    return;
  }

  logger.error(
    {
      event: "unhandled_error",
      err,
      method: req.method,
      path: req.path,
    },
    "Error inesperado capturado",
  );

  res
    .status(500)
    .json(
      responderError(
        500,
        "Error interno del servidor",
        ERROR_CODES.INTERNAL_SERVER_ERROR,
      ),
    );
}
