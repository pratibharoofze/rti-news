import React, { useCallback, useState } from 'react';
import {
  FlatList, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import styles from '../styles/SettingsStyles';
import { UserStore } from '../store/UserStore';
import { INDIAN_STATES, getDistricts, getTalukas } from './locationData'; 

// ── Dropdown Modal (same as Register) ────────────────────────────────────────
function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={dropStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={dropStyles.sheet}>
        <View style={dropStyles.handle} />
        <Text style={dropStyles.title}>{title}</Text>
        <View style={dropStyles.searchWrap}>
          <Ionicons name="search-outline" size={16} color="#2563eb" />
          <TextInput
            style={dropStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[dropStyles.item, selected === item && dropStyles.itemSelected]}
              onPress={() => { onSelect(item); onClose(); setSearch(''); }}
            >
              <Text style={[dropStyles.itemText, selected === item && dropStyles.itemTextSelected]}>
                {item}
              </Text>
              {selected === item && <Ionicons name="checkmark-circle" size={18} color="#2563eb" />}
            </TouchableOpacity>
          )}
          style={{ maxHeight: 340 }}
        />
      </View>
    </Modal>
  );
}

const dropStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36, borderWidth: 1, borderColor: '#e2e8f0',
    elevation: 20,
  },
  handle: { width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 3,
  },
  itemSelected: { backgroundColor: '#eff6ff' },
  itemText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  itemTextSelected: { color: '#2563eb', fontWeight: '700' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
const initialForm = { language: 'English', password: '' };

export default function SettingsScreen({ navigation }) {
  const { showToast } = useToast();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [settingsData, setSettingsData] = useState({ currentUser: null, settings: initialForm });
  const [form, setForm] = useState(initialForm);

  // Location state
  const [locState, setLocState]       = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locTaluka, setLocTaluka]     = useState('');
  const [stateModal, setStateModal]   = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [talukaModal, setTalukaModal] = useState(false);

  const moduleName = 'Settings';

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getSettingsSummary();
    setLoading(false);

    if (!data) { navigation.replace('Login'); return; }

    setSettingsData(data);
    setForm({ language: data.settings.language || 'English', password: '' });

    // Load current location values from user
    const user = data.currentUser;
    setLocState(user?.state || '');
    setLocDistrict(user?.district || '');
    setLocTaluka(user?.taluka || '');
  }, [navigation]);

  useFocusEffect(useCallback(() => { loadSettings(); }, [loadSettings]));

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // State change — reset district and taluka
  const handleStateChange = (val) => {
    setLocState(val);
    setLocDistrict('');
    setLocTaluka('');
  };

  // District change — reset taluka
  const handleDistrictChange = (val) => {
    setLocDistrict(val);
    setLocTaluka('');
  };

  const districtList = locState ? getDistricts(locState) : []; 
  const talukaList   = locDistrict ? getTalukas(locState, locDistrict) : []; 

  const handleSave = async () => {
    if (!form.language.trim()) { showToast('Language is required.', 'error'); return; }
    setSaving(true);
    const result = await UserStore.updateSettings({ language: form.language.trim(), password: form.password });
    setSaving(false);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    showToast('Settings updated successfully.', 'success');
    loadSettings();
  };

  // Save location to user profile
  const handleSaveLocation = async () => { 
    if (!locState) { showToast('Please select your state.', 'error'); return; } 
    if (districtList.length > 0 && !locDistrict) { showToast('Please select your district.', 'error'); return; } 
    if (locDistrict && talukaList.length > 0 && !locTaluka) { showToast('Please select your taluka.', 'error'); return; } 
 
    setSavingLocation(true); 
    const user = settingsData.currentUser;
    const result = await UserStore.updateUser(user.email, {
      state: locState,
      district: locDistrict,
      taluka: locTaluka,
    });
    setSavingLocation(false);

    if (!result) { showToast('Unable to update location.', 'error'); return; }
    showToast('Location updated successfully! ✅', 'success');
    loadSettings();
  };

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const user = settingsData.currentUser;

  return (
    <View style={styles.root}>
      <Header title={moduleName} onMenuPress={() => setSidebarVisible(true)} onLogout={handleLogout} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Live Settings</Text>
          <Text style={styles.heroTitle}>Current User Preferences</Text>
        </View>

        {/* ── Current Settings Summary ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Settings</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Language</Text>
            <Text style={styles.summaryValue}>{settingsData.settings.language}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>State</Text>
            <Text style={styles.summaryValue}>{user?.state || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>District</Text>
            <Text style={styles.summaryValue}>{user?.district || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taluka</Text>
            <Text style={styles.summaryValue}>{user?.taluka || '—'}</Text>
          </View>
        </View>

        {/* ── Location Update Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Location</Text>
          <Text style={[styles.sectionText, { marginBottom: 14 }]}>
            Change your State, District, and Taluka here.
          </Text>

          {/* State */}
          <View style={localStyles.inputGroup}>
            <Text style={localStyles.inputLabel}>State</Text>
            <TouchableOpacity style={localStyles.dropdown} onPress={() => setStateModal(true)} activeOpacity={0.8}>
              <Ionicons name="location-outline" size={18} color="#2563eb" />
              <Text style={[localStyles.dropdownText, !locState && localStyles.placeholder]}>
                {locState || 'Select state'}
              </Text>
              <Ionicons name="chevron-down-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* District */} 
          {districtList.length > 0 && ( 
            <View style={localStyles.inputGroup}> 
              <Text style={localStyles.inputLabel}>District</Text> 
              <TouchableOpacity style={localStyles.dropdown} onPress={() => setDistrictModal(true)} activeOpacity={0.8}> 
                <Ionicons name="business-outline" size={18} color="#2563eb" /> 
                <Text style={[localStyles.dropdownText, !locDistrict && localStyles.placeholder]}> 
                  {locDistrict || 'Select district'} 
                </Text> 
                <Ionicons name="chevron-down-outline" size={18} color="#94a3b8" /> 
              </TouchableOpacity> 
            </View> 
          )} 

          {/* Taluka */}
          {locDistrict !== '' && talukaList.length > 0 && (
            <View style={localStyles.inputGroup}>
              <Text style={localStyles.inputLabel}>Taluka</Text>
              <TouchableOpacity style={localStyles.dropdown} onPress={() => setTalukaModal(true)} activeOpacity={0.8}>
                <Ionicons name="map-outline" size={18} color="#2563eb" />
                <Text style={[localStyles.dropdownText, !locTaluka && localStyles.placeholder]}>
                  {locTaluka || 'Select taluka'}
                </Text>
                <Ionicons name="chevron-down-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#16a34a' }]}
            onPress={handleSaveLocation}
            disabled={savingLocation}
          >
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.saveButtonText}>
              {savingLocation ? 'Saving...' : 'Update Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── General Settings Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Language</Text>
            <TextInput
              style={styles.input}
              value={form.language}
              onChangeText={(text) => handleChange('language', text)}
              placeholder="Enter language"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              placeholder="Enter new password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Feather name="save" size={16} color="#ffffff" />
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Update Settings'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? <Text style={styles.loadingText}>Loading settings...</Text> : null}
      </ScrollView>

      <Footer activeTab={activeTab} onTabPress={setActiveTab} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} activeItem={moduleName} />

      {/* Modals */}
      <DropdownModal visible={stateModal} title="Select State" items={INDIAN_STATES}
        selected={locState} onSelect={handleStateChange} onClose={() => setStateModal(false)} />
      <DropdownModal visible={districtModal} title="Select District" items={districtList}
        selected={locDistrict} onSelect={handleDistrictChange} onClose={() => setDistrictModal(false)} />
      <DropdownModal visible={talukaModal} title="Select Taluka" items={talukaList}
        selected={locTaluka} onSelect={setLocTaluka} onClose={() => setTalukaModal(false)} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, minHeight: 48,
  },
  dropdownText: { flex: 1, fontSize: 14, color: '#0f172a' },
  placeholder: { color: '#94a3b8' },
});
