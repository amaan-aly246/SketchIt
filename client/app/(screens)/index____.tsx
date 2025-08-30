import { PanResponder, Text, TouchableOpacity, View } from "react-native";
import { Canvas, Path, Skia, SkPath } from "@shopify/react-native-skia";
import { useEffect, useState, useRef } from "react";
import socket from "../config/websocket";
import { useUserHook } from "../Context/UserContext";

type DrawPath = {
  path: SkPath;
  tool: "pen" | "eraser";
};

export default function Index() {
  const { userData: { roomCode } } = useUserHook()
  const currentStrokePoints = useRef<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const onPressClearCanvas = () => {
    setPaths([]);
    socket.emit('clearcanvas', { roomCode });
  }
  const onPressConnectToSocket = () => socket.connect();
  const onPressDisconnectToSocket = () => socket.disconnect();

  useEffect(() => {
    socket.on("connect", () => console.log(`Connected: ${socket.id}`));
    socket.on("disconnect", () => console.log(`Disconnected`));
    socket.on("connect_error", (err) => console.log("Connection error:", err.message));
    socket.on("clearcanvas", () => {
      setPaths([])
    })
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
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
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
        setCurrentPath({ path: currentPath.path.copy(), tool: currentPath.tool });
        currentStrokePoints.current.push({ x, y });
      }
    },

    onPanResponderRelease() {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);
        socket.emit("drawstroke", currentStrokePoints.current, currentPath.tool, roomCode);
        currentStrokePoints.current = [];
        setCurrentPath(null);
      }
    }
  });

  return (
    <View className="flex-1 bg-red-300">
      <Text className="text-2xl text-center">This is canvas to draw!</Text>
      <View className="flex-1" {...panResponder.panHandlers}>
        <Canvas style={{ height: "50%", backgroundColor: "white" }}>
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

      <View className="mb-6 gap-4">
        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressClearCanvas}>
          <Text className="font-semibold text-white">Clear canvas</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressConnectToSocket}>
          <Text className="font-semibold text-white">Connect to websocket</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressDisconnectToSocket}>
          <Text className="font-semibold text-white">Disconnect websocket</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-6 mx-auto gap-2">
        <TouchableOpacity className="bg-purple-300 p-5" onPress={() => setTool("eraser")}>
          <Text>Eraser</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-purple-300 p-5" onPress={() => setTool("pen")}>
          <Text>Pen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
