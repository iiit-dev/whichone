import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { hp, wp } from '@/constants/font-size';
import { voteOnPoll } from '@/api/api';

interface PollCardProps {
  poll: {
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
  };
  onVoteUpdate?: () => void;
  showFullDetails?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVoteUpdate, showFullDetails = true }) => {
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const totalVotes = poll.votes_count_a + poll.votes_count_b;
  const percentageA = totalVotes > 0 ? Math.round((poll.votes_count_a / totalVotes) * 100) : 0;
  const percentageB = totalVotes > 0 ? Math.round((poll.votes_count_b / totalVotes) * 100) : 0;

  const handleVote = async (option: 'A' | 'B') => {
    if (voting || poll.status !== 'ACTIVE') return;

    try {
      setVoting(true);
      await voteOnPoll(poll.id, { selectedOption: option });
      setSelectedOption(option);
      onVoteUpdate && onVoteUpdate();
      Alert.alert('Success', 'Your vote has been recorded!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const isExpired = poll.expires_at && new Date() > new Date(poll.expires_at);
  const isMaxVotesReached = totalVotes >= poll.max_votes;
  const canVote = poll.status === 'ACTIVE' && !isExpired && !isMaxVotesReached && !selectedOption;

  return (
    <View className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
      {/* Header */}
      {showFullDetails && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mr-2">
              <Text className="text-white text-sm font-bold">
                {poll.creator.username?.charAt(0)?.toUpperCase() || poll.creator.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text className="text-white text-sm font-semibold">
                {poll.creator.name || poll.creator.username}
              </Text>
              <Text className="text-gray-400 text-xs">
                {formatTimeAgo(poll.created_at)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {poll.is_paid && (
              <MaterialIcons name="monetization-on" size={16} color="#FFD700" style={{ marginRight: 4 }} />
            )}
            <Text className={`text-xs px-2 py-1 rounded ${
              poll.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              {poll.status}
            </Text>
          </View>
        </View>
      )}

      {/* Question */}
      <Text className="text-white text-lg font-semibold mb-4">
        {poll.question}
      </Text>

      {/* Options */}
      <View className="space-y-3">
        {/* Option A */}
        <TouchableOpacity
          className={`mb-3 p-4 rounded-lg border-2 ${
            selectedOption === 'A' 
              ? 'border-blue-500 bg-blue-500/20' 
              : canVote 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-600 bg-gray-700'
          }`}
          onPress={() => canVote && handleVote('A')}
          disabled={!canVote || voting}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              {poll.option_a_url && (
                <Image
                  source={{ uri: poll.option_a_url }}
                  className="w-full h-32 rounded-lg mb-2"
                  resizeMode="cover"
                />
              )}
              <Text className="text-white text-base font-medium">
                {poll.option_a_text}
              </Text>
            </View>
            {selectedOption && (
              <View className="ml-3">
                <Text className="text-blue-400 text-lg font-bold">
                  {percentageA}%
                </Text>
                <Text className="text-gray-400 text-sm">
                  {poll.votes_count_a} votes
                </Text>
              </View>
            )}
          </View>
          {selectedOption && (
            <View className="mt-2 bg-gray-600 rounded-full h-2">
              <View 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${percentageA}%` }}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Option B */}
        <TouchableOpacity
          className={`p-4 rounded-lg border-2 ${
            selectedOption === 'B' 
              ? 'border-purple-500 bg-purple-500/20' 
              : canVote 
                ? 'border-gray-600 bg-gray-700' 
                : 'border-gray-600 bg-gray-700'
          }`}
          onPress={() => canVote && handleVote('B')}
          disabled={!canVote || voting}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              {poll.option_b_url && (
                <Image
                  source={{ uri: poll.option_b_url }}
                  className="w-full h-32 rounded-lg mb-2"
                  resizeMode="cover"
                />
              )}
              <Text className="text-white text-base font-medium">
                {poll.option_b_text}
              </Text>
            </View>
            {selectedOption && (
              <View className="ml-3">
                <Text className="text-purple-400 text-lg font-bold">
                  {percentageB}%
                </Text>
                <Text className="text-gray-400 text-sm">
                  {poll.votes_count_b} votes
                </Text>
              </View>
            )}
          </View>
          {selectedOption && (
            <View className="mt-2 bg-gray-600 rounded-full h-2">
              <View 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${percentageB}%` }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      {showFullDetails && (
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-700">
          <Text className="text-gray-400 text-sm">
            {totalVotes} of {poll.max_votes} votes
          </Text>
          <View className="flex-row items-center space-x-4">
            {poll.expires_at && (
              <Text className="text-gray-400 text-sm">
                {isExpired ? 'Expired' : `Expires ${formatTimeAgo(poll.expires_at)}`}
              </Text>
            )}
            {voting && (
              <Text className="text-blue-400 text-sm">Voting...</Text>
            )}
          </View>
        </View>
      )}

      {/* Status Messages */}
      {!canVote && poll.status === 'ACTIVE' && (
        <View className="mt-3 p-2 bg-yellow-600/20 rounded border border-yellow-600">
          <Text className="text-yellow-400 text-sm text-center">
            {isMaxVotesReached ? 'Maximum votes reached' : 
             isExpired ? 'This poll has expired' : 
             'You have already voted on this poll'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PollCard; 