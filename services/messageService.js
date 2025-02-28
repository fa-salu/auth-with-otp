import Message from "../models/Message.js";

export const getAllMessage = async () => {
  try {
    return await Message.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const saveMessage = async (sender, message) => {
  const newMessage = new Message({ sender, message });
  return await newMessage.save();
};
