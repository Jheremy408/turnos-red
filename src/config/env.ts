import "dotenv/config";

export function obtenerJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "Configuración inválida: la variable JWT_SECRET no está definida",
    );
  }

  return secret;
}
