import { createContext, useState, ReactNode, useContext } from "react";
import type { UserData } from "../types/types";
type Stroke = {
  points: { x: number; y: number }[];
  tool: "pen" | "eraser";
};

type UserContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    userId: null,
    userName: null,
    roomName: null,
    roomCode: null,
    canvasHistory: [],
    foundAnswer: false,
    score: 0,
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserHook = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserHook must be used inside UserContextProvider");
  }

  return context;
};

export default UserContext;
