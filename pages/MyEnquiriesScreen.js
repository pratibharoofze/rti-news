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

const getEnquiryQuantity = (enquiry = {}) => (
  enquiry.quantity || enquiry.requested_quantity || enquiry.product_quantity || 'N/A'
);

const getEnquiryDate = (enquiry = {}) => (
  enquiry.created_at || enquiry.createdAt || enquiry.date || 'Unknown'
);

const getBuyerName = (enquiry = {}) => (
  enquiry.name || enquiry.buyer_name || [enquiry.buyer_first_name, enquiry.buyer_last_name].filter(Boolean).join(' ')
);

const getBuyerEmail = (enquiry = {}) => enquiry.email || enquiry.buyer_contact_email || enquiry.buyer_email;

const getBuyerContact = (enquiry = {}) => enquiry.contact || enquiry.buyer_mobile || '';

const notify = (title, msg) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const EnquiryDetailModal = ({ visible, enquiry, product, onClose, onCall, onWhatsApp }) => {
  if (!enquiry || !product) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Enquiry Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          >
            {/* Product Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product</Text>
              <DetailItem label="Name" value={product.title} />
              <DetailItem label="Price" value={money(product.price)} />
              <DetailItem label="Location" value={product.city} />
            </View>

            {/* Enquiry Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Enquiry</Text>
              <DetailItem label="Name" value={getBuyerName(enquiry)} />
              <DetailItem label="Email" value={getBuyerEmail(enquiry)} />
              <DetailItem label="Contact" value={getBuyerContact(enquiry)} />
              <DetailItem label="Quantity" value={getEnquiryQuantity(enquiry)} />
              {enquiry.message && <DetailItem label="Message" value={enquiry.message} />}
              <DetailItem label="Submitted" value={getEnquiryDate(enquiry)} />
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(enquiry.status) }]}>
                <Ionicons
                  name={getStatusIcon(enquiry.status)}
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.statusText}>
                  {enquiry.status?.charAt(0).toUpperCase() + enquiry.status?.slice(1) || 'New'}
                </Text>
              </View>
            </View>

            {/* Seller Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seller Contact</Text>
              <DetailItem label="Email" value={product.createdBy} />
              <DetailItem label="Phone" value={product.contact} />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onCall(product.contact)}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
                onPress={() => onWhatsApp(product.contact, product)}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'replied':
      return '#16a34a';
    case 'closed':
      return '#94a3b8';
    default:
      return '#0369a1';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'replied':
      return 'checkmark-circle';
    case 'closed':
      return 'close-circle';
    default:
      return 'information-circle';
  }
};

export default function MyEnquiriesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) {
        notify('Not Logged In', 'Please login to view your enquiries.');
        setLoading(false);
        return;
      }

      const summary = await UserStore.getEcomeMarketplaceSummary();
      if (!summary) {
        setLoading(false);
        return;
      }

      const userEmail = String(currentUser.email || '').trim().toLowerCase();
      const userEnquiries = (Array.isArray(summary.enquiries) ? summary.enquiries : [])
        .filter((eq) => String(eq.buyer_email || '').trim().toLowerCase() === userEmail);

      const listings = Array.isArray(summary.listings) ? summary.listings : [];
      const enrichedEnquiries = userEnquiries.map((eq) => ({
        ...eq,
        product: listings.find((l) => String(l.id) === String(eq.product_id)),
      }));

      setEnquiries(enrichedEnquiries);
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

  const handleCall = (contact) => {
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

  const handleWhatsApp = (contact, product) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) {
      notify('No Contact', 'No phone number available.');
      return;
    }
    const msg = encodeURIComponent(
      `Hi, I am interested in: ${product.title}\nPrice: ${money(product.price)}`
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
          <Text style={styles.loadingText}>Loading your enquiries...</Text>
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
          <Text style={styles.headerTitle}>My Enquiries</Text>
          <Text style={styles.headerSub}>{enquiries.length} enquiry(s)</Text>
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
        {enquiries.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No enquiries yet</Text>
            <Text style={styles.emptySubText}>Your submitted enquiries will appear here</Text>
          </View>
        ) : (
          enquiries.map((enquiry, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.enquiryCard}
              onPress={() => {
                setSelectedEnquiry(enquiry);
                setSelectedProduct(enquiry.product);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.enquiryTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.enquiryProduct} numberOfLines={2}>
                    {enquiry.product?.title || 'Unknown Product'}
                  </Text>
                  <View style={styles.enquiryMeta}>
                    <Ionicons name="location-outline" size={12} color="#64748b" />
                    <Text style={styles.enquiryCity}>{enquiry.product?.city || 'Unknown'}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadgeSmall,
                    { backgroundColor: getStatusColor(enquiry.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {enquiry.status?.charAt(0).toUpperCase() + enquiry.status?.slice(1) || 'New'}
                  </Text>
                </View>
              </View>

              <View style={styles.enquiryBottom}>
                <View style={styles.priceQtyRow}>
                  <Text style={styles.priceLabel}>{money(enquiry.product?.price)}</Text>
                  <Text style={styles.qtyLabel}>Qty: {getEnquiryQuantity(enquiry)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <EnquiryDetailModal
        visible={Boolean(selectedEnquiry && selectedProduct)}
        enquiry={selectedEnquiry}
        product={selectedProduct}
        onClose={() => {
          setSelectedEnquiry(null);
          setSelectedProduct(null);
        }}
        onCall={handleCall}
        onWhatsApp={handleWhatsApp}
      />
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
  enquiryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  enquiryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  enquiryProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  enquiryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  enquiryCity: {
    fontSize: 11,
    color: '#64748b',
  },
  statusBadgeSmall: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  enquiryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  priceQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0369a1',
    borderRadius: 10,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
