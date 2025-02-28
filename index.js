import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import phoneRoutes from "./routes/authPhoneRoute.js";
import emailRoutes from "./routes/authEmailRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import { socketController } from "./socket/socketController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connect error", err));

socketController(io);

app.use("/api/phone/otp", phoneRoutes);
app.use("/api/email/otp", emailRoutes);
app.use("/api", messageRoutes);

server.listen(PORT, () => console.log(`server running on port ${PORT}`));
