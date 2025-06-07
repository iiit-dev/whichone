import { Stack } from 'expo-router'
import AuthProvider from '@/context/authContext'
import { ThemeProvider } from '@/context/themeContext'
import { MediaProvider } from '@/context/mediaContext'
import "../global.css"
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <MediaProvider>
                            <Stack screenOptions={{ headerShown: false }} />
                        </MediaProvider>
                    </AuthProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}
