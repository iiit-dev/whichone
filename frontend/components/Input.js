import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { hp } from '@/constants/font-size';
import { papayaWhip } from '@/constants/colors';
const Input = ({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  className,
  labelTextSize = hp(2),
}) => {
  const [isFocused, setIsFocused] = useState(false);
   const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };
  return (
    <View className={`flex flex-col ${className || ''}`}>
      <View className='relative'>
        {label && (
          <Text
            // style={{ fontSize: labelTextSize }}
            className="font-semibold text-sm text-dark-text"
          >
            {label}
          </Text>
        )}
        <View style={{
          borderRadius : hp(2),
          borderWidth: 1,
          borderColor: isFocused ? '#007AFF' : '#3A3A3C',
        }} className="flex-row  items-center overflow-hidden bg-dark-secondary">
          {icon && (
            <View className="p-2 bg-transparent">
              {icon}
            </View>
          )}
          <TextInput
            className="flex-1 py-4 px-3 text-dark-text"
            style={{ 
              fontSize: hp(2),
            }}
            placeholder={placeholder}
            placeholderTextColor={"#8E8E93"}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
        </View>
      </View>
    </View>
  );
};
export default Input;

