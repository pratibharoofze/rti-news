import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const IS_WEB = Platform.OS === 'web';

const MENU_ITEMS = [
  ...(IS_WEB ? [{ label: 'Home', icon: 'home-outline', screen: 'Home' }] : []),
  { label: 'Profile',            icon: 'person-outline',        screen: 'Profile' },
  { label: 'My Network',         icon: 'people-outline',        screen: 'My Network' },
  { label: 'Wallet',             icon: 'wallet-outline',        screen: 'Wallet' },
  { label: 'Withdraw',           icon: 'cash-outline',          screen: 'Withdraw' },
  { label: 'Subscription Plans', icon: 'star-outline',          screen: 'SubscriptionPlans' },
  // { label: 'News Feed',          icon: 'newspaper-outline',     screen: 'Feed' },
   { label: 'e-Paper', icon: 'document-text-outline', screen: 'e-Paper' },
  { label: 'Live Streaming', icon: 'radio-outline', screen: 'Live Streaming' }, 
  { label: 'Certification',      icon: 'ribbon-outline',        screen: 'Certification' },
  { label: 'Notifications',      icon: 'notifications-outline', screen: 'Notifications' },
  // { label: 'Settings',           icon: 'settings-outline',      screen: 'Settings' },
  // { label: 'Logout',             icon: 'log-out-outline',       screen: '__logout__', isDestructive: true },
];

export default function QuickMenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const handlePress = async (item) => {
    if (item.screen === '__logout__') {
      await logout?.();
      navigation.navigate('Home');
      return;
    }
    navigation.navigate(item.screen);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Quick Menu</Text>
          <Text style={styles.headerSubtitle}>Access all features quickly</Text>
        </View>
      </View>

      {/* ── List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.listItem,
              index === MENU_ITEMS.length - 1 && styles.listItemLast,
            ]}
            onPress={() => handlePress(item)}
            activeOpacity={0.6}
          >
            {/* Icon */}
            <View style={[
              styles.iconWrap,
              item.isDestructive && styles.iconWrapDestructive,
            ]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.isDestructive ? '#ef4444' : '#f97316'}
              />
            </View>

            {/* Label */}
            <Text style={[
              styles.label,
              item.isDestructive && styles.labelDestructive,
            ]}>
              {item.label}
            </Text>

            {/* Arrow */}
            {!item.isDestructive && (
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff8f3',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff8f3',
    borderBottomWidth: 1,
    borderBottomColor: '#f1e5d3',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },

  // ── List ──
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e5d3',
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fde8d0',
  },
  iconWrapDestructive: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  labelDestructive: {
    color: '#ef4444',
  },
});