import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
interface GameMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onLeave: () => void;
  onClear: () => void;
  setTool: (tool: "pen" | "eraser") => void;
  currentTool: string;
}

const GameMenu = ({
  isVisible,
  onClose,
  onLeave,
  onClear,
  setTool,
  currentTool,
}: GameMenuProps) => {
  return (
    <Modal transparent visible={isVisible} animationType="none">
      <View className="flex-1 flex-row">
        {/* Left side: Transparent area to close menu when tapped */}
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />

        {/* Right side: The Sliding Menu */}
        <View className="w-64 bg-white h-full p-6 shadow-2xl justify-between">
          <SafeAreaView>
            <Text className="text-2xl font-black text-secondary mb-8">
              MENU
            </Text>

            {/* Tool Selection */}
            <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">
              Drawing Tools
            </Text>
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
              <Text className="ml-3 font-bold text-gray-600">Clear Canvas</Text>
            </TouchableOpacity>
          </SafeAreaView>

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
