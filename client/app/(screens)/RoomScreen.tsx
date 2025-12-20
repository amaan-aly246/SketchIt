import { useLocalSearchParams } from "expo-router";
import { useUserHook } from "../Context/UserContext";
import generateRoomId from "../utils/generateRoomId";
import { Response } from "../types/types";
import socket from "../config/websocket";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from "react-native";
type CreateRoomData = {
  userId: string;
};

type JoinRoomData = {
  userId: string;
};
const RoomScreen = () => {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { userData, setUserData } = useUserHook();
  const { userName, roomCode, userId, roomName } = userData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to handle the socket connection and wait for the 'connect' event
  const connectSocketAsync = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (socket.connected) {
        console.log("socket is connected ");
        return resolve();
      }

      const handleConnect = () => {
        cleanup();
        resolve();
      };

      const handleError = (err: any) => {
        console.log("connection failed here");
        cleanup();
        reject(new Error("Socket connection failed: " + err.message));
      };

      const cleanup = () => {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleError);
      };

      socket.once("connect", handleConnect);
      socket.once("connect_error", handleError);

      // Initiate the connection attempt
      socket.connect();
    });
  }, []);

  const onPressCreateRoom = async () => {
    if (isSubmitting) return; // Prevent double-click
    console.log("room name ", roomName);
    console.log(" name ", userName);
    if (!userName || !roomName) {
      console.warn(`Username and room name are not present`);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting to connect to socket...");
      await connectSocketAsync();
      console.log("Socket connected successfully. Proceeding to create room.");

      const roomCode = generateRoomId();

      socket.emit(
        "createroom",
        { userName, roomName, roomCode },
        (response: Response<CreateRoomData>) => {
          setIsSubmitting(false);

          if (response.success) {
            const data = response.data;
            console.log("User created room, User ID:", data?.userId);

            if (data?.userId) {
              setUserData({
                ...userData,
                roomCode,
                userId: data.userId,
                roomName,
              });
              router.push({
                pathname: "/PlayScreen",
              });
            }
          } else {
            console.error("Room creation error:", response.error);
          }
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error("Fatal Connection or Room Creation Error:", error);
    }
  };

  const onPressJoinRoom = async () => {
    if (isSubmitting) return; // Prevent double submission

    if (!roomCode || !userName) {
      console.warn(`Room code and user name are required`);
      return;
    }

    setIsSubmitting(true);

    try {
      await connectSocketAsync();

      socket.emit(
        "joinroom",
        { roomCode, userName },
        (response: Response<JoinRoomData>) => {
          setIsSubmitting(false);

          if (response.success) {
            const data = response.data;

            if (data?.userId) {
              console.log(
                `User ${data.userId} joined room ${roomCode} successfully.`
              );

              setUserData({
                ...userData,
                roomCode,
                userId: data.userId,
                roomName,
              });
              router.push({
                pathname: "/PlayScreen",
              });
            }
          } else {
            console.error(`Error joining room:`, response.error);
            // do to:  show this error to the user
          }
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error("Fatal Connection Error during join attempt:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="mt-[30%] mx-[13%] gap-5 p-10 rounded-2xl flex bg-secondary">
        <Text className="capitalize text-primary-dark font-NunitoItalica text-4xl">
          {mode} room{" "}
        </Text>

        <View>
          <Text className="capitalize text-primary-dark font-NunitoItalica text-2xl">
            user name
          </Text>
          <TextInput
            placeholder="enter your name"
            placeholderTextColor={"black"}
            className=" px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  "
            value={userName ?? ""}
            onChangeText={(text) =>
              setUserData({ ...userData, userName: text })
            }
          />
        </View>

        {mode == "join" ? (
          <>
            <View>
              <Text className="capitalize text-primary-dark font-NunitoItalica text-2xl">
                room code
              </Text>
              <TextInput
                placeholder="enter room code "
                placeholderTextColor={"black"}
                className=" px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  "
                value={roomCode ?? ""}
                onChangeText={(text) =>
                  setUserData({ ...userData, roomCode: text })
                }
              />
            </View>

            <TouchableOpacity onPress={onPressJoinRoom} disabled={isSubmitting}>
              {
                <Text className="mx-auto uppercase w-[10em] border-2 font-NunitoItalica bg-secondary-light text-primary-dark text-center text-xl py-4 rounded-2xl">
                  {isSubmitting ? "Connecting..." : "Join Room"}
                </Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text className="capitalize text-primary-dark font-NunitoItalica text-2xl">
                room name
              </Text>
              <TextInput
                placeholder="enter room name"
                placeholderTextColor={"black"}
                className=" px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  "
                value={roomName ?? ""}
                onChangeText={(text) =>
                  setUserData({ ...userData, roomName: text })
                }
              />
            </View>
            <TouchableOpacity
              onPress={onPressCreateRoom}
              disabled={isSubmitting}>
              <Text className="mx-auto uppercase w-[10em] border-2 font-NunitoItalica bg-secondary-light text-primary-dark text-center text-xl py-4 rounded-2xl">
                {isSubmitting ? "Connecting..." : "Create Room"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default RoomScreen;
