import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/config/api';

interface ProfileUpdateData {
  username?: string;
  bio?: string;
  website?: string;
  gender?: string;
  profile_pic?: string;
}

interface PollData {
  question: string;
  option_a_text: string;
  option_b_text: string;
  max_votes?: number;
  time_limit?: number;
  filters?: Array<{ type: string; value: string }>;
  is_paid?: boolean;
  demographic_filters?: any;
  option_a_url?: string;
  option_b_url?: string;
}

interface VoteData {
  selectedOption: 'A' | 'B';
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  const token = await SecureStore.getItemAsync('authToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return token;
};

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// POLL API FUNCTIONS

// 1. Get active polls for discovery
export const getActivePolls = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/discover`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch active polls');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 2. Get a specific poll by ID
export const getPollById = async (pollId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/${pollId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch poll');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 3. Create a new poll
export const createPoll = async (pollData: PollData): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(pollData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create poll');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 4. Vote on a poll
export const voteOnPoll = async (pollId: string, voteData: VoteData): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/${pollId}/vote`, {
      method: 'POST',
      headers,
      body: JSON.stringify(voteData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to vote on poll');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 5. Get polls created by the user
export const getUserCreatedPolls = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/user/created`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user created polls');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 6. Get polls the user has voted on
export const getUserVotedPolls = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/user/voted`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user voted polls');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 7. Close a poll
export const closePoll = async (pollId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/${pollId}/close`, {
      method: 'PUT',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to close poll');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 8. Get poll analytics
export const getPollAnalytics = async (pollId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/${pollId}/analytics`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch poll analytics');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// 9. Get creator dashboard
export const getCreatorDashboard = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}polls/creator/dashboard`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch creator dashboard');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// WALLET API FUNCTIONS FOR POLLS

// Get poll fee calculation
export const getPollFee = async (maxVotes: number): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}wallet/poll-fee/${maxVotes}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch poll fee');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// Check if user can afford a poll
export const checkCanAffordPoll = async (maxVotes: number): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}wallet/can-afford/${maxVotes}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check affordability');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// EXISTING PROFILE UPDATE FUNCTION

export const updateUserProfile = async (profileData: ProfileUpdateData): Promise<any> => {
  try {
    const token = await SecureStore.getItemAsync('authToken');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const results = [];

    if (profileData.username) {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const usernameResponse = await fetch(`${API_BASE_URL}user/${userId}/update-username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: profileData.username })
      });

      if (!usernameResponse.ok) {
        const errorData = await usernameResponse.json();
        throw new Error(errorData.error || 'Failed to update username');
      }

      results.push(await usernameResponse.json());
    }

    const otherFields = { ...profileData };
    delete otherFields.username;

    if (Object.keys(otherFields).length > 0) {
      const profileResponse = await fetch(`${API_BASE_URL}profile/create-profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(otherFields)
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      results.push(await profileResponse.json());
    }

    return results.length === 1 ? results[0] : results;
  } catch (error: any) {
    throw error;
  }
}; 