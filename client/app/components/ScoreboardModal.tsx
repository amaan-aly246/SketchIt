import React from "react";
import type { Participant } from "../types/types";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

interface ScoreboardModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLeave: () => void;
  participants: Participant[];
  isGameActive: boolean;
}

const ScoreboardModal = ({
  isVisible,
  onClose,
  participants,
  isGameActive,
  onLeave,
}: ScoreboardModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      {/* Semi-transparent Backdrop */}
      <View className="flex-1 justify-center items-center bg-black/70">
        {/* Modal Content Card */}
        <View className="bg-white w-[90%] max-h-[70%] p-6 rounded-3xl shadow-2xl border-4 border-secondary">
          <Text className="text-3xl font-black text-center mb-6 text-secondary uppercase tracking-widest">
            {!isGameActive ? "Final Results" : "Round Over!"}
          </Text>

          <ScrollView className="mb-6">
            {participants.map((player, index) => (
              <View
                key={player.userId}
                className={`flex-row justify-between items-center p-4 mb-2 rounded-xl ${
                  index === 0
                    ? "bg-yellow-100 border-2 border-yellow-500"
                    : "bg-gray-100"
                }`}>
                <View className="flex-row items-center">
                  <Text className="font-bold text-lg mr-3 w-6 text-gray-500">
                    {index + 1}.
                  </Text>
                  <Text className="font-bold text-lg text-gray-800">
                    {player.userName} {index === 0 && "👑"}
                  </Text>
                </View>

                <Text className="text-blue-600 font-black text-lg">
                  {player.score || 0} pts
                </Text>
              </View>
            ))}
          </ScrollView>

          {/*  Close Button for testing purposes */}
          <TouchableOpacity
            className="bg-secondary py-4 rounded-2xl"
            onPress={() => {
              if (isGameActive) {
                onClose();
              } else {
                onClose();
                onLeave();
              }
            }}>
            <Text className="text-white text-center font-black text-xl">
              {!isGameActive ? "Leave Room" : "CONTINUE"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ScoreboardModal;
