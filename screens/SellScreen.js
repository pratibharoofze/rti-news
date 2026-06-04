import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserStore } from '../store/UserStore';
import { useToast } from '../components/ui/ToastProvider';
import { getDistricts } from '../pages/locationData';
import { storeWebUriToIdbMedia } from '../utils/webMediaStore';

const ECOME_SECTORS = [
  'Electronics',
  'Mobiles & Tablets',
  'Computers & Laptops',
  'Home Appliances',
  'Furniture',
  'Fashion',
  'Vehicles',
  'Books & Stationery',
  'Sports & Fitness',
  'Tools & Equipment',
  'Services',
  'Other',
];

const ECOME_CREDIT_PLANS = [
  { plan_id: 'ecome-starter-monthly', plan_name: 'Starter', price: 499, credits: 10, duration: '30 Days', validity_days: 30 },
  { plan_id: 'ecome-growth-monthly', plan_name: 'Growth', price: 899, credits: 25, duration: '30 Days', validity_days: 30 },
  { plan_id: 'ecome-power-monthly', plan_name: 'Power', price: 1499, credits: 50, duration: '30 Days', validity_days: 30 },
];

const getAssetMimeType = (asset = {}) => {
  const mimeType = String(asset.mimeType || '').trim();
  if (mimeType) return mimeType;
  const uri = String(asset.uri || '').toLowerCase();
  if (uri.endsWith('.png')) return 'image/png';
  if (uri.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const getPersistentMediaUri = (asset = {}) => {
  const type = String(asset.type || '').toLowerCase();
  if (type !== 'video' && asset.base64) {
    return `data:${getAssetMimeType(asset)};base64,${asset.base64}`;
  }
  return asset.uri || '';
};

const getMediaItemFromAsset = async (asset = {}) => {
  const rawUri = getPersistentMediaUri(asset);
  const type = String(asset.type || (String(asset.uri || '').toLowerCase().endsWith('.mp4') ? 'video' : 'image')).trim();
  const storedUri = Platform.OS === 'web'
    ? await storeWebUriToIdbMedia(rawUri, {
        prefix: type === 'video' ? 'ecome-video' : 'ecome-image',
        mimeType: asset.mimeType || '',
      })
    : rawUri;
  const uri = Platform.OS === 'web' && storedUri === rawUri && /^data:/i.test(rawUri)
    ? ''
    : storedUri;
  return {
    uri,
    previewUri: Platform.OS === 'web' ? rawUri : '',
    type,
  };
};

const getMediaItemsFromPickerResult = async (result = {}) => {
  const assets = Array.isArray(result.selected)
    ? result.selected
    : Array.isArray(result.assets)
      ? result.assets
      : [result];
  const mediaAssets = (assets || [])
    .filter((asset) => asset && asset.uri)
    .slice(0, 6);
  return Promise.all(mediaAssets.map(getMediaItemFromAsset));
};

const normalizeIndianMobileNumber = (value = '') => {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
};

const isValidIndianMobileNumber = (value = '') => /^[6-9]\d{9}$/.test(normalizeIndianMobileNumber(value));

const getProfileLocationText = (user = {}) => {
  const parts = [user.taluka, user.district, user.state]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
};

const getCityChoices = (user = {}) => {
  const choices = [
    getProfileLocationText(user),
    user.taluka,
    user.district,
    ...getDistricts(user.state || ''),
  ];
  return Array.from(new Set(choices.map((value) => String(value || '').trim()).filter(Boolean)));
};

// ─── Mobile Layout ────────────────────────────────────────────────────────────

function EcomeSellMobile({ navigation }) {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [sectorOpen, setSectorOpen] = useState(false);
  const [sector, setSector] = useState('');
  const [whatSelling, setWhatSelling] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [cityChoices, setCityChoices] = useState([]);
  const [contact, setContact] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState(0);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);

  React.useEffect(() => {
    let alive = true;
    const loadSummary = async () => {
      const summary = await UserStore.getEcomeMarketplaceSummary();
      if (alive) {
        setCredits(summary.credits || 0);
        const locationChoices = getCityChoices(summary.currentUser || {});
        setCityChoices(locationChoices);
        if (!city && locationChoices[0]) setCity(locationChoices[0]);
        if (summary.expired) {
          setSubscriptionExpired(true);
          setShowSubscriptionAlert(true);
        }
      }
    };
    loadSummary();
    return () => { alive = false; };
  }, []);

  const handleBuyPlan = async (plan) => {
    const result = await UserStore.buyEcomeCredits(plan);
    if (result.ok) {
      setCredits(result.credits || 0);
      showToast(`${plan.credits} ecome credits added for 30 days. Total: ${result.credits}`, 'success');
    } else {
      showToast(result.message || 'Unable to buy credits.', 'error');
    }
  };

  const openMediaPicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access your media is required.', 'error');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.7,
      base64: Platform.OS !== 'web',
      allowsMultipleSelection: true,
    });

    if (result.canceled) return;
    const items = await getMediaItemsFromPickerResult(result);
    if (!items.length) return;
    setMediaItems((prev) => {
      const next = [...prev, ...items].slice(0, 6);
      setMediaUri(next[0]?.uri || '');
      setMediaType(next[0]?.type || '');
      return next;
    });
  };

  const removeMediaItem = (index) => {
    setMediaItems((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      setMediaUri(next[0]?.uri || '');
      setMediaType(next[0]?.type || '');
      return next;
    });
  };

  const handleSubmit = async () => {
    if (saving) return;

    // Check if subscription is expired
    if (subscriptionExpired) {
      showToast('Your subscription has expired. Please buy a new plan to continue selling.', 'error');
      return;
    }

    if (!sector || !whatSelling) {
      showToast('Please fill Category and What are you selling.', 'error');
      return;
    }
    if (!mediaItems.length) {
      showToast('Please upload at least one product image.', 'error');
      return;
    }
    if (contact.trim() && !isValidIndianMobileNumber(contact)) {
      showToast('Please enter a valid 10 digit contact number.', 'error');
      return;
    }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user?.email) {
      setSaving(false);
      showToast('Please login again to upload your listing.', 'error');
      return;
    }

    const listing = {
      id: `sell-${Date.now()}`,
      type: 'ecome_sell',
      title: whatSelling.trim() || 'Ecome Sell Listing',
      sector,
      description: description.trim(),
      quantity: quantity.trim(),
      price: price.trim(),
      city: city.trim(),
      contact: normalizeIndianMobileNumber(contact),
      mediaItems,
      mediaType,
      mediaUri,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
      createdBy: user.email,
    };

    const result = await UserStore.createEcomeListing(listing);
    setSaving(false);
    if (!result.ok) {
      showToast(result.message || 'Unable to save your listing. Please try again.', 'error');
      return;
    }

    setCredits(result.credits || 0);
    showToast('Your listing has been uploaded successfully and is visible on Buy page.', 'success');
    setSector('');
    setWhatSelling('');
    setQuantity('');
    setPrice('');
    setDescription('');
    setCity('');
    setContact('');
    setMediaItems([]);
    setMediaUri('');
    setMediaType('');
    navigation.navigate('Ecome');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      {/* Subscription Expired Alert */}
      {showSubscriptionAlert && (
        <View style={styles.alertBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Subscription Expired</Text>
              <Text style={styles.alertSub}>Buy a new plan to list products</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSubscriptionAlert(false)}>
              <Ionicons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#334155" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Sell</Text>
          <Text style={styles.headerSub}>Ecome (buy / sell)</Text>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.formContainer, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >

        {/* Credits Card */}
        <View style={styles.creditCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.creditTitle}>Monthly E-Commerce Subscription</Text>
            <Text style={styles.creditSub}>{credits} credits available · 30 days validity · 1 credit per product listing</Text>
          </View>
        </View>
        <View style={styles.planRow}>
          {ECOME_CREDIT_PLANS.map((plan) => (
            <TouchableOpacity key={plan.plan_id} style={styles.planCard} onPress={() => handleBuyPlan(plan)} activeOpacity={0.85}>
              <Text style={styles.planPrice}>₹{plan.price}</Text>
              <Text style={styles.planCredits}>{plan.plan_name} · {plan.credits} listings</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.fieldLabel}>Category<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setSectorOpen(!sectorOpen)}
          activeOpacity={0.8}
        >
          <Text style={sector ? styles.selectValue : styles.selectPlaceholder}>
            {sector || 'Select Category'}
          </Text>
          <Ionicons name={sectorOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Dropdown */}
        {sectorOpen && (
          <View style={styles.dropdown}>
            {ECOME_SECTORS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.dropdownItem, sector === s && styles.dropdownItemActive]}
                onPress={() => { setSector(s); setSectorOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, sector === s && styles.dropdownItemTextActive]}>
                  {s}
                </Text>
                {sector === s && <Ionicons name="checkmark" size={16} color="#ea580c" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* What are you selling */}
        <Text style={styles.fieldLabel}>What are you selling?<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. Laptop, mobile, sofa, washing machine"
          placeholderTextColor="#b0b8c4"
          value={whatSelling}
          onChangeText={setWhatSelling}
          multiline
        />

        {/* Quantity */}
        <Text style={styles.fieldLabel}>Quantity Available</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. 100 kg, 1 machine, 2 cows"
          placeholderTextColor="#b0b8c4"
          value={quantity}
          onChangeText={setQuantity}
        />

        {/* Price */}
        <Text style={styles.fieldLabel}>Price (₹)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter price amount"
          placeholderTextColor="#b0b8c4"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Media */}
        <Text style={styles.fieldLabel}>Media<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.mediaBtn} onPress={openMediaPicker} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={30} color="#64748b" />
          <Text style={styles.mediaBtnText}>Media</Text>
        </TouchableOpacity>
        {mediaItems.length > 0 ? (
          <View style={styles.mediaPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaThumbRow}>
              {mediaItems.map((item, index) => (
                <View key={`${item.uri}-${index}`} style={styles.mediaThumbWrap}>
                  {item.type === 'video' ? (
                    <View style={styles.mediaVideoThumb}>
                      <Ionicons name="videocam-outline" size={20} color="#64748b" />
                    </View>
                  ) : (
                    <Image source={{ uri: item.previewUri || item.uri }} style={styles.mediaThumb} resizeMode="cover" />
                  )}
                  <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMediaItem(index)} activeOpacity={0.7}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.mediaPreviewText}>{mediaItems.length} media item{mediaItems.length !== 1 ? 's' : ''} selected</Text>
          </View>
        ) : null}

        {/* Description */}
        <Text style={styles.fieldLabel}>Description<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.inputBox, styles.textArea]}
          placeholder="Add more detail"
          placeholderTextColor="#b0b8c4"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* City / Locality */}
        <Text style={styles.fieldLabel}>City / Locality</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setCityOpen(!cityOpen)}
          activeOpacity={0.8}
        >
          <Text style={city ? styles.selectValue : styles.selectPlaceholder}>
            {city || 'Use profile location or choose city'}
          </Text>
          <Ionicons name={cityOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
        </TouchableOpacity>
        {cityOpen && (
          <View style={styles.dropdown}>
            {cityChoices.length > 0 ? cityChoices.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.dropdownItem, city === item && styles.dropdownItemActive]}
                onPress={() => { setCity(item); setCityOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, city === item && styles.dropdownItemTextActive]}>
                  {item}
                </Text>
                {city === item && <Ionicons name="checkmark" size={16} color="#ea580c" />}
              </TouchableOpacity>
            )) : (
              <View style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>No saved location found</Text>
              </View>
            )}
          </View>
        )}
        <TextInput
          style={[styles.inputBox, styles.cityInput]}
          placeholder="Or type city/locality"
          placeholderTextColor="#b0b8c4"
          value={city}
          onChangeText={setCity}
        />

        {/* Contact */}
        <Text style={styles.fieldLabel}>Contact</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter your contact number"
          placeholderTextColor="#b0b8c4"
          value={contact}
          onChangeText={(value) => setContact(normalizeIndianMobileNumber(value))}
          keyboardType="phone-pad"
          maxLength={10}
        />

        {/* Bottom Submit */}
        <TouchableOpacity style={styles.submitBtnFull} onPress={handleSubmit} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.submitBtnFullText}>Submit Listing</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Web Layout ───────────────────────────────────────────────────────────────

function EcomeSellWeb({ navigation }) {
  const { showToast } = useToast();
  const [sectorOpen, setSectorOpen] = useState(false);
  const [sector, setSector] = useState('');
  const [whatSelling, setWhatSelling] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [cityChoices, setCityChoices] = useState([]);
  const [contact, setContact] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState(0);

  const openMediaPicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access your media is required.', 'error');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.7,
      base64: Platform.OS !== 'web',
      allowsMultipleSelection: true,
    });

    if (result.canceled) return;
    const items = await getMediaItemsFromPickerResult(result);
    if (!items.length) return;
    setMediaItems((prev) => {
      const next = [...prev, ...items].slice(0, 6);
      setMediaUri(next[0]?.uri || '');
      setMediaType(next[0]?.type || '');
      return next;
    });
  };

  const removeMediaItem = (index) => {
    setMediaItems((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      setMediaUri(next[0]?.uri || '');
      setMediaType(next[0]?.type || '');
      return next;
    });
  };

  // ─── Inject CSS ───────────────────────────────────────────────────────────────
  if (typeof document !== 'undefined') {
    const id = 'esell-web-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #f5f4f0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .fs-root { display: flex; flex-direction: column; height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
        .fs-topbar { height: 60px; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.07); display: flex; align-items: center; padding: 0 24px; gap: 14px; flex-shrink: 0; }
        .fs-logo { font-family: 'Instrument Serif', serif; font-size: 20px; color: #1e293b; flex: 1; }
        .fs-logo span { color: #94a3b8; }
        .fs-topbar-back { background: none; border: 1px solid #e2e8f0; border-radius: 9px; padding: 7px 16px; font-size: 13px; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
        .fs-topbar-back:hover { background: #f8fafc; }
        .fs-topbar-submit { background: #ea580c; border: none; border-radius: 10px; padding: 9px 22px; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s, transform 0.1s; }
        .fs-topbar-submit:hover { background: #c2410c; }
        .fs-topbar-submit:active { transform: scale(0.97); }
        .fs-body { flex: 1; display: flex; overflow: hidden; }
        .fs-sidebar { display: none; }
        .fs-sidebar-title { font-size: 10px; font-weight: 600; letter-spacing: 1.3px; text-transform: uppercase; color: #cbd5e1; margin-bottom: 8px; margin-top: 8px; }
        .fs-sidebar-item { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 9px; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; transition: background 0.15s; }
        .fs-sidebar-item:hover { background: #f1f5f9; color: #1e293b; }
        .fs-sidebar-item.active { background: #fff7ed; color: #ea580c; }
        .fs-main { flex: 1; overflow-y: auto; padding: 36px; display: flex; justify-content: center; }
        .fs-form-wrap { width: 100%; max-width: 620px; }
        .fs-page-title { font-family: 'Instrument Serif', serif; font-size: 28px; color: #1e293b; margin-bottom: 4px; }
        .fs-page-sub { font-size: 13px; color: #94a3b8; margin-bottom: 32px; }
        .fs-field { margin-bottom: 22px; }
        .fs-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 7px; display: block; }
        .fs-required { color: #ea580c; }
        .fs-input { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 13px 16px; font-size: 14px; color: #1e293b; font-family: 'DM Sans', sans-serif; background: #fff; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
        .fs-input:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234,88,12,0.08); }
        .fs-input::placeholder { color: #b0b8c4; }
        .fs-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
        .fs-select-wrap { position: relative; }
        .fs-select-btn { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 13px 16px; font-size: 14px; color: #1e293b; font-family: 'DM Sans', sans-serif; background: #fff; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: border-color 0.18s, box-shadow 0.18s; }
        .fs-select-btn:hover { border-color: #cbd5e1; }
        .fs-select-btn.open { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234,88,12,0.08); }
        .fs-select-placeholder { color: #b0b8c4; }
        .fs-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px; z-index: 100; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden; max-height: 340px; overflow-y: auto; }
        .fs-dropdown-item { padding: 13px 18px; font-size: 14px; color: #334155; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.12s; font-family: 'DM Sans', sans-serif; }
        .fs-dropdown-item:hover { background: #fff7ed; color: #ea580c; }
        .fs-dropdown-item.selected { color: #ea580c; font-weight: 600; background: #fff7ed; }
        .fs-dropdown-divider { height: 1px; background: #f1f5f9; margin: 0; }
        .fs-media-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1.5px dashed #cbd5e1; border-radius: 14px; padding: 24px 20px; cursor: pointer; background: #f8fafc; transition: border-color 0.18s, background 0.18s; width: 110px; }
        .fs-media-btn:hover { border-color: #ea580c; background: #fff7ed; }
        .fs-media-icon { font-size: 28px; color: #94a3b8; }
        .fs-media-label { font-size: 13px; font-weight: 600; color: #64748b; }
        .fs-submit-full { width: 100%; background: #ea580c; border: none; border-radius: 14px; padding: 16px; font-size: 15px; font-weight: 700; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; }
        .fs-submit-full:hover { background: #c2410c; box-shadow: 0 4px 16px rgba(234,88,12,0.25); }
        .fs-submit-full:active { transform: scale(0.98); }
        @media (max-width: 720px) {
          html, body, #root { min-height: 100%; overflow-x: hidden; }
          .fs-root { height: 100vh; min-height: 100vh; }
          .fs-topbar { height: 58px; padding: 0 12px; gap: 8px; }
          .fs-logo { font-size: 17px; min-width: 0; }
          .fs-topbar-back { padding: 7px 10px; font-size: 12px; white-space: nowrap; }
          .fs-topbar-submit { padding: 9px 14px; font-size: 13px; }
          .fs-body { display: block; overflow-y: auto; -webkit-overflow-scrolling: touch; }
          .fs-sidebar { display: none; }
          .fs-main { display: block; padding: 22px 14px 34px; overflow: visible; }
          .fs-form-wrap { width: 100%; max-width: none; }
          .fs-page-title { font-size: 25px; }
          .fs-page-sub { font-size: 12px; margin-bottom: 18px; max-width: 260px; line-height: 17px; }
          .fs-field { margin-bottom: 18px; }
          .fs-input, .fs-select-btn { font-size: 14px; padding: 12px 13px; }
          .fs-dropdown { position: relative; top: auto; margin-top: 6px; max-height: 260px; }
          .fs-media-btn { width: 100%; min-height: 86px; }
        }
      `;
      document.head.appendChild(el);
    }
  }

  React.useEffect(() => {
    let alive = true;
    UserStore.getEcomeMarketplaceSummary().then((summary) => {
      if (!alive) return;
      setCredits(summary.credits || 0);
      const locationChoices = getCityChoices(summary.currentUser || {});
      setCityChoices(locationChoices);
      if (!city && locationChoices[0]) setCity(locationChoices[0]);
    });
    return () => { alive = false; };
  }, []);

  const handleBuyPlan = async (plan) => {
    const result = await UserStore.buyEcomeCredits(plan);
    if (result.ok) {
      setCredits(result.credits || 0);
      showToast(`${plan.credits} ecome credits added for 30 days. Total: ${result.credits}`, 'success');
    } else {
      showToast(result.message || 'Unable to buy credits.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!sector || !whatSelling) {
      showToast('Please fill Category and What are you selling.', 'error');
      return;
    }
    if (!mediaItems.length) {
      showToast('Please upload at least one product image.', 'error');
      return;
    }
    if (contact.trim() && !isValidIndianMobileNumber(contact)) {
      showToast('Please enter a valid 10 digit contact number.', 'error');
      return;
    }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user?.email) {
      setSaving(false);
      showToast('Please login again to upload your listing.', 'error');
      return;
    }

    const listing = {
      id: `sell-${Date.now()}`,
      type: 'ecome_sell',
      title: whatSelling.trim() || 'Ecome Sell Listing',
      sector,
      description: description.trim(),
      quantity: quantity.trim(),
      price: price.trim(),
      city: city.trim(),
      contact: normalizeIndianMobileNumber(contact),
      mediaItems,
      mediaType,
      mediaUri,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
      createdBy: user.email,
    };

    const result = await UserStore.createEcomeListing(listing);
    setSaving(false);

    if (!result.ok) {
      showToast(result.message || 'Unable to save your listing. Please try again.', 'error');
      return;
    }

    setCredits(result.credits || 0);
    showToast('Your listing has been uploaded successfully and is visible on Buy page.', 'success');
    setSector('');
    setWhatSelling('');
    setQuantity('');
    setPrice('');
    setDescription('');
    setCity('');
    setContact('');
    setMediaItems([]);
    setMediaUri('');
    setMediaType('');
    navigation.navigate('Ecome');
  };

  return (
    <div className="fs-root">
      {/* Topbar */}
      <div className="fs-topbar">
        <div className="fs-logo">News<span>Hub</span></div>
        <button className="fs-topbar-back" onClick={() => navigation.goBack()}>
          ← Back
        </button>
        <button className="fs-topbar-submit" onClick={handleSubmit}>Submit</button>
      </div>

      <div className="fs-body">
        {/* Main Form */}
        <main className="fs-main">
          <div className="fs-form-wrap">
            <div className="fs-page-title">Sell</div>
            <div className="fs-page-sub">Ecome (buy / sell) — List your product for sale</div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 18 }}>
              <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>Monthly E-Commerce Subscription</div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{credits} credits available · 30 days validity · 1 credit per product listing</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {ECOME_CREDIT_PLANS.map((plan) => (
                  <button
                    key={plan.plan_id}
                    type="button"
                    onClick={() => handleBuyPlan(plan)}
                    style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontWeight: 800, color: '#ea580c' }}
                  >
                    ₹{plan.price} → {plan.plan_name} · {plan.credits} listings
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="fs-field">
              <label className="fs-label">Category <span className="fs-required">*</span></label>
              <div className="fs-select-wrap">
                <button
                  className={`fs-select-btn${sectorOpen ? ' open' : ''}`}
                  onClick={() => setSectorOpen(!sectorOpen)}
                  type="button"
                >
                  <span className={sector ? '' : 'fs-select-placeholder'}>
                    {sector || 'Select Category'}
                  </span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{sectorOpen ? '▲' : '▼'}</span>
                </button>
                {sectorOpen && (
                  <div className="fs-dropdown">
                    {ECOME_SECTORS.map((s, i) => (
                      <div key={s}>
                        <div
                          className={`fs-dropdown-item${sector === s ? ' selected' : ''}`}
                          onClick={() => { setSector(s); setSectorOpen(false); }}
                        >
                          {s}
                          {sector === s && <span>✓</span>}
                        </div>
                        {i < ECOME_SECTORS.length - 1 && <div className="fs-dropdown-divider" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* What are you selling */}
            <div className="fs-field">
              <label className="fs-label">What are you selling? <span className="fs-required">*</span></label>
              <input
                className="fs-input"
                placeholder="e.g. Laptop, mobile, sofa, washing machine"
                value={whatSelling}
                onChange={(e) => setWhatSelling(e.target.value)}
              />
            </div>

            {/* Quantity */}
            <div className="fs-field">
              <label className="fs-label">Quantity Available</label>
              <input
                className="fs-input"
                placeholder="e.g. 100 kg, 1 machine, 2 cows"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="fs-field">
              <label className="fs-label">Price (₹)</label>
              <input
                className="fs-input"
                type="number"
                placeholder="Enter price amount"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Media */}
            <div className="fs-field">
              <label className="fs-label">Media <span className="fs-required">*</span></label>
              <button className="fs-media-btn" onClick={openMediaPicker} type="button">
                <span className="fs-media-icon">📷</span>
                <span className="fs-media-label">Media</span>
              </button>
              {mediaItems.length > 0 ? (
                <div style={{ marginTop: 10, maxWidth: '100%', color: '#334155', fontSize: 13, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 10 }}>
                    {mediaItems.map((item, index) => (
                      <div key={`${item.uri}-${index}`} style={{ position: 'relative', minWidth: 110, minHeight: 110, borderRadius: 12, overflow: 'hidden', background: '#e2e8f0' }}>
                        {item.type === 'video' ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <span style={{ fontSize: 22 }}>🎬</span>
                          </div>
                        ) : (
                          <img
                            src={item.previewUri || item.uri}
                            alt={`Media ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMediaItem(index)}
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 24, height: 24, borderRadius: 12,
                            border: 'none', background: 'rgba(15,23,42,0.8)', color: '#fff', cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {mediaItems.length} media item{mediaItems.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              ) : null}
            </div>

            {/* Description */}
            <div className="fs-field">
              <label className="fs-label">Description <span className="fs-required">*</span></label>
              <textarea
                className="fs-input fs-textarea"
                placeholder="Add more detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* City / Locality */}
            <div className="fs-field">
              <label className="fs-label">City / Locality</label>
              <div className="fs-select-wrap" style={{ marginBottom: 10 }}>
                <button
                  className={`fs-select-btn${cityOpen ? ' open' : ''}`}
                  onClick={() => setCityOpen(!cityOpen)}
                  type="button"
                >
                  <span className={city ? '' : 'fs-select-placeholder'}>
                    {city || 'Use profile location or choose city'}
                  </span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{cityOpen ? '▲' : '▼'}</span>
                </button>
                {cityOpen && (
                  <div className="fs-dropdown">
                    {cityChoices.length > 0 ? cityChoices.map((item, i) => (
                      <div key={item}>
                        <div
                          className={`fs-dropdown-item${city === item ? ' selected' : ''}`}
                          onClick={() => { setCity(item); setCityOpen(false); }}
                        >
                          {item}
                          {city === item && <span>✓</span>}
                        </div>
                        {i < cityChoices.length - 1 && <div className="fs-dropdown-divider" />}
                      </div>
                    )) : (
                      <div className="fs-dropdown-item">No saved location found</div>
                    )}
                  </div>
                )}
              </div>
              <input
                className="fs-input"
                placeholder="Or type city/locality"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Contact */}
            <div className="fs-field">
              <label className="fs-label">Contact</label>
              <input
                className="fs-input"
                type="tel"
                placeholder="Enter your contact number"
                value={contact}
                maxLength={10}
                onChange={(e) => setContact(normalizeIndianMobileNumber(e.target.value))}
              />
            </div>

            {/* Submit */}
            <button className="fs-submit-full" onClick={handleSubmit} type="button">
              ✓ &nbsp; Submit Listing
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function EcomeSellScreen({ navigation }) {
  if (Platform.OS === 'web') return <EcomeSellWeb navigation={navigation} />;
  return <EcomeSellMobile navigation={navigation} />;
}

// ─── Styles (Mobile) ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  alertBox: {
    backgroundColor: '#fee2e2',
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#dc2626', marginBottom: 2 },
  alertSub: { fontSize: 12, color: '#991b1b' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
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
  submitBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  formContainer: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 300 },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 18,
  },
  required: { color: '#ea580c' },

  selectBox: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectPlaceholder: { fontSize: 14, color: '#b0b8c4' },
  selectValue: { fontSize: 14, color: '#1e293b', fontWeight: '600' },

  dropdown: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 99,
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemActive: { backgroundColor: '#fff7ed' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
  dropdownItemTextActive: { color: '#ea580c', fontWeight: '600' },

  inputBox: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  cityInput: {
    marginTop: 10,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 13,
  },

  mediaBtn: {
    width: 110,
    height: 90,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  mediaBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  mediaPreview: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mediaThumbRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mediaThumbWrap: {
    width: 92,
    height: 92,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
    marginRight: 10,
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
  },
  mediaVideoThumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#e2e8f0',
  },
  mediaPreviewText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 4,
  },
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 12,
  },
  creditTitle: { fontSize: 15, fontWeight: '800', color: '#9a3412' },
  creditSub: { fontSize: 12, color: '#c2410c', marginTop: 3 },
  planRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  planCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
  },
  planPrice: { fontSize: 14, fontWeight: '900', color: '#ea580c' },
  planCredits: { fontSize: 11, fontWeight: '700', color: '#64748b', marginTop: 2 },

  submitBtnFull: {
    backgroundColor: '#ea580c',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
  },
  submitBtnFullText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
