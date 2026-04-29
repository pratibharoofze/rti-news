import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, Dimensions, TouchableWithoutFeedback, Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;
const IS_MOBILE = SCREEN_WIDTH < 768;

const navLinks = [
  { label: 'HOME',           screen: 'Home',          icon: '🏠' },
  { label: 'ABOUT US',       screen: 'About',         icon: 'ℹ️'  },
  { label: 'WHAT IS RTI?',   screen: 'WhatIsRTI',     icon: '📋' },
  { label: 'IMPORTANT LAWS', screen: 'ImportantLaws', icon: '⚖️' },
  { label: 'CONTACT US',     screen: 'Contact',       icon: '📞' },
];

export default function AppNavbar({ navigation, activeScreen }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  };

  const handleNav = (screen) => {
    if (IS_MOBILE) closeSidebar();
    setTimeout(() => navigation?.navigate(screen), IS_MOBILE ? 260 : 0);
  };

  return (
    <>
      {/* ── Nav Bar ── */}
      <View style={s.navbar}>

        {IS_MOBILE ? (
          <TouchableOpacity onPress={openSidebar} style={s.hamburger} activeOpacity={0.7}>
            <View style={s.hamLine} />
            <View style={[s.hamLine, { width: 16 }]} />
            <View style={s.hamLine} />
          </TouchableOpacity>
        ) : (
          <View style={s.navCenter}>
            {navLinks.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[s.navBtn, isActive && s.navBtnActive]}
                  onPress={() => handleNav(item.screen)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.navText, isActive && s.navTextActive]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={s.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </View>

      {/* ── Mobile Sidebar ── */}
      {IS_MOBILE && sidebarOpen && (
        <View style={s.sidebarContainer} pointerEvents="box-none">

          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[s.overlay, { opacity: overlayAnim }]} />
          </TouchableWithoutFeedback>

          <Animated.View style={[s.sidebar, { transform: [{ translateX: slideAnim }] }]}>

            <View style={s.sidebarHeader}>
              <Text style={s.sidebarHeaderSub}>Navigation</Text>
              <Text style={s.sidebarHeaderTitle}>RTI Portal Menu</Text>
            </View>

            {navLinks.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[s.sidebarLink, isActive && s.sidebarLinkActive]}
                  onPress={() => handleNav(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={[s.linkIconBox, isActive && s.linkIconBoxActive]}>
                    <Text style={s.linkIconText}>{item.icon}</Text>
                  </View>
                  <Text style={[s.linkLabel, isActive && s.linkLabelActive]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={s.sidebarActivePip} />}
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

  // ── Navbar ──
  navbar: {
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: IS_MOBILE ? 10 : 8,
  },

  // ── Hamburger ──
  hamburger: {
    gap: 5,
    padding: 6,
  },
  hamLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // ── Desktop Nav Buttons ──
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.40)',
    backgroundColor: 'transparent',
  },

  navBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    elevation: 5,
    ...Platform.select({
      web: { boxShadow: '0px 3px 8px rgba(124,45,18,0.28)' },
      ios: {
        shadowColor: '#7c2d12',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      default: {},
    }),
  },

  navIcon: {
    fontSize: 14,
  },

  navText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  navTextActive: {
    color: 'green',
    fontWeight: '900',
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ea580c',
  },

  // ── Sidebar ──
  sidebarContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    elevation: 14,
    ...Platform.select({
      web: { boxShadow: '4px 0px 12px rgba(0,0,0,0.18)' },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      default: {},
    }),
  },
  sidebarHeader: {
    backgroundColor: '#f97316',
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderBottomWidth: 4,
    borderBottomColor: '#c2410c',
  },
  sidebarHeaderSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  sidebarHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sidebarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  sidebarLinkActive: {
    backgroundColor: '#fff7ed',
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  linkIconBoxActive: {
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
  },
  linkIconText: { fontSize: 16 },
  linkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.3,
  },
  linkLabelActive: {
    color: '#ea580c',
    fontWeight: '800',
  },
  sidebarActivePip: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#f97316',
  },
});
