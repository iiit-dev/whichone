import { View, Text } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'

const notifications = () => {
  return (
    <ScreenWrapper>
      <View className="bg-dark-bg flex-1 justify-center items-center">
        <Text className="text-dark-text text-xl">notifications</Text>
      </View>
    </ScreenWrapper>
  )
}

export default notifications