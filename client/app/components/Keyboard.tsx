import { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

const Keyboard = ({ onKeyPress, onBackspace }: KeyboardProps) => {
  const [caps, setCaps] = useState(false);

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Caps", "z", "x", "c", "v", "b", "n", "m", "⌫"],
    ["Space"]
  ];

  return (
    <View className="p-2 bg-primary">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-center mb-2">
          {row.map((key) => {
            let displayKey = key;

            if (key !== "Caps" && key !== "⌫" && key !== "Space") {
              displayKey = caps ? key.toUpperCase() : key.toLowerCase(); //  display respects Caps state
            }

            return (
              <TouchableOpacity
                key={key}
                className={`bg-primary-dark m-1 px-3 py-2 rounded ${key === "Space" ? "px-16" : ""}`}
                onPress={() => {
                  if (key === "Caps") setCaps(!caps);
                  else if (key === "⌫") onBackspace();
                  else if (key === "Space") onKeyPress(" ");
                  else onKeyPress(caps ? key.toUpperCase() : key);
                }}
              >
                <Text className="text-white text-lg">
                  {displayKey}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default Keyboard;
