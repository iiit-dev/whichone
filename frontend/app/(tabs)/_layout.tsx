import { Stack } from 'expo-router'

const StackLayout = () => {
    return (
        <Stack
            initialRouteName="home"
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen 
                name="home" 
            />
            <Stack.Screen 
                name="newpost" 
            />
            <Stack.Screen 
                name="media-selector" 
            />
            <Stack.Screen 
                name="notifications" 
            />
            <Stack.Screen 
                name="profile" 
            />
        </Stack>
    )
}

export default StackLayout