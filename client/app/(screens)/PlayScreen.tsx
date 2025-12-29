import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import Chat from "../components/Chat";
import { useEffect, useState, useRef } from "react";
import { Skia, Path, Canvas } from "@shopify/react-native-skia";
import socket from "../config/websocket";
import { DrawPath } from "../types/types";
import { useUserHook } from "../Context/UserContext";
import { useRouter } from "expo-router";
import ChatScreen from "../components/ChatScreen";
import LeaderBoard from "../components/LeaderBoard";
const PlayScreen = () => {
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const { userData, setUserData } = useUserHook();
  const { userName, roomCode, userId, roomName } = userData;
  const currentStrokePoints = useRef<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const router = useRouter();
  const onPressLeaveRoom = () => {
    if (!roomCode) {
      console.error(`Room code is required and its not present`);
      return;
    }

    socket.emit("leaveroom", { roomCode, userId }, (response: any) => {
      if (response.success) {
        console.log(`Left room ${roomCode} successfully.`);
        setUserData({
          ...userData,
          userId: null,
          roomCode: null,
          roomName: null,
          userName: null,
        });
        if (socket.connected) {
          socket.disconnect();
          console.log("WebSocket connection disconnected.");
        }
        router.dismissAll(); // Clears the stack and goes back to index
      } else {
        console.error(`error: ${response.error}`);
      }
    });
  };
  const onPressClearCanvas = () => {
    setPaths([]);
    console.log("send cleaning event to the server ");
    socket.emit("clearcanvas", roomCode);
  };
  useEffect(() => {
    socket.on("clearcanvas", () => {
      console.log("cleaning event received from server ");
      setPaths([]);
    });
    socket.on(
      "receive",
      (points: { x: number; y: number }[], receivedTool: "pen" | "eraser") => {
        const newPath = Skia.Path.Make();
        points.forEach((pt, i) => {
          if (i === 0) newPath.moveTo(pt.x, pt.y);
          else newPath.lineTo(pt.x, pt.y);
        });

        setPaths((prev) => [...prev, { path: newPath, tool: receivedTool }]);
      }
    );

    return () => {
      socket.off("receive");
      socket.off("clearcanvas");
    };
  }, []);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant(e) {
      const { locationX, locationY } = e.nativeEvent;
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      currentStrokePoints.current = [{ x: locationX, y: locationY }];
      setCurrentPath({ path: newPath, tool });
    },

    onPanResponderMove(e) {
      const { locationX: x, locationY: y } = e.nativeEvent;
      if (currentPath) {
        currentPath.path.lineTo(x, y);
        setCurrentPath({
          path: currentPath.path.copy(),
          tool: currentPath.tool,
        });
        currentStrokePoints.current.push({ x, y });
      }
    },

    onPanResponderRelease() {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);
        socket.emit(
          "drawstroke",
          currentStrokePoints.current,
          currentPath.tool,
          roomCode
        );
        currentStrokePoints.current = [];
        setCurrentPath(null);
      }
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1">
        <View className="flex-[10] bg-yellow-200 flex-row items-center justify-around">
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded"
            onPress={onPressLeaveRoom}>
            <Text className="text-white font-semibold">Leave</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded ${
              tool === "eraser" ? "bg-green-400" : "bg-blue-500"
            }`}
            onPress={() => setTool("eraser")}>
            <Text className="font-semibold text-white">Eraser</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-4 py-2 rounded ${
              tool === "pen" ? "bg-green-400" : "bg-blue-500"
            }`}
            onPress={() => setTool("pen")}>
            <Text className="font-semibold text-white">Pen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded  bg-blue-500`}
            onPress={onPressClearCanvas}>
            <Text className="font-semibold text-white">Clear canvas</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-[40]  " {...panResponder.panHandlers}>
          <Canvas style={{ flex: 1, backgroundColor: "white" }}>
            {paths.map((p, i) => (
              <Path
                key={`path-${i}`}
                path={p.path}
                color={p.tool === "pen" ? "red" : "white"}
                style="stroke"
                strokeWidth={p.tool === "pen" ? 4 : 20}
              />
            ))}
            {currentPath && (
              <Path
                path={currentPath.path}
                color={currentPath.tool === "pen" ? "red" : "white"}
                style="stroke"
                strokeWidth={currentPath.tool === "pen" ? 4 : 20}
              />
            )}
          </Canvas>
        </View>

        <View className="flex-[40]  bg-lime-300  ">
          <View className="flex-row flex-1">
            <LeaderBoard />
            <ChatScreen />
          </View>
        </View>

        <View className="  absolute bottom-0 right-0 left-0">
          <Chat />
        </View>
        {/* DON'T REMOVE. FOR STYLING PURPOSES  */}
        <View className="flex-[5]">
          <Text className="text-primary -z-10">hello</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlayScreen;
