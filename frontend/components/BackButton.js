import { TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import Icon from '../assets/icons/index'
import AntDesign from '@expo/vector-icons/AntDesign';
const BackButton = ({ onPress, color = '#000', size, style, className }) => {
    const router = useRouter()
    const handlePress = () => {
        if (onPress) {
            onPress()
        } else {
            router.back()
        }
    }
    return (
        <AntDesign name="left" size={size} color={color} onPress={handlePress} />
    )
}

export default BackButton