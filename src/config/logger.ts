import pino from "pino";

const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
] as const;

type LogLevel = (typeof LOG_LEVELS)[number];

const defaultLevel: LogLevel =
  process.env.NODE_ENV === "production" ? "error" : "info";
const configuredLevel = process.env.LOG_LEVEL?.toLowerCase();
const level = esNivelValido(configuredLevel) ? configuredLevel : defaultLevel;

const logger = pino({
  level,
  base: {
    service: "turnos-red",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "authorization",
      "Authorization",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.authorization",
      "*.Authorization",
      "req.body.password",
      "req.body.passwordHash",
      "req.headers.authorization",
      "req.headers.Authorization",
      "res.body.token",
    ],
    censor: "[REDACTED]",
  },
});

if (configuredLevel && !esNivelValido(configuredLevel)) {
  logger.error(
    {
      event: "invalid_log_level",
      configuredLevel,
      fallbackLevel: defaultLevel,
    },
    "Nivel de log inválido; se utiliza el valor predeterminado",
  );
}

function esNivelValido(valor: string | undefined): valor is LogLevel {
  return LOG_LEVELS.some((levelName) => levelName === valor);
}

export { logger };
