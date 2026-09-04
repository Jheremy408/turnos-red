import type { Turno, TurnoCrudo } from "../models/turno.model.js";

export function normalizarTurno(dato: TurnoCrudo): Turno | null {
  const id = Number(dato.id);

  // Validamos que el ID sea un entero positivo.
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const paciente = String(dato.paciente ?? "").trim();
  const documento = String(dato.documento ?? "").trim();
  const especialidad = String(dato.especialidad ?? "")
    .trim()
    .toUpperCase();
  const fecha = normalizarFecha(dato.fecha);
  const hora = normalizarHora(dato.hora);
  const confirmado = normalizarConfirmado(dato.confirmado);

  // Validamos los campos mínimos.
  if (
    !paciente ||
    !documento ||
    !especialidad ||
    !fecha ||
    !hora ||
    confirmado === null
  ) {
    return null;
  }

  const turno: Turno = {
    id,
    paciente,
    documento,
    especialidad,
    fecha,
    hora,
    confirmado,
  };

  if (dato.observaciones !== undefined) {
    turno.observaciones = String(dato.observaciones).trim();
  }

  return turno;
}

function normalizarFecha(valor: unknown): string | null {
  const fecha = String(valor ?? "").trim();

  const partes = fecha.split("/");

  if (partes.length !== 3) {
    return null;
  }

  const [dia, mes, anio] = partes;

  if (!dia || !mes || !anio) {
    return null;
  }

  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function normalizarHora(valor: unknown): string | null {
  const hora = String(valor ?? "")
    .trim()
    .replace(".", ":");

  if (!/^\d{1,2}:\d{2}$/.test(hora)) {
    return null;
  }

  const [horas, minutos] = hora.split(":").map(Number);

  if (
    horas === undefined ||
    minutos === undefined ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function normalizarConfirmado(valor: unknown): boolean | null {
  if (typeof valor === "boolean") {
    return valor;
  }

  const texto = String(valor ?? "")
    .trim()
    .toLowerCase();

  if (["si", "sí", "true", "1"].includes(texto)) {
    return true;
  }

  if (["no", "false", "0"].includes(texto)) {
    return false;
  }

  return null;
}
