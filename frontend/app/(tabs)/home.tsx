import { View, Text, Pressable, Image, Animated, ScrollView, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/context/authContext'
import ScreenWrapper from '@/components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '@/constants/font-size'
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'
import Avatar from './avatar'
import * as SecureStore from 'expo-secure-store'
import NavigationDrawer from '@/components/NavigationDrawer'
import PollCard from '@/components/PollCard'
import { getActivePolls } from '@/api/api'
import { useFocusEffect } from '@react-navigation/native'

interface UserData {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  profile?: {
    profile_pic?: string;
  };
}

interface Poll {
  id: string;
  question: string;
  option_a_text: string;
  option_b_text: string;
  option_a_url?: string;
  option_b_url?: string;
  votes_count_a: number;
  votes_count_b: number;
  max_votes: number;
  status: string;
  creator: {
    id: string;
    username: string;
    name: string;
  };
  created_at: string;
  expires_at?: string;
  is_paid?: boolean;
}

export default function Home() {
  const { user: contextUser, authState, onLogout, userId } = useAuth()
  const user = contextUser as UserData | null
  const [localUser, setLocalUser] = useState<UserData | null>(null)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setLocalUser(user)
    } else {
      const loadUserFromStorage = async () => {
        try {
          const userJson = await SecureStore.getItemAsync('userData');
          
          if (userJson) {
            const userData = JSON.parse(userJson);
            setLocalUser(userData)
            console.log('🔍 User data loaded from storage:', userData);
          }
        } catch (error) {
          console.error('🚨 Error loading user data:', error);
        }
      };
      loadUserFromStorage();
    }
  }, [user]);

  const fetchActivePolls = async () => {
    try {
      const response = await getActivePolls();
      // Filter out expired polls on the client side as backup
      const filteredPolls = (response.polls || []).filter((poll: Poll) => {
        // If no expiration date, poll is active
        if (!poll.expires_at) return true;
        // If expiration date exists, check if it's in the future
        return new Date() < new Date(poll.expires_at);
      });
      setPolls(filteredPolls);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      if (error.message !== 'Authentication token not found') {
        Alert.alert('Error', 'Failed to load polls');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivePolls();
    setRefreshing(false);
  };

  const handleVoteUpdate = () => {
    fetchActivePolls();
  };

  // Refresh polls when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActivePolls();
    }, [])
  );

  const openDrawer = () => {
    setIsDrawerVisible(true)
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerVisible(false)
    })
  }

  const navigateToPolls = () => {
    router.push('/polls-dashboard' as any)
  }

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <View className="flex-1 bg-dark-bg">
        <View className="flex-row items-center justify-between p-4 mb-2">
          <View>
            <Image
              source={require('@/assets/logo/which-one-logo.png')}
              className="w-24 h-16"
              style={{ resizeMode: 'contain' }}
              onError={() => { }}
            />
          </View>
          <View className="flex flex-row items-center justify-center gap-5">
            <Pressable onPress={navigateToPolls}>
              <MaterialIcons name="poll" size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={() => router.push('/newpost')}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={openDrawer}>
              <Avatar
                uri={user?.profile?.profile_pic || ''}
                style={{ borderRadius: 999999999999999999999999999 }}
                size={hp(3)}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-4">
            <Text className='text-2xl font-bold text-dark-text mb-1'>
              Active Polls
            </Text>
            {(user || localUser) && (
              <Text className="text-base text-dark-text-secondary">
                Hello, {(user?.name || localUser?.name || 'User')}! 👋
              </Text>
            )}
          </View>

          {/* Quick Actions */}
          <View className="flex-row mb-6 gap-3">
            <Pressable 
              className="flex-1 bg-blue-600 rounded-lg p-3 items-center"
              onPress={navigateToPolls}
            >
              <MaterialIcons name="analytics" size={20} color="white" />
              <Text className="text-white text-sm font-medium mt-1">
                Polls Dashboard
              </Text>
            </Pressable>
            <Pressable 
              className="flex-1 bg-green-600 rounded-lg p-3 items-center"
              onPress={() => router.push('/newpost')}
            >
              <MaterialIcons name="add-circle" size={20} color="white" />
              <Text className="text-white text-sm font-medium mt-1">
                Create Poll
              </Text>
            </Pressable>
          </View>

          {/* Polls List */}
          {loading ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-dark-text-secondary">Loading polls...</Text>
            </View>
          ) : polls.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <MaterialIcons name="poll" size={48} color="#6B7280" />
              <Text className="text-dark-text-secondary text-lg mt-4 mb-2">
                No active polls available
              </Text>
              <Text className="text-dark-text-secondary text-center">
                Be the first to create a poll and get the conversation started!
              </Text>
              <Pressable 
                className="bg-blue-600 rounded-lg px-6 py-3 mt-4"
                onPress={() => router.push('/newpost')}
              >
                <Text className="text-white font-medium">Create Your First Poll</Text>
              </Pressable>
            </View>
          ) : (
            <View className="pb-6">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVoteUpdate={handleVoteUpdate}
                  showFullDetails={true}
                />
              ))}
              
              {/* View More Button */}
              <Pressable 
                className="bg-gray-700 rounded-lg p-4 items-center mt-4"
                onPress={navigateToPolls}
              >
                <Text className="text-white font-medium">
                  View All Polls & Analytics
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isVisible={isDrawerVisible}
        onClose={closeDrawer}
        slideAnim={slideAnim}
      />
    </ScreenWrapper>
  )
}