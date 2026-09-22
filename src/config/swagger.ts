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
        name: "Turnos",
        description: "Operaciones para administrar turnos médicos.",
      },
      {
        name: "Médicos",
        description: "Operaciones para administrar profesionales de salud.",
      },
    ],
    components: {
      schemas: {
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
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
