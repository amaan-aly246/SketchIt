import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect } from "react";
import React from "react";
import socket from "../config/websocket";
import { useRoomHook } from "../Context/RoomContext";
import { useUserHook } from "../Context/UserContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LeaderBoard = () => {
  const {
    setParticipants,
    participants,
    gameState: { currentArtistId },
  } = useRoomHook();
  const {
    userData: { userId },
  } = useUserHook();
  // @ts-ignore
  useEffect(() => {
    if (socket.connected) {
      socket.on("updateParticipants", (userList) => {
        setParticipants(userList);
      });
    }
    return () => socket.off("updateParticipants");
  }, []);

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.userId}
      renderItem={({ item, index }) => {
        const isThisUserDrawing = item.userId === currentArtistId;

        return (
          <View
            style={index % 2 === 0 ? styles.evenElement : styles.oddElement}
            className="flex-row justify-between items-center py-3 px-4 border-b border-gray-200">
            <View className="flex-row items-center flex-1">
              <Text className="font-bold text-gray-800 text-base mr-2">
                {item.userName} {item.userId === userId && "(You)"}
              </Text>
              {isThisUserDrawing && (
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#396273"
                />
              )}
            </View>

            <Text className="font-black text-primary">
              {item.score || 0} pts
            </Text>
          </View>
        );
      }}
      className="flex-[50] h-full bg-primary-dark"
    />
  );
};

export default LeaderBoard;

const styles = StyleSheet.create({
  oddElement: { backgroundColor: "white" },
  evenElement: { backgroundColor: "#F7F1E6" },
});
