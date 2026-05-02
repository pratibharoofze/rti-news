import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from './components/ui/ToastProvider';
import { LanguageProvider } from './contexts/LanguageContext';

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

    const root = document.getElementById('root');
    if (!root) return undefined;

    const applyViewportHeight = () => {
      const height = Math.round(window.visualViewport?.height || window.innerHeight || 0);
      if (height <= 0) return;
      root.style.height = `${height}px`;
      root.style.minHeight = `${height}px`;
      root.style.width = '100%';
    };

    applyViewportHeight();
    window.addEventListener('resize', applyViewportHeight);
    window.visualViewport?.addEventListener('resize', applyViewportHeight);

    return () => {
      window.removeEventListener('resize', applyViewportHeight);
      window.visualViewport?.removeEventListener('resize', applyViewportHeight);
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LanguageProvider>
      <ToastProvider>
        <AppNavigator />
      </ToastProvider>
    </LanguageProvider>
  );
}
