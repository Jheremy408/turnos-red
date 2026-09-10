import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app.error.js";

interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  details: unknown[];
}

function responderError(
  status: number,
  message: string,
  code: string,
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
      "ROUTE_NOT_FOUND",
    ),
  );
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  void _next;

  if (error instanceof AppError) {
    res
      .status(error.status)
      .json(
        responderError(error.status, error.message, error.code, error.details),
      );
    return;
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.map(String).join(".") || "body",
      message: issue.message,
    }));

    res
      .status(400)
      .json(
        responderError(
          400,
          "Error de validación en los datos ingresados",
          "VALIDATION_ERROR",
          details,
        ),
      );
    return;
  }

  if (esErrorDeJsonInvalido(error)) {
    res
      .status(400)
      .json(
        responderError(
          400,
          "Error de validación en los datos ingresados",
          "VALIDATION_ERROR",
        ),
      );
    return;
  }

  console.error("Error inesperado:", error);

  res
    .status(500)
    .json(
      responderError(
        500,
        "Error interno del servidor",
        "INTERNAL_SERVER_ERROR",
      ),
    );
};
