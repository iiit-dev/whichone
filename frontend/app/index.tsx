import { View } from 'react-native'
import React, { useState, useEffect } from 'react'
import Welcome from './welcome'
import { Redirect } from 'expo-router'
import { useAuth } from '../context/authContext'
import Loading from '../components/Loading'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
SplashScreen.preventAutoHideAsync().catch(()=>{});
const Index = () => {
  const { authState } = useAuth()
  const [appIsReady, setAppIsReady] = useState(false)
  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        // console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }
    prepare()
  }, [])
  useEffect(() => {
    if (appIsReady && authState.authenticated !== null) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [appIsReady, authState.authenticated])
  if (!appIsReady || authState.authenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' }}>
        <Loading size="large" color="#007AFF" />
      </View>
    )
  }
  
  if (authState.authenticated) {
    return <Redirect href="/(tabs)/home" />
  } else {
    return <Welcome />
  }
}
export default Index