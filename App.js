import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from './components/ui/ToastProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';  // ← AuthProvider import karein

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // public/fonts/ folder se load — web aur native dono pe kaam karta hai
    'Ionicons':               require('./public/fonts/Ionicons.ttf'),
    'MaterialIcons':          require('./public/fonts/MaterialIcons.ttf'),
    'FontAwesome':            require('./public/fonts/FontAwesome.ttf'),
    'FontAwesome5_Regular':   require('./public/fonts/FontAwesome5_Regular.ttf'),
    'FontAwesome5_Solid':     require('./public/fonts/FontAwesome5_Solid.ttf'),
    'FontAwesome5_Brands':    require('./public/fonts/FontAwesome5_Brands.ttf'),
    'MaterialCommunityIcons': require('./public/fonts/MaterialCommunityIcons.ttf'),
    'AntDesign':              require('./public/fonts/AntDesign.ttf'),
    'Feather':                require('./public/fonts/Feather.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    // Height update ab index.html ka script handle karta hai
    try {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } catch {}
    return undefined;
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LanguageProvider>
      <AuthProvider>  {/* ← AuthProvider yahan add karein */}
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}