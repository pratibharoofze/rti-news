import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Platform, StatusBar, Dimensions, Image
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function AppHeader({ navigation, compact = false }) {

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN');
  };

  const androidPad = Platform.OS === 'android'
    ? { paddingTop: StatusBar.currentHeight || 0 }
    : null;

  return (
    <View style={[s.root, androidPad]}>

      {IS_MOBILE ? (
        <View style={s.mobileBar}>

          {/* LEFT: LOGO */}
          <Image
            source={require('../assets/images/certificate_logo.jpg')}
            style={s.logoTop}
            resizeMode="contain"
          />

          {/* CENTER: TEXT */}
          <Text style={s.centerTitle}>
            भारतीय माहिती अधिकार
          </Text>

          {/* RIGHT: SIGNUP */}
          <TouchableOpacity
            style={s.signupBtn}
            onPress={() => navigation?.navigate('Login')}
          >
            <Text style={s.signupIcon}>👤</Text>
            <Text style={s.signupText}>Sign Up</Text>
          </TouchableOpacity>

        </View>

      ) : (
        <>
          <View style={s.utilityBar}>

            {/* LEFT: LOGO */}
            <Image
              source={require('../assets/images/certificate_logo.jpg')}
              style={s.logoTop}
              resizeMode="contain"
            />

            {/* CENTER: TEXT */}
            <Text style={s.centerTitle}>
              भारतीय माहिती अधिकार
            </Text>

            {/* RIGHT: SIGNUP */}
            <TouchableOpacity
              style={s.signupBtn}
              onPress={() => navigation?.navigate('Login')}
            >
              <Text style={s.signupIcon}>👤</Text>
              <Text style={s.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* 🔥 BRAND BAR (LEFT DATE • RIGHT TIME) */}
          <View style={[s.brandBar, compact && s.brandBarCompact]}>

            {/* LEFT: DATE */}
            <Text style={s.tickerText}>
              📅 {formatDate(time)}
            </Text>

            {/* RIGHT: TIME */}
            <Text style={s.tickerText}>
              ⏰ {formatTime(time)}
            </Text>

          </View>
        </>
      )}

      <View style={s.bottomBar} />

    </View>
  );
}

const s = StyleSheet.create({

  root: {
    backgroundColor: '#fff',
    elevation: 6,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.10)' },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
      },
      default: {},
    }),
  },

  mobileBar: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249,115,22,0.15)',
  },

  utilityBar: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249,115,22,0.15)',
  },

  // LEFT LOGO
  logoTop: {
    position: 'absolute',
    left: 12,
    width: 85,
    height: 85,
  },

  // CENTER TEXT
  centerTitle: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: '900',
    color: '#f97316',
  },

  // RIGHT SIGNUP
  signupBtn: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },

  signupIcon: { fontSize: 12 },

  signupText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  // 🔥 BRAND BAR
  brandBar: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  tickerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomBar: {
    height: 4,
    backgroundColor: 'white',
  },
});
