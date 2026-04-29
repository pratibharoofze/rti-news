import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStore } from '../store/UserStore';
import { getTalukas } from '../pages/locationData';
import styles from '../styles/RegisterStyles'; // Reuse styles

// ── Dropdown Modal ────────────────────────────────────────────────────────────
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
          <Ionicons name="search-outline" size={16} color="#a78bfa" />
          <TextInput
            style={dropStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#64748b"
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
              {selected === item && <Ionicons name="checkmark-circle" size={18} color="#a78bfa" />}
            </TouchableOpacity>
          )}
          style={{ maxHeight: 320 }}
        />
      </View>
    </Modal>
  );
}

const dropStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a1329', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 36, borderWidth: 1, borderColor: 'rgba(196,181,253,0.16)',
  },
  handle: { width: 40, height: 4, backgroundColor: '#4b3579', borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '800', color: '#faf5ff', marginBottom: 12, textAlign: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#120d1d', borderWidth: 1, borderColor: '#302246',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#f5f3ff' },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4,
  },
  itemSelected: { backgroundColor: 'rgba(124,58,237,0.18)' },
  itemText: { fontSize: 14, color: '#ddd6fe', fontWeight: '500' },
  itemTextSelected: { color: '#c4b5fd', fontWeight: '700' },
});

export default function TalukaSelectScreen({ navigation, route }) {
  const { selectedState, selectedDistrict, fromPremium } = route.params || {};
  const [taluka, setTaluka] = useState('');
  const [talukaModal, setTalukaModal] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only prevent going back, not forward navigation
      const targetRoute = e.data.action.payload?.name;
      // Allow navigation to Dashboard
      if (targetRoute === 'Dashboard') {
        return;
      }
      // Prevent going back to DistrictSelect or other screens
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  const talukaList = selectedDistrict ? getTalukas(selectedState, selectedDistrict) : []; 

  const handleComplete = async () => { 
    if (!taluka.trim()) { alert('Please select or enter your taluka'); return; } 
    const user = await UserStore.getCurrentUser(); 
    if (!user) {
      navigation.replace('Login');
      return;
    }
    // Complete location setup
    const result = await UserStore.completeLocationSetup(user.email, selectedState, selectedDistrict, taluka);
    if (!result) {
      alert('Failed to save location. Please try again.');
      return;
    }
    // Navigate to Dashboard with newUser flag to show subscription modal
    navigation.replace('Dashboard', { userName: user.name, newUser: !fromPremium });
  };

  const handleSkip = async () => {
    // Skip taluka if no talukas available
    const user = await UserStore.getCurrentUser();
    navigation.replace('Dashboard', { userName: user?.name || 'User', newUser: !fromPremium });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.root}>
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.topAccent} />

            <View style={styles.logoCircle}>
              <Ionicons name="map-outline" size={24} color="#faf5ff" />
            </View>

            <Text style={styles.brandName}>RTI News</Text>

            <View style={styles.headerBlock}>
              <View style={styles.formIconWrap}>
                <Ionicons name="navigate-outline" size={18} color="#c4b5fd" />
              </View>
              <Text style={styles.welcomeBack}>Setup Location</Text>
              <Text style={styles.formTitle}>Select Your Taluka</Text>
              <Text style={styles.formSubtitle}>State: {selectedState}{selectedDistrict ? `, District: ${selectedDistrict}` : ''}</Text>
            </View>

            {talukaList.length > 0 ? (
              <>
                {/* ── Taluka Dropdown ── */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Taluka <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity
                    style={styles.inputWrap}
                    onPress={() => setTalukaModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="map-outline" size={18} color="#a78bfa" />
                    <Text style={[styles.input, !taluka && { color: '#64748b' }]}>
                      {taluka || 'Select your taluka'}
                    </Text>
                    <Ionicons name="chevron-down-outline" size={18} color="#a78bfa" />
                  </TouchableOpacity>
                </View>

                {/* ── Complete Button ── */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleComplete}>
                  <Text style={styles.submitBtnText}>Complete Setup</Text>
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Taluka <Text style={styles.required}>*</Text></Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="map-outline" size={18} color="#a78bfa" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your taluka"
                      placeholderTextColor="#64748b"
                      value={taluka}
                      onChangeText={setTaluka}
                    />
                  </View>
                </View>

                {/* ── Complete Button ── */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleComplete}>
                  <Text style={styles.submitBtnText}>Complete Setup</Text>
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* ── Taluka Dropdown Modal ── */}
        {talukaList.length > 0 && (
          <DropdownModal
            visible={talukaModal}
            title="Select Taluka"
            items={talukaList}
            selected={taluka}
            onSelect={setTaluka}
            onClose={() => setTalukaModal(false)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
