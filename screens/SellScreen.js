import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserStore } from '../store/UserStore';

const FARMING_SECTORS = [
  'Crops',
  'Farm Supplies',
  'Machinery',
  'Equipment',
  'Livestock',
  'Dairy',
  'Fruits & Vegetables',
  'Ready Crop (कटी फसल)',
  'Farm Help Service',
  'Storage',
  'Transport',
  'Other',
];

// ─── Mobile Layout ────────────────────────────────────────────────────────────

function FarmingSellMobile({ navigation }) {
  const insets = useSafeAreaInsets();

  const [sectorOpen, setSectorOpen] = useState(false);
  const [sector, setSector] = useState('');
  const [whatSelling, setWhatSelling] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [contact, setContact] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [saving, setSaving] = useState(false);

  const openMediaPicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access your media is required.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0] || result;
    if (asset?.uri) {
      setMediaUri(asset.uri);
      setMediaType(asset.type || (asset.uri.endsWith('.mp4') ? 'video' : 'image'));
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!sector || !whatSelling) {
      Alert.alert('Missing Fields', 'Please fill Farming Sector and What are you selling.');
      return;
    }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user?.email) {
      setSaving(false);
      Alert.alert('Login required', 'Please login again to upload your listing.');
      return;
    }

    const listing = {
      id: `sell-${Date.now()}`,
      type: 'farming_sell',
      title: whatSelling.trim() || 'Farming Sell Listing',
      sector,
      description: description.trim(),
      quantity: quantity.trim(),
      price: price.trim(),
      city: city.trim(),
      contact: contact.trim(),
      mediaType,
      mediaUri,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
      createdBy: user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedUser = await UserStore.updateUser(user.email, {
      news: [...(user.news || []), listing],
    });

    setSaving(false);
    if (!updatedUser) {
      Alert.alert('Upload failed', 'Unable to save your listing. Please try again.');
      return;
    }

    Alert.alert('Uploaded', 'Your listing has been uploaded successfully.');
    setSector('');
    setWhatSelling('');
    setQuantity('');
    setPrice('');
    setDescription('');
    setCity('');
    setContact('');
    setMediaUri('');
    setMediaType('');
    navigation.navigate('News Feed');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

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
          <Text style={styles.headerSub}>Farming (buy / sell)</Text>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.formContainer, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >

        {/* Farming Sector */}
        <Text style={styles.fieldLabel}>Farming Sector<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setSectorOpen(!sectorOpen)}
          activeOpacity={0.8}
        >
          <Text style={sector ? styles.selectValue : styles.selectPlaceholder}>
            {sector || 'Select Farming Sector'}
          </Text>
          <Ionicons name={sectorOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* Dropdown */}
        {sectorOpen && (
          <View style={styles.dropdown}>
            {FARMING_SECTORS.map((s) => (
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
          placeholder="e.g. Paddy seeds, tractor, fresh tomatoes"
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
        {mediaUri ? (
          <View style={styles.mediaPreview}>
            {mediaType === 'video' ? (
              <Text style={styles.mediaPreviewText}>Video selected</Text>
            ) : (
              <Text style={styles.mediaPreviewText}>Image selected</Text>
            )}
            <Text style={styles.mediaPreviewUri} numberOfLines={1}>{mediaUri}</Text>
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
        <TextInput
          style={styles.inputBox}
          placeholder="Enter your city or locality"
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
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        {/* Bottom Submit */}
        <TouchableOpacity style={styles.submitBtnFull} onPress={handleSubmit} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.submitBtnFullText}>Submit Listing</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─── Web Layout ───────────────────────────────────────────────────────────────

function FarmingSellWeb({ navigation }) {
  const [sectorOpen, setSectorOpen] = useState(false);
  const [sector, setSector] = useState('');
  const [whatSelling, setWhatSelling] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [contact, setContact] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [saving, setSaving] = useState(false);

  const openMediaPicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access your media is required.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0] || result;
    if (asset?.uri) {
      setMediaUri(asset.uri);
      setMediaType(asset.type || (asset.uri.endsWith('.mp4') ? 'video' : 'image'));
    }
  };

  React.useEffect(() => {
    const id = 'fsell-web-styles';
    if (document.getElementById(id)) return;
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
      .fs-sidebar { width: 220px; background: #fff; border-right: 1px solid rgba(0,0,0,0.07); padding: 24px 16px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
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
    `;
    document.head.appendChild(el);
  }, []);

  const handleSubmit = async () => {
    if (saving) return;
    if (!sector || !whatSelling) {
      alert('Please fill Farming Sector and What are you selling.');
      return;
    }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user?.email) {
      setSaving(false);
      alert('Please login again to upload your listing.');
      return;
    }

    const listing = {
      id: `sell-${Date.now()}`,
      type: 'farming_sell',
      title: whatSelling.trim() || 'Farming Sell Listing',
      sector,
      description: description.trim(),
      quantity: quantity.trim(),
      price: price.trim(),
      city: city.trim(),
      contact: contact.trim(),
      mediaType,
      mediaUri,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
      createdBy: user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedUser = await UserStore.updateUser(user.email, {
      news: [...(user.news || []), listing],
    });
    setSaving(false);

    if (!updatedUser) {
      alert('Unable to save your listing. Please try again.');
      return;
    }

    alert('Your listing has been uploaded successfully!');
    setSector('');
    setWhatSelling('');
    setQuantity('');
    setPrice('');
    setDescription('');
    setCity('');
    setContact('');
    setMediaUri('');
    setMediaType('');
    navigation.navigate('News Feed');
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
        {/* Sidebar */}
        <aside className="fs-sidebar">
          <div className="fs-sidebar-title">Farming</div>
          {['Sell', 'Give on rent', 'Buy', 'Take on rent'].map((item) => (
            <div
              key={item}
              className={`fs-sidebar-item${item === 'Sell' ? ' active' : ''}`}
            >
              <span style={{ fontSize: 16 }}>
                {item === 'Sell' ? '🌾' : item === 'Give on rent' ? '⬆️' : item === 'Buy' ? '🛒' : '⬇️'}
              </span>
              {item}
            </div>
          ))}
        </aside>

        {/* Main Form */}
        <main className="fs-main">
          <div className="fs-form-wrap">
            <div className="fs-page-title">Sell</div>
            <div className="fs-page-sub">Farming (buy / sell) — List your produce or equipment for sale</div>

            {/* Farming Sector */}
            <div className="fs-field">
              <label className="fs-label">Farming Sector <span className="fs-required">*</span></label>
              <div className="fs-select-wrap">
                <button
                  className={`fs-select-btn${sectorOpen ? ' open' : ''}`}
                  onClick={() => setSectorOpen(!sectorOpen)}
                  type="button"
                >
                  <span className={sector ? '' : 'fs-select-placeholder'}>
                    {sector || 'Select Farming Sector'}
                  </span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{sectorOpen ? '▲' : '▼'}</span>
                </button>
                {sectorOpen && (
                  <div className="fs-dropdown">
                    {FARMING_SECTORS.map((s, i) => (
                      <div key={s}>
                        <div
                          className={`fs-dropdown-item${sector === s ? ' selected' : ''}`}
                          onClick={() => { setSector(s); setSectorOpen(false); }}
                        >
                          {s}
                          {sector === s && <span>✓</span>}
                        </div>
                        {i < FARMING_SECTORS.length - 1 && <div className="fs-dropdown-divider" />}
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
                placeholder="e.g. Paddy seeds, tractor, fresh tomatoes"
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
              {mediaUri ? (
                <div style={{ marginTop: 10, maxWidth: 320, color: '#334155', fontSize: 13 }}>
                  <div style={{ marginBottom: 10 }}>
                    {mediaType === 'video' ? (
                      <video
                        src={mediaUri}
                        controls
                        style={{ width: '100%', borderRadius: 12, maxHeight: 240, objectFit: 'cover', background: '#000' }}
                      />
                    ) : (
                      <img
                        src={mediaUri}
                        alt="Selected media"
                        style={{ width: '100%', borderRadius: 12, objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {mediaType === 'video' ? 'Video selected' : 'Image selected'}
                  </div>
                  <div style={{ wordBreak: 'break-all', color: '#64748b', fontSize: 13 }}>{mediaUri}</div>
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
              <input
                className="fs-input"
                placeholder="Enter your city or locality"
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
                onChange={(e) => setContact(e.target.value)}
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

export default function FarmingSellScreen({ navigation }) {
  if (Platform.OS === 'web') return <FarmingSellWeb navigation={navigation} />;
  return <FarmingSellMobile navigation={navigation} />;
}

// ─── Styles (Mobile) ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

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

  formContainer: { paddingHorizontal: 18, paddingTop: 22 },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 18,
  },
  required: { color: '#ea580c' },

  // Select / Dropdown
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

  // Inputs
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 13,
  },

  // Media
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
  mediaPreviewText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 4,
  },
  mediaPreviewUri: {
    fontSize: 12,
    color: '#64748b',
  },

  // Bottom submit
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