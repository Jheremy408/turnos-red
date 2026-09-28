import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import { cargarTurnos } from "./services/turno.service.js";
import { establecerTurnos } from "./controllers/turno.controller.js";
import { turnoEvents } from "./events/turno.events.js";
import { logger } from "./config/logger.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = Number(process.env.PORT) || 3000;
const DATA_PATH = process.env.DATA_PATH || "./data/turnos.json";

io.on("connection", (socket) => {
  logger.info(
    {
      event: "socket_connected",
      socketId: socket.id,
    },
    "Cliente Socket.IO conectado",
  );

  socket.on("disconnect", () => {
    logger.info(
      {
        event: "socket_disconnected",
        socketId: socket.id,
      },
      "Cliente Socket.IO desconectado",
    );
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
      logger.info(
        {
          event: "server_started",
          port: PORT,
        },
        "Servidor iniciado",
      );
    });
  } catch (error) {
    logger.fatal(
      {
        event: "server_start_failed",
        err: error,
      },
      "No se pudo iniciar el servidor",
    );
    process.exit(1);
  }
}

iniciarServidor();
