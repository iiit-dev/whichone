import React from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import Avatar from '@/app/(tabs)/avatar';

interface NavigationDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  slideAnim: Animated.Value;
}

interface UserData {
  id?: string | number;
  name?: string;
  username?: string;
  email?: string;
  profile?: {
    profile_pic?: string;
  };
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function NavigationDrawer({ isVisible, onClose, slideAnim }: NavigationDrawerProps) {
  const router = useRouter();
  const { user: contextUser, onLogout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme(); 
  const user = contextUser as UserData | null;

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => {
        router.push('/profile');
        onClose();
      },
    },
    {
      icon: 'add',
      title: 'New Post',
      onPress: () => {
        router.push('/newpost');
        onClose();
      },
    },
    {
      icon: 'favorite-outline',
      title: 'Notifications',
      onPress: () => {
        router.push('/notifications');
        onClose();
      },
    },
    {
      icon: isDarkMode ? 'light-mode' : 'dark-mode',
      title: isDarkMode ? 'Light Mode' : 'Dark Mode',
      onPress: () => {
        toggleTheme();
        // Don't close drawer immediately for theme toggle
      },
    },
    {
      icon: 'settings',
      title: 'Settings',
      onPress: () => {
        router.push('/account-settings');

        // Add settings route later
        onClose();
      },
    },
    {
      icon: 'help-outline',
      title: 'Help & Support',
      onPress: () => {
        // Add help route later
        onClose();
      },
    },
    {
      icon: 'logout',
      title: 'Logout',
      onPress: () => {
        onLogout();
        onClose();
      },
      isLogout: true,
    },
  ];

  const handleBackdropPress = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
      
      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [DRAWER_WIDTH, 0],
              }),
            }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Avatar
            uri={user?.profile?.profile_pic || ''}
            size={60}
            style={{ borderRadius: 30 }}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, item.isLogout && styles.logoutItem]}
              onPress={item.onPress}
            >
              <MaterialIcons
                name={item.icon as any}
                size={24}
                color={item.isLogout ? '#FF3B30' : '#FFFFFF'}
              />
              <Text style={[styles.menuText, item.isLogout && styles.logoutText]}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 5,
  },
  userInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 20,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  logoutText: {
    color: '#FF3B30',
  },
}); 