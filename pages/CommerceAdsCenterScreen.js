import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  if (typeof alert !== 'undefined') {
    alert(`${title}\n${message}`);
  }
};

const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const ActionButton = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function CommerceAdsCenterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    myListings: 0,
    receivedEnquiries: 0,
    sentEnquiries: 0,
    credits: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await UserStore.getCurrentUser();
      setUser(currentUser || null);

      const summary = await UserStore.getEcomeMarketplaceSummary();
      const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
      const listings = Array.isArray(summary?.listings) ? summary.listings : [];
      const enquiries = Array.isArray(summary?.enquiries) ? summary.enquiries : [];

      const myListings = listings.filter(
        (item) => String(item.createdBy || '').trim().toLowerCase() === currentEmail
      ).length;

      const receivedEnquiries = enquiries.filter((enquiry) => {
        return listings.some(
          (listing) =>
            String(listing.id) === String(enquiry.product_id) &&
            String(listing.createdBy || '').trim().toLowerCase() === currentEmail
        );
      }).length;

      const sentEnquiries = enquiries.filter(
        (enquiry) =>
          String(enquiry.buyer_email || '').trim().toLowerCase() === currentEmail
      ).length;

      setStats({
        myListings,
        receivedEnquiries,
        sentEnquiries,
        credits: summary?.credits || 0,
      });
    } catch (error) {
      console.error('Commerce hub load error:', error);
      notify('Load failed', 'Unable to load commerce dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Commerce Hub</Text>
          <Text style={styles.headerSub}>Manage listings and enquiries</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="storefront" size={30} color="#16a34a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name || 'Seller'}</Text>
            <Text style={styles.welcomeSub}>Your subscription marketplace dashboard</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="layers"
            label="My Listings"
            value={stats.myListings}
            color="#3b82f6"
            onPress={() => navigation.navigate('MyListings')}
          />
          <StatCard
            icon="chatbubble-ellipses"
            label="Received Enquiries"
            value={stats.receivedEnquiries}
            color="#f59e0b"
            onPress={() => navigation.navigate('SellerEnquiryDashboard')}
          />
          <StatCard
            icon="send"
            label="Sent Enquiries"
            value={stats.sentEnquiries}
            color="#10b981"
            onPress={() => navigation.navigate('MyEnquiries')}
          />
          <StatCard
            icon="cash"
            label="Credits"
            value={stats.credits}
            color="#8b5cf6"
            onPress={() => navigation.navigate('Sell')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <ActionButton
              icon="add-circle-outline"
              label="Create Listing"
              color="#16a34a"
              onPress={() => navigation.navigate('Sell')}
            />
            <ActionButton
              icon="list-outline"
              label="Browse Products"
              color="#3b82f6"
              onPress={() => navigation.navigate('FarmingBuy')}
            />
            <ActionButton
              icon="chatbubble-outline"
              label="My Enquiries"
              color="#10b981"
              onPress={() => navigation.navigate('MyEnquiries')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  welcomeSub: {
    fontSize: 12,
    color: '#295e20',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexBasis: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
});
