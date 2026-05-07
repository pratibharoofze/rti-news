import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIDEBAR_MENU_ITEMS } from '../constants/homeData';
import { getMenuLabel } from '../utils/storyHelpers';

export default function NewsMenuSidebar({ activeMenuKey, onSelectMenu, isCompactLayout, commonCopy }) {
  return (
    <View style={[styles.sidebarShell, isCompactLayout && styles.sidebarShellCompact]}>
      <View style={styles.sidebarMenuStack}>
        {SIDEBAR_MENU_ITEMS.map((menuItem) => {
          const isActive = activeMenuKey === menuItem.key;
          return (
            <TouchableOpacity
              key={menuItem.key}
              style={[
                styles.sidebarMenuButton,
                { borderColor: menuItem.accentColor, backgroundColor: isActive ? menuItem.surfaceColor : '#ffffff' },
                isActive && styles.sidebarMenuButtonActive,
              ]}
              onPress={() => onSelectMenu(menuItem.key)}
              activeOpacity={0.86}
            >
              <View style={[styles.sidebarMenuIconWrap, { backgroundColor: `${menuItem.accentColor}18` }]}>
                <Ionicons name={menuItem.icon} size={15} color={menuItem.accentColor} />
              </View>
              <Text style={[styles.sidebarMenuLabel, { color: menuItem.accentColor }]}>
                {getMenuLabel(menuItem, commonCopy)}
              </Text>
              <Ionicons name="chevron-forward-outline" size={13} color={menuItem.accentColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarShell: {
    width: 252, borderRadius: 0, backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: '#e5e7eb', borderTopWidth: 0, padding: 14,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { elevation: 4, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 18 },
    }),
  },
  sidebarShellCompact: { width: '100%', borderRadius: 24 },
  sidebarMenuStack: { gap: 10 },
  sidebarMenuButton: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  sidebarMenuButtonActive: { transform: [{ translateX: 2 }] },
  sidebarMenuIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sidebarMenuLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
});