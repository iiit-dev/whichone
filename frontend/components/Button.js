import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React from 'react'
import Loading from './Loading'
import { hp, wp } from '@/constants/font-size'

const Button = ({ title, onPress, loading, className, textClassName, icon, customClass, fontSize, shadow = true, style }) => {
    const defaultButtonClass = "bg-dark-accent p-4 rounded-full w-full flex justify-center items-center"
    const defaultTextClass = "text-dark-text text-center font-bold"
    const buttonClassName = customClass || `${defaultButtonClass} ${className || ''}`
    if (loading) {
        return (
            <Pressable onPress={onPress}
                style={shadow ? {
                    shadowColor: '#000',
                    shadowOffset: { 
                        width: 0,
                        height: 3,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 10, 
                    elevation: 5,
                    ...style
                } : style}
                className={`${buttonClassName} `}
            >
                <Loading size="small" color="#ffffff" />
            </Pressable>
        )
    }
    return (
        <Pressable onPress={onPress}
            className={`${buttonClassName} `}
            style={shadow ? {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
                ...style
            } : style}
        >
            <View className="flex-row justify-center items-center">
                {icon ? <View>{icon}</View> :
                    <Text className={textClassName || defaultTextClass} style={{ fontSize: fontSize || hp(2) }}>
                        {title}
                    </Text>
                }
            </View>
        </Pressable>
    )
}

export default Button
// className="bg-papaya-whip-950 p-4 rounded-full w-full"
