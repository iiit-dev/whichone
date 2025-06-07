import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { updateUserProfile } from '@/api/api';
import { useAuth } from '@/context/authContext';
import { hp } from '@/constants/font-size';

const BioEdit = () => {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const params = useLocalSearchParams();
  const [bio, setBio] = useState(params.currentBio as string || '');
  const [inputHeight, setInputHeight] = useState(24); // Initial height for one line
  const MAX_CHARS = 150;

  const handleSave = async () => {
    try {
      await updateUserProfile({ 
        bio,
        website: user?.profile?.website || '',
        gender: user?.profile?.gender || 'Male',
        profile_pic: user?.profile?.profile_pic || ''
      });
      refreshUserData && await refreshUserData();
      router.back();
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  const handleTextChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      setBio(text);
    }
  };
 
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Bio</Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <MaterialIcons name="check" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.inputContainer}>
            <TextInput
              value={bio}
              onChangeText={handleTextChange}
              placeholder="Add your bio..."
              placeholderTextColor="#8E8E93"
              multiline
              autoFocus
              style={styles.input}
              maxLength={MAX_CHARS}
            />
            <View style={styles.bottomBorder} />
          </View>
        </KeyboardAvoidingView>
        
        {/* Character count - positioned outside KeyboardAvoidingView */}
        <View style={styles.charCountContainer}>
          <Text style={[
            styles.charCount,
            bio.length >= MAX_CHARS ? styles.charCountLimitReached : null
          ]}>
            {bio.length}/{MAX_CHARS}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    fontSize: hp(2.2),
    color: '#FFFFFF',
    padding: 0,
    minHeight: 30,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#3A3A3C',
    width: '100%',
  },
  charCountContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  charCountLimitReached: {
    color: '#FF3B30',
  },
});

export default BioEdit; 