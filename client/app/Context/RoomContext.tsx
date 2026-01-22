import { createContext, useState, ReactNode, useContext } from "react";
import type { Participant } from "../types/types";
import type { GameState } from "../types/types";
export interface RoomContextType {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  updateUserScore: (userId: string, newScore: number) => void;
}
const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    totalRounds: 3,
    roundTime: 10,
    isRoundActive: false,
    isGameActive: false,
    gameAdminId: null,
    currentArtistId: null,
    currentArtistName: null,
  });
  const updateUserScore = (userId: string, newScore: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, score: newScore } : p)),
    );
  };
  return (
    <RoomContext.Provider
      value={{
        participants,
        setParticipants,
        gameState,
        setGameState,
        updateUserScore,
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
