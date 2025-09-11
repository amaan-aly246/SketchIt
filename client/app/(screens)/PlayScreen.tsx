import { View, Text, SafeAreaView } from 'react-native'
import Chat from '../components/Chat'
import { useEffect, useState } from 'react';
import { Skia, Path, Canvas } from '@shopify/react-native-skia';
import socket from '../config/websocket';
import { DrawPath } from '../types/types';
const PlayScreen = () => {

  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  useEffect(() => {
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
      socket.off("receive");
      socket.off("clearcanvas");
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary">

      <View className="flex-1">
        <View className="flex-[10] bg-yellow-200 justify-center items-center">
          <Text>Heading</Text>
        </View>

        <View className="flex-[50]  ">
          <Canvas style={{ height: "100%", backgroundColor: "white" }}>
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

        <View className="flex-[40] bg-lime-300 justify-center items-center">
          <Text>Split screen</Text>
        </View>

        <View className=" bg-orange-300 flex-10 py-2">
          <Text>text</Text>
        </View>
      </View>

      <View className="  absolute bottom-9 right-0 left-0">
        <Chat />
      </View>
    </SafeAreaView>
  )
}

export default PlayScreen
