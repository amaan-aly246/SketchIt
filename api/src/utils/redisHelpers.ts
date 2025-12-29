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
