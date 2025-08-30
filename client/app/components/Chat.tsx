import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  Text
} from "react-native";
import socket from "../config/websocket";
import { ChatMssg } from "../types/types";
import { useUserHook } from "../Context/UserContext";
const Chat = () => {
  const { userData: { roomCode } } = useUserHook()
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMssg[]>([]); // all the messages in the chat 
  const onPressSendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendmessage", {
      roomCode,
      message: message.trim(),
    });

    console.log(`📤 Message sent: ${message}`);
    setMessage("");
  };
  useEffect(() => {
    socket.on("receivemessage", (mssg: string) => {
      console.log(`message received : ${mssg}`)
    })

    return () => {
      socket.off("receivemessage")
    }
  }, [])
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={95}
    >
      <View style={{ flex: 1 }} />

      <View className="bg-slate-300 flex-row items-center ">
        <TextInput
          className="border-sky-100 border-2 flex-1 text-black px-2 py-2 rounded-md"
          placeholder="Enter message here"
          placeholderTextColor="gray"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          className={`p-3 ml-2 w-24 rounded-md ${message.trim() ? "bg-blue-500" : "bg-blue-200"
            }`}
          onPress={onPressSendMessage}
          disabled={!message.trim()}
        >
          <Text className="text-center text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;
