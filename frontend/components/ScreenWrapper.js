import { View, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ScreenWrapper = ({ children }) => {
    const {top} = useSafeAreaInsets();
    const paddingTop = top > 0 ? top : 0
    return (
        <View style={{ flex: 1, paddingTop, backgroundColor: '#1C1C1E' }}>
            {children}
        </View>
    )
}

export default ScreenWrapper  