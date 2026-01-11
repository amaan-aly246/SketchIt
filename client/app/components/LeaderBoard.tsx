import { View, Text, FlatList, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import React from "react";
import socket from "../config/websocket";
import { useRoomHook } from "../Context/RoomContext";
const LeaderBoard = () => {
  const { setParticipants, participants } = useRoomHook();
  useEffect(() => {
    if (socket.connected) {
      socket.on("updateParticipants", (userList) => {
        console.log("✅ Received list:", userList);
        setParticipants(userList);
      });
    }

    return () => {
      socket.off("updateParticipants");
    };
  }, []);

  return (
    <>
      <FlatList
        data={participants}
        renderItem={({ item, index }) => (
          <View style={index % 2 == 0 ? styles.evenElement : styles.oddElement}>
            <Text className="py-3 px-2">
              {item.userName} and {index}
            </Text>
          </View>
        )}
        className="flex-[50] h-full bg-primary-dark"
      />
    </>
  );
};

export default LeaderBoard;

const styles = StyleSheet.create({
  oddElement: {
    backgroundColor: "white",
  },
  evenElement: {
    backgroundColor: "#F7F1E6",
  },
});
