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
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const activeElement = document.activeElement;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

// ✅ KEY FIX: mobile web detection
// Web pe window.innerWidth se check karo
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start(() => setSidebarOpen(false));
  };

  const handleNav = (screen) => {
    blurActiveElement();
    if (sidebarOpen) closeSidebar();
    if (navigation && navigation.navigate) {
      navigation.navigate(screen);
    }
  };

  // ── CASE 1: Native Android/iOS  OR  Mobile Web (phone me link khola)
  // → Bottom Tab Bar dikhao
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

  // ── CASE 2: Desktop Web → Top Navbar + Sidebar
  return (
    <>
      <View style={s.navbar}>
        <TouchableOpacity onPress={openSidebar} style={s.hamburger}>
          <View style={s.hamLine} />
          <View style={[s.hamLine, { width: 16 }]} />
          <View style={s.hamLine} />
        </TouchableOpacity>
        <Text style={s.title}>RTI Portal</Text>
      </View>

      {sidebarOpen && (
        <View style={s.sidebarContainer}>
          <Pressable onPress={closeSidebar}>
            <Animated.View style={[s.overlay, { opacity: overlayAnim }]} />
          </Pressable>

          <Animated.View style={[s.sidebar, { transform: [{ translateX: slideAnim }] }]}>
            <View style={s.sidebarHeader}>
              <Text style={s.sidebarHeaderTitle}>Menu</Text>
              <TouchableOpacity onPress={closeSidebar} style={s.closeBtn}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {navLinks.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[s.sidebarLink, isActive && s.sidebarLinkActive]}
                  onPress={() => handleNav(item.screen)}
                >
                  <Text style={[s.linkText, isActive && s.linkTextActive]}>
                    {item.icon}  {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  // ── Mobile / Mobile-Web Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    elevation: 20,
    // ✅ Web pe fixed bottom me rahega
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
    padding: 12,
    zIndex: 10,
  },
  hamburger: { marginRight: 10, padding: 4 },
  hamLine: { width: 22, height: 2.5, backgroundColor: '#fff', marginVertical: 2, borderRadius: 2 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // ── Sidebar
  sidebarContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 30,
  },
  sidebarHeader: {
    padding: 20,
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarHeaderTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  closeBtn: { padding: 4 },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sidebarLink: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sidebarLinkActive: { backgroundColor: '#fff7ed' },
  linkText: { fontSize: 14, color: '#374151' },
  linkTextActive: { color: '#f97316', fontWeight: '700' },
});
