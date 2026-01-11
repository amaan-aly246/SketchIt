import { createContext, useState, ReactNode, useContext } from "react";
import type { Participant } from "../types/types";
type RoomContextType = {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  updateUserScore: (userId: string, newScore: number) => void;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Helper to update a specific user's score without replacing the whole array
  const updateUserScore = (userId: string, newScore: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, score: newScore } : p))
    );
  };

  return (
    <RoomContext.Provider
      value={{ participants, setParticipants, updateUserScore }}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom Hook for easy access
export const useRoomHook = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomHook must be used inside RoomContextProvider");
  }
  return context;
};

export default RoomContext;
