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
  return `₹ ${text}`;
};

const getContactFeedbackKey = (person, type) => {
  const stableId = String(person?.id || person?.email || person?.contact || person?.name || '').trim().toLowerCase();
  return `${type || person?.type || 'contact'}:${stableId}`;
};

const ProductMedia = ({ item, size = 'card' }) => {
  const uri = String(item?.mediaUri || '').trim();
  if (uri && String(item?.mediaType || '').toLowerCase() !== 'video') {
    return (
      <Image
        source={{ uri }}
        style={size === 'compact' ? styles.cardImageCompact : styles.cardImage}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={size === 'compact' ? styles.cardMediaFallbackCompact : styles.cardMediaFallback}>
      <Ionicons
        name={String(item?.mediaType || '').toLowerCase() === 'video' ? 'videocam-outline' : 'leaf-outline'}
        size={26}
        color="#16a34a"
      />
    </View>
  );
};

const ModalProductMedia = ({ item }) => {
  const uri = String(item?.mediaUri || '').trim();
  if (uri && String(item?.mediaType || '').toLowerCase() !== 'video') {
    return (
      <Image
        source={{ uri }}
        style={styles.modalProductImage}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={styles.modalProductImageFallback}>
      <Ionicons
        name={String(item?.mediaType || '').toLowerCase() === 'video' ? 'videocam-outline' : 'leaf-outline'}
        size={48}
        color="#16a34a"
      />
    </View>
  );
};

// ── Single contact card (seller or buyer) shown inside contact modal ──
const DetailContactCard = ({ item, person, type, onCall, feedbackByContact, onFeedbackSaved }) => {
  const contactKey = getContactFeedbackKey(person, type);
  const existingFeedback = feedbackByContact?.[contactKey];
  const [voted, setVoted] = useState(Boolean(existingFeedback));
  const [showThankYou, setShowThankYou] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);

  const handleThumb = async (response) => {
    if (savingFeedback || voted) return;
    setSavingFeedback(true);
    const result = await UserStore.saveFarmingPriceFeedback({
      productId: item?.id,
      contactKey,
      contactType: type,
      contactName: person?.name,
      contactEmail: person?.email,
      price: person?.price,
      quantity: person?.quantity,
      response,
    });
    setSavingFeedback(false);
    if (!result?.ok) {
      notify('Feedback failed', result?.message || 'Unable to save your response.');
      return;
    }
    setVoted(true);
    setShowThankYou(true);
    onFeedbackSaved?.(result.feedback || {
      product_id: item?.id,
      contact_key: contactKey,
      response,
    });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <View style={styles.detailContactCard}>

      {/* ── Top Toast: "Thank you for vote" ── */}
      {toastVisible && (
        <View style={styles.topToast}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.topToastText}>Thank you for your vote! 🙏🏻</Text>
        </View>
      )}

      <View style={styles.detailContactTopRow}>
        <View style={type === 'sell' ? styles.detailBadgeSell : styles.detailBadgeBuy}>
          <Text style={styles.detailBadgeText}>{type === 'sell' ? 'Selling' : 'Buying'}</Text>
        </View>
        <View style={styles.detailTimeRow}>
          <Ionicons name="time-outline" size={13} color="#94a3b8" />
          <Text style={styles.detailTimeText}>{person.time || 'Just now'}</Text>
        </View>
      </View>

      <View style={styles.detailContactInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.detailContactName}>{person.name || 'Unknown'}</Text>
          <Text style={styles.detailContactCrop}>{person.crop || person.title || ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.detailContactPriceLabel}>Price:</Text>
          <Text style={styles.detailContactPrice}>₹ {person.price || 'N/A'}</Text>
          <Text style={styles.detailContactQty}>({person.quantity || 'N/A'})</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.detailCallBtn}
        onPress={() => onCall(person.contact, person)}
        activeOpacity={0.85}
      >
        <Ionicons name="call" size={16} color="#fff" />
        <Text style={styles.detailCallBtnText}>Call</Text>
      </TouchableOpacity>

      {/* ── Bottom: thumbs hide → green thank you box ── */}
      {existingFeedback ? null : voted && showThankYou ? (
        <View style={styles.thankyouRow}>
          <Text style={styles.thankyouText}>Thank you for your response🙏🏻</Text>
        </View>
      ) : (
        <View style={styles.priceFeedbackRow}>
          <Text style={styles.priceFeedbackLabel}>Is this price correct?</Text>
          <View style={styles.priceFeedbackBtns}>
            <TouchableOpacity
              style={[styles.thumbBtn, savingFeedback && styles.thumbBtnDisabled]}
              onPress={() => handleThumb('like')}
              activeOpacity={0.8}
              disabled={savingFeedback}
            >
              <Ionicons name="thumbs-up" size={16} color="#334155" />
              <Text style={styles.thumbLabel}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.thumbBtn, savingFeedback && styles.thumbBtnDisabled]}
              onPress={() => handleThumb('dislike')}
              activeOpacity={0.8}
              disabled={savingFeedback}
            >
              <Ionicons name="thumbs-down" size={16} color="#334155" />
              <Text style={styles.thumbLabel}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ── Contact List Modal — shown when Enquire button is tapped ──
const ContactListModal = ({ item, onClose, onWhatsApp, priceFeedback, onFeedbackSaved }) => {
  if (!item) return null;
  const { sellers, buyers } = getContactPersons(item);
  const allContacts = [
    ...sellers.map((s) => ({ ...s, type: 'sell' })),
    ...buyers.map((b) => ({ ...b, type: 'buy' })),
  ];
  const feedbackByContact = (Array.isArray(priceFeedback) ? priceFeedback : [])
    .filter((feedback) => String(feedback.product_id || '') === String(item.id || ''))
    .reduce((map, feedback) => {
      const key = String(feedback.contact_key || '').trim();
      if (key) map[key] = feedback;
      return map;
    }, {});

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.detailSheet} onPress={() => {}}>
          {/* header */}
          <View style={styles.contactModalHeader}>
            <View style={styles.contactModalHeaderLeft}>
              <Text style={styles.contactModalTitle}>{item.title || 'Product'}</Text>
              <Text style={styles.contactModalSub}>Tap Call to connect with buyer/seller</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
          >
            {allContacts.length === 0 ? (
              <View style={styles.modalEmptyBox}>
                <Ionicons name="people-outline" size={32} color="#94a3b8" />
                <Text style={styles.modalEmptyText}>No contacts available for this product.</Text>
              </View>
            ) : (
              allContacts.map((person, i) => (
                <DetailContactCard
                  key={i}
                  item={item}
                  person={person}
                  type={person.type}
                  onCall={onWhatsApp}
                  feedbackByContact={feedbackByContact}
                  onFeedbackSaved={onFeedbackSaved}
                />
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getContactPersons = (item) => {
  const sellers = [];
  const buyers = [];

  if (item) {
    sellers.push({
      id: `listing-${item.id}`,
      email: item.owner_email || item.createdBy || item.reporter_email || '',
      name: item.owner_name || item.author_name || 'Seller',
      crop: item.title,
      price: item.price,
      quantity: item.quantity,
      contact: item.contact,
      time: item.created_at ? getRelativeTime(item.created_at) : 'Just now',
    });
  }

  if (Array.isArray(item?.sellers)) {
    item.sellers.forEach((s) => {
      sellers.push({
        id: s.id,
        email: s.email || s.seller_email || '',
        name: s.name || s.owner_name || 'Seller',
        crop: s.crop || item.title,
        price: s.price,
        quantity: s.quantity,
        contact: s.contact,
        time: s.created_at ? getRelativeTime(s.created_at) : 'Just now',
      });
    });
  }

  if (Array.isArray(item?.buyers)) {
    item.buyers.forEach((b) => {
      buyers.push({
        id: b.id,
        email: b.email || b.buyer_email || '',
        name: b.name || b.buyer_name || 'Buyer',
        crop: b.crop || item.title,
        price: b.price,
        quantity: b.quantity,
        contact: b.contact,
        time: b.created_at ? getRelativeTime(b.created_at) : 'Just now',
      });
    });
  }

  return { sellers, buyers };
};

const getRelativeTime = (dateStr) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  } catch {
    return 'Just now';
  }
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

// ── Confirm Dialog ──
const ConfirmDialog = ({ visible, onOk, onCancel }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={bfStyles.confirmBackdrop}>
      <View style={bfStyles.confirmBox}>
        <Text style={bfStyles.confirmText}>Are you sure you want to save this price?</Text>
        <View style={bfStyles.confirmBtns}>
          <TouchableOpacity style={bfStyles.confirmOkBtn} onPress={onOk} activeOpacity={0.85}>
            <Text style={bfStyles.confirmOkText}>OK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={bfStyles.confirmCancelBtn} onPress={onCancel} activeOpacity={0.85}>
            <Text style={bfStyles.confirmCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ── Success Modal ──
const SuccessModal = ({ visible, userName, productTitle, onClose }) => {
  const handleShare = () => {
    const msg = encodeURIComponent(
      `I just listed "${productTitle}" on the marketplace! Come check the latest prices and trade with me.`
    );
    const url = `https://wa.me/?text=${msg}`;
    if (Platform.OS === 'web') { window.open(url, '_blank'); return; }
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={bfStyles.successBackdrop}>
        <View style={bfStyles.successBox}>
          <TouchableOpacity style={bfStyles.successClose} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>

          <Text style={bfStyles.successTitle}>Thank you {userName || 'User'}</Text>

          <View style={bfStyles.successRow}>
            <Text style={bfStyles.successRowIcon}>🙏</Text>
            <Text style={bfStyles.successRowText}>
              Your contribution will help thousands of traders make the right decision at the right time.
            </Text>
          </View>
          <View style={bfStyles.successRow}>
            <Text style={bfStyles.successRowIcon}>🏆</Text>
            <Text style={bfStyles.successRowText}>
              Your name will be added to the list of contributors on this page.
            </Text>
          </View>
          <View style={bfStyles.successRow}>
            <Text style={bfStyles.successRowIcon}>🔗</Text>
            <Text style={bfStyles.successRowText}>
              Share this page with your trading friends.
            </Text>
          </View>

          <TouchableOpacity style={bfStyles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={bfStyles.shareBtnText}>Share this page</Text>
          </TouchableOpacity>

          <View style={bfStyles.illustrationWrap}>
            <Text style={{ fontSize: 72, textAlign: 'center' }}>🐂🌾</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Buy Form Modal ──
const BuyFormModal = ({ product, onClose, onSaved }) => {
  const [mode, setMode] = useState('buy');
  const [quantity, setQuantity] = useState('100');
  const [price, setPrice] = useState('');
  const [callAllow, setCallAllow] = useState(true);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const MAX_MEDIA = 5;

  const handlePickMedia = () => {
    if (mediaFiles.length >= MAX_MEDIA) return;
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_MEDIA - mediaFiles.length;
        const toAdd = files.slice(0, remaining).map((f) => ({
          uri: URL.createObjectURL(f),
          name: f.name,
          type: f.type,
        }));
        setMediaFiles((prev) => [...prev, ...toAdd]);
      };
      input.click();
    }
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePress = () => {
    if (!price) {
      notify('Enter price', 'Please enter the price.');
      return;
    }
    if (!quantity) {
      notify('Enter quantity', 'Please enter the quantity.');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOk = async () => {
    if (saving) return;
    setSaving(true);
    const payload = {
      quantity,
      price,
      callAllow,
      message: mode === 'sell'
        ? 'Seller submitted a sell offer from Farming Buy page.'
        : 'Buyer submitted a buy request from Farming Buy page.',
    };
    const result = mode === 'sell'
      ? await UserStore.createFarmingSellOffer(product.id, payload)
      : await UserStore.createFarmingPurchase(product.id, payload);
    setSaving(false);
    if (!result.ok) {
      setShowConfirm(false);
      notify(mode === 'sell' ? 'Sell offer failed' : 'Buy request failed', result.message || 'Unable to save your request.');
      return;
    }
    setShowConfirm(false);
    onSaved?.();
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
          <Pressable style={[styles.detailSheet, { maxHeight: '95%' }]} onPress={() => {}}>
            <View style={bfStyles.header}>
              <Text style={bfStyles.title}>Fill details to buy/sell product:</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={bfStyles.label}>
                What do you want to do? <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={bfStyles.toggleRow}>
                <TouchableOpacity
                  style={[bfStyles.toggleBtn, mode === 'buy' && bfStyles.toggleBtnActiveBuy]}
                  onPress={() => setMode('buy')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cart-outline" size={18} color={mode === 'buy' ? '#fff' : '#475569'} />
                  <Text style={[bfStyles.toggleBtnText, mode === 'buy' && { color: '#fff' }]}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[bfStyles.toggleBtn, mode === 'sell' && bfStyles.toggleBtnActiveSell]}
                  onPress={() => setMode('sell')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cash-outline" size={18} color={mode === 'sell' ? '#fff' : '#475569'} />
                  <Text style={[bfStyles.toggleBtnText, mode === 'sell' && { color: '#fff' }]}>Sell</Text>
                </TouchableOpacity>
              </View>

              <Text style={bfStyles.label}>
                Quantity (kg) <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={bfStyles.inputWrap}>
                <Ionicons name="scale-outline" size={16} color="#94a3b8" />
                <TextInput
                  style={bfStyles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={bfStyles.label}>
                Price (per quintal) <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <View style={bfStyles.inputWrap}>
                <Text style={{ fontSize: 16, color: '#94a3b8', fontWeight: '700' }}>₹</Text>
                <TextInput
                  style={bfStyles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="Enter price"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={bfStyles.checkRow}
                onPress={() => setCallAllow(!callAllow)}
                activeOpacity={0.8}
              >
                <View style={[bfStyles.checkbox, callAllow && bfStyles.checkboxActive]}>
                  {callAllow && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={bfStyles.checkLabel}>Allow customers to call me for price enquiry</Text>
              </TouchableOpacity>

              <Text style={bfStyles.label}>Add photo/video of your product:</Text>

              {mediaFiles.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {mediaFiles.map((f, i) => (
                      <View key={i} style={bfStyles.thumbWrap}>
                        <Image source={{ uri: f.uri }} style={bfStyles.thumb} resizeMode="cover" />
                        <TouchableOpacity
                          style={bfStyles.thumbRemove}
                          onPress={() => removeMedia(i)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                style={[bfStyles.mediaPicker, mediaFiles.length >= MAX_MEDIA && { opacity: 0.5 }]}
                onPress={handlePickMedia}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={40} color="#16a34a" />
                <Text style={bfStyles.mediaPickerText}>
                  {mediaFiles.length >= MAX_MEDIA
                    ? 'Max photos/videos added'
                    : `Choose photo/video\nAdd ${MAX_MEDIA - mediaFiles.length} more\n(Optional)`}
                </Text>
              </TouchableOpacity>

              <View style={bfStyles.mediaTip}>
                <Text style={bfStyles.mediaTipText}>
                  Tip: Show all available stock clearly in the video
                </Text>
              </View>

              <TouchableOpacity style={bfStyles.saveBtn} onPress={handleSavePress} activeOpacity={0.85}>
                <Text style={bfStyles.saveBtnText}>Save Price ›</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        visible={showConfirm}
        onOk={handleConfirmOk}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessModal
        visible={showSuccess}
        userName={product?.owner_name || ''}
        productTitle={product?.title || 'this product'}
        onClose={handleSuccessClose}
      />
    </>
  );
};


export default function FarmingBuyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isCompactWeb = Platform.OS === 'web' && windowWidth <= 640;
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [priceFeedback, setPriceFeedback] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [contactProduct, setContactProduct] = useState(null);
  const [buyFormProduct, setBuyFormProduct] = useState(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const summary = await UserStore.getFarmingMarketplaceSummary();
    setListings(Array.isArray(summary?.listings) ? summary.listings : []);
    setPriceFeedback(Array.isArray(summary?.priceFeedback) ? summary.priceFeedback : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const handleWhatsApp = (contact, person) => {
    const phone = String(contact || '').replace(/\D/g, '');
    if (!phone) { notify('No Contact', 'No contact information available.'); return; }
    const msg = encodeURIComponent(
      `Hi, I am interested in: ${person?.crop || person?.title || ''}\nPrice: ${money(person?.price)}\nQuantity: ${person?.quantity || 'N/A'}`
    );
    const url = `https://wa.me/91${phone}?text=${msg}`;
    if (Platform.OS === 'web') { window.open(url, '_blank'); return; }
    Linking.openURL(url);
  };

  const handleFeedbackSaved = (feedback) => {
    if (!feedback) return;
    setPriceFeedback((prev) => {
      const exists = prev.some((item) => (
        String(item.product_id || '') === String(feedback.product_id || '')
        && String(item.contact_key || '') === String(feedback.contact_key || '')
      ));
      return exists ? prev : [feedback, ...prev];
    });
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
          listings.map((item) => {
            return (
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

                  {/* ── Only Enquire + Buy Now buttons ── */}
                  <View style={styles.cardBottomRow}>
                    <TouchableOpacity
                      style={styles.enquireBtn}
                      onPress={(e) => { e.stopPropagation?.(); setContactProduct(item); }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={15} color="#fff" />
                      <Text style={styles.enquireBtnText}>Enquire</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardBuyBtn}
                      onPress={(e) => { e.stopPropagation?.(); setBuyFormProduct(item); }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="bag-check-outline" size={15} color="#fff" />
                      <Text style={styles.cardBuyBtnText}>Buy Now</Text>
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
            <Text style={styles.stateText}>Sell products on the Sell page to see them here.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={styles.emptyBtn} activeOpacity={0.85}>
              <Text style={styles.emptyBtnText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ─── Product Detail Modal ─── */}
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

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                >
                  <ModalProductMedia item={selectedProduct} />

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

                    <View style={styles.modalDivider} />

                    {selectedProduct.description ? (
                      <View style={styles.modalDescSection}>
                        <Text style={styles.modalSectionLabel}>Description</Text>
                        <Text style={styles.modalDescText}>{selectedProduct.description}</Text>
                      </View>
                    ) : null}

                    <View style={styles.modalInfoGrid}>
                      <InfoRow icon="time-outline" label="Listed" value={selectedProduct.created_at ? getRelativeTime(selectedProduct.created_at) : null} />
                    </View>

                    <TouchableOpacity
                      style={styles.modalBuyBtn}
                      onPress={() => {
                        setSelectedProduct(null);
                        setBuyFormProduct(selectedProduct);
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="bag-check-outline" size={18} color="#fff" />
                      <Text style={styles.modalBuyBtnText}>Buy Now</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Contact List Modal (Enquire button tap) ─── */}
      <ContactListModal
        item={contactProduct}
        onClose={() => setContactProduct(null)}
        onWhatsApp={handleWhatsApp}
        priceFeedback={priceFeedback}
        onFeedbackSaved={handleFeedbackSaved}
      />

      {/* ─── Buy Form Modal ─── */}
      {buyFormProduct && (
        <BuyFormModal
          product={buyFormProduct}
          onClose={() => setBuyFormProduct(null)}
          onSaved={loadListings}
        />
      )}
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

  cardBottomRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14,
  },
  enquireBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#16a34a', borderRadius: 12,
    paddingVertical: 13,
  },
  enquireBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  cardBuyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#ea580c', borderRadius: 12,
    paddingVertical: 13,
  },
  cardBuyBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },

  stateBox: {
    alignItems: 'center', justifyContent: 'center', padding: 28,
    borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  stateText: { marginTop: 8, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginTop: 8 },
  emptyBtn: { marginTop: 14, backgroundColor: '#16a34a', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  emptyBtnText: { color: '#fff', fontWeight: '900' },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end', alignItems: 'center',
  },
  detailSheet: {
    width: '100%', maxWidth: 480, maxHeight: '92%',
    backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalCloseBtn: {
    position: 'absolute', top: 12, right: 14, zIndex: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    alignItems: 'center', justifyContent: 'center',
  },

  contactModalHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, paddingRight: 52,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  contactModalHeaderLeft: { flex: 1 },
  contactModalTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  contactModalSub: { fontSize: 12, color: '#64748b', marginTop: 2 },

  modalProductImage: {
    width: '100%', height: 220, backgroundColor: '#dcfce7',
  },
  modalProductImageFallback: {
    width: '100%', height: 220, backgroundColor: '#f0fdf4',
    alignItems: 'center', justifyContent: 'center',
  },

  modalProductInfo: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 0,
  },
  modalTitlePriceRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 10, marginTop: 4,
  },
  modalProductTitle: {
    flex: 1, fontSize: 20, fontWeight: '900', color: '#0f172a', lineHeight: 26,
  },
  modalPriceBadge: {
    backgroundColor: '#fff7ed', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#fed7aa',
  },
  modalPriceText: { fontSize: 16, fontWeight: '900', color: '#ea580c' },

  modalMetaChipsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10,
  },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  metaChipText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },

  modalDivider: {
    height: 1, backgroundColor: '#f1f5f9', marginVertical: 14,
  },

  modalDescSection: { marginBottom: 12 },
  modalSectionLabel: {
    fontSize: 12, fontWeight: '800', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  modalDescText: {
    fontSize: 14, color: '#334155', lineHeight: 21,
  },

  modalInfoGrid: { gap: 8, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  infoIconWrap: {
    width: 22, height: 22, borderRadius: 6,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', fontWeight: '700', flex: 1 },

  modalBuyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#ea580c', borderRadius: 14,
    paddingVertical: 15, marginTop: 4,
  },
  modalBuyBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  modalEmptyBox: { alignItems: 'center', padding: 24, gap: 8 },
  modalEmptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },

  detailContactCard: {
    marginHorizontal: 12, marginBottom: 10, borderRadius: 16,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', padding: 16,
  },
  detailContactTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  detailBadgeSell: {
    backgroundColor: '#dc2626', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  detailBadgeBuy: {
    backgroundColor: '#16a34a', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  detailBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  detailTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailTimeText: { fontSize: 12, color: '#94a3b8' },
  detailContactInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  detailContactName: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  detailContactCrop: { fontSize: 13, color: '#64748b', marginTop: 3 },
  detailContactPriceLabel: { fontSize: 12, color: '#64748b' },
  detailContactPrice: { fontSize: 26, fontWeight: '900', color: '#16a34a' },
  detailContactQty: { fontSize: 12, color: '#64748b', marginTop: 2 },
  detailCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, marginBottom: 14,
  },
  detailCallBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  priceFeedbackRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  priceFeedbackLabel: { fontSize: 13, color: '#475569', fontWeight: '600' },
  priceFeedbackBtns: { flexDirection: 'row', gap: 10 },
  thumbBtn: {
    flexDirection: 'column', alignItems: 'center', gap: 3,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f1f5f9', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  thumbBtnDisabled: { opacity: 0.55 },
  thumbBtnActiveUp: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  thumbBtnActiveDown: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  thumbLabel: { fontSize: 10, fontWeight: '700', color: '#334155' },

  thankyouRow: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 12,
  },
  thankyouText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
    textAlign: 'center',
  },
  topToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  topToastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

const bfStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, paddingRight: 52,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 16 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc', paddingVertical: 14,
  },
  toggleBtnActiveBuy: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  toggleBtnActiveSell: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  toggleBtnText: { fontSize: 15, fontWeight: '800', color: '#475569' },
  thumbWrap: { position: 'relative', width: 80, height: 80 },
  thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#dcfce7' },
  thumbRemove: { position: 'absolute', top: -6, right: -6 },

  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  confirmBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
  confirmText: { fontSize: 15, color: '#0f172a', fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  confirmBtns: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  confirmOkBtn: { backgroundColor: '#3b82f6', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  confirmOkText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  confirmCancelBtn: { backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  confirmCancelText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  successBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380 },
  successClose: { alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 18 },
  successRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  successRowIcon: { fontSize: 22 },
  successRowText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 20, fontWeight: '600' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 15, marginTop: 8 },
  shareBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  illustrationWrap: { alignItems: 'center', marginTop: 20 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 2,
  },
  input: { flex: 1, fontSize: 15, color: '#0f172a', paddingVertical: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkLabel: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '600', lineHeight: 18 },
  mediaPicker: {
    borderWidth: 2, borderColor: '#16a34a', borderStyle: 'dashed',
    borderRadius: 16, height: 160, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0fdf4', gap: 10,
  },
  mediaPickerText: {
    fontSize: 14, color: '#16a34a', fontWeight: '700',
    textAlign: 'center', lineHeight: 22,
  },
  mediaTip: {
    backgroundColor: '#ef4444', borderRadius: 10, padding: 12, marginTop: 10,
  },
  mediaTipText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  saveBtn: {
    backgroundColor: '#334155', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
