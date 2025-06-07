import { View, Text } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'

const Loading = ({size ,color}) => {
    return (
        <View className='flex items-center justify-center'>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}

export default Loading 