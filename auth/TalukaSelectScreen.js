import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { UserStore } from '../store/UserStore';
import { useAuth } from '../contexts/AuthContext';
import { getTalukas } from '../pages/locationData';
import styles from '../styles/RegisterStyles';

function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter((i) => i.toLowerCase().includes(search.toLowerCase()));

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
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor="#a78bfa"
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 320 }}
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
  searchInput: { flex: 1, fontSize: 14, color: '#f5f3ff', borderWidth: 0, outlineStyle: 'none', paddingVertical: 0 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4 },
  itemSelected: { backgroundColor: 'rgba(124,58,237,0.18)' },
  itemText: { fontSize: 14, color: '#ddd6fe', fontWeight: '500' },
  itemTextSelected: { color: '#c4b5fd', fontWeight: '700' },
});

export default function TalukaSelectScreen({ navigation, route }) {
  const { login } = useAuth();
  const { selectedState, selectedDistrict, fromPremium, needsCreateUser } = route.params || {};

  const [taluka, setTaluka] = useState('');
  const [talukaModal, setTalukaModal] = useState(false);
  const allowLeaveRef = useRef(false);
  const registrationJustCompleted = !fromPremium;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current) return;
      const targetRoute = e.data.action.payload?.name;
      if (targetRoute === 'Home') return;
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  const handleClose = () => {
    allowLeaveRef.current = true;
    navigation.replace('DistrictSelect', {
      selectedState, fromPremium, needsCreateUser, preselectedDistrict: selectedDistrict,
    });
  };

  const talukaList = selectedDistrict ? getTalukas(selectedState, selectedDistrict) : [];

  // ── Shared: navigate to Home after setup ──────────────────────────────────
  const goToHome = (userName) => {
    navigation.replace('Home', {
      fromRegistration: true,
      registrationJustCompleted,
      userName: userName || 'User',
    });
  };

  // ── Complete Setup ────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!taluka.trim()) {
      alert('Please select or enter your taluka');
      return;
    }
    const talukaValue = taluka.trim();

    if (needsCreateUser) {
      const pending = await UserStore.getPendingRegistration();
      if (!pending?.email) {
        alert('Registration data not found. Please register again.');
        navigation.replace('Register');
        return;
      }

      const created = await UserStore.saveUser({
        name: pending.name, mobile: pending.mobile, email: pending.email,
        referral_code_used: pending.referral_code_used || null,
        password: pending.password, state: selectedState,
        district: selectedDistrict, taluka: talukaValue,
      });

      if (created && !created.ok) {
        alert(created.message || 'Registration failed. Please try again.');
        return;
      }

      await UserStore.setCurrentUser(pending.email);
      login();
      await UserStore.completeLocationSetup(pending.email, selectedState, selectedDistrict, talukaValue);
      await UserStore.clearPendingRegistration();
      goToHome(pending.name);
      return;
    }

    const user = await UserStore.getCurrentUser();
    if (!user) { navigation.replace('Login'); return; }

    const result = await UserStore.completeLocationSetup(user.email, selectedState, selectedDistrict, talukaValue);
    if (!result) { alert('Failed to save location. Please try again.'); return; }
    goToHome(user.name);
  };

  // ── Skip Taluka ───────────────────────────────────────────────────────────
  const handleSkip = async () => {
    if (needsCreateUser) {
      const pending = await UserStore.getPendingRegistration();
      if (!pending?.email) {
        alert('Registration data not found. Please register again.');
        navigation.replace('Register');
        return;
      }

      const created = await UserStore.saveUser({
        name: pending.name, mobile: pending.mobile, email: pending.email,
        referral_code_used: pending.referral_code_used || null,
        password: pending.password, state: selectedState,
        district: selectedDistrict, taluka: '',
      });

      if (created && !created.ok) {
        alert(created.message || 'Registration failed. Please try again.');
        return;
      }

      await UserStore.setCurrentUser(pending.email);
      login();
      await UserStore.completeLocationSetup(pending.email, selectedState, selectedDistrict, '');
      await UserStore.clearPendingRegistration();
      goToHome(pending.name);
      return;
    }

    const user = await UserStore.getCurrentUser();
    if (!user) { navigation.replace('Login'); return; }

    await UserStore.completeLocationSetup(user.email, selectedState, selectedDistrict, '');
    goToHome(user.name);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.root}>
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.formContainer}>
            {/* Back Button */}
            <TouchableOpacity style={[styles.closeButton, { width: 'auto', paddingHorizontal: 10 }]} onPress={handleClose} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="arrow-back-outline" size={18} color="#94a3b8" />
                <Text style={{ color: '#94a3b8', fontWeight: '800', fontSize: 13 }}>Back</Text>
              </View>
            </TouchableOpacity>

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
              <Text style={styles.formSubtitle}>
                State: {selectedState}{selectedDistrict ? `, District: ${selectedDistrict}` : ''}
              </Text>
            </View>

            {talukaList.length > 0 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Taluka <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity style={styles.inputWrap} onPress={() => setTalukaModal(true)} activeOpacity={0.8}>
                    <Ionicons name="map-outline" size={18} color="#a78bfa" />
                    <Text style={[styles.input, !taluka && { color: '#64748b' }]}>
                      {taluka || 'Select your taluka'}
                    </Text>
                    <Ionicons name="chevron-down-outline" size={18} color="#a78bfa" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleComplete}>
                  <Text style={styles.submitBtnText}>Complete Setup</Text>
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity style={localStyles.skipBtn} onPress={handleSkip} activeOpacity={0.75}>
                  <Text style={localStyles.skipBtnText}>Skip for now</Text>
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

                <TouchableOpacity style={styles.submitBtn} onPress={handleComplete}>
                  <Text style={styles.submitBtnText}>Complete Setup</Text>
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity style={localStyles.skipBtn} onPress={handleSkip} activeOpacity={0.75}>
                  <Text style={localStyles.skipBtnText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

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

const localStyles = StyleSheet.create({
  skipBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});