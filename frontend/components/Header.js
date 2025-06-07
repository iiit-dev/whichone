import { View, Text } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import BackButton from './BackButton';
import { hp } from '@/constants/font-size';
const Header = ({
  title,
  showBackButton = true,
}) => {
  const router = useRouter();
  return (
    <View className='relative w-full flex flex-row items-center'>
      {
        showBackButton && (
          <BackButton
            className='absolute left-0 border border-red-500'
            onPress={() => router.back()}
            color="#FFFFFF"
            size={16}
          />
        )
      }
      <Text style={{ fontSize: hp(2.7) }} className='font-bold mx-auto text-dark-text'>{title}</Text>
    </View>
  )
}

export default Header