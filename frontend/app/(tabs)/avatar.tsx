import { View, StyleProp, ImageStyle, Image } from 'react-native'
import React from 'react'
import { hp } from '@/constants/font-size'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
interface AvatarProps {
  uri: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  className?: string;
}
const Avatar = (
  {
    uri,
    size = 24,
    style,
    className,
  }
    : AvatarProps
) => {
  let transformedUri = uri;
  if (uri && uri.includes('0.0.0.0:6000')) {
    transformedUri = uri.replace('0.0.0.0:6000', '10.0.2.2:6000');
  }
  const isValidUri = typeof transformedUri === 'string' && transformedUri.trim().length > 0;
  
  return (
    <>
      {isValidUri ? (
        <Image
          source={{ uri: transformedUri }}
          className={className}
          style={[{ width: size, height: size }, style]}
          onError={() => {}}
        />
      ) : (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="account-circle" size={size} color="#8E8E93" />
        </View>
      )}
    </>
  )
}
export default Avatar