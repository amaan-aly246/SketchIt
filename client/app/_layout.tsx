import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";
import { UserContextProvider } from "./Context/UserContext";
export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={false} />

      <UserContextProvider>

        <Stack>
          <Stack.Screen name="(screens)" options={{ headerShown: true, }} />
        </Stack>
      </UserContextProvider>
    </>
  );
}
