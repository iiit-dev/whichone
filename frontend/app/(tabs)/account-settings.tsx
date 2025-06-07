import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'expo-router';
import { hp } from '@/constants/font-size';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const AccountSettings = () => {
  const { user, onLogout } = useAuth();
  const router = useRouter();
  const email = user?.email || 'Not set';
  
  const goBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      router.replace('/login');
    } catch (error) {
      // console.error('Logout failed:', error);
      // Handle error state
    }
  };

  return (
    <ScreenWrapper>
      <View className='flex flex-row items-center justify-between py-4 px-4 bg-dark-bg'>
        <TouchableOpacity onPress={goBack} className="w-[15%]">
          <MaterialIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={{ fontSize: hp(2.4) }} className="text-center text-xl flex-1 font-medium text-dark-text">Account Settings</Text>

        <View className="w-[15%]"></View>
      </View>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-dark-bg">
        <View className="px-4 py-6">
          {/* Update Email Address */}
          <TouchableOpacity 
            className="flex-row items-center justify-between mb-4 py-3 border-b"
            style={{ borderBottomColor: '#3A3A3C' }}
            onPress={() => {/* Navigate to email update screen */}}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={24} color="#FFFFFF" className="mr-3" />
              <View className="ml-3">
                <Text className="text-base font-medium text-dark-text">Update Email Address</Text>
                <Text className="text-sm text-dark-text-secondary">{email}</Text>
              </View>
            </View>
            <AntDesign name="right" size={18} color="#8E8E93" />
          </TouchableOpacity>
          
          {/* Add Phone Number */}
          <TouchableOpacity 
            className="flex-row items-center justify-between mb-4 py-3 border-b"
            style={{ borderBottomColor: '#3A3A3C' }}
            onPress={() => {/* Navigate to phone number screen */}}
          >
            <View className="flex-row items-center">
            <MaterialIcons name="phone" size={24} color="#FFFFFF" className="mr-3" />
            <View className="ml-3">
                <Text className="text-base font-medium text-dark-text">Add Phone Number</Text>
                <Text className="text-sm text-dark-text-secondary">No phone number added</Text>
              </View>
            </View>
            <AntDesign name="right" size={18} color="#8E8E93" />
          </TouchableOpacity>
          
          {/* Change Password */}
          <TouchableOpacity 
            className="flex-row items-center justify-between mb-4 py-3 border-b"
            style={{ borderBottomColor: '#3A3A3C' }}
            onPress={() => {/* Navigate to password change screen */}}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="lock-outline" size={24} color="#FFFFFF" className="mr-3" />
              <View className="ml-3">
                <Text className="text-base font-medium text-dark-text">Change Password</Text>
                <Text className="text-sm text-dark-text-secondary">Update your password</Text>
              </View>
            </View>
            <AntDesign name="right" size={18} color="#8E8E93" />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            className="flex-row items-center justify-between py-3 border-b"
            style={{ borderBottomColor: '#3A3A3C' }}
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="logout" size={24} color="#FF3B30" className="mr-3" />
              <View className="ml-3">
                <Text className="text-base font-medium text-dark-destructive">Logout</Text>
                <Text className="text-sm text-dark-text-secondary">Sign out of your account</Text>
              </View>
            </View>
            <AntDesign name="right" size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AccountSettings;