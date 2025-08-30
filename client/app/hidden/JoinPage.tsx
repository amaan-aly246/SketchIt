import { View, Text, TextInput } from 'react-native'
import { TouchableOpacity } from 'react-native'
import socket from '../config/websocket';
import Chat from '../components/Chat';
import { useUserHook } from '../Context/UserContext';
import generateRoomId from '../utils/generateRoomId';
import { Response } from '../types/types';

type CreateRoomData = {
  userId: string
}

type JoinRoomData = {
  userId: string
}
const JoinPage = () => {
  const { userData, setUserData } = useUserHook();
  const { userName, roomCode, userId, roomName } = userData;
  const onPressCreateRoom = () => {
    if (!userName || !roomName) {
      console.warn(`Username and room name are not present`)
      return;
    }

    const roomCode = generateRoomId()
    socket.emit(
      'createroom',
      { userName, roomName, roomCode },
      (response: Response<CreateRoomData>) => {
        if (response.success) {
          const data = response.data;
          console.log("user created room", data?.userId);
          if (data?.userId) {
            setUserData({ ...userData, roomCode, userId: data.userId, roomName })
          }

        } else {
          console.error("error:", response.error);
        }
      }
    );

  }
  const onPressJoinRoom = () => {
    if (!roomCode || !userName) {
      console.warn(`room code and user name is required`);
      return;
    }

    socket.emit('joinroom', { roomCode, userName }, (response: Response<JoinRoomData>) => {
      if (response.success) {
        console.log(`user with id : ${response.data?.userId} joined room ${roomCode}`);
        const data = response.data
        if (data?.userId) {
          setUserData({ ...userData, roomCode, userId: data.userId, roomName })
        }
      }
      else {
        console.log(`error:`, response.error);
      }
    });
  }

  const onPressLeaveRoom = () => {
    if (!roomCode) {
      console.error(`Room code is required and its not present`);
      return;
    }

    socket.emit('leaveroom', { roomCode, userId }, (response: any) => {
      if (response.success) {
        console.log(`Left room ${roomCode} successfully.`);
        setUserData({ ...userData, userId: null, roomCode: null, roomName: null, userName: null })
      }
      else {
        console.error(`error: ${response.error}`)
      }
    })
  }
  return (
    <>

      <View className='flex-1 justify-between gap-4 '>
        <Text className='text-center font-NunitoItalica '>Join Lobby</Text>
        <View className='text-center h-20 gap-2 mb-6 m-2'>
          <TextInput className=' border-black border-2 p-3 w-[15em] mx-auto'
            placeholder='user name'
            placeholderTextColor={"black"}
            value={userName ?? ""}
            onChangeText={(text) => setUserData({ ...userData, userName: text })} />
          <TextInput className=' border-black border-2 p-3 w-[15em] mx-auto '
            placeholder='room name'
            placeholderTextColor={"black"}
            value={roomName ?? ""}
            onChangeText={(text) => setUserData({ ...userData, roomName: text })}
          />

          <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto mb-3" onPress={onPressCreateRoom}>
            <Text className="font-semibold text-white"> Create Room </Text>
          </TouchableOpacity>
        </View>
        <View className="mb-6 mt-20 gap-3 ">
          <TextInput className=' border-black border-2 p-3 w-[15em] mx-auto '
            placeholder='room code'
            placeholderTextColor={"black"}

            value={roomCode ?? ""}
            onChangeText={(text) => setUserData({ ...userData, roomCode: text })}
          />
          <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressJoinRoom}>
            <Text className="font-semibold text-white">Join Room</Text>
          </TouchableOpacity>


          {userId &&

            <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressLeaveRoom}>
              <Text className="font-semibold text-white">leave room</Text>
            </TouchableOpacity>

          }
        </View>
      </View>
      <Chat />
    </>
  )

}

export default JoinPage
