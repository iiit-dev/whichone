import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { hp, wp } from '@/constants/font-size';
import { useAuth } from '@/context/authContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Icon from '@/assets/icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { API_BASE_URL } from '@/config/api';
import { z } from 'zod';

// For real devices, replace 'YOUR_COMPUTER_IP' with your actual computer's IP address
const COMPUTER_IP = '192.168.0.100'; // Your actual IP address

// Configure the base URL based on platform
// export const API_BASE_URL =
//   Platform.OS === 'android'
//     ? __DEV__ 
//       ? 'http://10.0.2.2:3000/api/v1'  // Android emulator in development
//       : `http://${COMPUTER_IP}:3000/api/v1`  // Real Android device
//     : Platform.OS === 'ios'
//       ? 'http://localhost:3000/api/v1'
//       : 'http://localhost:3000/api/v1';
const Register = () => {
  const { onRegister } = useAuth();
  const signUpSchema = z.object({
    name: z.string().min(1),
    email: z.string().min(1).email(),
    password: z.string().min(6)
  });
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const validateForm = () => {
    const filledFields = Object.values(formValues).filter(value => value.trim() !== '').length;
    const totalFields = Object.keys(formValues).length;
    if (filledFields === 0) {
      setValidationError('Fill all the 3 fields');
      return false;
    } else if (filledFields === 1) {
      setValidationError('Fill the remaining fields');
      return false;
    } else if (filledFields === totalFields - 1) {
      setValidationError('Fill the remaining field');
      return false;
    }
    try {
      signUpSchema.parse(formValues);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError && err.errors.length > 0) {
        setValidationError(err.errors[0].message);
      } else {
        setValidationError('Validation failed');
      }
      return false;
    }
  };
  const handleChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
    setValidationError('');
  };

  const signUpWithEmail = async () => {
    if (!validateForm()) {
      setSnackbarVisible(true);
      return;
    }
    try {
      setLoading(true);
      console.log('🚀 Starting registration process...');
      console.log('📧 Email:', formValues.email);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log('📬 Sending verification email...');
      // First make the API request to get the verification code
      const verificationResponse = await fetch(`${API_BASE_URL}send-verification-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formValues.email,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('✅ Verification email response received, status:', verificationResponse.status);

      const verificationData = await verificationResponse.json();
      if (!verificationResponse.ok) {
        console.log('❌ Verification email failed:', verificationData);
        throw new Error(verificationData.message || 'Failed to send verification code');
      }

      console.log('📝 Registering user...');
      // Then register the user
      const response = await onRegister(
        formValues.name,
        formValues.email,
        formValues.password
      );

      console.log('✅ Registration successful!');
      // Registration successful, redirect to verification page with the code and email
      router.push({
        pathname: '/verify',
        params: {
          email: formValues.email,
          verificationCode: verificationData.verificationCode
        }
      });
    } catch (error: any) {
      // Registration failed
      console.log('❌ Registration error:', error);
      let errorMessage = 'Registration failed';

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setValidationError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="h-full flex justify-center items-center bg-dark-bg"
      >
        <View className="w-full max-w-md px-6">
          {!keyboardVisible && (
            <View className="flex-col flex p-2 mt-2">
              <Text style={{ fontSize: hp(4) }} className="text-center text-dark-text font-bold p-1">
                Create Account
              </Text>
            </View>
          )}
          {!keyboardVisible && (
            <Text
              style={{
                fontSize: hp(3),
                textShadowColor: 'rgba(255, 255, 255, 0.21)',
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 0,
              }}
              className="p-1 text-dark-text text-center font-bold mb-4"
            >
              Get instant feedback on choices!
            </Text>
          )}
          <View className="w-full">
            <Input
              className="mt-5"
              icon={<AntDesign name="user" size={24} color="#FFFFFF" />}
              label="Name"
              placeholder="Enter your Name"
              value={formValues.name}
              onChangeText={(text: string) => handleChange('name', text)}
            />
            <Input
              className="mt-5"
              icon={<Icon name="email" color="#FFFFFF" />}
              label="Email"
              placeholder="Enter your Email"
              value={formValues.email}
              onChangeText={(text: string) => handleChange('email', text)}
            />
            <Input
              className="mt-5"
              icon={
                <Icon
                  color="#FFFFFF"
                  name={showPassword ? 'view-pass' : 'view-off'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              label="Password"
              placeholder="Enter your Password"
              secureTextEntry={!showPassword}
              value={formValues.password}
              onChangeText={(text: string) => handleChange('password', text)}
            />
            <TouchableOpacity
              onPress={() => router.push('/register')}
              className="self-end"
            >
              <Text className="text-dark-text-secondary my-3 text-sm font-semibold">Forgot password?</Text>
            </TouchableOpacity>
            {/* <Button
              title="Forgot your Password?"
              onPress={() => router.push('/login')}
              loading={false}
              className=""
              textClassName="text-papaya-whip-600 font-bold"
              icon={null}
              shadow={false}
              customClass={'bg-transparent my-3 ml-[50%]'}
              fontSize={null}
              style={{}}
            /> */}
            <Button
              title="Sign Up"
              loading={loading}
              onPress={signUpWithEmail}
              className={null}
              textClassName={null}
              icon={null}
              customClass="mx-auto mb-3 w-[100%] bg-dark-accent px-4 py-3 rounded-full flex justify-center items-center"
              fontSize={hp(2.7)}
              style={{}}
            />
            <Button
              title="Already have an account?"
              onPress={() => router.push('/login')}
              loading={false}
              className="bg-transparent"
              textClassName="text-dark-accent text-center font-bold"
              icon={null}
              shadow={false}
              customClass={null}
              fontSize={null}
              style={{}}
            />
          </View>
          {!keyboardVisible && (
            <View className="items-center my-5">
              <Text style={{ fontSize: hp(2) }} className="text-dark-text-secondary font-bold mb-3">Or continue with</Text>
              <View className="flex-row justify-around w-3/5">
                <Button
                  title="Google"
                  onPress={() => { }}
                  loading={false}
                  className=""
                  textClassName=""
                  icon={<FontAwesome name="google" className='' size={24} color={'#FFFFFF'} />}
                  customClass="bg-dark-secondary rounded-lg size-[3rem] flex justify-center items-center shadow-md"
                  fontSize={null}
                  style={{}}
                />
                <Button
                  title="Facebook"
                  onPress={() => { }}
                  loading={false}
                  className=""
                  textClassName=""
                  icon={<FontAwesome name="facebook" size={24} color={'#FFFFFF'} />}
                  customClass="bg-dark-secondary rounded-lg size-[3rem] flex justify-center items-center shadow-md"
                  fontSize={null}
                  style={{}}
                />
                <Button
                  icon={<FontAwesome name="apple" size={24} color={'#FFFFFF'} />}
                  customClass="bg-dark-secondary rounded-lg size-[3rem] flex justify-center items-center shadow-md"
                  title="Apple"
                  onPress={() => { }}
                  loading={false}
                  className=""
                  textClassName=""
                  fontSize={null}
                  style={{}}
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: '#2C2C2E' }}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
          labelStyle: { color: '#FFFFFF' }
        }}
      >
        <Text style={{ color: '#FFFFFF' }}>{validationError}</Text>
      </Snackbar>
    </ScreenWrapper>
  );
};

export default Register;