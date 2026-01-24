import { View, Text, FlatList } from "react-native";

import type { ChatMssg } from "../../../shared/types";
import { useEffect, useState } from "react";
import { useUserHook } from "../Context/UserContext";
import socket from "../config/websocket";
const renderItem = ({ item }: { item: ChatMssg }) => {
  const isCorrect = item.status === "correct";
  const isClose = item.status === "close";

  return (
    <View
      className={`px-4 py-2 mb-1 mx-2 rounded-xl flex-row items-baseline ${
        isCorrect
          ? "bg-green-100 border-l-4 border-green-500"
          : isClose
            ? "bg-yellow-100 border-l-4 border-yellow-500"
            : "bg-white/10"
      }`}>
      {/* Author Name */}
      {/* if user guessed correctly don't include author name , this way it will act as a notification */}
      {!isCorrect && (
        <Text
          className={`font-bold mr-2 ${
            isCorrect
              ? "text-green-800"
              : isClose
                ? "text-yellow-800"
                : "text-gray-300"
          }`}>
          {item.authorName}:
        </Text>
      )}

      {/* Message Content */}
      <Text
        className={`flex-1 ${
          isCorrect
            ? "text-green-700 font-black"
            : isClose
              ? "text-yellow-700 font-semibold italic"
              : "text-white"
        }`}>
        {item.message}
      </Text>
    </View>
  );
};
const ChatScreen = () => {
  const [chatMessages, setChatMessages] = useState<ChatMssg[]>([]);
  const { setUserData, userData } = useUserHook();
  const { userId } = userData;
  useEffect(() => {
    socket.on("receivemessage", (mssg: ChatMssg) => {
      if (mssg.status == "correct" && mssg.authorId == userId) {
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
      <View className="flex-[60] h-full bg-[#1A1A1A]">
        <FlatList
          data={chatMessages}
          inverted={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      </View>
    </>
  );
};

export default ChatScreen;
