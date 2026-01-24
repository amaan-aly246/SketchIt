import { Server, Socket } from "socket.io";
import { validateGuess } from "../utils/validateGuess";
import type { GuessStatusEnum } from "../types";
import {
  saveStroke,
  clearCanvasHistory,
  saveParticipants,
  getParticipants,
  incrementCorrectGuesses,
  updateRoomInfo,
  setupWordPool,
  getRoomInfo,
} from "../utils/redisHelpers";
import { handleGameFlow } from "../utils/handleGameFlow";
import type { Participant } from "../types";
export const registerGameHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "drawstroke",
    async (
      points: { x: number; y: number }[],
      tool: "pen" | "eraser",
      roomCode: string,
      color: string,
    ) => {
      await saveStroke(roomCode, { points, tool, color });

      socket.to(roomCode).emit("receive", points, tool, color);
    },
  );

  socket.on("clearcanvas", async (roomCode: string) => {
    await clearCanvasHistory(roomCode);
    // Send to everyone else in the room
    socket.to(roomCode).emit("clearcanvas");
  });

  //  Handle Chat and Word Guessing
  socket.on("sendmessage", async ({ roomCode, message, userName, userId }) => {
    const info = await getRoomInfo(roomCode);
    const wordToGuess = info.selectedWord;
    if (!info.isRoundActive) {
      //  game not started yet ,so treat all mssg as normal mssg
      io.to(roomCode).emit("receivemessage", {
        message,
        authorId: userId,
        authorName: userName,
        status: "none",
      });
      return;
    }
    const status: GuessStatusEnum = validateGuess(message, wordToGuess);

    const data = {
      message,
      authorId: userId,
      authorName: userName,
      status,
    };

    if (status === "correct") {
      const currentGuessCount = await incrementCorrectGuesses(roomCode);

      let pointsToAdd = 0;
      if (currentGuessCount === 1) pointsToAdd = 500;
      else if (currentGuessCount === 2) pointsToAdd = 300;
      else pointsToAdd = 100;

      const participants = await getParticipants(roomCode);
      const updatedList = participants.map((p) => {
        if (p.userId === userId) {
          return { ...p, score: (p.score || 0) + pointsToAdd };
        }
        return p;
      });

      await saveParticipants(roomCode, updatedList);
      io.to(roomCode).emit("updateParticipants", updatedList);

      // Hide word for others, show for the sender
      socket.to(roomCode).emit("receivemessage", {
        ...data,
        message: `${userName} guessed the word!`,
      });
      socket.emit("receivemessage", data);

      const totalGuessers = updatedList.length - 1;
      const guessLimit = Math.min(totalGuessers, 3);

      if (currentGuessCount >= guessLimit) {
        const { endRound } = handleGameFlow(io);
        await endRound(roomCode);
      }
    } else if (status === "close") {
      // Only emit to the sender (private hint)
      socket.emit("receivemessage", {
        ...data,
        message: `${message} is very close!`,
      });
    } else {
      //  Regular Message
      io.to(roomCode).emit("receivemessage", data);
    }
  });

  socket.on("startGame", async ({ roomCode, totalRounds, roundTime }) => {
    // create word pool for this game
    await setupWordPool(roomCode);
    // Initialize game info in Redis
    await updateRoomInfo(roomCode, {
      totalRounds: totalRounds,
      currentRound: 0,
      currentArtistIndex: -1,
      roundTime: roundTime,
      selectedWord: "",
      isRoundActive: "true",
    });
    const { chooseWords } = handleGameFlow(io);
    await chooseWords(roomCode);
  });

  socket.on("wordSelected", async ({ roomCode, word }) => {
    await updateRoomInfo(roomCode, { selectedWord: word });
    const { startNewRound } = handleGameFlow(io);
    await startNewRound(roomCode);
  });
};
