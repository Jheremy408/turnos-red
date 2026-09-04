import { Router } from "express";
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
} from "../controllers/turno.controller.js";

const router = Router();

router.get("/turnos", obtenerTurnos);
router.get("/turnos/:id", obtenerTurnoPorId);
router.post("/turnos", crearTurno);
router.put("/turnos/:id", actualizarTurno);
router.delete("/turnos/:id", eliminarTurno);

export default router;
