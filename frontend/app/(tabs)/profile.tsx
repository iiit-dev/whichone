import { View, Text, Platform, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useState, useCallback } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Button from '@/components/Button';
import { hp } from '@/constants/font-size';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { updateUserProfile } from '@/api/api';
import Avatar from './avatar';

interface EditProfileScreenProps {
  user?: any;
  router?: any;
  refreshUserData?: () => Promise<any>;
}

const Profile = () => {
  const { user, authState, refreshUserData } = useAuth()
  const router = useRouter()

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen is focused
      refreshUserData();
      return () => {
        // This will run when the screen is unfocused
      };
    }, [refreshUserData])
  );

  if (!user) {
    return (
      <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
          <Text className="text-dark-text">Loading profile...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <EditProfileScreen user={user} router={router} refreshUserData={refreshUserData} />
      </ScrollView>
    </ScreenWrapper>
  )
}

const EditProfileScreen = ({ user, router, refreshUserData }: EditProfileScreenProps) => {
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [website, setWebsite] = useState(user?.profile?.website || '');
  const [gender, setGender] = useState(user?.profile?.gender || 'Male');
  const [profilePic, setProfilePic] = useState(user?.profile?.profile_pic || '');
  const [lastUserData, setLastUserData] = useState<any>(null);

  // Update state when user data changes, but only on initial load or when data actually changes
  React.useEffect(() => {
    if (user) {
      // Check if this is the first load or if the user data has actually changed
      const currentUserString = JSON.stringify({
        username: user?.username,
        bio: user?.profile?.bio,
        website: user?.profile?.website,
        gender: user?.profile?.gender,
        profile_pic: user?.profile?.profile_pic
      });
      
      const lastUserString = JSON.stringify(lastUserData);
      
      if (!lastUserData || currentUserString !== lastUserString) {
        setUsername(user?.username || '');
        setBio(user?.profile?.bio || '');
        setWebsite(user?.profile?.website || '');
        setGender(user?.profile?.gender || 'Male');
        setProfilePic(user?.profile?.profile_pic || '');
        setLastUserData({
          username: user?.username,
          bio: user?.profile?.bio,
          website: user?.profile?.website,
          gender: user?.profile?.gender,
          profile_pic: user?.profile?.profile_pic
        });
      }
    }
  }, [user, lastUserData]);

  const goBack = () => {
    router.back();
  };

  const handleSaveChanges = async () => {
    try {
      // Save profile changes logic
      await updateUserProfile({ username, bio, website, gender, profile_pic: profilePic });
      refreshUserData && await refreshUserData(); // Refresh user data after saving changes
      router.replace('/'); // Replace the current screen with the root screen to trigger a refresh
    } catch (error) {
      // Handle error
    }
  };

  const goToAccountSettings = () => {
    router.push('/account-settings');
  };

  const handleEditProfilePicture = () => {
    // Profile picture edit logic
  };

  const navigateToBioEdit = () => {
    router.push({
      pathname: '/bio-edit',
      params: { currentBio: bio }
    });
  };

  return (
    <View className="bg-dark-bg flex-1">
      <View className='flex flex-row items-center justify-between py-4 px-4'>
        <TouchableOpacity onPress={goBack} className="w-[15%]">
          <MaterialIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={{ fontSize: hp(2.4) }} className="text-center text-xl flex-1 font-medium text-dark-text">Edit Profile</Text>

        <View className="w-[15%] flex-row justify-end items-center">
          {/* <TouchableOpacity onPress={goToAccountSettings} className="mr-4">
            <MaterialIcons name="settings" size={24} color="#FFFFFF" />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleSaveChanges}>
            <MaterialIcons name="check" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className='relative flex items-center mb-4'>
        <View className="relative">

          <Avatar
            uri={user?.profile?.profile_pic || ''} 
            style={{
              borderRadius: hp(9999999999),
              borderWidth: 1,
              borderColor: '#3A3A3C',
              resizeMode: 'cover',
            }} 
            size={hp(20)}
          />
        </View>
        <TouchableOpacity onPress={handleEditProfilePicture}>
          <Text className="text-dark-accent mt-4 text-lg">Edit picture or avatar</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 mt-2 ">
        <View className="mb-2">
          <Text className="text-dark-text-secondary ">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#8E8E93"
            className="pb-2 border-b text-lg text-dark-text"
            style={{ borderBottomColor: '#3A3A3C' }}
          />
        </View>

        <TouchableOpacity
          className="mb-2"
          onPress={navigateToBioEdit}
        >
          <Text className="text-dark-text-secondary">Bio</Text>
          <View className="pb-2 border-b" style={{ borderBottomColor: '#3A3A3C' }}>
            <Text className="text-lg text-dark-text" numberOfLines={2}>
              {bio || <Text style={{ opacity: 0.5, color: '#8E8E93' }}>Add bio</Text>}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="mb-2">
          <Text className="text-dark-text-secondary ">Website</Text>
          <TextInput
            value={website}
            onChangeText={setWebsite}
            placeholder="Add link"
            placeholderTextColor="#8E8E93"
            className="pb-2 border-b text-lg text-dark-text"
            style={{ borderBottomColor: '#3A3A3C' }}
          />
        </View>

        <TouchableOpacity
          className=" mb-4 pb-2 border-b"
          style={{ borderBottomColor: '#3A3A3C' }}
          onPress={() => {
            // Logic to open gender selection
          }}
        >
          <Text className="text-dark-text-secondary">Gender</Text>
          <View className="flex-row items-center justify-end">
            <Text className="text-lg mr-2 text-dark-text">{gender}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile