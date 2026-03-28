import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

/* ROUTES */

import authRoutes from "./routes/authRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import measurementRoutes from "./routes/measurementRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/* CORS */

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

/* HTTP SERVER */

const server = http.createServer(app);

/* SOCKET SERVER */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {

  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

});

/* MAKE SOCKET AVAILABLE */

app.set("io", io);

/* API ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/users", userRoutes);

/* START SERVER */

server.listen(5000, () => {
  console.log("Server running on port 5000");
});