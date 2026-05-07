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
import { getDistricts } from '../pages/locationData';
import styles from '../styles/RegisterStyles';

// ── Dropdown Modal ─────────────────────────────────────────────
function DropdownModal({
  visible,
  title,
  items,
  selected,
  onSelect,
  onClose,
}) {
  const [search, setSearch] = useState('');

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={dropStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={dropStyles.sheet}>
        <View style={dropStyles.handle} />

        <Text style={dropStyles.title}>
          {title}
        </Text>

        {/* Search Box */}
        <View style={dropStyles.searchWrap}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#a78bfa"
          />

          <TextInput
            style={dropStyles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor="#a78bfa"
          />
        </View>

        {/* District List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 320 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                dropStyles.item,
                selected === item &&
                  dropStyles.itemSelected,
              ]}
              onPress={() => {
                onSelect(item);
                onClose();
                setSearch('');
              }}
            >
              <Text
                style={[
                  dropStyles.itemText,
                  selected === item &&
                    dropStyles.itemTextSelected,
                ]}
              >
                {item}
              </Text>

              {selected === item && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#a78bfa"
                />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const dropStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1329',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.16)',
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b3579',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#faf5ff',
    marginBottom: 12,
    textAlign: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#120d1d',
    borderWidth: 1,
    borderColor: '#302246',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#f5f3ff',
    borderWidth: 0,
    outlineStyle: 'none',
    paddingVertical: 0,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },

  itemSelected: {
    backgroundColor:
      'rgba(124,58,237,0.18)',
  },

  itemText: {
    fontSize: 14,
    color: '#ddd6fe',
    fontWeight: '500',
  },

  itemTextSelected: {
    color: '#c4b5fd',
    fontWeight: '700',
  },
});

export default function DistrictSelectScreen({
  navigation,
  route,
}) {
  const {
    selectedState,
    fromPremium,
    needsCreateUser,
  } = route.params || {};

  const preselectedDistrict =
    route?.params?.preselectedDistrict;

  const [district, setDistrict] = useState(
    preselectedDistrict
      ? String(preselectedDistrict)
      : ''
  );

  const [districtModal, setDistrictModal] =
    useState(false);

  const [districtTouched, setDistrictTouched] =
    useState(false);

  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!preselectedDistrict) return;

    setDistrict(String(preselectedDistrict));
  }, [preselectedDistrict]);

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'beforeRemove',
        (e) => {
          if (allowLeaveRef.current) {
            return;
          }

          const targetRoute =
            e.data.action.payload?.name;

          if (targetRoute === 'TalukaSelect') {
            return;
          }

          e.preventDefault();
        }
      );

    return unsubscribe;
  }, [navigation]);

  const districtList = selectedState
    ? getDistricts(selectedState)
    : [];

  const handleNext = async () => {
    if (!district.trim()) {
      setDistrictTouched(true);
      return;
    }

    navigation.replace('TalukaSelect', {
      selectedState,
      selectedDistrict: district.trim(),
      fromPremium,
      needsCreateUser,
    });
  };

  const handleClose = () => {
    allowLeaveRef.current = true;

    navigation.replace('StateSelect', {
      fromPremium,
      needsCreateUser,
      preselectedState: selectedState,
      autoOpen: true,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.root}>
        <View style={[styles.glow, styles.glowTop]} />

        <View
          style={[styles.glow, styles.glowBottom]}
        />

        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            {/* Back Button */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  width: 'auto',
                  paddingHorizontal: 10,
                },
              ]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  color="#94a3b8"
                />

                <Text
                  style={{
                    color: '#94a3b8',
                    fontWeight: '800',
                    fontSize: 13,
                  }}
                >
                  Back
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.topAccent} />

            <View style={styles.logoCircle}>
              <Ionicons
                name="business-outline"
                size={24}
                color="#faf5ff"
              />
            </View>

            <Text style={styles.brandName}>
              RTI News
            </Text>

            <View style={styles.headerBlock}>
              <View style={styles.formIconWrap}>
                <Ionicons
                  name="map-outline"
                  size={18}
                  color="#c4b5fd"
                />
              </View>

              <Text style={styles.welcomeBack}>
                Setup Location
              </Text>

              <Text style={styles.formTitle}>
                Select Your District
              </Text>

              <Text style={styles.formSubtitle}>
                State: {selectedState}
              </Text>
            </View>

            {/* District Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                District{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              {districtList.length > 0 ? (
                <TouchableOpacity
                  style={[
                    styles.inputWrap,
                    districtTouched &&
                      !district.trim() &&
                      styles.inputWrapError,
                  ]}
                  onPress={() =>
                    setDistrictModal(true)
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color="#a78bfa"
                  />

                  <Text
                    style={[
                      styles.input,
                      !district && {
                        color: '#64748b',
                      },
                    ]}
                  >
                    {district ||
                      'Select your district'}
                  </Text>

                  <Ionicons
                    name="chevron-down-outline"
                    size={18}
                    color="#a78bfa"
                  />
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.inputWrap,
                    districtTouched &&
                      !district.trim() &&
                      styles.inputWrapError,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color="#a78bfa"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your district"
                    placeholderTextColor="#64748b"
                    value={district}
                    onChangeText={(t) => {
                      setDistrict(t);

                      if (!districtTouched) {
                        setDistrictTouched(true);
                      }
                    }}
                    onBlur={() =>
                      setDistrictTouched(true)
                    }
                  />
                </View>
              )}

              {districtTouched &&
              !district.trim() ? (
                <Text style={styles.errorText}>
                  Please select or enter your
                  district
                </Text>
              ) : null}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleNext}
            >
              <Text style={styles.submitBtnText}>
                Next
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* District Dropdown Modal */}
        {districtList.length > 0 && (
          <DropdownModal
            visible={districtModal}
            title="Select District"
            items={districtList}
            selected={district}
            onSelect={(next) => {
              setDistrict(next);
              setDistrictTouched(true);
            }}
            onClose={() =>
              setDistrictModal(false)
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}