import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';

const navLinks = [
  { label: 'HOME',           screen: 'Home' },
  { label: 'ABOUT US',       screen: 'About' },
  { label: 'WHAT IS RTI?',   screen: 'WhatIsRTI' },
  { label: 'IMPORTANT LAWS', screen: 'ImportantLaws' },
  { label: 'CONTACT US',     screen: 'Contact' },
];

export default function AppNavbar({ navigation, activeScreen }) {
  return (
    <View>
      {/* ── Nav Bar ── */}
      <View style={s.navbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.navScroll}
        >
          {navLinks.map((item) => {
            const isActive = activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={item.label}
                style={s.navItem}
                onPress={() => navigation?.navigate(item.screen)}
              >
                <Text style={[s.navText, isActive && s.navTextActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={s.underline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Ticker / Marquee ── */}
      <View style={s.tickerRow}>
        <View style={s.tickerLabel}>
          <Text style={s.tickerLabelText}>📢 आवाहन</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        >
          <Text style={s.tickerContent}>
            📢 आमच्या "सभासद व्हा" पर्यायाला भेट द्या आणि नोंदणीकृत रिपोर्टर बना
            {'  •  '}आजच जॉइन करा{'  •  '}नवीन अपडेट्स मिळवा!
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Navbar
  navbar: {
    backgroundColor: '#f97316',
  },
  navScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  navTextActive: {
    fontWeight: '800',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // Ticker
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tickerLabel: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  tickerLabelText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  tickerContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
});