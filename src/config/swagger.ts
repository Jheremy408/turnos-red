import swaggerJsdoc from "swagger-jsdoc";

const especialidades = [
  "Clínica médica",
  "Pediatría",
  "Odontología",
  "Nutrición",
];

const turnoProperties = {
  id: {
    type: "integer",
    minimum: 1,
    example: 101,
  },
  paciente: {
    type: "string",
    minLength: 1,
    example: "Pedro González",
  },
  documento: {
    type: "string",
    minLength: 1,
    example: "31654210",
  },
  especialidad: {
    type: "string",
    enum: especialidades,
    example: "Pediatría",
  },
  fecha: {
    type: "string",
    format: "date",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    example: "2026-08-14",
  },
  hora: {
    type: "string",
    pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
    example: "10:00",
  },
  confirmado: {
    type: "boolean",
    example: true,
  },
  medicoId: {
    type: "integer",
    minimum: 1,
    example: 2,
  },
  observaciones: {
    type: "string",
    example: "Control anual",
  },
};

const medicoProperties = {
  id: {
    type: "integer",
    minimum: 1,
    example: 2,
  },
  nombre: {
    type: "string",
    minLength: 1,
    example: "Carlos Rojas",
  },
  especialidad: {
    type: "string",
    enum: especialidades,
    example: "Pediatría",
  },
  disponible: {
    type: "boolean",
    example: true,
  },
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TurnosRed API",
      version: "1.0.0",
      description:
        "API REST para administrar turnos médicos y profesionales de salud, con validación de datos y notificaciones en tiempo real.",
    },
    tags: [
      {
        name: "Autenticación",
        description: "Registro de usuarios e inicio de sesión mediante JWT.",
      },
      {
        name: "Turnos",
        description: "Operaciones para administrar turnos médicos.",
      },
      {
        name: "Médicos",
        description: "Operaciones para administrar profesionales de salud.",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AuthRegisterRequest: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            password: {
              type: "string",
              minLength: 8,
              writeOnly: true,
              example: "Password123",
            },
          },
        },
        AuthLoginRequest: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            password: {
              type: "string",
              minLength: 1,
              writeOnly: true,
              example: "Password123",
            },
          },
        },
        AuthUser: {
          type: "object",
          additionalProperties: false,
          required: ["id", "email", "rol"],
          properties: {
            id: {
              type: "integer",
              minimum: 1,
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            rol: {
              type: "string",
              enum: ["usuario"],
              example: "usuario",
            },
          },
        },
        AuthTokenResponse: {
          type: "object",
          additionalProperties: false,
          required: ["token"],
          properties: {
            token: {
              type: "string",
              description: "JWT firmado con expiración.",
              example: "<jwt>",
            },
          },
        },
        Turno: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "paciente",
            "documento",
            "especialidad",
            "fecha",
            "hora",
            "confirmado",
            "medicoId",
          ],
          properties: turnoProperties,
        },
        TurnoActualizacion: {
          type: "object",
          additionalProperties: false,
          description:
            "Reemplazo completo de un turno. El ID puede omitirse; si se incluye, debe coincidir con el ID de la ruta.",
          required: [
            "paciente",
            "documento",
            "especialidad",
            "fecha",
            "hora",
            "confirmado",
            "medicoId",
          ],
          properties: turnoProperties,
        },
        Medico: {
          type: "object",
          additionalProperties: false,
          required: ["id", "nombre", "especialidad", "disponible"],
          properties: medicoProperties,
        },
        MedicoActualizacion: {
          type: "object",
          additionalProperties: false,
          description:
            "Reemplazo completo de un médico. El ID puede omitirse; si se incluye, debe coincidir con el ID de la ruta.",
          required: ["nombre", "especialidad", "disponible"],
          properties: medicoProperties,
        },
        ErrorResponse: {
          type: "object",
          additionalProperties: false,
          required: ["status", "message", "code", "details"],
          properties: {
            status: {
              type: "integer",
              example: 400,
            },
            message: {
              type: "string",
              example: "Error de validación en los datos ingresados",
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            details: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["field", "message"],
                properties: {
                  field: {
                    type: "string",
                    example: "documento",
                  },
                  message: {
                    type: "string",
                    example: "El documento debe ser un texto",
                  },
                },
              },
              example: [
                {
                  field: "documento",
                  message: "El documento debe ser un texto",
                },
              ],
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Token ausente, inválido o expirado.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                tokenMissing: {
                  summary: "Token ausente",
                  value: {
                    status: 401,
                    message: "Token de autenticación ausente",
                    code: "AUTH_TOKEN_MISSING",
                    details: [],
                  },
                },
                tokenInvalid: {
                  summary: "Token inválido o expirado",
                  value: {
                    status: 401,
                    message: "Token de autenticación inválido o expirado",
                    code: "AUTH_TOKEN_INVALID",
                    details: [],
                  },
                },
              },
            },
          },
        },
        ResourceNotFound: {
          description: "Recurso no encontrado.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: 404,
                message: "Recurso no encontrado",
                code: "RESOURCE_NOT_FOUND",
                details: [],
              },
            },
          },
        },
        ResourceConflict: {
          description: "Ya existe un recurso con los datos identificadores enviados.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: 409,
                message: "Ya existe un recurso con el identificador ingresado",
                code: "RESOURCE_CONFLICT",
                details: [],
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
