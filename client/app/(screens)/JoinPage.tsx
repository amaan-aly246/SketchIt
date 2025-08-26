import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native'
import socket from '../websocket';
import Chat from '../components/Chat';
// import { useUserHook } from '../Context/UserContext';
// import generateRoomId from '../utils/generateRoomId';
const JoinPage = () => {
  // const { roomId, setRoomId } = useUserHook()

  const onPressJoinRoom = () => {
    console.log("Joined room!")
    // const new_room_id: string = generateRoomId();
    // setRoomId(new_room_id);
    socket.emit("joinRoom", "abc123");
  }

  const onPressLeaveRoom = () => {
    console.log("Left room")
    socket.emit("leaveRoom", "abc123");
    // setRoomId(null)
  }
  return (
    <>

      <View className='flex-1 justify-between  '>
        <Text className='text-center'>Join Lobby</Text>
        <View className="mb-6 gap-4">
          <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressJoinRoom}>
            <Text className="font-semibold text-white">Join Room</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-500 w-[10em] p-5 mx-auto" onPress={onPressLeaveRoom}>
            <Text className="font-semibold text-white">leave room</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Chat />
    </>
  )

}

export default JoinPage
