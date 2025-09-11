import { createContext, useState, ReactNode, useContext } from "react";

type UserData = {
  userId: string | null;
  userName: string | null;
  roomName: string | null;
  roomCode: string | null;
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

export default UserContext
