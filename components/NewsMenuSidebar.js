import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIDEBAR_MENU_ITEMS } from '../constants/homeData';
import { getMenuLabel } from '../utils/storyHelpers';

export default function NewsMenuSidebar({ activeMenuKey, onSelectMenu, isCompactLayout, commonCopy }) {
  // चुनें कि कितने कॉलम चाहिए (मोबाइल पर 3)
  const numColumns = isCompactLayout ? 3 : 1;

  return (
    <View style={[styles.sidebarShell, isCompactLayout && styles.sidebarShellCompact]}>
      <FlatList
        data={SIDEBAR_MENU_ITEMS}
        key={numColumns} // key change से grid/vertical refresh होगा
        numColumns={numColumns}
        scrollEnabled={!isCompactLayout} // मोबाइल पर स्क्रॉल ऑफ (खुद adjust होगा)
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.menuContainer,
          isCompactLayout && styles.menuContainerCompact,
        ]}
        columnWrapperStyle={isCompactLayout && styles.gridRow}
        renderItem={({ item: menuItem }) => {
          const isActive = activeMenuKey === menuItem.key;
          return (
            <TouchableOpacity
              style={[
                styles.sidebarMenuButton,
                isCompactLayout && styles.compactMenuButton,
                {
                  borderColor: menuItem.accentColor,
                  backgroundColor: isActive ? menuItem.surfaceColor : '#ffffff',
                },
                isActive && styles.sidebarMenuButtonActive,
              ]}
              onPress={() => onSelectMenu(menuItem.key)}
              activeOpacity={0.86}
            >
              <View style={[styles.sidebarMenuIconWrap, { backgroundColor: `${menuItem.accentColor}18` }]}>
                <Ionicons name={menuItem.icon} size={isCompactLayout ? 18 : 15} color={menuItem.accentColor} />
              </View>
              <Text style={[styles.sidebarMenuLabel, { color: menuItem.accentColor }, isCompactLayout && styles.compactMenuLabel]}>
                {getMenuLabel(menuItem, commonCopy)}
              </Text>
              {!isCompactLayout && <Ionicons name="chevron-forward-outline" size={13} color={menuItem.accentColor} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarShell: {
    width: 252,
    borderRadius: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderTopWidth: 0,
    padding: 14,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        elevation: 4,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
    }),
  },
  sidebarShellCompact: {
    width: '100%',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  menuContainer: {
    gap: 10,
  },
  menuContainerCompact: {
    gap: 12,
    paddingHorizontal: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  sidebarMenuButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1, // Grid में बराबर जगह लेने के लिए
  },
  compactMenuButton: {
    flexDirection: 'column', // मोबाइल पर column में आइकन ऊपर, text नीचे
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 12,
    gap: 6,
    minWidth: 0, // flex shrink
  },
  sidebarMenuButtonActive: {
    transform: [{ translateX: 2 }],
  },
  sidebarMenuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarMenuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  compactMenuLabel: {
    flex: 0,
    fontSize: 11,
    textAlign: 'center',
  },
});