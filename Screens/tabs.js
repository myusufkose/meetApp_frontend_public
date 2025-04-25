import Ionicons from '@expo/vector-icons/Ionicons';
import { LoginScreen } from "./User/Login";
import { RegisterScreen } from "./User/Register";
import ProfileScreen from "./User/Profile.js";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './HomeScreen';
import { DetailsScreen } from './DetailsScreen.js';
import { CreateActivity } from './Activity/CreateActivity';
import { AllActivities } from './Activity/AllActivities';
import PrivacyAndSecurity from './User/PrivacyAndSecurity';
import ChatListScreen from './Chat/ChatListScreen';
import NotificationsScreen from './User/NotificationsScreen';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Button } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext.js';
import React, { useContext, useState } from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../Context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function MyTabs() {
    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator();
    const { user, loading } = useContext(AuthContext);
    const { theme, changeTheme } = useTheme();
    
    if (loading) {
        return (
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: theme.colors.background 
            }}>
                <Text style={{ color: theme.colors.text }}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <>
            {!user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen name="AuthTabs" component={TabNavigator} options={{ headerShown: false }} />
                    <Stack.Screen 
                        name="PrivacyAndSecurity" 
                        component={PrivacyAndSecurity}
                        options={{
                            title: 'Gizlilik ve Güvenlik',
                            headerStyle: {
                                backgroundColor: theme.colors.surface,
                                borderBottomColor: theme.colors.border,
                                borderBottomWidth: 1,
                            },
                            headerTintColor: theme.colors.text,
                            headerTitleStyle: {
                                fontWeight: '600',
                            },
                        }}
                    />
                    <Stack.Screen 
                        name="AllActivities" 
                        component={AllActivities}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen 
                        name="Notifications" 
                        component={NotificationsScreen}
                        options={{
                            title: 'Bildirimler',
                            headerStyle: {
                                backgroundColor: theme.colors.surface,
                                borderBottomColor: theme.colors.border,
                                borderBottomWidth: 1,
                            },
                            headerTintColor: theme.colors.text,
                            headerTitleStyle: {
                                fontWeight: '600',
                            },
                        }}
                    />
                </Stack.Navigator>
            )}
        </>
    );
}

function TabNavigator() {
    const Tab = createBottomTabNavigator();
    const { theme, changeTheme } = useTheme();
    const navigation = useNavigation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'CreateActivity') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Details') {
                        iconName = focused ? 'information-circle' : 'information-circle-outline';
                    } else if (route.name === 'ChatList') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 80,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.inactive,
                tabBarShowLabel: false,
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Notifications')}
                            style={{ marginRight: 15 }}
                        >
                            <MaterialCommunityIcons 
                                name="bell-outline" 
                                size={24} 
                                color={theme.colors.primary} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={changeTheme}
                            style={{ marginRight: 15 }}
                        >
                            <MaterialCommunityIcons 
                                name="theme-light-dark" 
                                size={24} 
                                color={theme.colors.primary} 
                            />
                        </TouchableOpacity>
                    </View>
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="CreateActivity" component={CreateActivity} />
            <Tab.Screen name="ChatList" component={ChatListScreen} />
            <Tab.Screen name="Details" component={DetailsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Header'da logo göstermek için
function LogoTitle() {
    const navigation = useNavigation();
    return (
        <Button
            onPress={() => { while (navigation.canGoBack()) navigation.goBack(); }}
            style={{
                backgroundColor: 'transparent',
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <Image
                style={{
                    width: 65,
                    height: 65,
                    resizeMode: 'contain',
                    marginLeft: 5
                }}
                source={require('../assets/logo.png')}
                defaultSource={require('../assets/logo.png')}
            />
        </Button>
    );
}

// Tab ve header stilleri
const customBack = "rgba(11,16,20,255)"
const screenOptions = {
    tabBarStyle: { backgroundColor: customBack },
    headerStyle: {
        backgroundColor: customBack,
    },
    headerTintColor: "white",
    headerTitle: "MeetApp",
    headerTitleStyle: {
        fontWeight: 'bold',
    },
    tabBarActiveTintColor: "white",
    tabBarActiveBackgroundColor: customBack,
    tabBarInactiveBackgroundColor: customBack,
}
