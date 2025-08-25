import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="JoinPage"
        options={{
          title: "Play",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default _layout;
