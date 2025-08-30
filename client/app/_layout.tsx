import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";
import { useFonts } from "expo-font"
import { UserContextProvider } from "./Context/UserContext";
export default function RootLayout() {
  const [fontLoaded] = useFonts({
    NunitoItalica: require('../assets/fonts/Nunito-BlackItalic.ttf')
  })
  return (
    <>
      <StatusBar hidden={false} />

      <UserContextProvider>

        <Stack>
          <Stack.Screen name="(screens)" options={{ headerShown: false, }} />
        </Stack>
      </UserContextProvider>
    </>
  );
}
