import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native'

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleInfo, faPaintbrush } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'expo-router';
const Home = () => {
  const router = useRouter();
  return (
    <SafeAreaView className='flex-1  bg-primary'>
      <View className='flex-1 mx-[15%] mt-[40%] '>
        <View className='flex-row gap-4  justify-between mb-10'>
          <Text className='capitalize font-NunitoItalica text-secondary block text-5xl '>
            <FontAwesomeIcon icon={faPaintbrush as any} size={50} color='#F4E9D9' />
            Sketch It</Text>
        </View>
        <View className='flex gap-4  bg-primary'  >
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/RoomScreen',
              params: {
                mode: 'create'
              }
            })
          }}>
            <Text className='uppercase w-[15em] font-NunitoItalica bg-secondary text-primary-dark text-center text-xl py-5 rounded-2xl'>create room</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/RoomScreen',
              params: {
                mode: 'join'
              }
            })
          }}>
            <Text className='uppercase w-[15em] font-NunitoItalica bg-secondary text-primary-dark text-center text-xl py-5 rounded-2xl'>join room</Text>
          </TouchableOpacity>
        </View>
        <View className='flex '>
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/PlayScreen'
            })
          }}>

            <View className='ml-10 mt-10'>
              <FontAwesomeIcon size={40} icon={faCircleInfo as any} color='#F4E9D9' />
            </View>
            <Text className='capitalize text-secondary font-NunitoItalica text-xl'>How to play</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default Home
