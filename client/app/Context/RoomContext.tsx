import { createContext, useState, ReactNode, useContext } from "react";
import type { Participant } from "../types/types";

type RoomContextType = {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  updateUserScore: (userId: string, newScore: number) => void;
  currentRound: number;
  setCurrentRound: React.Dispatch<React.SetStateAction<number>>;
  totalRounds: number;
  setTotalRounds: React.Dispatch<React.SetStateAction<number>>;
  roundTime: number;
  setRoundTime: React.Dispatch<React.SetStateAction<number>>;
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(2); // Default to 2
  const [roundTime, setRoundTime] = useState(10); // in seconds
  const updateUserScore = (userId: string, newScore: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, score: newScore } : p))
    );
  };

  return (
    <RoomContext.Provider
      value={{
        participants,
        setParticipants,
        updateUserScore,
        currentRound,
        setCurrentRound,
        totalRounds,
        setTotalRounds,
        roundTime,
        setRoundTime,
      }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomHook = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomHook must be used inside RoomContextProvider");
  }
  return context;
};

export default RoomContext;
