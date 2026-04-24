import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Platform, StatusBar,
} from 'react-native';

// Logo local asset
const logo = require('../assets/images/new-logo1.jpg');

const tickerData = [
  'સરળ પ્રશ્ન..એક ચોક્કસ જવાબ ... બંધારણ દ્વારા ..!',
  'ಸರಳ ಪ್ರಶ್ನೆ..ಒಂದು ನಿಖರವಾದ ಉತ್ತರ ... ಸಂವಿಧಾನದ ಪ್ರಕಾರ ..!',
  'সরল প্রশ্ন..এই সুনির্দিষ্ট উত্তর ... সংবিধান অনুসারে ..!',
  'خوچک प्रश्न..अचूक उत्तर..संविधान द्वारे..!',
  'Simple question..a precise answer ...By constitution..!',
  'सरल सवाल..सटीक जवाब ... संविधान द्वारा ..!',
];

export default function AppHeader({ navigation, compact = false }) {
  const [dateTime, setDateTime] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const topInsetStyle = Platform.OS === 'android'
    ? { paddingTop: (StatusBar.currentHeight || 0) + (compact ? 6 : 10) }
    : null;

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      const time = now.toLocaleTimeString('en-IN');
      setDateTime(`${date}  ${time}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerData.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <View>
      {/* ── Top Bar ── */}
      <View style={[s.topBar, compact && s.topBarCompact, topInsetStyle]}>
        <View style={[s.timeBox, compact && s.timeBoxCompact]}>
          <Text style={s.clockIcon}>🕐</Text>
          <Text style={s.timeText} numberOfLines={1}>{dateTime}</Text>
        </View>
        <TouchableOpacity
          style={[s.signupBtn, compact && s.signupBtnCompact]}
          onPress={() => navigation?.navigate('Login')}
        >
          <Text style={s.signupIcon}>👤</Text>
          <Text style={s.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* ── Logo Section ── */}
      <View style={[s.logoSection, compact && s.logoSectionCompact]}>
        <Image source={logo} style={[s.logo, compact && s.logoCompact]} resizeMode="contain" />
        {/* Ticker inside logo section */}
        <View style={[s.tickerBox, compact && s.tickerBoxCompact]}>
          <Text style={[s.tickerText, compact && s.tickerTextCompact]} numberOfLines={1}>
            {tickerData[tickerIndex]}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Top Bar
  topBar: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topBarCompact: {
    paddingVertical: 8,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  timeBoxCompact: { paddingVertical: 4 },
  clockIcon: { fontSize: 14 },
  timeText: { color: '#fff', fontSize: 11, fontWeight: '600', flex: 1 },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  signupBtnCompact: { paddingVertical: 6, paddingHorizontal: 12 },
  signupIcon: { fontSize: 12 },
  signupText: { color: '#ea580c', fontSize: 13, fontWeight: '700' },

  // Logo
  logoSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSectionCompact: { paddingVertical: 8 },
  logo: { width: '100%', height: 200 },
  logoCompact: { height: 84 },
  tickerBox: {
    marginTop: 6,
    paddingHorizontal: 20,
  },
  tickerBoxCompact: { marginTop: 4, paddingHorizontal: 14 },
  tickerText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tickerTextCompact: { fontSize: 11 },
});
