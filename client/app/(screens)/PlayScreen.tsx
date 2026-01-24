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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import socket from "../config/websocket";
import type {
  ChooseWordPayload,
  EndGamePayload,
  GameState,
  RoundOverPayload,
  RoundStartedPayload,
} from "../../../shared/types";
import type { DrawPath } from "../localtypes";
import { useUserHook } from "../Context/UserContext";
import { useRouter } from "expo-router";
import ChatScreen from "../components/ChatScreen";
import LeaderBoard from "../components/LeaderBoard";
import ScoreboardModal from "../components/ScoreboardModal";
import { useRoomHook } from "../Context/RoomContext";
import GameMenu from "../components/GameMenu";
import GameActionModal from "../components/GameActionModal";
const PlayScreen = () => {
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const { userData, setUserData } = useUserHook();
  const { participants, setParticipants, setGameState, gameState } =
    useRoomHook();
  const { roomCode, userId, role } = userData;
  const currentStrokePoints = useRef<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser" | "none">("none");
  const [isScoreboardVisible, setIsScoreboardVisible] = useState(false);
  const [gameActionModalVisibility, setGameActionModalVisibility] =
    useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { roundTime, currentRound, totalRounds, isRoundActive, isGameActive } =
    gameState;
  const [currTime, setCurrTime] = useState<number>(roundTime);
  const [wordChoices, setWordChoices] = useState<string[]>([]);

  const router = useRouter();
  const onSelect = (word: string) => {
    setWordChoices([]);
    setGameActionModalVisibility(false);
    socket.emit("wordSelected", { roomCode, word });
  };
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
          canvasHistory: [],
          foundAnswer: false,
          score: 0,
          role: "guesser",
          isAdmin: false,
        });
        setGameState((prevState: GameState) => ({
          ...prevState,
          currentRound: 0,
          roundTime: 10,
          totalRounds: 3,
          currentArtistId: null,
          currentArtistName: null,
          isRoundActive: false,
          isGameActive: false,
          selectedWord: null,
        }));
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
    let interval: number;

    if (isRoundActive) {
      interval = setInterval(() => {
        setCurrTime((prev) => {
          // console.log(`time : ${prev}`);
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRoundActive]);
  useEffect(() => {
    socket.on("clearcanvas", () => {
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
      },
    );

    socket.on("roundStarted", (res: RoundStartedPayload) => {
      setGameState((prevState: GameState) => ({
        ...prevState,
        isRoundActive: true,
        totalRounds: res.totalRounds,
        currentRound: res.currentRound,
        selectedWord: res.word,
      }));
      setCurrTime(res.roundTime);
      setGameActionModalVisibility(false);
    });
    socket.on("roundOver", (res: RoundOverPayload) => {
      console.log("round Over");
      onPressClearCanvas(); // clear the canvas for the next round
      setParticipants(res.participants);
      setUserData((prevData) => ({
        ...prevData,
        foundAnswer: false,
        role: "guesser",
      }));
      setTool("none");
      setCurrTime(res.roundTime); // reset the clock after each round
      setGameState((prevState: GameState) => ({
        ...prevState,
        isGameActive: true,
        isRoundActive: false,
      }));
      setIsScoreboardVisible(true); // pop-up the scoreboard after each round
      //  Wait 10s for scoreboard then start next round and close the scoreboard
      setTimeout(() => setIsScoreboardVisible(false), 10000);
    });
    socket.on("endGame", (res: EndGamePayload) => {
      console.log(`game end`);
      setParticipants(res.participants);
      onPressClearCanvas(); // clear the canvas
      setGameState((prevState: GameState) => ({
        ...prevState,
        isGameActive: false,
        isRoundActive: false,
      }));
      setIsScoreboardVisible(true); // pop-up the scoreboard when game ends
    });
    socket.on("chooseWord", (res: ChooseWordPayload) => {
      setGameState((prevState: GameState) => ({
        ...prevState,
        currentRound: res.currentRound,
        currentArtistId: res.nextArtist.userId,
        currentArtistName: res.nextArtist.userName,
        isGameActive: true,
      }));
      setIsMenuVisible(false);
      setGameActionModalVisibility(true);
      if (res.nextArtist.userId == userId) {
        // this user will draw this round
        setUserData((prevData) => ({
          ...prevData,
          role: "artist",
        }));
        setTool("pen");
        setWordChoices(res.words);
      }
    });
    return () => {
      socket.off("receive");
      socket.off("clearcanvas");
      socket.off("roundStarted");
      socket.off("endGame");
      socket.off("roundOver");
      socket.off("chooseWord");
    };
  }, []);
  useEffect(() => {
    if (userData.canvasHistory && userData.canvasHistory.length > 0) {
      console.log("Restoring canvas history...");

      const restoredPaths = userData.canvasHistory.map((stroke: any) => {
        const skPath = Skia.Path.Make();

        stroke.points.forEach((pt: { x: number; y: number }, i: number) => {
          if (i === 0) skPath.moveTo(pt.x, pt.y);
          else skPath.lineTo(pt.x, pt.y);
        });

        return {
          path: skPath,
          tool: stroke.tool,
        };
      });

      setPaths(restoredPaths);
    }
  }, []);
  // const panResponder = PanResponder.create({
  //   onStartShouldSetPanResponder: () => true,

  //   onPanResponderGrant(e) {
  //     const { locationX, locationY } = e.nativeEvent;
  //     const newPath = Skia.Path.Make();
  //     newPath.moveTo(locationX, locationY);
  //     currentStrokePoints.current = [{ x: locationX, y: locationY }];
  //     setCurrentPath({ path: newPath, tool });
  //   },

  //   onPanResponderMove(e) {
  //     const { locationX: x, locationY: y } = e.nativeEvent;
  //     if (currentPath) {
  //       currentPath.path.lineTo(x, y);
  //       setCurrentPath({
  //         path: currentPath.path.copy(),
  //         tool: currentPath.tool,
  //       });
  //       currentStrokePoints.current.push({ x, y });
  //     }
  //   },

  //   onPanResponderRelease() {
  //     if (currentPath) {
  //       setPaths((prev) => [...prev, currentPath]);
  //       socket.emit(
  //         "drawstroke",
  //         currentStrokePoints.current,
  //         currentPath.tool,
  //         roomCode,
  //       );
  //       currentStrokePoints.current = [];
  //       setCurrentPath(null);
  //     }
  //   },
  // });
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant(e) {
      const { locationX, locationY } = e.nativeEvent;
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      currentStrokePoints.current = [{ x: locationX, y: locationY }];
      setCurrentPath({ path: newPath, tool });

      // Notify guesser that a new stroke has started
      socket.emit(
        "drawstroke",
        [{ x: locationX, y: locationY }],
        tool,
        roomCode,
      );
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

        // Emit every movement point immediately for live updates
        socket.emit("drawstroke", currentStrokePoints.current, tool, roomCode);
      }
    },

    onPanResponderRelease() {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);

        // Final emit to ensure the full path is synced
        socket.emit("drawstroke", currentStrokePoints.current, tool, roomCode);

        currentStrokePoints.current = [];
        setCurrentPath(null);
      }
    },
  });
  // useEffect(() => {
  //   console.log(`isGameActive ${isGameActive}`);
  //   console.log(`isRoundActive ${isRoundActive}`);
  // }, [isRoundActive, isGameActive]);
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1">
        {/* Top heading */}
        <View className="flex-[12] bg-white border-b border-gray-100 flex-row items-center px-4 justify-between">
          {/*  Timer & Round Info */}
          <View className="flex-row items-center space-x-3">
            <View className="bg-secondary/10 px-3 py-1.5 rounded-2xl flex-row items-center">
              <MaterialCommunityIcons
                name="timer-outline"
                size={24}
                color="#396273"
              />
              <Text className="ml-1.5 font-black text-xl text-secondary-dark">
                {currTime}s
              </Text>
            </View>
            <View className="bg-gray-100 px-3 py-1.5 rounded-2xl">
              <Text className="font-bold text-gray-500">
                {currentRound}/{totalRounds}
              </Text>
            </View>
          </View>

          {/* Word Hint (The "Dashes") */}
          <View className="items-center justify-center pt-2">
            {isGameActive &&
              (!isRoundActive ? (
                <Text className="font-bold text-gray-400 italic">
                  Waiting...
                </Text>
              ) : (
                <View className="relative">
                  <View className="flex-row space-x-1 items-end">
                    <Text className="text-2xl font-black tracking-[4px] text-gray-800">
                      {role === "artist"
                        ? gameState?.selectedWord || ""
                        : gameState?.selectedWord
                          ? "_ ".repeat(gameState.selectedWord.length).trim()
                          : ""}
                    </Text>

                    {gameState?.selectedWord && (
                      <Text className="text-[10px] font-bold text-secondary-dark bg-secondary/10 px-1 rounded absolute -top-1 -right-4">
                        {gameState.selectedWord.length}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
          </View>

          {/*Settings & Room Code */}
          <View className="flex-row items-center">
            <Text className="mr-3 font-mono text-lg text-gray-400  tracking-tighter">
              {roomCode}
            </Text>
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              className="p-2 bg-gray-50 rounded-full">
              <Feather name="menu" size={24} color="#396273" />
            </TouchableOpacity>
          </View>

          <GameMenu
            isVisible={isMenuVisible}
            onClose={() => setIsMenuVisible(false)}
            onLeave={onPressLeaveRoom}
            onClear={onPressClearCanvas}
            setTool={setTool}
            currentTool={tool}
            toggleScoreboard={setIsScoreboardVisible}
            roomCode={roomCode}
          />
        </View>
        {/* Canvas  */}
        <View
          className="flex-[40]  "
          {...panResponder.panHandlers}
          pointerEvents={
            gameState.currentArtistId == userData.userId ? "auto" : "none"
          }>
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

        {/*  leaderboard and chatscreen */}
        <View className="flex-[40]  bg-lime-300  ">
          <View className="flex-row flex-1">
            <LeaderBoard />
            <ChatScreen />
          </View>
        </View>
        <ScoreboardModal
          isVisible={isScoreboardVisible}
          onClose={() => setIsScoreboardVisible(false)}
          participants={participants} // Pass your current participants list
          isGameActive={isGameActive}
          onLeave={onPressLeaveRoom}
        />
        {/* Game action modal */}
        <GameActionModal
          currentArtistId={gameState.currentArtistId}
          userId={userData.userId}
          artistName={gameState.currentArtistName}
          isVisible={gameActionModalVisibility}
          words={wordChoices}
          onSelect={onSelect}
        />
        <View className="  absolute bottom-0 right-0 left-0">
          <Chat role={role} />
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
