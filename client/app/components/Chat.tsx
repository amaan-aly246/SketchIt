import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native";
import socket from "../config/websocket";
import { useUserHook } from "../Context/UserContext";
import Keyboard from "./Keyboard";
import { PlayerRole } from "../../../shared/types";
interface ChatProps {
  role: PlayerRole;
}
const Chat = ({ role }: ChatProps) => {
  const {
    userData: { roomCode, userId, userName, foundAnswer },
  } = useUserHook();
  const [message, setMessage] = useState<string>("");
  const [keyboardState, setKeyboardState] = useState<"visible" | "hidden">(
    "hidden",
  );

  const handleKeyboardState = () => {
    if (keyboardState == "visible") {
      setKeyboardState("hidden");
    } else {
      setKeyboardState("visible");
    }
  };
  const onPressSendMessage = () => {
    if (!socket.connected) {
      console.warn("Cannot send message: WebSocket is disconnected.");
      return;
    }
    if (!message.trim()) return;
    socket.emit("sendmessage", {
      roomCode,
      message: message.trim(),
      userName,
      userId,
    });

    setMessage("");
  };
  return (
    <View>
      <View className="bg-primary flex-row items-center ">
        <TextInput
          className="border-sky-100 border-2 flex-1 text-white px-2 py-2 "
          // placeholder={foundAnswer ? "You gussed already." : "Enter your guess"}
          placeholder={
            foundAnswer
              ? "You guessed already"
              : role == "artist"
                ? "You are drawing. Can't guess."
                : "Enter your guess"
          }
          placeholderTextColor="white"
          value={message}
          onChangeText={setMessage}
          showSoftInputOnFocus={false}
          caretHidden={false}
          onPress={handleKeyboardState}
        />
        <TouchableOpacity
          className={`p-3 ml-2 w-24 ${
            message.trim() && !foundAnswer ? "bg-blue-500" : "bg-blue-200"
          }`}
          onPress={onPressSendMessage}
          disabled={!message.trim() || foundAnswer || role == "artist"}>
          <Text className="text-center text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>

      <View className={`${keyboardState}`}>
        <Keyboard
          onKeyPress={(key) => setMessage((prev) => prev + key)}
          onBackspace={() => setMessage((prev) => prev.slice(0, -1))}
        />
      </View>
    </View>
  );
};

export default Chat;
