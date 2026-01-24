import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import socket from "../config/websocket";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRoomHook } from "../Context/RoomContext";
import { useUserHook } from "../Context/UserContext";
import type { GameState } from "../../../shared/types";
interface GameMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLeave: () => void;
  onClear: () => void;
  setTool: (tool: "pen" | "eraser" | "none") => void;
  currentTool: string;
  toggleScoreboard: React.Dispatch<React.SetStateAction<boolean>>;
  roomCode: string | null;
}

const GameMenu = ({
  isVisible,
  onClose,
  onLeave,
  onClear,
  setTool,
  currentTool,
  toggleScoreboard,
  roomCode,
}: GameMenuProps) => {
  const { setGameState, gameState } = useRoomHook();
  const { totalRounds, roundTime, isRoundActive } = gameState;
  const { userData } = useUserHook();
  const startGame = async () => {
    if (!roomCode) {
      console.error(`Room code is required and its not present`);
      return;
    }

    socket.emit("startGame", { roomCode, totalRounds, roundTime });
    setGameState((prevState: GameState) => ({
      ...prevState,
      totalRounds: prevState.totalRounds,
      isGameActive: true,
    }));
  };

  // useEffect(() => {
  //   console.log(`isRoundActive ${isRoundActive}`);
  //   console.log(`isAdmin ${userData.isAdmin}`);
  // }, [isRoundActive]);
  return (
    <Modal transparent visible={isVisible} animationType="none">
      <View className="flex-1 flex-row">
        {/* Left side: Transparent area to close menu when tapped */}
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />

        {/* Right side: The Sliding Menu */}
        <View className="w-64 bg-white h-full p-6 shadow-2xl justify-between">
          <SafeAreaView>
            <Text className="text-2xl font-black text-primary mb-8">MENU</Text>
            {/* Drawing related action */}
            {currentTool != "none" && (
              <>
                <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">
                  Drawing Tools
                </Text>
                {/* pen */}
                <TouchableOpacity
                  onPress={() => {
                    setTool("pen");
                    onClose();
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${currentTool === "pen" ? "bg-blue-100" : "bg-gray-50"}`}>
                  <Ionicons
                    name="pencil"
                    size={24}
                    color={currentTool === "pen" ? "#3b82f6" : "gray"}
                  />
                  <Text
                    className={`ml-3 font-bold ${currentTool === "pen" ? "text-blue-600" : "text-gray-600"}`}>
                    Pen Tool
                  </Text>
                </TouchableOpacity>
                {/* eraser */}
                <TouchableOpacity
                  onPress={() => {
                    setTool("eraser");
                    onClose();
                  }}
                  className={`flex-row items-center p-4 rounded-xl mb-6 ${currentTool === "eraser" ? "bg-blue-100" : "bg-gray-50"}`}>
                  <FontAwesome
                    name="eraser"
                    size={24}
                    color={currentTool === "eraser" ? "#3b82f6" : "gray"}
                  />
                  <Text
                    className={`ml-3 font-bold ${currentTool === "eraser" ? "text-blue-600" : "text-gray-600"}`}>
                    Eraser
                  </Text>
                </TouchableOpacity>

                {/* Actions */}
                <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">
                  Canvas Actions
                </Text>
                {/* Clear canvas btn */}
                <TouchableOpacity
                  onPress={() => {
                    onClear();
                    onClose();
                  }}
                  className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-2">
                  <Ionicons name="trash-outline" size={24} color="gray" />
                  <Text className="ml-3 font-bold text-gray-600">
                    Clear Canvas
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {/* <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">
              General
            </Text> */}
            {/* scoreboard btn for testing only */}
            {/* <TouchableOpacity
              onPress={() => {
                onClose();
                toggleScoreboard(true);
              }}
              className={`flex-row bg-gray-50 items-center p-4 rounded-xl mb-2 `}>
              <MaterialCommunityIcons
                name="scoreboard-outline"
                size={24}
                color="gray"
              />
              <Text className={`ml-3 font-bold text-gray-600`}>Scorecard</Text>
            </TouchableOpacity> */}
            {/* admin settings  */}
            {/* show admin settings to admin only and when round haven't started */}
            {userData.isAdmin && !isRoundActive && (
              <>
                <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">
                  Admin
                </Text>

                <View className="flex-col  justify-between mb-4">
                  {/* Rounds Selector */}
                  <View className=" mb-2 bg-gray-100 p-3 rounded-xl items-center">
                    <Text className="text-[10px] uppercase text-gray-500 font-bold">
                      Rounds
                    </Text>
                    <View className="flex-row items-center mt-1">
                      {/* decrement rounds */}
                      <TouchableOpacity
                        onPress={() =>
                          setGameState((prev: GameState) => ({
                            ...prev,
                            totalRounds: Math.max(1, prev.totalRounds - 1),
                          }))
                        }>
                        <AntDesign name="minus" size={20} color="gray" />
                      </TouchableOpacity>
                      <Text className="mx-4 font-bold text-lg">
                        {totalRounds}
                      </Text>
                      {/* increment rounds */}
                      <TouchableOpacity
                        onPress={() =>
                          setGameState((prev: GameState) => ({
                            ...prev,
                            totalRounds: Math.min(10, prev.totalRounds + 1),
                          }))
                        }>
                        <AntDesign name="plus" size={20} color="gray" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Time Selector */}
                  <View className="  bg-gray-100 p-3 rounded-xl items-center">
                    <Text className="text-[10px] uppercase text-gray-500 font-bold">
                      Time per Round
                    </Text>
                    <View className="flex-row items-center mt-1">
                      {/* Decrement Button */}
                      <TouchableOpacity
                        onPress={() =>
                          setGameState((prev: GameState) => ({
                            ...prev,
                            roundTime: Math.max(10, prev.roundTime - 10),
                          }))
                        }>
                        <AntDesign
                          name="minus"
                          size={20}
                          color={roundTime === 10 ? "lightgray" : "gray"}
                        />
                      </TouchableOpacity>

                      <Text className="mx-4 font-bold text-lg">
                        {roundTime}s
                      </Text>

                      {/* Increment Button */}
                      <TouchableOpacity
                        onPress={() =>
                          setGameState((prev: GameState) => ({
                            ...prev,
                            roundTime: Math.min(120, prev.roundTime + 10),
                          }))
                        }>
                        <AntDesign
                          name="plus"
                          size={20}
                          color={roundTime === 120 ? "lightgray" : "gray"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {/* Start Button */}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    startGame();
                  }}
                  className="flex-row bg-red-50 items-center p-4 rounded-xl mb-2">
                  <Entypo name="controller-play" size={24} color="red" />
                  <Text className="ml-3 font-bold text-red-500 uppercase">
                    Start Game
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </SafeAreaView>
          {/* Leave room btn */}
          <TouchableOpacity
            onPress={onLeave}
            className="flex-row items-center p-4 bg-red-50 rounded-xl">
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="ml-3 font-bold text-red-500">Leave Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GameMenu;
