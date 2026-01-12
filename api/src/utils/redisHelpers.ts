import redis from "../redis/redis";

const getRoomKey = (roomCode: string) => `room:${roomCode}:participants`;

export const checkRoomExists = async (roomCode: string): Promise<boolean> => {
  const key = getRoomKey(roomCode);
  const exists = await redis.exists(key);
  return exists === 1;
};

export const saveParticipants = async (
  roomCode: string,
  participants: any[]
) => {
  const key = getRoomKey(roomCode);
  // Set the key with a 24-hour expiry (86400 seconds)
  await redis.set(key, JSON.stringify(participants), "EX", 86400);
};

export const getParticipants = async (roomCode: string): Promise<any[]> => {
  const key = getRoomKey(roomCode);
  const data = await redis.get(key);
  return data ? JSON.parse(data) : [];
};

export const deleteRoom = async (roomCode: string) => {
  const key = getRoomKey(roomCode);
  await redis.del(key);
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
  roomCode: string
): Promise<number> => {
  const key = `room:${roomCode}:state`;
  // Atomic increment: safe from race conditions
  const count = await redis.hincrby(key, "correctGuesses", 1);
  return count;
};

// Helper to reset the state for the next round
export const resetRoomState = async (roomCode: string) => {
  const key = `room:${roomCode}:state`;
  await redis.hset(key, "correctGuesses", 0);
  await redis.expire(key, 86400);
};
