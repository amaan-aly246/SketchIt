import { createContext, useState, ReactNode, useContext } from "react";

type UserContextType = {
  roomId: string | null
  setRoomId: (id: string | null) => void;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null)

  return (
    <UserContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </UserContext.Provider>
  )
};

export const useUserHook = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserHook must be used inside UserProvider")
  }

  return context;
}

