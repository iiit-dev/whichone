import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMedia } from '@/context/mediaContext';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const THUMBNAIL_SIZE = (width - 40) / GRID_SIZE; // 40 for padding

interface MediaAsset {
  id: string;
  uri: string;
  mediaType: 'photo' | 'video';
  duration?: number;
  filename: string;
}

const MediaSelector = () => {
  const { selectedMedia, setSelectedMedia } = useMedia();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [localSelectedMedia, setLocalSelectedMedia] = useState<MediaAsset[]>(selectedMedia);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermissionAndLoadMedia();
  }, []);

  const requestPermissionAndLoadMedia = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await loadMedia();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to access media library');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        first: 100,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const formattedAssets: MediaAsset[] = media.assets.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType === MediaLibrary.MediaType.photo ? 'photo' : 'video',
        duration: asset.duration,
        filename: asset.filename,
      }));

      setMediaAssets(formattedAssets);
      
      // Auto-select the first media item if none selected
      if (localSelectedMedia.length === 0 && formattedAssets.length > 0) {
        setLocalSelectedMedia([formattedAssets[0]]);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      Alert.alert('Error', 'Failed to load media');
    }
  };

  const handleMediaSelect = (media: MediaAsset) => {
    if (multiSelectMode) {
      const isSelected = localSelectedMedia.some(item => item.id === media.id);
      if (isSelected) {
        setLocalSelectedMedia(localSelectedMedia.filter(item => item.id !== media.id));
      } else {
        setLocalSelectedMedia([...localSelectedMedia, media]);
      }
    } else {
      setLocalSelectedMedia([media]);
    }
  };

  const handleNext = () => {
    if (localSelectedMedia.length === 0) {
      Alert.alert('No Media Selected', 'Please select at least one media item');
      return;
    }
    
    // Convert MediaLibrary.MediaType to string for context
    const contextMedia = localSelectedMedia.map(media => ({
      ...media,
      mediaType: media.mediaType === 'photo' ? 'photo' as const : 'video' as const
    }));
    
    // Update context with selected media
    setSelectedMedia(contextMedia);
    
    // Navigate back to newpost
    router.back();
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderMediaThumbnail = (media: MediaAsset, index: number) => {
    const isSelected = localSelectedMedia.some(item => item.id === media.id);
    
    return (
      <TouchableOpacity
        key={media.id}
        style={[styles.thumbnailContainer, { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }]}
        onPress={() => handleMediaSelect(media)}
      >
        <Image
          source={{ uri: media.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Video duration overlay */}
        {media.mediaType === 'video' && media.duration && (
          <View style={styles.durationOverlay}>
            <Text style={styles.durationText}>
              {formatDuration(media.duration)}
            </Text>
          </View>
        )}
        
        {/* Selection overlay */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading media...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Media library access is required to select photos and videos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermissionAndLoadMedia}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topBarButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.topBarTitle}>Gallery</Text>
        
        <TouchableOpacity onPress={handleNext} style={styles.topBarButton}>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Selected Media Preview */}
      <View style={styles.previewContainer}>
        {localSelectedMedia.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {localSelectedMedia.map((media, index) => (
              <View key={media.id} style={styles.previewItem}>
                <Image
                  source={{ uri: media.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                {media.mediaType === 'video' && media.duration && (
                  <View style={styles.previewDurationOverlay}>
                    <Text style={styles.previewDurationText}>
                      {formatDuration(media.duration)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noSelectionContainer}>
            <Text style={styles.noSelectionText}>No media selected</Text>
          </View>
        )}
      </View>

      {/* Media Grid */}
      <View style={styles.gridContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {mediaAssets.map((media, index) => renderMediaThumbnail(media, index))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.multiSelectButton,
            multiSelectMode && styles.multiSelectButtonActive
          ]}
          onPress={() => setMultiSelectMode(!multiSelectMode)}
        >
          <Ionicons 
            name={multiSelectMode ? "checkmark-circle" : "copy-outline"} 
            size={20} 
            color={multiSelectMode ? "#007AFF" : "white"} 
          />
          <Text style={[
            styles.multiSelectText,
            multiSelectMode && styles.multiSelectTextActive
          ]}>
            SELECT MULTIPLE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  topBarButton: {
    padding: 8,
  },
  topBarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    height: 200,
    backgroundColor: '#111',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewItem: {
    width: 200,
    height: 200,
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewDurationOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewDurationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionText: {
    color: '#666',
    fontSize: 16,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  thumbnailContainer: {
    marginBottom: 2,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,122,255,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 4,
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000',
  },
  multiSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  multiSelectButtonActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  multiSelectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  multiSelectTextActive: {
    color: '#007AFF',
  },
});

export default MediaSelector; 