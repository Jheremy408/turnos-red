import "./config/env.js";

import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import medicoRoutes from "./routes/medico.routes.js";
import turnoRoutes from "./routes/turno.routes.js";

const app = express();

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(":method :url :status :response-time ms"));
}
app.use(express.json());
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(authRoutes);
app.use(turnoRoutes);
app.use(medicoRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
