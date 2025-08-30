import { useLocalSearchParams } from 'expo-router'
import { View, Text, SafeAreaView, TouchableOpacity, TextInput } from 'react-native'
const RoomScreen = () => {
  const { mode } = useLocalSearchParams<{ mode: string }>()
  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <View className='mt-[30%] mx-[13%] gap-5 p-10 rounded-2xl flex bg-secondary'>
        <Text className='capitalize text-primary-dark font-NunitoItalica text-4xl'>{mode} room </Text>

        <View>
          <Text className='capitalize text-primary-dark font-NunitoItalica text-2xl'>user name</Text>
          <TextInput placeholder='enter your name' placeholderTextColor={"black"} className=' px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  ' />

        </View>

        {/* join room screen */}
        {
          mode == "join" ?
            <>
              <View>
                <Text className='capitalize text-primary-dark font-NunitoItalica text-2xl'>room code</Text>
                <TextInput placeholder='enter rooom code ' placeholderTextColor={"black"} className=' px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  ' />

              </View>

              <TouchableOpacity onPress={() => {
              }}>
                <Text className='mx-auto uppercase w-[10em] border-2 font-NunitoItalica bg-secondary-light text-primary-dark text-center text-xl py-4 rounded-2xl'>join room</Text>
              </TouchableOpacity>
            </>
            // create room screen
            : <>

              <View>
                <Text className='capitalize text-primary-dark font-NunitoItalica text-2xl'>room name</Text>
                <TextInput placeholder='enter room name' placeholderTextColor={"black"} className=' px-2 py-3 border-2 bg-secondary-light rounded-xl text-primary-dark  ' />
              </View>
              <TouchableOpacity onPress={() => {
              }}>
                <Text className='mx-auto uppercase w-[10em] border-2 font-NunitoItalica bg-secondary-light text-primary-dark text-center text-xl py-4 rounded-2xl'>Create room</Text>
              </TouchableOpacity>

            </>
        }
      </View>
    </SafeAreaView>
  )
}

export default RoomScreen
