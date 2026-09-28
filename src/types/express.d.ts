import type { UsuarioAutenticado } from "../models/usuario.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioAutenticado;
    }
  }
}

export {};
