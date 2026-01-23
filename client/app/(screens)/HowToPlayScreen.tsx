import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router, useRouter } from "expo-router";

const steps = [
  {
    icon: <Feather name="users" size={28} color="#396273" />,
    title: "Join a Room",
    desc: "Create a private room or join your friends using a unique Room Code.",
  },
  {
    icon: (
      <MaterialCommunityIcons
        name="palette-outline"
        size={28}
        color="#396273"
      />
    ),
    title: "The Artist's Turn",
    desc: "If you're the artist, pick a word and draw it on the canvas. No letters or numbers allowed!",
  },
  {
    icon: <FontAwesome5 name="keyboard" size={24} color="#396273" />,
    title: "The Guessers",
    desc: "Watch the drawing in real-time and type your guesses in the chat as fast as you can.",
  },
  {
    icon: (
      <MaterialCommunityIcons name="trophy-outline" size={28} color="#396273" />
    ),
    title: "Earn Points",
    desc: "The faster you guess the word, the more points you earn. The artist also gets points when people guess correctly!",
  },
];
const onBack = () => {
  router.dismissAll();
};
const HowToPlayScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 pb-4 px-6 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
          <Feather name="arrow-left" size={28} color="#396273" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-secondary-dark ml-2">
          How to Play
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 mb-8 leading-6 text-lg">
          SketchIt is a multiplayer drawing and guessing game. Follow these
          simple steps to become a master:
        </Text>

        {steps.map((step, index) => (
          <View key={index} className="flex-row mb-8">
            <View className="bg-secondary/10 w-14 h-14 rounded-2xl items-center justify-center mr-4">
              {step.icon}
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-xl font-black text-gray-800 mb-1">
                {step.title}
              </Text>
              <Text className="text-gray-600 leading-5">{step.desc}</Text>
            </View>
          </View>
        ))}

        {/* Pro Tip Box */}
        <View className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200 mb-10">
          <View className="flex-row items-center mb-2">
            <Feather name="zap" size={20} color="#ca8a04" />
            <Text className="font-black text-yellow-700 ml-2 uppercase text-xs tracking-widest">
              Pro Tip
            </Text>
          </View>
          <Text className="text-yellow-800">
            Keep an eye on the dashes at the top of the screen. They reveal the
            number of letters !
          </Text>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View className="p-6 border-t border-gray-100">
        <TouchableOpacity
          onPress={onBack}
          className="bg-primary py-4 rounded-2xl shadow-lg shadow-secondary/30">
          <Text className="text-white text-center font-black text-xl">
            Got it!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HowToPlayScreen;
