import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// import { ChatMssg } from "../types/types";
import type { ChatMssg } from "../../../shared/types";
import { useEffect, useState } from "react";
import { useUserHook } from "../Context/UserContext";
import socket from "../config/websocket";

const testData = [
  {
    isCorrect: true,
    message: "mssg1",
  },
  {
    isCorrect: false,
    message: "mssg2",
  },
];
const ChatScreen = () => {
  const [chatMessages, setChatMessages] = useState<ChatMssg[]>([]);
  const {
    setUserData,
    userData: { userId },
  } = useUserHook();
  useEffect(() => {
    socket.on("receivemessage", (mssg: ChatMssg) => {
      if (mssg.isCorrect && mssg.authorId == userId) {
        setUserData((prevData) => ({
          ...prevData,
          foundAnswer: true,
        }));
      }
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
        // contentContainerStyle={styles.container}
        className="flex-[60] h-full bg-secondary"
      />
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "yellow",
    flexGrow: 1,
  },
  mssg: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  successMssg: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#90EE90",
  },
});
