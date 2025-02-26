import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const baseURL = process.env.BASE_URL;
const customerId = process.env.CUSTOMER_ID;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

let authToken = null;

export const generateAuthToken = async () => {
  try {
    const key = Buffer.from(password).toString("base64");
    const url = `${baseURL}/auth/v1/authentication/token?country=IN&customerId=${customerId}&email=${email}&key=${key}&scope=NEW`;

    const response = await axios.get(url, {
      headers: { accept: "*/*" },
    });

    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error("Error generating auth token:", error);
    throw new Error("Failed to generate auth token");
  }
};

export const sendOtp = async (countryCode, mobileNumber) => {
  try {
    if (!authToken) await generateAuthToken();

    const url = `${baseURL}/verification/v2/verification/send?countryCode=${countryCode}&customerId=${customerId}&flowType=SMS&mobileNumber=${mobileNumber}`;

    const response = await axios.post(
      url,
      {},
      {
        headers: { accept: "*/*", authToken },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

export const validateOtp = async (
  otpCode,
  countryCode,
  mobileNumber,
  verificationId
) => {
  try {
    if (!authToken) await generateAuthToken();

    const url = `${baseURL}/verification/v2/verification/validateOtp?countryCode=${countryCode}&mobileNumber=${mobileNumber}&verificationId=${verificationId}&customerId=${customerId}&code=${otpCode}`;

    const response = await axios.get(url, {
      headers: { accept: "*/*", authToken },
    });

    return response.data;
  } catch (error) {
    console.error("Error validating OTP:", error);
    throw new Error("Failed to validate OTP");
  }
};
