import { Server } from "socket.io";
import {
  ChooseWordPayload,
  EndGamePayload,
  RoundOverPayload,
  RoundStartedPayload,
} from "../../../shared/types";
import {
  getRoomInfo,
  updateRoomInfo,
  clearCanvasHistory,
  getParticipants,
  getChoicesForArtist,
} from "./redisHelpers";
const roomTimers = new Map<string, NodeJS.Timeout>();

export const handleGameFlow = (io: Server) => {
  const startNewRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    await clearCanvasHistory(roomCode);
    // CLEAR any old timer just to be safe
    if (roomTimers.has(roomCode)) clearTimeout(roomTimers.get(roomCode));
    // start and store  timer for each round
    const timer = setTimeout(() => {
      endRound(roomCode);
    }, info.roundTime * 1000); // s to ms
    // @ts-ignore
    roomTimers.set(roomCode, timer);
    const payload: RoundStartedPayload = {
      currentRound: info.currentRound,
      totalRounds: info.totalRounds,
      roundTime: info.roundTime,
      word: info.selectedWord,
    };
    io.to(roomCode).emit("roundStarted", payload);
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
      const payload: EndGamePayload = { participants };
      io.to(roomCode).emit("endGame", payload);
      //  clear canvas stored in redis
      clearCanvasHistory(roomCode);
    } else {
      const payload: RoundOverPayload = {
        participants,
        roundTime: info.roundTime,
      };
      io.to(roomCode).emit("roundOver", payload);
      // // Wait 10s for scoreboard then start next round
      setTimeout(() => chooseWords(roomCode), 10000);
    }
  };

  const chooseWords = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    const nextRound = info.currentRound + 1;

    // participants
    const participants = await getParticipants(roomCode);
    const noOfParticipants = participants.length;
    const nextArtistIndex = (info.currentArtistIndex + 1) % noOfParticipants;
    await updateRoomInfo(roomCode, {
      currentArtistIndex: nextArtistIndex,
      currentRound: nextRound,
      correctGuesses: 0,
    });
    const choices = await getChoicesForArtist(roomCode);
    const playload: ChooseWordPayload = {
      currentRound: nextRound,
      totalRounds: info.totalRounds,
      nextArtist: participants[nextArtistIndex], // which  will draw next
      roundTime: info.roundTime,
      words: choices, // give these words to artist for him to choose the next word
    };
    io.to(roomCode).emit("chooseWord", playload);
  };
  return { startNewRound, endRound, chooseWords };
};
