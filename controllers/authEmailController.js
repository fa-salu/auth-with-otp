import EmailUser from "../models/EmailUser.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerWithEmail = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await EmailUser.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email already exist, Please Login" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await EmailUser.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering with our service. Please use the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <h1 style="color: #2c7be5; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
            <p style="color: #777; margin-top: 10px; font-size: 14px;">This code will expire in ${
              process.env.OTP_EXPIRY || 5
            } minutes</p>
          </div>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>The Support Team</p>
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      message: "User registered successfully. OTP sent to email.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await EmailUser.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .status(200)
      .json({ message: "Email verified successfully", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await EmailUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
