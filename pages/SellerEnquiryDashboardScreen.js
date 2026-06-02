import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { UserStore } from '../store/UserStore';

const money = (val) => {
  if (!val) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const notify = (title, msg) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
};

const getBuyerName = (person = {}) => (
  person.name || person.buyer_name || [person.buyer_first_name, person.buyer_last_name].filter(Boolean).join(' ') || 'Unknown'
);
const getBuyerEmail = (person = {}) => (
  person.email || person.buyer_contact_email || person.buyer_email || 'No email'
);
const getBuyerContact = (person = {}) => person.contact || person.buyer_mobile || person.mobile || '';
const getEnquiryQuantity = (person = {}) => (
  person.quantity || person.requested_quantity || person.product_quantity || 'N/A'
);
const getEnquiryDate = (person = {}) => person.date || person.created_at || person.createdAt || 'N/A';

const DetailContactCard = ({ person, product, onCall, onWhatsApp }) => {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View>
          <Text style={styles.contactName}>{getBuyerName(person)}</Text>
          <Text style={styles.contactEmail}>{getBuyerEmail(person)}</Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="layers-outline" size={14} color="#0369a1" />
          <Text style={styles.infoLabel}>Quantity:</Text>
          <Text style={styles.infoValue}>{getEnquiryQuantity(person)}</Text>
        </View>
        {person.message && (
          <View style={styles.infoRow}>
            <Ionicons name="chatbubble-outline" size={14} color="#0369a1" />
            <Text style={styles.infoLabel}>Message:</Text>
            <Text style={[styles.infoValue, { flex: 1 }]}>{person.message}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#0369a1" />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{getEnquiryDate(person)}</Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => onCall(getBuyerContact(person), person)}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={() => onWhatsApp(getBuyerContact(person), person, product)}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SellerEnquiryDashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) {
        notify('Not Logged In', 'Please login to view enquiries.');
        setLoading(false);
        return;
      }

      const summary = await UserStore.getEcomeMarketplaceSummary();
      if (!summary) {
        setLoading(false);
        return;
      }

      const userEmail = String(currentUser.email || '').trim().toLowerCase();
      const userListings = (Array.isArray(summary.listings) ? summary.listings : [])
        .filter((item) => String(item.createdBy || '').trim().toLowerCase() === userEmail);

      const enquiries = Array.isArray(summary.enquiries) ? summary.enquiries : [];
      
      const listingsWithEnquiries = userListings.map((listing) => ({
        ...listing,
        enquiries: enquiries.filter((eq) => String(eq.product_id) === String(listing.id)),
      }));

      setListings(listingsWithEnquiries);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCall = (contact, person) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) {
      notify('No Contact', 'No phone number available.');
      return;
    }
    if (Platform.OS === 'web') {
      window.open(`tel:+91${phone}`);
    } else {
      Linking.openURL(`tel:+91${phone}`);
    }
  };

  const handleWhatsApp = (contact, person, product) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) {
      notify('No Contact', 'No phone number available.');
      return;
    }
    const msg = encodeURIComponent(
      `Hi, I am interested in your enquiry for: ${product.title}\nProduct: ${product.title}\nPrice: ${money(product.price)}`
    );
    const url = `https://wa.me/91${phone}?text=${msg}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading enquiries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Enquiries Received</Text>
          <Text style={styles.headerSub}>{listings.length} product(s)</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadData}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 32 }}
      >
        {listings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="inbox-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No enquiries yet</Text>
            <Text style={styles.emptySubText}>Your received enquiries will appear here</Text>
          </View>
        ) : (
          listings.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <TouchableOpacity
                style={styles.productHeader}
                onPress={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                  <View style={styles.productMeta}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="chatbubble-outline" size={12} color="#0369a1" />
                      <Text style={styles.metaText}>{product.enquiries?.length || 0} enquiries</Text>
                    </View>
                    <Text style={styles.productPrice}>{money(product.price)}</Text>
                  </View>
                </View>
                <Ionicons
                  name={expandedProduct === product.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>

              {expandedProduct === product.id && (
                <View style={styles.expandedContent}>
                  {product.enquiries && product.enquiries.length > 0 ? (
                    <ScrollView scrollEnabled={false}>
                      {product.enquiries.map((enquiry, idx) => (
                        <DetailContactCard
                          key={idx}
                          person={enquiry}
                          product={product}
                          onCall={handleCall}
                          onWhatsApp={handleWhatsApp}
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noEnquiriesBox}>
                      <Text style={styles.noEnquiriesText}>No enquiries for this product</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  noEnquiriesBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noEnquiriesText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  contactCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0369a1',
  },
  contactHeader: {
    marginBottom: 10,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  contactEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  contactInfo: {
    marginBottom: 10,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    minWidth: 70,
  },
  infoValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0369a1',
    borderRadius: 8,
    paddingVertical: 8,
  },
  callBtnText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 8,
  },
  whatsappBtnText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
});
