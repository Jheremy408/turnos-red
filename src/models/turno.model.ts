export interface TurnoCrudo {
  id: unknown;
  paciente: unknown;
  documento: unknown;
  especialidad: unknown;
  fecha: unknown;
  hora: unknown;
  confirmado: unknown;
  medicoId?: unknown;
  observaciones?: unknown;
}

export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  medicoId: number;
  observaciones?: string;
}
