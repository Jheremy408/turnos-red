import type { ErrorCode } from "./error-code.js";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: ErrorCode,
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}
