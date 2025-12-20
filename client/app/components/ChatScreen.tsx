import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ChatMssg } from "../types/types";
import { useEffect, useState } from "react";
import socket from "../config/websocket";

const ChatScreen = () => {
  const [chatMessages, setChatMessages] = useState<ChatMssg[]>([]);
  useEffect(() => {
    socket.on("receivemessage", (mssg: ChatMssg) => {
      setChatMessages((prevMessages) => [mssg, ...prevMessages]);
    });

    return () => {
      socket.off("receivemessage");
    };
  }, []);
  return (
    <>
      <FlatList
        data={chatMessages}
        inverted={true}
        renderItem={({ item }) => (
          <Text
            style={item.isCorrect == true ? styles.successMssg : styles.mssg}>
            {item.message}
          </Text>
        )}
        contentContainerStyle={styles.container}
      />
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "red",
    flexGrow: 1,
  },
  mssg: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  successMssg: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#90EE90",
  },
});
