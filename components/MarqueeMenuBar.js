import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIDEBAR_MENU_ITEMS } from '../constants/homeData';
import { getMenuLabel } from '../utils/storyHelpers';

export default function MarqueeMenuBar({ activeMenuKey, onSelectMenu, commonCopy }) {
  const scrollRef = useRef(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);
  const totalWidthRef = useRef(0);

  const PILL_WIDTH = 110; // approximate pill width + gap
  const ITEMS_COUNT = SIDEBAR_MENU_ITEMS.length;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    totalWidthRef.current = ITEMS_COUNT * PILL_WIDTH;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      positionRef.current += 0.8; // scroll speed
      if (positionRef.current >= totalWidthRef.current) {
        positionRef.current = 0;
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      } else {
        scrollRef.current?.scrollTo({ x: positionRef.current, animated: false });
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const doubledItems = [...SIDEBAR_MENU_ITEMS, ...SIDEBAR_MENU_ITEMS];

  return (
    <View style={styles.wrapper}>
      {/* Left fade */}
      <View style={styles.fadeLeft} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={styles.track}
        onTouchStart={() => { isPausedRef.current = true; }}
        onTouchEnd={() => { isPausedRef.current = false; }}
        onMouseEnter={() => { isPausedRef.current = true; }}   // web hover pause
        onMouseLeave={() => { isPausedRef.current = false; }}  // web hover resume
      >
        {doubledItems.map((menuItem, index) => {
          const isActive = activeMenuKey === menuItem.key;
          return (
            <TouchableOpacity
              key={`${menuItem.key}-${index}`}
              style={[
                styles.pill,
                {
                  borderColor: isActive ? menuItem.accentColor : `${menuItem.accentColor}66`,
                  backgroundColor: isActive ? menuItem.surfaceColor : '#ffffff',
                },
              ]}
              onPress={() => onSelectMenu(menuItem.key)}
              activeOpacity={0.82}
            >
              <View style={[styles.pillIcon, { backgroundColor: `${menuItem.accentColor}18` }]}>
                <Ionicons name={menuItem.icon} size={14} color={menuItem.accentColor} />
              </View>
              <Text style={[styles.pillLabel, { color: menuItem.accentColor }]}>
                {getMenuLabel(menuItem, commonCopy)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right fade */}
      <View style={styles.fadeRight} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f7',
    paddingVertical: 8,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 8,
  },
  pillIcon: {
    width: 24, height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 28,
    zIndex: 2,
    ...Platform.select({
      web: { background: 'linear-gradient(to right, #ffffff, transparent)' },
    }),
  },
  fadeRight: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 28,
    zIndex: 2,
    ...Platform.select({
      web: { background: 'linear-gradient(to left, #ffffff, transparent)' },
    }),
  },
});