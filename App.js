import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from './components/ui/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { isMobileWebDevice } from './utils/webDevice';


SplashScreen.preventAutoHideAsync().catch(() => {});

const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Text strings must be rendered')) {
    console.log('\n🔴🔴🔴 TEXT ERROR CAUGHT! 🔴🔴🔴');
    console.log('ARG1:', args[1]);
    console.log('ARG2:', args[2]);
    console.log('ARG3:', JSON.stringify(args[3]));
  }
  originalConsoleError(...args);
};
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
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
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyHeight = document.body.style.height;

    try {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.width = '100%';

      if (isMobileWebDevice()) {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
      } else {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
      }
    } catch {}
    return () => {
      try {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.width = originalBodyWidth;
        document.documentElement.style.height = originalHtmlHeight;
        document.body.style.height = originalBodyHeight;
      } catch {}
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <ErrorBoundary>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
  );
}
