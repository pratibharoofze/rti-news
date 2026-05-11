import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import WhatIsRTIScreen from '../screens/WhatIsRTIScreen';
import ImportantLawsScreen from '../screens/ImportantLawsScreen';
import NewsDetailsScreen from '../screens/NewsDetailsScreen';
import FeedScreen from '../screens/FeedScreen';
import LoginScreen from '../auth/LoginScreen';
import RegisterScreen from '../auth/RegisterScreen';
import StateSelectScreen from '../auth/StateSelectScreen';
import DistrictSelectScreen from '../auth/DistrictSelectScreen';
import TalukaSelectScreen from '../auth/TalukaSelectScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';
import OtpScreen from '../auth/OtpScreen';
import ResetPasswordScreen from '../auth/ResetPasswordScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ProfileScreen from '../pages/ProfileScreen';
import MyNetworkScreen from '../pages/MyNetworkScreen';
import WalletScreen from '../pages/WalletScreen';
import WithdrawScreen from '../pages/WithdrawScreen';
import SubscriptionPlansScreen from '../pages/SubscriptionPlansScreen';
import NewsFeedScreen from '../pages/NewsFeedScreen';
import AddNewsScreen from '../pages/Addnewsscreen';
import EPaperScreen from '../pages/EPaperScreen';
import LiveStreamingScreen from '../pages/LiveStreamingScreen';
import LiveBroadcastScreen from '../pages/LiveBroadcastScreen';
import CertificationScreen from '../pages/CertificationScreen';
import NotificationsScreen from '../pages/NotificationsScreen';
import SettingsScreen from '../pages/SettingsScreen';
import ViewMemberScreen from '../pages/ViewMemberScreen';
import EditMemberScreen from '../pages/EditMemberScreen';
import PaymentScreen from '../pages/PaymentScreen';
import AttemptQuizScreen from '../pages/AttemptQuizScreen';
import QuizResultScreen from '../pages/QuizResultScreen';
import CertificatePreviewScreen from '../pages/CertificatePreviewScreen';
import UserPublicProfileScreen from '../pages/UserPublicProfileScreen';

const Stack = createNativeStackNavigator();
const NAVIGATION_STATE_KEY = 'rti-news-navigation-state';

async function readPersistedNavigationState() {
  try {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(NAVIGATION_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    }

    const raw = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function persistNavigationState(state) {
  try {
    const serialized = JSON.stringify(state);

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(NAVIGATION_STATE_KEY, serialized);
      return;
    }

    await AsyncStorage.setItem(NAVIGATION_STATE_KEY, serialized);
  } catch {
    // Ignore persistence failures so navigation keeps working.
  }
}

export default function AppNavigator() {
  const [initialState, setInitialState] = useState();
  const [isNavStateReady, setIsNavStateReady] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const savedState = await readPersistedNavigationState();
      if (!alive) return;
      if (savedState) {
        setInitialState(savedState);
      }
      setIsNavStateReady(true);
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!isNavStateReady) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={persistNavigationState}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        {/* ── Public / Landing ── */}
        <Stack.Screen name="Home"          component={HomeScreen} />
        <Stack.Screen name="About"         component={AboutScreen} />
        <Stack.Screen name="Contact"       component={ContactScreen} />
        <Stack.Screen name="WhatIsRTI"     component={WhatIsRTIScreen} />
        <Stack.Screen name="ImportantLaws" component={ImportantLawsScreen} />
        <Stack.Screen name="NewsDetails"   component={NewsDetailsScreen} />
        <Stack.Screen name="Feed"          component={FeedScreen} />

        {/* ── Auth ── */}
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="Register"       component={RegisterScreen} />
        <Stack.Screen name="StateSelect"    component={StateSelectScreen} />
        <Stack.Screen name="DistrictSelect" component={DistrictSelectScreen} />
        <Stack.Screen name="TalukaSelect"   component={TalukaSelectScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Otp"            component={OtpScreen} />
        <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />

        {/* ── App Screens ── */}
        <Stack.Screen name="Dashboard"          component={DashboardScreen} />
        <Stack.Screen name="Profile"            component={ProfileScreen} />
        <Stack.Screen name="My Network"         component={MyNetworkScreen} />
        <Stack.Screen name="Wallet"             component={WalletScreen} />
        <Stack.Screen name="Withdraw"           component={WithdrawScreen} />
        <Stack.Screen name="Subscription Plans" component={SubscriptionPlansScreen} />
        <Stack.Screen name="News Feed"          component={NewsFeedScreen} />
        <Stack.Screen name="Add News"           component={AddNewsScreen} />
        <Stack.Screen name="e-Paper"            component={EPaperScreen} />
        <Stack.Screen name="Live Streaming"     component={LiveStreamingScreen} />
        <Stack.Screen name="Start Live"         component={LiveBroadcastScreen} />
        <Stack.Screen name="Certification"      component={CertificationScreen} />
        <Stack.Screen name="Notifications"      component={NotificationsScreen} />
        <Stack.Screen name="Settings"           component={SettingsScreen} />
        <Stack.Screen name="ViewMember"         component={ViewMemberScreen} />
        <Stack.Screen name="EditMember"         component={EditMemberScreen} />
        <Stack.Screen name="UserProfile"        component={UserPublicProfileScreen} />
        <Stack.Screen name="Payment"            component={PaymentScreen} />
        <Stack.Screen name="AttemptQuiz"        component={AttemptQuizScreen} />
        <Stack.Screen name="QuizResult"         component={QuizResultScreen} />
        <Stack.Screen name="CertificatePreview" component={CertificatePreviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
