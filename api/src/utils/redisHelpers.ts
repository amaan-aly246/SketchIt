import redis from "../redis/redis";
import axios from "axios";
export const checkRoomExists = async (roomCode: string): Promise<boolean> => {
  const key = `room:${roomCode}:participants`;
  const exists = await redis.exists(key);
  return exists === 1;
};

export const saveParticipants = async (
  roomCode: string,
  participants: any[],
) => {
  const key = `room:${roomCode}:participants`;
  // Set the key with a 24-hour expiry (86400 seconds)
  await redis.set(key, JSON.stringify(participants), "EX", 86400);
};

export const getParticipants = async (roomCode: string): Promise<any[]> => {
  const key = `room:${roomCode}:participants`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : [];
};

export const deleteRoom = async (roomCode: string) => {
  const key = `room:${roomCode}:participants`;
  await redis.del(key);
  const canvasKey = `room:${roomCode}:canvas`;
  await redis.del(canvasKey); // delete canvas associated with that accound
  const roomInfoKey = `room:${roomCode}:info`;
  await redis.del(roomInfoKey);
  const wordPoolKey = `room:${roomCode}:wordPool`;
  await redis.del(wordPoolKey);
};

export const saveStroke = async (roomCode: string, strokeData: any) => {
  const key = `room:${roomCode}:canvas`;
  // Push the new stroke to the end of the list
  await redis.rpush(key, JSON.stringify(strokeData));
  await redis.expire(key, 86400); // 24h expiry
};

export const getCanvasHistory = async (roomCode: string) => {
  const key = `room:${roomCode}:canvas`;
  const strokes = await redis.lrange(key, 0, -1);
  return strokes.map((s) => JSON.parse(s));
};

export const clearCanvasHistory = async (roomCode: string) => {
  await redis.del(`room:${roomCode}:canvas`);
};

// Helper to increment and get the current count of correct guesses
export const incrementCorrectGuesses = async (
  roomCode: string,
): Promise<number> => {
  const key = `room:${roomCode}:info`;
  // Atomic increment: safe from race conditions
  const count = await redis.hincrby(key, "correctGuesses", 1);
  return count;
};

// Helper to update any field in the room info hash
export const updateRoomInfo = async (
  roomCode: string,
  data: Partial<{
    totalRounds: number;
    currentRound: number;
    correctGuesses: number;
    currentArtistIndex: number;
    roundTime: number;
    selectedWord: string;
    isRoundActive: string;
    hintMask: string;
  }>,
) => {
  const key = `room:${roomCode}:info`;
  await redis.hset(key, data);
};

// Helper to get the full room info
export const getRoomInfo = async (roomCode: string) => {
  const key = `room:${roomCode}:info`;
  const info = await redis.hgetall(key);
  return {
    totalRounds: parseInt(info.totalRounds),
    currentRound: parseInt(info.currentRound),
    correctGuesses: parseInt(info.correctGuesses),
    currentArtistIndex: parseInt(info.currentArtistIndex),
    roundTime: parseInt(info.roundTime),
    selectedWord: info.selectedWord,
    isRoundActive: info.isRoundActive,
    hintMask: info.hintMask,
  };
};

export const setupWordPool = async (roomCode: string) => {
  const response = await axios.get(
    "https://api.datamuse.com/words?ml=objects&max=50",
  );
  const words = response.data
    .map((item: any) => item.word)
    .filter((w: string) => !w.includes(" ")); // Filter out phrases

  const key = `room:${roomCode}:wordPool`;
  await redis.sadd(key, ...words);
  await redis.expire(key, 3600);
};
export const getChoicesForArtist = async (roomCode: string) => {
  return ["Apple", "Cloud", "Sword"]; // testing
  const key = `room:${roomCode}:wordPool`;
  // Pop 3 random words
  const choices = await redis.spop(key, 3);

  // Fallback if pool is empty
  if (!choices || choices.length === 0) return ["Apple", "Cloud", "Sword"];

  return choices;
};
