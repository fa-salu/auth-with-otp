import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import otpRoutes from "./routes/authRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connect error", err));

app.use("/api/otp", otpRoutes);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
