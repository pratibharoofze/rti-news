import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserStore } from '../store/UserStore';

const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

const money = (value) => {
  const text = String(value || '').trim();
  if (!text) return 'Price on request';
  return `Rs. ${text}`;
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const ProductMedia = ({ item, size = 'card' }) => {
  const uri = String(item?.mediaUri || '').trim();
  if (uri && String(item?.mediaType || '').toLowerCase() !== 'video') {
    return (
      <Image
        source={{ uri }}
        style={
          size === 'detail'
            ? styles.detailImage
            : size === 'compact'
              ? styles.cardImageCompact
              : styles.cardImage
        }
      />
    );
  }

  return (
    <View
      style={
        size === 'detail'
          ? styles.detailMediaFallback
          : size === 'compact'
            ? styles.cardMediaFallbackCompact
            : styles.cardMediaFallback
      }
    >
      <Ionicons
        name={String(item?.mediaType || '').toLowerCase() === 'video' ? 'videocam-outline' : 'leaf-outline'}
        size={size === 'detail' ? 34 : 26}
        color="#16a34a"
      />
    </View>
  );
};

export default function FarmingBuyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isCompactWeb = Platform.OS === 'web' && windowWidth <= 640;
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const summary = await UserStore.getFarmingMarketplaceSummary();
    setListings(Array.isArray(summary?.listings) ? summary.listings : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const openEnquiry = (product) => {
    setEnquiryProduct(product);
    setSelectedProduct(null);
    setQuantity(product?.quantity || '');
    setMessage('');
  };

  const closeEnquiry = () => {
    setEnquiryProduct(null);
    setQuantity('');
    setMessage('');
    setSending(false);
  };

  const handleEnquiry = async () => {
    if (!enquiryProduct || sending) return;
    setSending(true);
    const result = await UserStore.createFarmingEnquiry(enquiryProduct.id, { quantity, message });
    setSending(false);
    if (!result.ok) {
      notify('Enquiry failed', result.message || 'Unable to send enquiry.');
      return;
    }
    closeEnquiry();
    notify('Enquiry sent', 'The product details have been saved in the inboxes of the buyer, admin, and product reporter/seller.');
  };

  const handleBuy = async (product) => {
    if (sending) return;
    setSending(true);
    const result = await UserStore.createFarmingPurchase(product.id, {
      quantity: product.quantity,
      message: 'Buyer clicked Buy Now from Farming Buy page.',
    });
    setSending(false);
    if (!result.ok) {
      notify('Buy request failed', result.message || 'Unable to send buy request.');
      return;
    }
    notify('Successful Buyer', 'Your buy request has been sent successfully. The product details have been saved in the inboxes of the buyer, admin, and product reporter/seller.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Buy</Text>
          <Text style={styles.headerSub}>Products uploaded from Sell page</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={styles.sellBtn} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.sellBtnText}>Sell</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isCompactWeb && styles.contentCompact,
          { paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="cart-outline" size={28} color="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Farming Marketplace</Text>
            <Text style={styles.heroText}>Tap any product to see full details, buy it, or send enquiry.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#ea580c" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        ) : listings.length ? (
          listings.map((item) => (
            <TouchableOpacity
              key={`${item.owner_email}-${item.id}`}
              style={[styles.card, isCompactWeb && styles.cardCompact]}
              onPress={() => setSelectedProduct(item)}
              activeOpacity={0.88}
            >
              <ProductMedia item={item} size={isCompactWeb ? 'compact' : 'card'} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{money(item.price)}</Text>
                </View>
                <Text style={styles.cardMeta}>{item.sector || 'Farming'} · {item.city || 'Location N/A'}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description || 'No description added.'}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.ownerText}>By {item.owner_name || item.author_name || 'Seller'}</Text>
                  <Text style={styles.qtyText}>Qty: {item.quantity || 'N/A'}</Text>
                </View>
                <View style={[styles.actionRow, isCompactWeb && styles.actionRowCompact]}>
                  <TouchableOpacity style={styles.enquireBtn} onPress={() => openEnquiry(item)} activeOpacity={0.85}>
                    <Ionicons name="chatbox-ellipses-outline" size={17} color="#ea580c" />
                    <Text style={styles.enquireBtnText}>Enquire Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(item)} activeOpacity={0.85}>
                    <Ionicons name="bag-check-outline" size={17} color="#fff" />
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.stateBox}>
            <Ionicons name="basket-outline" size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.stateText}>Sell page se submit kiya hua product yahan show hoga.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={styles.emptyBtn} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={Boolean(selectedProduct)} transparent animationType="slide" onRequestClose={() => setSelectedProduct(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedProduct(null)}>
          <Pressable style={styles.detailSheet}>
            {selectedProduct ? (
              <>
                <View style={styles.modalHandle} />
                <ProductMedia item={selectedProduct} size="detail" />
                <Text style={styles.detailTitle}>{selectedProduct.title}</Text>
                <Text style={styles.detailPrice}>{money(selectedProduct.price)}</Text>
                <InfoRow label="Product ID" value={selectedProduct.id} />
                <InfoRow label="Sector" value={selectedProduct.sector} />
                <InfoRow label="Quantity" value={selectedProduct.quantity} />
                <InfoRow label="Location" value={selectedProduct.city} />
                <InfoRow label="Seller / Reporter" value={selectedProduct.owner_name || selectedProduct.author_name} />
                <InfoRow label="Contact" value={selectedProduct.contact} />
                <Text style={styles.descTitle}>Description</Text>
                <Text style={styles.detailDesc}>{selectedProduct.description || 'No description added.'}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.enquireBtn} onPress={() => openEnquiry(selectedProduct)} activeOpacity={0.85}>
                    <Text style={styles.enquireBtnText}>Enquire Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(selectedProduct)} activeOpacity={0.85}>
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={Boolean(enquiryProduct)} transparent animationType="fade" onRequestClose={closeEnquiry}>
        <Pressable style={styles.modalBackdrop} onPress={closeEnquiry}>
          <Pressable style={styles.enquiryBox}>
            {enquiryProduct ? (
              <>
                <Text style={styles.enquiryTitle}>Enquire Now</Text>
                <InfoRow label="Product Name" value={enquiryProduct.title} />
                <InfoRow label="Product ID" value={enquiryProduct.id} />
                <InfoRow label="Sector" value={enquiryProduct.sector} />
                <InfoRow label="Available Quantity" value={enquiryProduct.quantity} />
                <InfoRow label="Price" value={money(enquiryProduct.price)} />
                <InfoRow label="Location" value={enquiryProduct.city} />
                <Text style={styles.inputLabel}>Required Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  placeholderTextColor="#94a3b8"
                />
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add note for seller/reporter"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeEnquiry} activeOpacity={0.85}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyBtn} onPress={handleEnquiry} activeOpacity={0.85}>
                    <Text style={styles.buyBtnText}>{sending ? 'Sending...' : 'Send Enquiry'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  sellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  sellBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, maxWidth: 920, width: '100%', alignSelf: 'center' },
  contentCompact: { paddingHorizontal: 12, paddingTop: 12 },
  hero: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
    backgroundColor: '#fffbeb',
    marginBottom: 14,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
  },
  heroTitle: { fontSize: 16, fontWeight: '900', color: '#92400e' },
  heroText: { fontSize: 12, color: '#b45309', marginTop: 4, lineHeight: 18 },
  card: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardCompact: { flexDirection: 'column' },
  cardImage: { width: Platform.OS === 'web' ? 190 : '100%', height: 150, backgroundColor: '#dcfce7' },
  cardImageCompact: { width: '100%', height: 154, backgroundColor: '#dcfce7' },
  cardMediaFallback: {
    width: Platform.OS === 'web' ? 190 : '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  cardMediaFallbackCompact: {
    width: '100%',
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '900', color: '#0f172a' },
  cardPrice: { fontSize: 14, fontWeight: '900', color: '#ea580c' },
  cardMeta: { fontSize: 12, color: '#64748b', marginTop: 5 },
  cardDesc: { fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 9 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 },
  ownerText: { flex: 1, fontSize: 12, color: '#64748b', fontWeight: '700' },
  qtyText: { fontSize: 12, color: '#166534', fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionRowCompact: { gap: 8 },
  enquireBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  enquireBtnText: { color: '#ea580c', fontWeight: '900', fontSize: 13 },
  buyBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buyBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  stateText: { marginTop: 8, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 8 },
  emptyBtn: { marginTop: 14, backgroundColor: '#16a34a', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  emptyBtnText: { color: '#fff', fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  detailSheet: {
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
  },
  modalHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: '#cbd5e1', alignSelf: 'center', marginBottom: 14 },
  detailImage: { width: '100%', height: 230, borderRadius: 16, backgroundColor: '#dcfce7' },
  detailMediaFallback: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  detailTitle: { fontSize: 21, fontWeight: '900', color: '#0f172a', marginTop: 16 },
  detailPrice: { fontSize: 17, fontWeight: '900', color: '#ea580c', marginTop: 5, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '800' },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 12, color: '#0f172a', fontWeight: '700' },
  descTitle: { fontSize: 13, color: '#0f172a', fontWeight: '900', marginTop: 14 },
  detailDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 5 },
  enquiryBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
  },
  enquiryTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  inputLabel: { fontSize: 12, color: '#334155', fontWeight: '800', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  messageInput: { minHeight: 86 },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: { color: '#334155', fontWeight: '900' },
});
