import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '@/components/ScreenWrapper';
import PollCard from '@/components/PollCard';
import PollEndpointsSummary from '@/components/PollEndpointsSummary';
import { hp } from '@/constants/font-size';
import {
  getActivePolls,
  getUserCreatedPolls,
  getUserVotedPolls,
  getCreatorDashboard,
  getPollAnalytics,
  closePoll
} from '@/api/api';

const { width } = Dimensions.get('window');

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

interface Vote {
  id: string;
  selected_option: 'A' | 'B';
  created_at: string;
  poll: Poll;
}

interface DashboardData {
  totalPolls: number;
  totalVotes: number;
  totalViews: number;
  totalEarnings: number;
  activePolls: number;
  completedPolls: number;
  averageVotesPerPoll: number;
  topPerformingPoll?: {
    id: string;
    question: string;
    totalVotes: number;
  };
}

type TabType = 'discover' | 'created' | 'voted' | 'analytics' | 'dashboard' | 'summary';

const PollsDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [createdPolls, setCreatedPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<Vote[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPollAnalytics, setSelectedPollAnalytics] = useState<any>(null);

  const tabs = [
    { key: 'discover', label: 'Discover', icon: 'explore' },
    { key: 'created', label: 'My Polls', icon: 'create' },
    { key: 'voted', label: 'Voted', icon: 'how-to-vote' },
    { key: 'analytics', label: 'Analytics', icon: 'analytics' },
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'summary', label: 'API Summary', icon: 'code' }
  ];

  const fetchData = async (tab: TabType) => {
    if (tab === 'summary') {
      // No API calls needed for summary tab
      return;
    }
    
    setLoading(true);
    try {
      switch (tab) {
        case 'discover':
          const activeResponse = await getActivePolls();
          // Filter out expired polls on the client side as backup
          const filteredActivePolls = (activeResponse.polls || []).filter((poll: Poll) => {
            // If no expiration date, poll is active
            if (!poll.expires_at) return true;
            // If expiration date exists, check if it's in the future
            return new Date() < new Date(poll.expires_at);
          });
          setActivePolls(filteredActivePolls);
          break;
        case 'created':
          const createdResponse = await getUserCreatedPolls();
          setCreatedPolls(createdResponse.polls || []);
          break;
        case 'voted':
          const votedResponse = await getUserVotedPolls();
          setVotedPolls(votedResponse.votes || []);
          break;
        case 'dashboard':
          const dashboardResponse = await getCreatorDashboard();
          setDashboardData(dashboardResponse.dashboard || null);
          break;
        case 'analytics':
          // Analytics will be loaded per poll
          break;
      }
    } catch (error: any) {
      console.error(`Error fetching ${tab} data:`, error);
      Alert.alert('Error', `Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  };

  const loadPollAnalytics = async (pollId: string) => {
    try {
      const response = await getPollAnalytics(pollId);
      setSelectedPollAnalytics(response.insights);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load poll analytics');
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await closePoll(pollId);
      Alert.alert('Success', 'Poll closed successfully');
      fetchData('created'); // Refresh created polls
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to close poll');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(activeTab);
    setRefreshing(false);
  };

  const handleVoteUpdate = () => {
    fetchData(activeTab);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(activeTab);
    }, [activeTab])
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <PollEndpointsSummary />;

      case 'discover':
        return (
          <View>
            <Text className="text-white text-lg font-semibold mb-4">
              Active Polls ({activePolls.length})
            </Text>
            {activePolls.length === 0 ? (
              <View className="items-center py-10">
                <MaterialIcons name="poll" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">
                  No active polls available for voting
                </Text>
              </View>
            ) : (
              activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVoteUpdate={handleVoteUpdate}
                  showFullDetails={true}
                />
              ))
            )}
          </View>
        );

      case 'created':
        return (
          <View>
            <Text className="text-white text-lg font-semibold mb-4">
              Polls I Created ({createdPolls.length})
            </Text>
            {createdPolls.length === 0 ? (
              <View className="items-center py-10">
                <MaterialIcons name="create" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">
                  You haven't created any polls yet
                </Text>
                <TouchableOpacity 
                  className="bg-blue-600 rounded-lg px-6 py-3 mt-4"
                  onPress={() => router.push('/newpost')}
                >
                  <Text className="text-white font-medium">Create Your First Poll</Text>
                </TouchableOpacity>
              </View>
            ) : (
              createdPolls.map((poll) => (
                <View key={poll.id} className="mb-4">
                  <PollCard
                    poll={poll}
                    onVoteUpdate={handleVoteUpdate}
                    showFullDetails={true}
                  />
                  <View className="flex-row justify-between mt-2 px-4">
                    <TouchableOpacity
                      className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
                      onPress={() => loadPollAnalytics(poll.id)}
                    >
                      <MaterialIcons name="analytics" size={16} color="white" />
                      <Text className="text-white ml-2 text-sm">View Analytics</Text>
                    </TouchableOpacity>
                    {poll.status === 'ACTIVE' && (
                      <TouchableOpacity
                        className="bg-red-600 rounded-lg px-4 py-2 flex-row items-center"
                        onPress={() => handleClosePoll(poll.id)}
                      >
                        <MaterialIcons name="close" size={16} color="white" />
                        <Text className="text-white ml-2 text-sm">Close Poll</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'voted':
        return (
          <View>
            <Text className="text-white text-lg font-semibold mb-4">
              Polls I Voted On ({votedPolls.length})
            </Text>
            {votedPolls.length === 0 ? (
              <View className="items-center py-10">
                <MaterialIcons name="how-to-vote" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">
                  You haven't voted on any polls yet
                </Text>
              </View>
            ) : (
              votedPolls.map((vote) => (
                <View key={vote.id} className="mb-4">
                  <View className="bg-gray-800 rounded-lg p-3 mb-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-green-400 font-medium">
                        You voted: Option {vote.selected_option}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(vote.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <PollCard
                    poll={vote.poll}
                    onVoteUpdate={handleVoteUpdate}
                    showFullDetails={false}
                  />
                </View>
              ))
            )}
          </View>
        );

      case 'analytics':
        return (
          <View>
            <Text className="text-white text-lg font-semibold mb-4">
              Poll Analytics
            </Text>
            {selectedPollAnalytics ? (
              <View className="bg-gray-800 rounded-lg p-4">
                <Text className="text-white text-lg font-semibold mb-3">
                  {selectedPollAnalytics.poll.question}
                </Text>
                
                <View className="space-y-4">
                  {/* Basic Stats */}
                  <View className="bg-gray-700 rounded-lg p-3">
                    <Text className="text-gray-300 text-sm mb-2">Basic Statistics</Text>
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-white text-xl font-bold">
                          {selectedPollAnalytics.poll.totalVotes}
                        </Text>
                        <Text className="text-gray-400 text-sm">Total Votes</Text>
                      </View>
                      <View>
                        <Text className="text-white text-xl font-bold">
                          {selectedPollAnalytics.poll.totalViews}
                        </Text>
                        <Text className="text-gray-400 text-sm">Total Views</Text>
                      </View>
                      <View>
                        <Text className="text-white text-xl font-bold">
                          {selectedPollAnalytics.poll.totalShares}
                        </Text>
                        <Text className="text-gray-400 text-sm">Total Shares</Text>
                      </View>
                    </View>
                  </View>

                  {/* Demographics */}
                  {selectedPollAnalytics.demographics && (
                    <View className="bg-gray-700 rounded-lg p-3">
                      <Text className="text-gray-300 text-sm mb-2">Demographics</Text>
                      <Text className="text-white">
                        Gender: {JSON.stringify(selectedPollAnalytics.demographics.genderBreakdown)}
                      </Text>
                      <Text className="text-white">
                        Age Groups: {JSON.stringify(selectedPollAnalytics.demographics.ageGroups)}
                      </Text>
                    </View>
                  )}

                  {/* Engagement */}
                  {selectedPollAnalytics.engagement && (
                    <View className="bg-gray-700 rounded-lg p-3">
                      <Text className="text-gray-300 text-sm mb-2">Engagement</Text>
                      <Text className="text-white">
                        Bounce Rate: {selectedPollAnalytics.engagement.bounceRate || 'N/A'}%
                      </Text>
                      <Text className="text-white">
                        Peak Hour: {selectedPollAnalytics.engagement.peakVotingHour || 'N/A'}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  className="bg-gray-600 rounded-lg p-3 mt-4 items-center"
                  onPress={() => setSelectedPollAnalytics(null)}
                >
                  <Text className="text-white">Close Analytics</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center py-10">
                <MaterialIcons name="analytics" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">
                  Select a poll from 'My Polls' to view detailed analytics
                </Text>
              </View>
            )}
          </View>
        );

      case 'dashboard':
        return (
          <View>
            <Text className="text-white text-lg font-semibold mb-4">
              Creator Dashboard
            </Text>
            {dashboardData ? (
              <View className="space-y-4">
                {/* Overview Cards */}
                <View className="flex-row flex-wrap justify-between">
                  <View className="bg-blue-600 rounded-lg p-4 w-[48%] mb-4">
                    <Text className="text-white text-2xl font-bold">
                      {dashboardData.totalPolls}
                    </Text>
                    <Text className="text-blue-200 text-sm">Total Polls</Text>
                  </View>
                  <View className="bg-green-600 rounded-lg p-4 w-[48%] mb-4">
                    <Text className="text-white text-2xl font-bold">
                      {dashboardData.totalVotes}
                    </Text>
                    <Text className="text-green-200 text-sm">Total Votes</Text>
                  </View>
                  <View className="bg-purple-600 rounded-lg p-4 w-[48%] mb-4">
                    <Text className="text-white text-2xl font-bold">
                      {dashboardData.totalViews}
                    </Text>
                    <Text className="text-purple-200 text-sm">Total Views</Text>
                  </View>
                  <View className="bg-yellow-600 rounded-lg p-4 w-[48%] mb-4">
                    <Text className="text-white text-2xl font-bold">
                      ${dashboardData.totalEarnings.toFixed(2)}
                    </Text>
                    <Text className="text-yellow-200 text-sm">Earnings</Text>
                  </View>
                </View>

                {/* Performance Stats */}
                <View className="bg-gray-800 rounded-lg p-4">
                  <Text className="text-white text-lg font-semibold mb-3">
                    Performance
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-300">Active Polls</Text>
                      <Text className="text-white">{dashboardData.activePolls}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-300">Completed Polls</Text>
                      <Text className="text-white">{dashboardData.completedPolls}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-300">Avg Votes per Poll</Text>
                      <Text className="text-white">{dashboardData.averageVotesPerPoll.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>

                {/* Top Performing Poll */}
                {dashboardData.topPerformingPoll && (
                  <View className="bg-gray-800 rounded-lg p-4">
                    <Text className="text-white text-lg font-semibold mb-3">
                      Top Performing Poll
                    </Text>
                    <Text className="text-gray-300 mb-2">
                      {dashboardData.topPerformingPoll.question}
                    </Text>
                    <Text className="text-green-400 font-semibold">
                      {dashboardData.topPerformingPoll.totalVotes} total votes
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="items-center py-10">
                <MaterialIcons name="dashboard" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4">
                  No dashboard data available
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-dark-bg">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">
            Polls Dashboard
          </Text>
          <TouchableOpacity onPress={() => router.push('/newpost')}>
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-gray-700"
        >
          <View className="flex-row px-4 py-3">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`mr-6 px-4 py-2 rounded-full flex-row items-center ${
                  activeTab === tab.key ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onPress={() => setActiveTab(tab.key as TabType)}
              >
                <MaterialIcons 
                  name={tab.icon as any} 
                  size={16} 
                  color="white" 
                  style={{ marginRight: 4 }}
                />
                <Text className="text-white text-sm font-medium">
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Content */}
        {activeTab === 'summary' ? (
          renderTabContent()
        ) : (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="p-4">
              {loading ? (
                <View className="items-center py-10">
                  <Text className="text-gray-400">Loading...</Text>
                </View>
              ) : (
                renderTabContent()
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default PollsDashboard; 