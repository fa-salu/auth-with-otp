import { getAllMessage } from "../services/messageService.js";

export const getMessage = async (req, res) => {
  try {
    const messages = await getAllMessage();
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Error fetching messages" });
  }
};
