import { Server } from "socket.io";
import {
  getRoomInfo,
  updateRoomInfo,
  clearCanvasHistory,
  getParticipants,
} from "./redisHelpers";
export const handleGameFlow = (io: Server) => {
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

    io.to(roomCode).emit("roundStarted", {
      currentRound: nextRound,
      totalRounds: info.totalRounds,
      nextArtist: participants[nextArtistIndex], // which which will draw next
    });
  };

  const endRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    const participants = await getParticipants(roomCode);

    // Check if game is over
    if (info.currentRound >= info.totalRounds) {
      io.to(roomCode).emit("endGame", { participants });
      // todo : clear canvas stored in redis
    } else {
      io.to(roomCode).emit("roundOver", { participants });
      // // Wait 10s for scoreboard then start next round
      setTimeout(() => startNewRound(roomCode), 10000);
    }
  };

  return { startNewRound, endRound };
};
