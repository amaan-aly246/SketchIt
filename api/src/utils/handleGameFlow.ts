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
  saveParticipants,
} from "./redisHelpers";
const roomTimers = new Map<string, NodeJS.Timeout>();

export const handleGameFlow = (io: Server) => {
  const startNewRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    await clearCanvasHistory(roomCode);

    // Reset the hintMask in Redis for the new word
    const initialMask = "_".repeat(info.selectedWord.length);
    await updateRoomInfo(roomCode, { hintMask: initialMask });

    // Clear any old timers (
    if (roomTimers.has(roomCode)) {
      const existingTimer = roomTimers.get(roomCode);
      clearInterval(existingTimer as NodeJS.Timeout);
      roomTimers.delete(roomCode);
    }

    startRoundTimer(roomCode, info.roundTime);

    const payload: RoundStartedPayload = {
      currentRound: info.currentRound,
      totalRounds: info.totalRounds,
      roundTime: info.roundTime,
      word: info.selectedWord,
      hintMask: initialMask,
    };
    io.to(roomCode).emit("roundStarted", payload);
  };

  const endRound = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    let participants = await getParticipants(roomCode);

    if (roomTimers.has(roomCode)) {
      clearTimeout(roomTimers.get(roomCode));
      roomTimers.delete(roomCode);
    }

    const artistIdx = info.currentArtistIndex;
    const artist = {
      ...participants[artistIdx],
      // Correctly add points to the existing score
      score: (participants[artistIdx].score || 0) + info.correctGuesses * 50,
    };
    participants[info.currentArtistIndex] = artist;
    await updateRoomInfo(roomCode, { isRoundActive: "false" });
    await saveParticipants(roomCode, participants); // update participants data
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
  const startRoundTimer = (roomCode: string, duration: number) => {
    let timeLeft = duration;

    const timer = setInterval(async () => {
      timeLeft--;

      if (timeLeft === Math.floor(duration * 0.5)) {
        await revealRandomLetter(roomCode);
      }

      if (timeLeft === Math.floor(duration * 0.25)) {
        await revealRandomLetter(roomCode);
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
        roomTimers.delete(roomCode);
        await endRound(roomCode);
      }
    }, 1000);

    // STORE the interval so endRound can cancel it if someone guesses correctly
    roomTimers.set(roomCode, timer);
  };

  const revealRandomLetter = async (roomCode: string) => {
    const info = await getRoomInfo(roomCode);
    const word = info.selectedWord;

    // Create or update a 'hintMask' (e.g., "A_ _ L _")
    // We will pick a random index that is currently an underscore and reveal it
    const currentHint = info.hintMask || "_".repeat(word.length);
    const hiddenIndices = [];

    for (let i = 0; i < currentHint.length; i++) {
      if (currentHint[i] === "_") hiddenIndices.push(i);
    }

    if (hiddenIndices.length > 1) {
      // Leave at least one letter hidden
      const randomIndex =
        hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
      const newHint = currentHint.split("");
      newHint[randomIndex] = word[randomIndex];

      const updatedHint = newHint.join("");
      await updateRoomInfo(roomCode, { hintMask: updatedHint });

      // Broadcast the new hint to all guessers
      io.to(roomCode).emit("wordHint", { updatedHint });
    }
  };
  return {
    startNewRound,
    endRound,
    chooseWords,
    revealRandomLetter,
    startRoundTimer,
  };
};
