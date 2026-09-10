import express from "express";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";

import medicoRoutes from "./routes/medico.routes.js";
import turnoRoutes from "./routes/turno.routes.js";
import { cargarTurnos } from "./services/turno.service.js";
import { establecerTurnos } from "./controllers/turno.controller.js";
import { turnoEvents } from "./events/turno.events.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(express.static("public"));
app.use(turnoRoutes);
app.use(medicoRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = Number(process.env.PORT) || 3000;
const DATA_PATH = process.env.DATA_PATH || "./data/turnos.json";

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

turnoEvents.on("turno:creado", (turno) => {
  io.emit("turno:nuevo", turno);
});

turnoEvents.on("turno:actualizado", (turno) => {
  io.emit("turno:actualizado", turno);
});

turnoEvents.on("turno:eliminado", (turno) => {
  io.emit("turno:eliminado", turno);
});

async function iniciarServidor() {
  try {
    const turnos = await cargarTurnos(DATA_PATH);

    establecerTurnos(turnos);

    httpServer.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();
