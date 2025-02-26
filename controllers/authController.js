import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtp, validateOtp } from "../services/otpServices.js";

export const sendOtpController = async (req, res) => {
  const { name, password, countryCode, mobileNumber } = req.body;

  try {
    let user = await User.findOne({ mobileNumber });
    if (user) {
      return res.status(400).json({ message: "alreay register. Please login" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name,
        countryCode,
        mobileNumber,
        password: hashedPassword,
        isVerified: false,
      });

      await user.save();

      const response = await sendOtp(countryCode, mobileNumber);
      if (response.data.responseCode === "200") {
        res.status(200).json({
          message: "OTP sent successfully",
          verificationId: response.data.verificationId,
        });
      } else {
        res.status(400).json({ error: response.data.errorMessage });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateOtpController = async (req, res) => {
  const { countryCode, mobileNumber, otpCode, verificationId } = req.body;
  try {
    const response = await validateOtp(
      otpCode,
      countryCode,
      mobileNumber,
      verificationId
    );

    if (
      response.data.verificationStatus === "VERIFICATION_COMPLETED" &&
      !response.data.errorMessage
    ) {
      let user = await User.findOne({ mobileNumber });

      if (!user) {
        return res
          .status(400)
          .json({ error: "User not found. Please register first." });
      }

      user.isVerified = true;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, mobileNumber: user.mobileNumber },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res
        .status(200)
        .json({ message: "OTP verification successful", token, user });
    } else {
      res.status(400).json({ error: response.data.errorMessage });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { mobileNumber, password } = req.body;
  try {
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found. Please register first." });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id, mobileNumber: user.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
