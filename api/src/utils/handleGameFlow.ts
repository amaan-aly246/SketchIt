import { Server } from "socket.io";
import {
  getRoomInfo,
  updateRoomInfo,
  clearCanvasHistory,
  getParticipants,
} from "./redisHelpers";
export const handleGameFlow = (io: Server) => {
  const roomTimers = new Map<string, NodeJS.Timeout>();
  const startNewRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    const nextRound = info.currentRound + 1;

    // participants
    const participants = await getParticipants(roomCode);
    const noOfParticipants = participants.length;
    const nextArtistIndex = (info.currentArtistIndex + 1) % noOfParticipants;
    // Reset round-specific data in Redis
    await updateRoomInfo(roomCode, {
      currentRound: nextRound,
      correctGuesses: 0,
      currentArtistIndex: nextArtistIndex,
    });
    await clearCanvasHistory(roomCode);
    // CLEAR any old timer just to be safe
    if (roomTimers.has(roomCode)) clearTimeout(roomTimers.get(roomCode));
    // start and store  timer for each round
    const timer = setTimeout(() => {
      endRound(roomCode);
    }, 10000);

    roomTimers.set(roomCode, timer);
    io.to(roomCode).emit("roundStarted", {
      currentRound: nextRound,
      totalRounds: info.totalRounds,
      nextArtist: participants[nextArtistIndex], // which  will draw next
    });
  };

  const endRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    const participants = await getParticipants(roomCode);

    if (roomTimers.has(roomCode)) {
      clearTimeout(roomTimers.get(roomCode));
      roomTimers.delete(roomCode);
    }
    // Check if game is over
    if (info.currentRound >= info.totalRounds) {
      io.to(roomCode).emit("endGame", { participants });
      //  clear canvas stored in redis
      clearCanvasHistory(roomCode);
    } else {
      io.to(roomCode).emit("roundOver", { participants });
      // // Wait 10s for scoreboard then start next round
      setTimeout(() => startNewRound(roomCode), 10000);
    }
  };

  return { startNewRound, endRound };
};
