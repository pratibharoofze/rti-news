import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserStore } from '../store/UserStore';

const notify = (title, message) => {
  if (Platform.OS === 'web' && typeof alert !== 'undefined') {
    alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
};

const money = (value) => {
  const raw = String(value || '').replace(/[^\d.]/g, '');
  if (!raw) return 'Price N/A';
  return `Rs. ${Number(raw).toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN');
};

const ListingCard = ({ item }) => (
  <View style={styles.listingCard}>
    <View style={styles.listingTop}>
      <View style={styles.listingIcon}>
        <Ionicons name="cube-outline" size={22} color="#2563eb" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title || 'Untitled Listing'}
        </Text>
        <Text style={styles.listingMeta} numberOfLines={1}>
          {[item.sector, item.city || 'Location N/A'].filter(Boolean).join(' | ')}
        </Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{item.status || 'active'}</Text>
      </View>
    </View>

    {item.description ? (
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
    ) : null}

    <View style={styles.detailRow}>
      <View style={styles.detailChip}>
        <Ionicons name="cash-outline" size={14} color="#16a34a" />
        <Text style={styles.detailText}>{money(item.price)}</Text>
      </View>
      <View style={styles.detailChip}>
        <Ionicons name="layers-outline" size={14} color="#64748b" />
        <Text style={styles.detailText}>Qty: {item.quantity || 'N/A'}</Text>
      </View>
      {formatDate(item.createdAt) ? (
        <View style={styles.detailChip}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
        </View>
      ) : null}
    </View>
  </View>
);

export default function MyListingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser?.email) {
        setListings([]);
        notify('Login required', 'Please login to view your listings.');
        return;
      }

      const summary = await UserStore.getEcomeMarketplaceSummary();
      const currentEmail = String(currentUser.email || '').trim().toLowerCase();
      const myListings = (Array.isArray(summary?.listings) ? summary.listings : [])
        .filter((item) => String(item.createdBy || item.owner_email || '').trim().toLowerCase() === currentEmail);
      setListings(myListings);
    } catch (error) {
      console.error('My listings load error:', error);
      notify('Load failed', 'Unable to load your listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Listings</Text>
          <Text style={styles.headerSub}>{listings.length} product listing{listings.length === 1 ? '' : 's'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Sell')} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 28 }]}
        >
          {listings.length > 0 ? (
            listings.map((item) => <ListingCard key={String(item.id)} item={item} />)
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="layers-outline" size={38} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Create your first product listing from Sell screen.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Sell')} activeOpacity={0.85}>
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Create Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  container: { padding: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: '#64748b', fontSize: 13 },
  listingCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  listingTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  listingTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  listingMeta: { fontSize: 11, color: '#64748b', marginTop: 3 },
  statusPill: {
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { color: '#15803d', fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
  description: { fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 12 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  detailText: { fontSize: 11, color: '#334155', fontWeight: '700' },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 22,
    paddingVertical: 42,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 5, marginBottom: 18 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
