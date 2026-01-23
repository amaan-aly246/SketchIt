import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface GameActionModalProps {
  isVisible: boolean;
  userId: string | null;
  currentArtistId: string | null;
  artistName: string | null;
  words: string[];
  onSelect: (word: string) => void;
}

const GameActionModal = ({
  isVisible,
  userId,
  currentArtistId,
  artistName,
  words,
  onSelect,
}: GameActionModalProps) => {
  useEffect(() => {
    console.log(`userId ${userId}`);
    console.log(`currentArtistId ${currentArtistId}`);
    console.log(`is artist ${currentArtistId == userId}`);
  }, [userId, currentArtistId]);
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/80 p-6">
        <View className="bg-white w-full max-w-sm rounded-3xl p-8 items-center shadow-2xl">
          {userId == currentArtistId ? (
            //  ARTIST VIEW
            <>
              <Text className="text-2xl font-black text-gray-800 mb-2">
                You are the Artist!
              </Text>
              <Text className="text-gray-500 mb-6 text-center">
                Pick a word to start drawing:
              </Text>

              {words.map((word) => (
                <TouchableOpacity
                  key={word}
                  onPress={() => onSelect(word)}
                  className="bg-secondary-light w-full py-4 rounded-2xl mb-3 border-2 border-secondary">
                  <Text className="text-center text-xl font-bold text-secondary-dark capitalize">
                    {word}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            //  GUSSER'S VIEW
            <>
              <View className="bg-secondary/10 p-4 rounded-full mb-4">
                <ActivityIndicator size="large" color="#396273" />
              </View>

              <Text className="text-2xl font-black text-gray-800 text-center mb-2">
                Get Ready to Guess!
              </Text>

              <Text className="text-gray-600 text-center text-lg">
                Waiting for{" "}
                <Text className="font-bold text-primary-dark">
                  {artistName || "the artist"}
                </Text>{" "}
                <Text>to choose a word...</Text>
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GameActionModal;
