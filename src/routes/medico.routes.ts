import { Router } from "express";

import {
  actualizarMedico,
  crearMedico,
  eliminarMedico,
  obtenerMedicoPorId,
  obtenerMedicos,
} from "../controllers/medico.controller.js";

const router = Router();

router.get("/medicos", obtenerMedicos);
router.get("/medicos/:id", obtenerMedicoPorId);
router.post("/medicos", crearMedico);
router.put("/medicos/:id", actualizarMedico);
router.delete("/medicos/:id", eliminarMedico);

export default router;
