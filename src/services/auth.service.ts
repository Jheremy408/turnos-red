import { readFile, writeFile } from "node:fs/promises";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { obtenerJwtSecret } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../errors/error-code.js";
import {
  ROL_USUARIO,
  type Usuario,
  type UsuarioPublico,
} from "../models/usuario.model.js";
import type { LoginInput, RegistroInput } from "../schemas/auth.schema.js";

const USUARIOS_PATH = "./data/usuarios.json";
const BCRYPT_ROUNDS = 10;
const JWT_EXPIRATION = "1h";

export async function registrarUsuario(
  datos: RegistroInput,
): Promise<UsuarioPublico> {
  const usuarios = await cargarUsuarios();

  if (usuarios.some((usuario) => usuario.email === datos.email)) {
    throw new AppError(
      409,
      "Ya existe un usuario registrado con ese email",
      ERROR_CODES.RESOURCE_CONFLICT,
    );
  }

  const passwordHash = await bcrypt.hash(datos.password, BCRYPT_ROUNDS);
  const id =
    usuarios.reduce(
      (maximo, usuario) => Math.max(maximo, usuario.id),
      0,
    ) + 1;
  const usuario: Usuario = {
    id,
    email: datos.email,
    passwordHash,
    rol: ROL_USUARIO,
  };

  usuarios.push(usuario);
  await guardarUsuarios(usuarios);

  logger.info(
    {
      event: "user_registered",
      userId: usuario.id,
      outcome: "success",
    },
    "Usuario registrado",
  );

  return crearUsuarioPublico(usuario);
}

export async function autenticarUsuario(
  datos: LoginInput,
): Promise<{ token: string }> {
  const usuarios = await cargarUsuarios();
  const usuario = usuarios.find((registro) => registro.email === datos.email);

  if (
    !usuario ||
    !(await bcrypt.compare(datos.password, usuario.passwordHash))
  ) {
    logger.warn(
      {
        event: "auth_login_failed",
        outcome: "failure",
      },
      "Intento de autenticación fallido",
    );

    throw new AppError(
      401,
      "Credenciales inválidas",
      ERROR_CODES.AUTH_CREDENTIALS_INVALID,
    );
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    obtenerJwtSecret(),
    {
      algorithm: "HS256",
      expiresIn: JWT_EXPIRATION,
    },
  );

  logger.info(
    {
      event: "auth_login_succeeded",
      userId: usuario.id,
      outcome: "success",
    },
    "Autenticación exitosa",
  );

  return { token };
}

async function cargarUsuarios(): Promise<Usuario[]> {
  let contenido: string;

  try {
    contenido = await readFile(USUARIOS_PATH, "utf-8");
  } catch (error) {
    if (esErrorDeArchivoNoEncontrado(error)) {
      return [];
    }

    throw error;
  }

  if (!contenido.trim()) {
    return [];
  }

  const datos: unknown = JSON.parse(contenido);

  if (!Array.isArray(datos) || !datos.every(esUsuarioPersistido)) {
    throw new Error("El archivo usuarios.json contiene datos inválidos");
  }

  return datos;
}

async function guardarUsuarios(usuarios: Usuario[]): Promise<void> {
  await writeFile(
    USUARIOS_PATH,
    `${JSON.stringify(usuarios, null, 2)}\n`,
    "utf-8",
  );
}

function crearUsuarioPublico(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  };
}

function esUsuarioPersistido(valor: unknown): valor is Usuario {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const usuario = valor as Record<string, unknown>;

  return (
    typeof usuario.id === "number" &&
    Number.isSafeInteger(usuario.id) &&
    usuario.id > 0 &&
    typeof usuario.email === "string" &&
    typeof usuario.passwordHash === "string" &&
    usuario.passwordHash.length > 0 &&
    usuario.rol === ROL_USUARIO
  );
}

function esErrorDeArchivoNoEncontrado(
  error: unknown,
): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
