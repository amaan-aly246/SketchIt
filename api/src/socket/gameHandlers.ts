import { Server, Socket } from "socket.io";
import { checkWord } from "../utils/checkWord";
import {
  saveStroke,
  clearCanvasHistory,
  saveParticipants,
  getParticipants,
  incrementCorrectGuesses,
} from "../utils/redisHelpers";
export const registerGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "drawstroke",
    async (
      points: { x: number; y: number }[],
      tool: "pen" | "eraser",
      roomCode: string
    ) => {
      await saveStroke(roomCode, { points, tool });
      // Broadcast the stroke to everyone in the room except the sender
      socket.to(roomCode).emit("receive", points, tool);
    }
  );

  socket.on("clearcanvas", async (roomCode: string) => {
    await clearCanvasHistory(roomCode);
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
      // //  Increment guess count atomically in Redis
      const currentGuessCount = await incrementCorrectGuesses(roomCode);

      // Determine points based on the 500, 300, 100 rule
      let pointsToAdd = 0;
      if (currentGuessCount === 1) pointsToAdd = 500;
      else if (currentGuessCount === 2) pointsToAdd = 300;
      else if (currentGuessCount === 3) pointsToAdd = 100;

      //  Update Participant List in Redis
      const participants = await getParticipants(roomCode);
      const updatedList = participants.map((p) => {
        if (p.userId === userId) {
          return {
            ...p,
            score: (p.score || 0) + pointsToAdd,
          };
        }
        return p;
      });
      await saveParticipants(roomCode, updatedList);
      io.to(roomCode).emit("updateParticipants", updatedList);
      // Correct guess: Hide word from others to prevent spoiling
      socket
        .to(roomCode)
        .emit("receivemessage", { ...data, message: "hidden" });
      // Show the actual word to the person who guessed it
      socket.emit("receivemessage", data);
    } else {
      // Regular chat message: Send to everyone
      io.to(roomCode).emit("receivemessage", data);
    }
  });
};
