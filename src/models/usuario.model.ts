export const ROL_USUARIO = "usuario" as const;

export type RolUsuario = typeof ROL_USUARIO;

export interface Usuario {
  id: number;
  email: string;
  passwordHash: string;
  rol: RolUsuario;
}

export interface UsuarioPublico {
  id: number;
  email: string;
  rol: RolUsuario;
}

export interface UsuarioAutenticado {
  id: number;
  rol: RolUsuario;
}
