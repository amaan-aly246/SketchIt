import { PanResponder, Text, TouchableOpacity, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { SkPath } from "@shopify/react-native-skia";
import { io } from "socket.io-client"
import { useEffect, useState } from "react";
import config from "./config";

const socket = io(config.env.server_url, {
  autoConnect: false
});

export default function Index() {

  const onPressClearCanvas = (): void => {
    setPaths([]);
  };
  const onPressConnectToSocket = (): void => {
    console.log('Socket btn working fine')
    socket.connect();
  }
  const onPressDisconnectToSocket = () => {
    socket.disconnect()
  }
  const [paths, setPaths] = useState<SkPath[]>([])
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null)

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`✅ Connected to server with id: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected`);
    });

    socket.on("connect_error", (err) => {
      console.log("🚨 Connection error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant(e) {
      const { locationX, locationY } = e.nativeEvent;
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      setCurrentPath(newPath);
    },

    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      if (currentPath) {
        currentPath.lineTo(locationX, locationY);
        setCurrentPath(currentPath.copy());
      }

    },

    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths([...paths, currentPath]);
        setCurrentPath(null)
      }
    }
  })



  return (

    <View className=" flex-1 text-black bg-red-300 ">

      <Text className=" text-2xl text-center">This is canvas to draw! </Text>
      <View className=" flex-1" {...panResponder.panHandlers}>
        <Canvas style={{ height: "50%", backgroundColor: 'white' }}>
          {
            paths.map((p, i) => (
              <Path key={i} path={p} color="red" style="stroke" strokeWidth={4} />
            ))
          }
          {currentPath && (
            <Path path={currentPath} color="red" style="stroke" strokeWidth={4} />
          )}
        </Canvas>
      </View>
      <View className="mb-6 gap-4">

        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto   " onPress={onPressClearCanvas} >
          <Text className="font-semibold text-white"> Clear canvas </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto   " onPress={onPressConnectToSocket} >
          <Text className="font-semibold text-white"> Connect to websocekt! </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto   " onPress={onPressDisconnectToSocket} >
          <Text className="font-semibold text-white"> Disconnect  to websocekt! </Text>
        </TouchableOpacity>
      </View>
    </View >
  );

}
