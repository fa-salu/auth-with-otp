import mongoose from "mongoose";

const MobileUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    countryCode: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MoblieUser = mongoose.model("User", MobileUserSchema);
export default MoblieUser;
