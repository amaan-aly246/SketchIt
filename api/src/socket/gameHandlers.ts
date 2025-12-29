import { Server, Socket } from "socket.io";
import { checkWord } from "../utils/checkWord";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "drawstroke",
    (
      points: { x: number; y: number }[],
      tool: "pen" | "eraser",
      roomCode: string
    ) => {
      // Broadcast the stroke to everyone in the room except the sender
      socket.to(roomCode).emit("receive", points, tool);
    }
  );

  socket.on("clearcanvas", (roomCode: string) => {
    // Send to everyone else in the room
    socket.to(roomCode).emit("clearcanvas");
  });

  //  Handle Chat and Word Guessing
  socket.on("sendmessage", async ({ roomCode, message, userName, userId }) => {
    console.log(`Message in room ${roomCode}: ${message}`);

    const isCorrect = await checkWord(message);
    const data = {
      message,
      authorId: userId,
      authorName: userName,
      isCorrect,
    };

    if (isCorrect) {
      // Correct guess: Hide word from others to prevent spoiling
      socket
        .to(roomCode)
        .emit("receivemessage", { ...data, message: "hidden" });
      // Show the actual word to the person who guessed it
      socket.emit("receivemessage", data);

      // TODO: Logic to award points to userId would go here
    } else {
      // Regular chat message: Send to everyone
      io.to(roomCode).emit("receivemessage", data);
    }
  });
};
