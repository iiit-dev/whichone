import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import JWT from 'expo-jwt'

import * as Device from 'expo-device';
import { API_BASE_URL } from '@/config/api';

// Using centralized API configuration
console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('📱 Device info:', { 
  platform: Platform.OS, 
  isDevice: Device.isDevice, 
  deviceName: Device.deviceName 
});  // Web/other platforms use localhost

// Define custom interface for JWT payload
interface CustomJwtPayload extends JwtPayload {
  id?: string;
  email?: string;
  name?: string;
}

const decodeToken = (token: string): CustomJwtPayload | null => {
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);
    return decoded;
  } catch (jwtDecodeError) {
    try {
      const decoded = JWT.decode(token, 'whichone-secret-key') as CustomJwtPayload;
      return decoded;
    } catch (expoJwtError) {
      return null;
    }
  }
};

interface AuthContextType {
  authState: { token: string | null, authenticated: boolean | null }
  user: any | null
  userId: string | null
  onRegister: (name: string, email: string, password: string) => Promise<any>
  onLogin: (email: string, password: string) => Promise<any>
  onLogout: () => Promise<any>
  refreshUserData: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  authState: { token: null, authenticated: null },
  user: null,
  userId: null,
  onRegister: async () => ({}),
  onLogin: async () => ({}),
  onLogout: async () => ({}),
  refreshUserData: async () => ({}),
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      if (!userId) {
        return null;
      }
      const userApiUrl = `${API_BASE_URL}user/${userId}`;
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(userApiUrl, {
        method: 'GET',
        headers : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setUser(data);
      await SecureStore.setItemAsync('user', JSON.stringify(data));
      setUserId(data.id);
      return data;
    } catch (error: any) {
      return null;
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const userJson = await SecureStore.getItemAsync('user');
        
        if (userJson) {
          try {
            const userData = JSON.parse(userJson);
            setUserId(userData.id);
            setUser(userData);
            await SecureStore.setItemAsync('userId', userData.id.toString());
          } catch (error) {
            // Handle parsing error silently
          }
        }

        if (token) {
          try {
            const decoded = decodeToken(token);
            if (decoded) {
              if (decoded.id) {
                setUserId(decoded.id);
                await SecureStore.setItemAsync('userId', decoded.id.toString());
                await fetchUserData(decoded.id);
              }
            }

            setAuthState({
              token,
              authenticated: true,
            });
          } catch (decodeError) {
            setAuthState({
              token: null,
              authenticated: false,
            });
          }
        } else {
          setAuthState({
            token: null,
            authenticated: false,
          });
        }
      } catch (error) {
        setAuthState({
          token: null,
          authenticated: false,
        });
      }
    };
    loadToken();
  }, []);

  const onRegister = async (name: string, email: string, password: string) => {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `${API_BASE_URL}register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
          signal: controller.signal,
        });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      }
      throw error;
    }
  };

  const onLogin = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 && data.needsVerification) {
          throw {
            message: 'Email not verified',
            response: {
              data: {
                needsVerification: true,
                email: data.email
              }
            }
          };
        }
        throw new Error(data.error || data.message || 'Login failed');
      }
      
      const token = data.token;
      await SecureStore.setItemAsync('authToken', token);
      
      if (data.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        await SecureStore.setItemAsync('userId', data.user.id.toString());
      }
      
      setAuthState({
        token: token,
        authenticated: true,
      });
      
      if (data.user) {
        setUser(data.user);
        setUserId(data.user.id);
      } else {
        try {
          const decodedHeader = jwtDecode(token, { header: true }) as { alg: string, typ?: string };
          if (decodedHeader.alg !== 'HS256') {
            // Handle unexpected algorithm silently
          }
          const payload = jwtDecode(token) as any;
          if (payload.id) {
            setUserId(payload.id);
            await SecureStore.setItemAsync('userId', payload.id.toString());
            await fetchUserData(payload.id);
          }
        } catch (error) {
          // Handle token decoding error silently
        }
      }
      return data;
    } catch (error: any) {
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  };

  const onLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('userId');
      setAuthState({
        token: null,
        authenticated: false,
      });
      setUser(null);
      setUserId(null);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      if (!userId) {
        return null;
      }
      return await fetchUserData(userId);
    } catch (error) {
      return null;
    }
  };

  const value = {
    authState,
    user,
    userId,
    onRegister,
    onLogin,
    onLogout,
    refreshUserData,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
