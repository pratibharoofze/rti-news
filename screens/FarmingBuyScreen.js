import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  return `₹ ${text}`;
};

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
        resizeMode="cover"
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
        size={size === 'detail' ? 48 : 26}
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

  const handleWhatsApp = (contact, product) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) { notify('No Contact', 'No contact information available.'); return; }
    const msg = encodeURIComponent(
      `Hi, I am interested in your product: ${product?.title || ''}\nPrice: ${money(product?.price)}\nQuantity: ${product?.quantity || 'N/A'}`
    );
    const url = `https://wa.me/91${phone}?text=${msg}`;
    if (Platform.OS === 'web') { window.open(url, '_blank'); return; }
    Linking.openURL(url);
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
    notify('Successful Buyer', 'Your buy request has been sent successfully.');
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
            <Text style={styles.heroText}>Tap any product to see full details and contact seller.</Text>
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
                <TouchableOpacity
                  style={styles.cardCallBtn}
                  onPress={() => handleWhatsApp(item.contact, item)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="call-outline" size={16} color="#fff" />
                  <Text style={styles.cardCallBtnText}>Call / WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.stateBox}>
            <Ionicons name="basket-outline" size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.stateText}>Sell products on the Sell page to see them here.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={styles.emptyBtn} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ─── Detail Modal ─── */}
      <Modal
        visible={Boolean(selectedProduct)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedProduct(null)}>
          <Pressable style={styles.detailSheet} onPress={() => {}}>
            {selectedProduct ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>

                {/* ── Hero Image with overlay title ── */}
                <View style={styles.detailHeroWrap}>
                  <ProductMedia item={selectedProduct} size="detail" />
                  {/* Dark gradient overlay */}
                  <View style={styles.detailHeroOverlay}>
                    <Text style={styles.detailHeroTitle}>{selectedProduct.title}</Text>
                    {selectedProduct.sector ? (
                      <Text style={styles.detailHeroSub}>{selectedProduct.sector}</Text>
                    ) : null}
                  </View>
                  {/* Close button */}
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedProduct(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* ── Description ── */}
                {selectedProduct.description ? (
                  <Text style={styles.detailDescCenter}>{selectedProduct.description}</Text>
                ) : null}

                {/* ── Seller Card ── */}
                <View style={styles.sellerCard}>
                  {/* Badge row */}
                  <View style={styles.sellerBadgeRow}>
                    <View style={styles.sellerBadge}>
                      <Text style={styles.sellerBadgeText}>🌾 Selling</Text>
                    </View>
                    <View style={styles.sellerTimeRow}>
                      <Ionicons name="time-outline" size={13} color="#94a3b8" />
                      <Text style={styles.sellerTime}>{selectedProduct.city || 'Location N/A'}</Text>
                    </View>
                  </View>

                  {/* Thumbnail */}
                  <View style={styles.sellerThumbWrap}>
                    <ProductMedia item={selectedProduct} size="detail" />
                  </View>

                  {/* Name + Price row */}
                  <View style={styles.sellerInfoRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sellerName}>
                        {selectedProduct.owner_name || selectedProduct.author_name || 'Seller'}
                      </Text>
                      <Text style={styles.sellerCrop}>{selectedProduct.title}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.sellerPriceLabel}>Price:</Text>
                      <Text style={styles.sellerPrice}>₹ {selectedProduct.price || 'N/A'}</Text>
                      <Text style={styles.sellerQty}>({selectedProduct.quantity || 'N/A'})</Text>
                    </View>
                  </View>

                  {/* Call Button */}
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleWhatsApp(selectedProduct.contact, selectedProduct)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="call-outline" size={18} color="#fff" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                </View>

                {/* Buy Now */}
                <TouchableOpacity
                  style={styles.buyBtn}
                  onPress={() => handleBuy(selectedProduct)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bag-check-outline" size={17} color="#fff" />
                  <Text style={styles.buyBtnText}>Buy Now</Text>
                </TouchableOpacity>

              </ScrollView>
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
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  sellBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#16a34a', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 9,
  },
  sellBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, maxWidth: 920, width: '100%', alignSelf: 'center' },
  contentCompact: { paddingHorizontal: 12, paddingTop: 12 },
  hero: {
    flexDirection: 'row', gap: 14, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#fef3c7', backgroundColor: '#fffbeb', marginBottom: 14,
  },
  heroIcon: {
    width: 50, height: 50, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#fef3c7',
  },
  heroTitle: { fontSize: 16, fontWeight: '900', color: '#92400e' },
  heroText: { fontSize: 12, color: '#b45309', marginTop: 4, lineHeight: 18 },

  // Card
  card: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
    borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 12,
  },
  cardCompact: { flexDirection: 'column' },
  cardImage: { width: Platform.OS === 'web' ? 190 : '100%', height: 150, backgroundColor: '#dcfce7' },
  cardImageCompact: { width: '100%', height: 154, backgroundColor: '#dcfce7' },
  cardMediaFallback: {
    width: Platform.OS === 'web' ? 190 : '100%', height: 150,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4',
  },
  cardMediaFallbackCompact: {
    width: '100%', height: 154, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#f0fdf4',
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
  cardCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#3b82f6', borderRadius: 10,
    paddingVertical: 10, marginTop: 12,
  },
  cardCallBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  stateBox: {
    alignItems: 'center', justifyContent: 'center', padding: 28,
    borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  stateText: { marginTop: 8, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 8 },
  emptyBtn: { marginTop: 14, backgroundColor: '#16a34a', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  emptyBtnText: { color: '#fff', fontWeight: '900' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  detailSheet: {
    maxHeight: '92%', backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden',
  },

  // Hero image with overlay
  detailHeroWrap: { position: 'relative', width: '100%', height: 220 },
  detailImage: { width: '100%', height: 220, backgroundColor: '#dcfce7' },
  detailMediaFallback: {
    width: '100%', height: 220, alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#f0fdf4',
  },
  detailHeroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 18, paddingBottom: 16, paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  detailHeroTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  detailHeroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  modalCloseBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  detailDescCenter: {
    fontSize: 13, color: '#475569', lineHeight: 20,
    textAlign: 'center', paddingHorizontal: 18, marginTop: 14,
  },

  // Seller card
  sellerCard: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 16,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  sellerBadgeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10,
  },
  sellerBadge: {
    backgroundColor: '#16a34a', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  sellerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  sellerTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerTime: { fontSize: 12, color: '#94a3b8' },
  sellerThumbWrap: { width: '100%', height: 200 },
  sellerInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
  },
  sellerName: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  sellerCrop: { fontSize: 13, color: '#64748b', marginTop: 3 },
  sellerPriceLabel: { fontSize: 12, color: '#64748b' },
  sellerPrice: { fontSize: 26, fontWeight: '900', color: '#16a34a' },
  sellerQty: { fontSize: 12, color: '#64748b' },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#3b82f6',
    marginHorizontal: 14, marginBottom: 14, borderRadius: 12, paddingVertical: 14,
  },
  callBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#ea580c', borderRadius: 12,
    marginHorizontal: 16, marginTop: 12, paddingVertical: 14,
  },
  buyBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});