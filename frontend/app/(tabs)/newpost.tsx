import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Image, StyleSheet, TouchableOpacity, TextInput, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/context/authContext';
import { useMedia } from '@/context/mediaContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

type ImageAsset = ImagePicker.ImagePickerAsset | null;

const NewPost = () => {
  const { authState, userId } = useAuth();
  const { selectedMedia, clearSelectedMedia } = useMedia();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  
  // Poll-specific state
  const [question, setQuestion] = useState('');
  const [optionAText, setOptionAText] = useState('');
  const [optionBText, setOptionBText] = useState('');
  const [optionAUrl, setOptionAUrl] = useState('');
  const [optionBUrl, setOptionBUrl] = useState('');
  const [optionAImage, setOptionAImage] = useState<ImageAsset>(null);
  const [optionBImage, setOptionBImage] = useState<ImageAsset>(null);
  const [maxVotes, setMaxVotes] = useState('10');
  const [timeLimit, setTimeLimit] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [cropMode, setCropMode] = useState<'free' | 'square' | 'rectangle'>('free');

  const handleImagePicker = async (option: 'A' | 'B') => {
    try {
      // Directly use free-form cropping as default
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        // No aspect ratio for free-form cropping
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (option === 'A') {
          setOptionAImage(result.assets[0]);
        } else if (option === 'B') {
          setOptionBImage(result.assets[0]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (option: 'A' | 'B') => {
    if (option === 'A') {
      setOptionAImage(null);
    } else if (option === 'B') {
      setOptionBImage(null);
    }
  };

  const handleCreatePoll = async () => {
    if (!question.trim()) {
      Alert.alert('Missing Fields', 'Please enter a poll question');
      return;
    }

    if (!optionAText.trim() && !optionBText.trim()) {
      Alert.alert('Missing Fields', 'Please provide at least one option');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add text fields (don't send creator_id - backend gets it from auth)
      formData.append('question', question.trim());
      
      if (optionAText.trim()) {
        formData.append('option_a_text', optionAText.trim());
      }
      
      if (optionBText.trim()) {
        formData.append('option_b_text', optionBText.trim());
      }
      
      // Only append URL fields if no images are selected (to avoid field name conflicts)
      if (optionAUrl.trim() && !optionAImage) {
        formData.append('option_a_url', optionAUrl.trim());
      }
      
      if (optionBUrl.trim() && !optionBImage) {
        formData.append('option_b_url', optionBUrl.trim());
      }
      
      formData.append('max_votes', maxVotes || '10');
      
      if (timeLimit) {
        formData.append('time_limit', timeLimit);
      }
      
      formData.append('is_paid', isPaid.toString());
      
      // Add image files if selected (backend expects these as option_a_url and option_b_url)
      if (optionAImage) {
        const fileExtension = optionAImage.uri.split('.').pop() || 'jpg';
        formData.append('option_a_url', {
          uri: optionAImage.uri,
          type: `image/${fileExtension}`,
          name: `option_a_image.${fileExtension}`,
        } as any);
      }
      
      if (optionBImage) {
        const fileExtension = optionBImage.uri.split('.').pop() || 'jpg';
        formData.append('option_b_url', {
          uri: optionBImage.uri,
          type: `image/${fileExtension}`,
          name: `option_b_image.${fileExtension}`,
        } as any);
      }

      // Make API request
      const response = await fetch('https://730f-103-181-64-156.ngrok-free.app/api/v1/polls', {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - let the browser set it automatically with boundary
          'Authorization': `Bearer ${authState?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Poll created successfully:', result);
      
      // Clear form fields after successful creation
      setQuestion('');
      setOptionAText('');
      setOptionBText('');
      setOptionAUrl('');
      setOptionBUrl('');
      setOptionAImage(null);
      setOptionBImage(null);
      setMaxVotes('10');
      setTimeLimit('');
      setIsPaid(false);
      
      Alert.alert('Success', 'Poll created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/home')
        }
      ]);
    } catch (error) {
      console.error('Poll creation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setQuestion('');
    setOptionAText('');
    setOptionBText('');
    setOptionAUrl('');
    setOptionBUrl('');
    setOptionAImage(null);
    setOptionBImage(null);
    setMaxVotes('10');
    setTimeLimit('');
    setIsPaid(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Poll</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
            Poll Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'existing' && styles.activeTab]}
          onPress={() => setActiveTab('existing')}
        >
          <Text style={[styles.tabText, activeTab === 'existing' && styles.activeTabText]}>
            Options & Settings
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Conditional Form Fields based on Active Tab */}
          {activeTab === 'new' && (
            <>
              {/* Poll Question */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Poll Question *</Text>
                <TextInput
                  style={[styles.textInput, styles.descriptionInput]}
                  placeholder="What would you like people to choose between?"
                  placeholderTextColor="#8E8E93"
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.characterCount}>{question.length}/200</Text>
              </View>

              {/* Option A */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Option A</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter text for Option A"
                  placeholderTextColor="#8E8E93"
                  value={optionAText}
                  onChangeText={setOptionAText}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Option A Image (Optional)</Text>
                {optionAImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: optionAImage.uri }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('A')}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.imagePickerButton} 
                    onPress={() => handleImagePicker('A')}
                  >
                    <Ionicons name="image-outline" size={24} color="#007AFF" />
                    <Text style={styles.imagePickerText}>Select Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Option B */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Option B</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter text for Option B"
                  placeholderTextColor="#8E8E93"
                  value={optionBText}
                  onChangeText={setOptionBText}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Option B Image (Optional)</Text>
                {optionBImage ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: optionBImage.uri }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton} 
                      onPress={() => removeImage('B')}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.imagePickerButton} 
                    onPress={() => handleImagePicker('B')}
                  >
                    <Ionicons name="image-outline" size={24} color="#007AFF" />
                    <Text style={styles.imagePickerText}>Select Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {activeTab === 'existing' && (
            <>
              {/* Poll Settings */}
              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Maximum Votes</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10"
                  placeholderTextColor="#8E8E93"
                  value={maxVotes}
                  onChangeText={setMaxVotes}
                  keyboardType="numeric"
                />
                <Text style={styles.helperText}>Default: 10 votes for free polls</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.fieldLabel}>Time Limit (Minutes)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter time limit in minutes (optional)"
                  placeholderTextColor="#8E8E93"
                  value={timeLimit}
                  onChangeText={setTimeLimit}
                  keyboardType="numeric"
                />
                <Text style={styles.helperText}>Leave empty for no time limit</Text>
              </View>

              {/* Poll Type Toggle */}
              <View style={styles.formSection}>
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.fieldLabel}>Paid Poll</Text>
                    <Text style={styles.helperText}>Enable premium features</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.toggle, isPaid && styles.toggleActive]}
                    onPress={() => setIsPaid(!isPaid)}
                  >
                    <View style={[styles.toggleSwitch, isPaid && styles.toggleSwitchActive]} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preview Section */}
              <View style={styles.previewSection}>
                <Text style={styles.fieldLabel}>Poll Preview</Text>
                <View style={styles.previewContainer}>
                  <Text style={styles.previewQuestion}>
                    {question || "Your poll question will appear here"}
                  </Text>
                  <View style={styles.previewOptions}>
                    <View style={styles.previewOption}>
                      <Text style={styles.previewOptionText}>
                        A: {optionAText || "Option A"}
                      </Text>
                      {optionAImage && (
                        <Image source={{ uri: optionAImage.uri }} style={styles.previewImage} />
                      )}
                    </View>
                    <View style={styles.previewOption}>
                      <Text style={styles.previewOptionText}>
                        B: {optionBText || "Option B"}
                      </Text>
                      {optionBImage && (
                        <Image source={{ uri: optionBImage.uri }} style={styles.previewImage} />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
          onPress={handleCreatePoll}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? 'Creating...' : 'Create Poll'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginRight: 30,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadContent: {
    alignItems: 'center',
  },
  fileIconsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  fileIcon: {
    marginHorizontal: 10,
  },
  uploadText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  browseText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  supportText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  uploadedFilesContainer: {
    marginBottom: 30,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '75%',
    backgroundColor: '#007AFF',
  },
  formSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  shareSection: {
    marginBottom: 40,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#1C1C1E',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#4A90E2',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleSwitch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleSwitchActive: {
    transform: [{ translateX: 20 }],
  },
  previewSection: {
    marginBottom: 40,
  },
  previewContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  previewQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  previewOptions: {
    gap: 12,
  },
  previewOption: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 6,
  },
  previewOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previewUrl: {
    fontSize: 12,
    color: '#007AFF',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  removeImageButton: {
    padding: 4,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#3A3A3C',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  imagePickerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default NewPost;