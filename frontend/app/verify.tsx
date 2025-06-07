import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Keyboard } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { Snackbar } from 'react-native-paper';
import { hp, wp } from '@/constants/font-size';
import { papayaWhip } from '@/constants/colors';
import { API_BASE_URL } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

const Verify = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Auto-focus next input if text was entered
      if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !code[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = async () => {
    if (resendDisabled) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}send-verification-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      
      setResendDisabled(true);
      setCountdown(30);
      setError('New verification code sent');
      setSnackbarVisible(true);
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      setError('Please enter a valid 4-digit code');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Verification failed');
      }
      
      // Save verification status and token if provided
      if (data.token) {
        await SecureStore.setItemAsync('authToken', data.token);
      }
      
      if (data.user) {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      }
      
      // Redirect to login page instead of home page
      router.replace('/login');
    } catch (error: any) {
      setError(error.message || 'Verification failed');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <View className="h-full bg-dark-bg">
        <View className="flex-1 justify-center items-center px-6">
          {!isKeyboardVisible && (
            <View className="flex-1 justify-center items-center">
              <Image 
                source={require('@/assets/images/tech-idea.png')}
                style={{       
                  width: wp(80), 
                  height: wp(80),
                  resizeMode: 'contain'
                }}
              />
            </View>
          )}
        </View>

        {/* Bottom Section */}
        <View 
          className={`bg-dark-secondary border border-dark-border px-6 pt-8 pb-12 ${!isKeyboardVisible ? 'rounded-t-3xl' : ''}`} 
          style={{ 
            minHeight: isKeyboardVisible ? hp(100) : hp(67),
            flex: isKeyboardVisible ? 1 : undefined 
          }}
        >
          <Text style={{ fontSize: hp(4) }} className="text-dark-text font-bold mb-2">
            Account
          </Text>
          <Text style={{ fontSize: hp(4) }} className="text-dark-text font-bold mb-6">
            Verification
          </Text>
          
          <Text style={{ fontSize: hp(2) }} className="text-dark-text-secondary mb-8 leading-6">
            Please enter the 4 digit code sent to Your Email
          </Text>
          
          {/* Code Input Fields */}
          <View className="flex-row justify-between mb-8">
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={{
                  width: 70,
                  height: 70,
                  borderWidth: 1,
                  borderColor: '#3A3A3C',
                  borderRadius: 20,
                  fontSize: 24,
                  textAlign: 'center',
                  backgroundColor: '#1C1C1E',
                  color: '#FFFFFF',
                  fontWeight: '600',
                }}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor="#007AFF"
              />
            ))}
          </View>
          
          {/* Resend Code Link */}
          <TouchableOpacity 
            onPress={resendCode} 
            disabled={resendDisabled}
            className="mb-8"
          >
            <Text className="text-slate-50 text-center underline" style={{ fontSize: hp(1.8) }}>
              {resendDisabled 
                ? `Resend Code in ${countdown}s` 
                : "Resend Code"}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={verifyCode}
            disabled={loading}
            className="bg-transparent border-2 border-slate-50 rounded-full py-4"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            <Text style={{ fontSize: hp(2.2) }} className="text-slate-50 text-center font-semibold">
              {loading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: error.includes('sent') ? '#007AFF' : '#2C2C2E' }}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
          labelStyle: { color: '#FFFFFF' }
        }}
      >
        <Text style={{ color: '#FFFFFF' }}>{error}</Text>
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  codeInput: {
    width: 70,
    height: 70,
    borderWidth: 0,
    borderRadius: 20,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Verify; 