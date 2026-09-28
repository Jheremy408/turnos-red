import { Router } from "express";

import {
  iniciarSesion,
  registrarUsuario,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";

const router = Router();

router.post("/auth/registro", asyncHandler(registrarUsuario));
router.post("/auth/login", asyncHandler(iniciarSesion));

export default router;
