import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import phoneRoutes from "./routes/authPhoneRoute.js";
import emailRoutes from "./routes/authEmailRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connect error", err));

app.use("/api/phone/otp", phoneRoutes);
app.use("/api/email/otp", emailRoutes);

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
