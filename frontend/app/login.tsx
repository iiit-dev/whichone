import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../assets/icons/index';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/constants/font-size';
import Input from '../components/Input';
import Button from '../components/Button';
import { z } from 'zod';
import { FontAwesome } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { papayaWhip } from '@/constants/colors';
import { useAuth } from '@/context/authContext';
import { API_BASE_URL } from '@/config/api';
import AntDesign from '@expo/vector-icons/AntDesign';

const signInSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const router = useRouter();
  const { onLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
    setValidationError('');
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Test response:', data);
      setValidationError(`Connection successful! Response: ${data.message}`);
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setValidationError(`Connection failed: ${error.message}`);
      setSnackbarVisible(true);
    }
  };

  const validateForm = () => {
    const filledFields = Object.values(formValues).filter(value => value.trim() !== '').length;
    const totalFields = Object.keys(formValues).length;

    if (filledFields === 0) {
      setValidationError('Fill the email and password fields');
      return false;
    } else if (filledFields === 1) {
      const emptyField = Object.entries(formValues).find(([_, value]) => !value.trim())?.[0];
      setValidationError(`Fill the ${emptyField} field`);
      return false;
    }
    try {
      signInSchema.parse(formValues);
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

  async function signInWithEmail() {
    if (!validateForm()) {
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);
      console.log('Starting login process...');
      console.log('API_BASE_URL:', API_BASE_URL);

      try {
        console.log('Calling onLogin with:', { email: formValues.email });
        const response = await onLogin(formValues.email, formValues.password);
        console.log('Login successful:', response);
        router.push('/(tabs)/home');
      } catch (error: any) {
        console.error('Login error:', error);

        if (error.message?.includes('Email not verified') ||
          (error.response?.data && error.response.data.needsVerification)) {
          const email = error.response?.data?.email || formValues.email;
          try {
            console.log('Sending verification email to:', email);
            await fetch(`${API_BASE_URL}send-verification-mail`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });
            router.push({
              pathname: '/verify',
              params: { email }
            });
          } catch (sendError) {
            console.error('Error sending verification code:', sendError);
            setValidationError('Failed to send verification code. Please try again.');
            setSnackbarVisible(true);
          }
        } else {
          let errorMessage = error.message || 'Login failed';
          console.error('Setting validation error:', errorMessage);
          setValidationError(errorMessage);
          setSnackbarVisible(true);
        }
      }
    } catch (outerError) {
      console.error('Outer catch error:', outerError);
      setValidationError('An unexpected error occurred. Please try again.');
      setSnackbarVisible(true);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="min-h-full bg-dark-bg flex justify-center items-center px-8" style={{ paddingBottom: isKeyboardVisible ? keyboardHeight * 0.1 : 0 }}>
            {/* Instagram Logo */}
            <View className="mb-4">
              <Image
                source={require('@/assets/logo/which-one-logo.png')}
                className="h-16 "
                style={{
                  // width: hp(52.5),
                  // height: hp(10),
                  resizeMode: 'contain'
                }}
                onError={() => { }}
              />

            </View>

            {/* Continue with Facebook Button */}
            {!isKeyboardVisible && (
              <View className="w-full mb-6">
                <Button
                  title="Continue with Facebook"
                  onPress={() => { }}
                  loading={false}
                  className=""
                  textClassName="text-dark-text font-semibold"
                  customClass="bg-dark-accent p-4 rounded-lg w-full flex flex-row justify-center items-center"
                  icon={<FontAwesome name="facebook" size={20} color="white" style={{ marginRight: 8 }} />}
                  fontSize={hp(2.2)}
                  style={{}}
                />
              </View>
            )}

            {/* OR Divider */}
            {!isKeyboardVisible && (

              <View className="w-full flex-row items-center mb-6">
                <View className="flex-1 h-px bg-dark-border" />
                <Text className="mx-4 text-dark-text-secondary font-semibold">OR</Text>
                <View className="flex-1 h-px bg-dark-border" />
              </View>
            )}

            {/* Input Fields */}
            <View className="w-full mb-4">
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
            </View>

            {/* Forgot Password */}
            <View className="w-full mb-6">
              <TouchableOpacity
                onPress={() => router.push('/register')}
                className="self-end"
              >
                <Text className="text-dark-text-secondary text-sm font-semibold">Forgot password?</Text>
              </TouchableOpacity>
            </View>
            {/* Log In Button */}
            <View className={`w-full ${isKeyboardVisible ? 'mb-4' : 'mb-8'}`}>

              <Button
                title="Log In"
                loading={loading}
                onPress={() => signInWithEmail()}
                className={null}
                textClassName={null}
                icon={null}
                customClass="mx-auto mb-3 w-[100%] bg-dark-accent px-4 py-3 rounded-full flex justify-center items-center"
                fontSize={hp(2.7)}
                style={{}}
              />
            </View>



            {/* Sign Up Link */}
            {!isKeyboardVisible && (
              <View className="flex-row items-center mb-16">
                <Text className="text-dark-text-secondary">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-dark-accent font-semibold">Sign up</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* From Facebook */}
            {!isKeyboardVisible && (
              <View className="absolute bottom-8">
                <Text className="text-dark-text-secondary text-xs text-center">
                  from{'\n'}
                  <Text className="font-semibold">FACEBOOK</Text>
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
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

export default Login;
