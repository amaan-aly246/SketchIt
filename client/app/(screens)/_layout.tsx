import { Stack } from "expo-router";
import React from "react";
const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="RoomScreen"
        options={{
          title: "Room"
        }}
      />
      <Stack.Screen name="index"
        options={{
          title: "Home"
        }}
      />
    </Stack>
  );
};

export default _layout;
