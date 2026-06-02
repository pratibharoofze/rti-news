import React, { useCallback, useEffect, useState } from 'react';
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
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserStore } from '../store/UserStore';
import { useToast } from '../components/ui/ToastProvider';

const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

const money = (value) => {
  const text = String(value || '').trim();
  return text ? `Rs. ${text}` : 'Price on request';
};

const normalizeIndianMobileNumber = (value = '') => {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
};

const isValidIndianMobileNumber = (value = '') => /^[6-9]\d{9}$/.test(normalizeIndianMobileNumber(value));

const splitName = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

const getMediaItems = (item = {}) => {
  const items = Array.isArray(item.mediaItems) ? item.mediaItems : [];
  if (items.length) return items.filter((media) => media?.uri);
  const imageItems = Array.isArray(item.images)
    ? item.images
        .filter(Boolean)
        .map((uri) => ({ uri: String(uri), type: 'image' }))
    : [];
  if (imageItems.length) return imageItems;
  if (item.mediaUri) return [{ uri: item.mediaUri, type: item.mediaType || 'image' }];
  return [];
};

const getRelativeTime = (dateStr) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  } catch {
    return 'Recently';
  }
};

const getProductImages = (item = {}) => (
  getMediaItems(item).filter((media) => media?.uri && String(media.type || '').toLowerCase() !== 'video')
);

const ProductMedia = ({ item, compact, onOpen }) => {
  const mediaItems = getMediaItems(item);
  const imageItems = getProductImages(item);
  const media = mediaItems[0];
  const isImage = media?.uri && String(media.type || '').toLowerCase() !== 'video';

  if (imageItems.length > 1) {
    return (
      <View style={compact ? styles.cardImageGalleryCompact : styles.cardImageGallery}>
        <View style={styles.cardImageGalleryContent}>
          {imageItems.map((image, index) => (
            <TouchableOpacity
              key={`${image.uri}-${index}`}
              style={compact ? styles.cardGalleryThumbWrapCompact : styles.cardGalleryThumbWrap}
              onPress={(event) => {
                event.stopPropagation?.();
                onOpen?.(index);
              }}
              activeOpacity={0.85}
            >
              <Image source={{ uri: image.uri }} style={styles.cardGalleryThumb} resizeMode="cover" />
              <View style={styles.cardGalleryCounter}>
                <Text style={styles.cardGalleryCounterText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (isImage) {
    return (
      <Image
        source={{ uri: media.uri }}
        style={compact ? styles.cardImageCompact : styles.cardImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={compact ? styles.cardMediaFallbackCompact : styles.cardMediaFallback}>
      <Ionicons name={media?.uri ? 'videocam-outline' : 'image-outline'} size={28} color="#16a34a" />
    </View>
  );
};

const ProductGallery = ({ item, selectedIndex = 0, onSelectIndex }) => {
  const mediaItems = getMediaItems(item);
  const activeIndex = Math.min(Math.max(Number(selectedIndex) || 0, 0), Math.max(mediaItems.length - 1, 0));
  const activeMedia = mediaItems[activeIndex];

  if (!mediaItems.length) {
    return (
      <View style={styles.modalProductImageFallback}>
        <Ionicons name="image-outline" size={48} color="#16a34a" />
      </View>
    );
  }

  const isActiveImage = String(activeMedia?.type || '').toLowerCase() !== 'video';

  return (
    <View style={styles.gallery}>
      <View style={styles.galleryItem}>
        {isActiveImage ? (
          <Image source={{ uri: activeMedia.uri }} style={styles.modalProductImage} resizeMode="cover" />
        ) : (
          <View style={styles.modalProductImageFallback}>
            <Ionicons name="videocam-outline" size={48} color="#16a34a" />
            <Text style={styles.videoLabel}>Video selected</Text>
          </View>
        )}
        {mediaItems.length > 1 ? (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{activeIndex + 1}/{mediaItems.length}</Text>
          </View>
        ) : null}
      </View>

      {mediaItems.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalThumbRow}>
          {mediaItems.map((media, index) => {
            const isImage = String(media.type || '').toLowerCase() !== 'video';
            return (
              <TouchableOpacity
                key={`${media.uri}-${index}`}
                style={[styles.modalThumbWrap, index === activeIndex && styles.modalThumbWrapActive]}
                onPress={() => onSelectIndex?.(index)}
                activeOpacity={0.85}
              >
                {isImage ? (
                  <Image source={{ uri: media.uri }} style={styles.modalThumbImage} resizeMode="cover" />
                ) : (
                  <View style={styles.modalThumbFallback}>
                    <Ionicons name="videocam-outline" size={20} color="#16a34a" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
};

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={14} color="#16a34a" />
      </View>
      <Text style={styles.infoLabel}>{label}: </Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const EnquiryFormModal = ({ product, onClose, onSaved }) => {
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [quantity, setQuantity] = useState(product?.quantity || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadBuyerDetails = async () => {
      const user = await UserStore.getCurrentUser();
      if (!alive || !user) return;
      const nameParts = splitName(user.name);
      setFirstName(String(user.first_name || user.firstName || nameParts.firstName || '').trim());
      setLastName(String(user.last_name || user.lastName || nameParts.lastName || '').trim());
      setEmail(String(user.email || '').trim());
      setContact(normalizeIndianMobileNumber(user.mobile || user.mobile_number || user.contact_number || ''));
    };
    loadBuyerDetails();
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (saving) return;
    const normalizedContact = normalizeIndianMobileNumber(contact);
    if (!firstName.trim()) {
      showToast('Please enter your first name.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter your email.', 'error');
      return;
    }
    if (!normalizedContact) {
      showToast('Please enter your contact number.', 'error');
      return;
    }
    if (!isValidIndianMobileNumber(normalizedContact)) {
      showToast('Please enter a valid 10 digit contact number.', 'error');
      return;
    }

    setSaving(true);
    const result = await UserStore.createEcomeEnquiry(product.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      contact: normalizedContact,
      quantity: quantity || product.quantity,
      message: message.trim(),
    });
    setSaving(false);

    if (!result.ok) {
      showToast(result.message || 'Unable to submit enquiry.', 'error');
      return;
    }

    showToast('Your enquiry has been submitted.', 'success');
    onSaved?.();
    onClose();
  };

  if (!product) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.detailSheet, { maxHeight: '82%' }]} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Send Enquiry</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <View style={styles.productInfoBox}>
              <Text style={styles.productInfoLabel}>Product</Text>
              <Text style={styles.productInfoValue}>{product.title}</Text>
            </View>

            <Text style={styles.formLabel}>First Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.formLabel}>Last Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.formLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.formLabel}>Contact Number</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={(value) => setContact(normalizeIndianMobileNumber(value))}
                placeholder="Enter contact number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <Text style={styles.formLabel}>Quantity</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="layers-outline" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder={product.quantity || 'Enter quantity'}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="e.g. What is the final price?"
              placeholderTextColor="#94a3b8"
              multiline
            />

            <TouchableOpacity
              style={[styles.submitEnquiryBtn, saving && { opacity: 0.65 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={styles.submitEnquiryText}>Send Enquiry</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function FarmingBuyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompactWeb = Platform.OS === 'web' && width <= 640;
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enquiryProduct, setEnquiryProduct] = useState(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const summary = await UserStore.getEcomeMarketplaceSummary();
    setListings(Array.isArray(summary?.listings) ? summary.listings : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const handleCall = (contact) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) {
      notify('No contact', 'Seller phone number is not available.');
      return;
    }
    const url = `tel:+91${phone}`;
    if (Platform.OS === 'web') {
      window.open(url);
      return;
    }
    Linking.openURL(url);
  };

  const handleWhatsApp = (product) => {
    const phone = String(product?.contact || '').replace(/\D/g, '');
    if (!phone) {
      notify('No contact', 'Seller phone number is not available.');
      return;
    }
    const msg = encodeURIComponent(`Hi, I am interested in ${product.title}. Price: ${money(product.price)}`);
    const url = `https://wa.me/91${phone}?text=${msg}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      return;
    }
    Linking.openURL(url);
  };

  const openEnquiry = (product) => {
    setSelectedProduct(null);
    setEnquiryProduct(product);
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
          <Text style={styles.headerSub}>Browse ecommerce products</Text>
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
            <Text style={styles.heroTitle}>Ecome Marketplace</Text>
            <Text style={styles.heroText}>View products, contact sellers, or send an enquiry.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#ea580c" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        ) : listings.length ? (
          listings.map((item) => {
            const hasMultipleImages = getProductImages(item).length > 1;
            return (
              <TouchableOpacity
                key={`${item.owner_email}-${item.id}`}
                style={[styles.card, (isCompactWeb || hasMultipleImages) && styles.cardCompact]}
                onPress={() => {
                  setSelectedImageIndex(0);
                  setSelectedProduct(item);
                }}
                activeOpacity={0.88}
              >
                <ProductMedia
                  item={item}
                  compact={isCompactWeb}
                  onOpen={(index = 0) => {
                    setSelectedImageIndex(index);
                    setSelectedProduct(item);
                  }}
                />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.cardPrice}>{money(item.price)}</Text>
                  </View>
                  <Text style={styles.cardMeta}>{item.sector || 'General'} | {item.city || 'Location N/A'}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description || 'No description added.'}</Text>

                  <View style={styles.cardBottomRow}>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={(event) => { event.stopPropagation?.(); handleCall(item.contact); }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="call-outline" size={15} color="#fff" />
                      <Text style={styles.actionBtnText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.enquireBtn}
                      onPress={(event) => { event.stopPropagation?.(); openEnquiry(item); }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={15} color="#fff" />
                      <Text style={styles.actionBtnText}>Enquire</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.stateBox}>
            <Ionicons name="basket-outline" size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.stateText}>Subscribed sellers can add products from the Sell page.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={Boolean(selectedProduct)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedProduct(null)}>
          <Pressable style={styles.detailSheet} onPress={() => {}}>
            {selectedProduct ? (
              <>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedProduct(null)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color="#64748b" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  <ProductGallery
                    item={selectedProduct}
                    selectedIndex={selectedImageIndex}
                    onSelectIndex={setSelectedImageIndex}
                  />

                  <View style={styles.modalProductInfo}>
                    <View style={styles.modalTitlePriceRow}>
                      <Text style={styles.modalProductTitle}>{selectedProduct.title || 'Untitled Product'}</Text>
                      <View style={styles.modalPriceBadge}>
                        <Text style={styles.modalPriceText}>{money(selectedProduct.price)}</Text>
                      </View>
                    </View>

                    <View style={styles.modalMetaChipsRow}>
                      {selectedProduct.sector ? (
                        <View style={styles.metaChip}>
                          <Ionicons name="grid-outline" size={12} color="#0369a1" />
                          <Text style={styles.metaChipText}>{selectedProduct.sector}</Text>
                        </View>
                      ) : null}
                      {selectedProduct.city ? (
                        <View style={styles.metaChip}>
                          <Ionicons name="location-outline" size={12} color="#0369a1" />
                          <Text style={styles.metaChipText}>{selectedProduct.city}</Text>
                        </View>
                      ) : null}
                      {selectedProduct.quantity ? (
                        <View style={styles.metaChip}>
                          <Ionicons name="layers-outline" size={12} color="#0369a1" />
                          <Text style={styles.metaChipText}>Qty: {selectedProduct.quantity}</Text>
                        </View>
                      ) : null}
                    </View>

                    {selectedProduct.description ? (
                      <View style={styles.modalDescSection}>
                        <Text style={styles.modalSectionLabel}>Description</Text>
                        <Text style={styles.modalDescText}>{selectedProduct.description}</Text>
                      </View>
                    ) : null}

                    <View style={styles.modalInfoGrid}>
                      <InfoRow icon="person-outline" label="Seller" value={selectedProduct.owner_name || selectedProduct.author_name} />
                      <InfoRow icon="call-outline" label="Contact" value={selectedProduct.contact} />
                      <InfoRow icon="time-outline" label="Listed" value={selectedProduct.createdAt ? getRelativeTime(selectedProduct.createdAt) : null} />
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalCallBtn}
                        onPress={() => handleCall(selectedProduct.contact)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="call" size={18} color="#fff" />
                        <Text style={styles.modalActionText}>Call Seller</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalWhatsappBtn}
                        onPress={() => handleWhatsApp(selectedProduct)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                        <Text style={styles.modalActionText}>WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.modalEnquiryBtn}
                      onPress={() => openEnquiry(selectedProduct)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="send" size={18} color="#fff" />
                      <Text style={styles.modalActionText}>Send Enquiry</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <EnquiryFormModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
        onSaved={loadListings}
      />
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
  card: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
    borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 12,
  },
  cardCompact: { flexDirection: 'column' },
  cardImage: { width: Platform.OS === 'web' ? 190 : '100%', height: 150, backgroundColor: '#dcfce7' },
  cardImageCompact: { width: '100%', height: 154, backgroundColor: '#dcfce7' },
  cardImageGallery: {
    width: '100%',
    minHeight: 150,
    backgroundColor: '#f0fdf4',
  },
  cardImageGalleryCompact: { width: '100%', minHeight: 154, backgroundColor: '#f0fdf4' },
  cardImageGalleryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  cardGalleryThumbWrap: {
    width: Platform.OS === 'web' ? 170 : '31%',
    height: 136,
    minWidth: Platform.OS === 'web' ? 150 : 96,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#dcfce7',
    position: 'relative',
  },
  cardGalleryThumbWrapCompact: {
    width: '31%',
    minWidth: 96,
    height: 116,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#dcfce7',
    position: 'relative',
  },
  cardGalleryThumb: { width: '100%', height: '100%' },
  cardGalleryCounter: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: 6,
  },
  cardGalleryCounterText: { color: '#fff', fontSize: 11, fontWeight: '900' },
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
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#0369a1', borderRadius: 12, paddingVertical: 13,
  },
  enquireBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 13,
  },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  stateBox: {
    alignItems: 'center', justifyContent: 'center', padding: 28,
    borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  stateText: { marginTop: 8, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 8 },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end', alignItems: 'center',
  },
  detailSheet: {
    width: '100%', maxWidth: 520, maxHeight: '92%',
    backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalCloseBtn: {
    position: 'absolute', top: 12, right: 14, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center',
  },
  gallery: { width: '100%', backgroundColor: '#f0fdf4' },
  galleryItem: { width: '100%', height: 240 },
  modalProductImage: { width: '100%', height: 240, backgroundColor: '#dcfce7' },
  modalProductImageFallback: {
    width: '100%', height: 240, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center',
  },
  modalThumbRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  modalThumbWrap: {
    width: 74,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalThumbWrapActive: { borderColor: '#ea580c' },
  modalThumbImage: { width: '100%', height: '100%' },
  modalThumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  videoLabel: { marginTop: 8, fontSize: 12, color: '#16a34a', fontWeight: '700' },
  imageCounter: {
    position: 'absolute', right: 12, bottom: 12,
    backgroundColor: 'rgba(15,23,42,0.75)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  imageCounterText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalProductInfo: {
    backgroundColor: '#fff', padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0', borderTopWidth: 0,
  },
  modalTitlePriceRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 10, marginTop: 4,
  },
  modalProductTitle: { flex: 1, fontSize: 20, fontWeight: '900', color: '#0f172a', lineHeight: 26 },
  modalPriceBadge: {
    backgroundColor: '#fff7ed', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#fed7aa',
  },
  modalPriceText: { fontSize: 16, fontWeight: '900', color: '#ea580c' },
  modalMetaChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 14 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  metaChipText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },
  modalDescSection: { marginBottom: 14 },
  modalSectionLabel: {
    fontSize: 12, fontWeight: '800', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  modalDescText: { fontSize: 14, color: '#334155', lineHeight: 21 },
  modalInfoGrid: { gap: 8, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoIconWrap: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', fontWeight: '700', flex: 1 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCallBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#0369a1', borderRadius: 14, paddingVertical: 14,
  },
  modalWhatsappBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 14,
  },
  modalEnquiryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#ea580c', borderRadius: 14, paddingVertical: 14, marginTop: 10,
  },
  modalActionText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, paddingRight: 52,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  sheetTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', flex: 1 },
  formContent: { padding: 16, paddingBottom: 32 },
  productInfoBox: {
    backgroundColor: '#f8fafc', borderRadius: 12, borderLeftWidth: 4,
    borderLeftColor: '#0369a1', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  productInfoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
  productInfoValue: { fontSize: 14, color: '#0f172a', fontWeight: '800' },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 2,
  },
  input: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 12 },
  textArea: {
    minHeight: 90, textAlignVertical: 'top',
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#fff', paddingHorizontal: 14,
  },
  submitEnquiryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, marginTop: 20,
  },
  submitEnquiryText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
