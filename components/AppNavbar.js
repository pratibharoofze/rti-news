import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
  Platform, Pressable,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;
const IS_WEB = Platform.OS === 'web';
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function blurActiveElement() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const activeElement = document.activeElement;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

const IS_WEB_MOBILE = IS_WEB && (
  typeof window !== 'undefined' ? window.innerWidth < 768 : SCREEN_WIDTH < 768
);

const navLinks = [
  { label: 'HOME',           screen: 'Home',          icon: '🏠' },
  { label: 'ABOUT US',       screen: 'About',         icon: 'ℹ️' },
  { label: 'FEED',           screen: 'Feed',          icon: '📰' },
  { label: 'WHAT IS RTI?',   screen: 'WhatIsRTI',     icon: '📋' },
  { label: 'IMPORTANT LAWS', screen: 'ImportantLaws', icon: '⚖️' },
  { label: 'CONTACT US',     screen: 'Contact',       icon: '📞' },
];

const mobileLabels = {
  Home:          'Home',
  About:         'About',
  WhatIsRTI:     'RTI?',
  ImportantLaws: 'Laws',
  Feed:          'Feed',
  Contact:       'Contact',
};

export default function AppNavbar({ activeScreen, navigation }) {
  const handleNav = (screen) => {
    blurActiveElement();
    if (navigation && navigation.navigate) {
      navigation.navigate(screen);
    }
  };

  // ── CASE 1: Native Android/iOS OR Mobile Web
  if (!IS_WEB || IS_WEB_MOBILE) {
    return (
      <View style={s.bottomBar}>
        {navLinks.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={s.tabItem}
              onPress={() => handleNav(item.screen)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <View style={[s.activeTopLine, isActive && s.activeTopLineVisible]} />
              <View style={[s.iconWrap, isActive && s.iconWrapActive]}>
                <Text style={s.tabIcon}>{item.icon}</Text>
              </View>
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
                {mobileLabels[item.screen]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ── CASE 2: Desktop Web → Center Navbar Links
  return (
    <View style={s.navbar}>
      {/* Left: Logo/Title */}
      <Text style={s.title}>🇮🇳 RTI Portal</Text>

      {/* Center: Nav Links */}
      <View style={s.navLinks}>
        {navLinks.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={[s.navLink, isActive && s.navLinkActive]}
              onPress={() => handleNav(item.screen)}
            >
              <Text style={[s.navLinkText, isActive && s.navLinkTextActive]}>
                {item.label}
              </Text>
              {isActive && <View style={s.activeUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // ── Mobile Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    elevation: 20,
    ...Platform.select({
      web: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      },
      default: {},
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTopLine: { width: 20, height: 3, borderRadius: 2 },
  activeTopLineVisible: { backgroundColor: 'green' },
  iconWrap: {
    width: 44, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: { backgroundColor: '#dcfce7' },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 9, color: '#94a3b8', marginTop: 2 },
  tabLabelActive: { color: 'green', fontWeight: '600' },

  // ── Desktop Web Navbar
  navbar: {
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 10,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
      default: {},
    }),
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 24,
  },
  navLinks: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  navLinkText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  navLinkTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 4,
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});