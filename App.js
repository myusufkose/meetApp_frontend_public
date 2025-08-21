// In App.js in a new project
import * as React from 'react';
import {StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './Screens/HomeScreen';
import { DetailsScreen } from './Screens/DetailsScreen.js';
import { useEffect, useState } from 'react';
import { AuthProvider } from "./Context/AuthContext.js";
import { ThemeProvider } from './Context/ThemeContext';
import { MyTabs } from "./Screens/tabs.js"
import ChatListScreen from './Screens/Chat/ChatListScreen';
import ChatScreen from './Screens/Chat/ChatScreen';
import NewChatScreen from './Screens/Chat/NewChatScreen';
import { WebSocketProvider } from './Context/WebSocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  AsyncStorage.clear(); // Clear AsyncStorage for debugging purposes
  useEffect(() => {
    console.log('App.js - Component mounted');
  }, []);

  return (
    <AuthProvider>
      <WebSocketProvider>
        <ThemeProvider>
          <StatusBar
            backgroundColor="#61dafb" 
            barStyle={'default'}
            showHideTransition={'fade'}
            hidden={false}
          />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerBackTitleVisible: false,
                headerBackTitle: '',
                headerBackVisible: true,
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#000000',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: '600',
                },
                headerLeft: () => null
              }}
            >
              <Stack.Screen 
                name="RootTabs" 
                component={MyTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="ChatList" 
                component={ChatListScreen}
                options={{ title: 'Sohbetler' }}
              />
              <Stack.Screen 
                name="Chat" 
                component={ChatScreen}
                options={({ route }) => {
                  console.log('App.js - Chat screen options - route params:', route.params);
                  if (!route.params?.chatInfo) {
                    console.error('App.js - Chat screen options - chatInfo is undefined');
                    return { title: 'Sohbet' };
                  }
                  const title = route.params.chatInfo.is_group 
                    ? route.params.chatInfo.group_name 
                    : route.params.chatInfo.participants_info?.find(p => p.user_id !== route.params.chatInfo.user_id)?.full_name || 'Sohbet';
                  console.log('App.js - Chat screen options - calculated title:', title);
                  return { title };
                }}
              />
              <Stack.Screen 
                name="NewChat" 
                component={NewChatScreen}
                options={{ 
                  title: 'Yeni Sohbet',
                  headerLeft: () => null
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
