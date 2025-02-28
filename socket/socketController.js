import { saveMessage } from "../services/messageService.js";

export const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("message", async (rawData) => {
      try {
        const parsedData = JSON.parse(rawData);

        if (parsedData.event === "sendMessage") {
          const { sender, message } = parsedData.data;
          const newMessage = await saveMessage(sender, message);

          io.emit("receiveMessage", newMessage);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};
