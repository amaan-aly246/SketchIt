import { Server } from "socket.io";
import { registerRoomHandlers } from "./roomHandlers";
import { registerGameHandlers } from "./gameHandlers";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`WebSocket connected, ID: ${socket.id}`);

    // Register modular logic
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id}, Reason: ${reason}`);
      // NOTE: roomHandlers will eventually need a logic here to clean up activeRooms
    });
  });

  return io;
};
