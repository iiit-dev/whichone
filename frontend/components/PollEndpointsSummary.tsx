import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EndpointInfo {
  method: string;
  endpoint: string;
  description: string;
  implemented: boolean;
  icon: string;
}

const PollEndpointsSummary = () => {
  const endpoints: EndpointInfo[] = [
    {
      method: 'GET',
      endpoint: '/polls/discover',
      description: 'Get active polls for discovery (polls user hasn\'t voted on)',
      implemented: true,
      icon: 'explore'
    },
    {
      method: 'GET',
      endpoint: '/polls/:id',
      description: 'Get a specific poll by ID with detailed information',
      implemented: true,
      icon: 'info'
    },
    {
      method: 'POST',
      endpoint: '/polls/',
      description: 'Create a new poll with optional image uploads',
      implemented: true,
      icon: 'add-circle'
    },
    {
      method: 'POST',
      endpoint: '/polls/:id/vote',
      description: 'Vote on a poll with real-time updates and rewards',
      implemented: true,
      icon: 'how-to-vote'
    },
    {
      method: 'GET',
      endpoint: '/polls/user/created',
      description: 'Get polls created by the authenticated user',
      implemented: true,
      icon: 'create'
    },
    {
      method: 'GET',
      endpoint: '/polls/user/voted',
      description: 'Get polls the authenticated user has voted on',
      implemented: true,
      icon: 'check-circle'
    },
    {
      method: 'PUT',
      endpoint: '/polls/:id/close',
      description: 'Close a poll (mark as CLOSED) for poll creators',
      implemented: true,
      icon: 'close'
    },
    {
      method: 'GET',
      endpoint: '/polls/:id/analytics',
      description: 'Get detailed poll analytics for poll creators',
      implemented: true,
      icon: 'analytics'
    },
    {
      method: 'GET',
      endpoint: '/polls/creator/dashboard',
      description: 'Get creator dashboard with comprehensive analytics',
      implemented: true,
      icon: 'dashboard'
    }
  ];

  const walletEndpoints: EndpointInfo[] = [
    {
      method: 'GET',
      endpoint: '/wallet/poll-fee/:maxVotes',
      description: 'Calculate poll fee for a given number of votes',
      implemented: true,
      icon: 'monetization-on'
    },
    {
      method: 'GET',
      endpoint: '/wallet/can-afford/:maxVotes',
      description: 'Check if user can afford to create a poll',
      implemented: true,
      icon: 'account-balance-wallet'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600';
      case 'POST': return 'bg-blue-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const renderEndpointCard = (endpoint: EndpointInfo, index: number) => (
    <View key={index} className="bg-gray-800 rounded-lg p-4 mb-3 border-l-4 border-blue-500">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <MaterialIcons name={endpoint.icon as any} size={20} color="#3B82F6" />
          <Text className={`ml-2 px-2 py-1 rounded text-white text-xs font-bold ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons 
            name={endpoint.implemented ? "check-circle" : "pending"} 
            size={16} 
            color={endpoint.implemented ? "#10B981" : "#F59E0B"} 
          />
          <Text className={`ml-1 text-xs ${endpoint.implemented ? 'text-green-400' : 'text-yellow-400'}`}>
            {endpoint.implemented ? 'Implemented' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <Text className="text-blue-300 font-mono text-sm mb-2">
        {endpoint.endpoint}
      </Text>
      
      <Text className="text-gray-300 text-sm">
        {endpoint.description}
      </Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold mb-2">
          Poll Endpoints Implementation
        </Text>
        <Text className="text-gray-400 text-base">
          Complete overview of all poll-related API endpoints and their current implementation status.
        </Text>
      </View>

      {/* Implementation Summary */}
      <View className="bg-gray-800 rounded-lg p-4 mb-6">
        <Text className="text-white text-lg font-semibold mb-3">
          Implementation Summary
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Total Endpoints:</Text>
          <Text className="text-white font-semibold">{endpoints.length + walletEndpoints.length}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Main Poll Endpoints:</Text>
          <Text className="text-blue-400 font-semibold">{endpoints.length}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Wallet-Related:</Text>
          <Text className="text-purple-400 font-semibold">{walletEndpoints.length}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-300">Implementation Status:</Text>
          <Text className="text-green-400 font-semibold">
            {endpoints.filter(e => e.implemented).length + walletEndpoints.filter(e => e.implemented).length}/
            {endpoints.length + walletEndpoints.length} Complete
          </Text>
        </View>
      </View>

      {/* Main Poll Endpoints */}
      <View className="mb-6">
        <Text className="text-white text-xl font-semibold mb-4">
          Main Poll Endpoints ({endpoints.length})
        </Text>
        {endpoints.map((endpoint, index) => renderEndpointCard(endpoint, index))}
      </View>

      {/* Wallet-Related Endpoints */}
      <View className="mb-6">
        <Text className="text-white text-xl font-semibold mb-4">
          Wallet-Related Endpoints ({walletEndpoints.length})
        </Text>
        {walletEndpoints.map((endpoint, index) => renderEndpointCard(endpoint, index + endpoints.length))}
      </View>

      {/* Features Implemented */}
      <View className="bg-gray-800 rounded-lg p-4 mb-6">
        <Text className="text-white text-lg font-semibold mb-3">
          Features Implemented
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Active polls discovery and display</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Interactive voting with real-time updates</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">User poll creation and management</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Vote history and tracking</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Poll analytics and insights</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Creator dashboard with statistics</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Poll fee calculation and affordability checks</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text className="text-gray-300 ml-2">Poll closure and status management</Text>
          </View>
        </View>
      </View>

      {/* Technical Implementation */}
      <View className="bg-gray-800 rounded-lg p-4 mb-20">
        <Text className="text-white text-lg font-semibold mb-3">
          Technical Implementation
        </Text>
        <Text className="text-gray-300 text-sm mb-2">
          • <Text className="text-blue-400">React Native</Text> with TypeScript for type safety
        </Text>
        <Text className="text-gray-300 text-sm mb-2">
          • <Text className="text-green-400">Reusable components</Text> for consistent UI/UX
        </Text>
        <Text className="text-gray-300 text-sm mb-2">
          • <Text className="text-purple-400">Real-time updates</Text> with proper state management
        </Text>
        <Text className="text-gray-300 text-sm mb-2">
          • <Text className="text-yellow-400">Comprehensive error handling</Text> and user feedback
        </Text>
        <Text className="text-gray-300 text-sm mb-2">
          • <Text className="text-red-400">Responsive design</Text> with Tailwind CSS styling
        </Text>
        <Text className="text-gray-300 text-sm">
          • <Text className="text-indigo-400">Authentication integration</Text> with secure token management
        </Text>
      </View>
    </ScrollView>
  );
};

export default PollEndpointsSummary; 