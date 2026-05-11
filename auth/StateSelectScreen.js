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
import { useToast } from '../components/ui/ToastProvider';
import { INDIAN_STATES } from '../pages/locationData';
import styles from '../styles/RegisterStyles';

function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = items.filter(i =>
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

        <Text style={dropStyles.title}>{title}</Text>

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

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 320 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                dropStyles.item,
                selected === item && dropStyles.itemSelected,
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
    backgroundColor: 'rgba(124,58,237,0.18)',
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

export default function StateSelectScreen({
  navigation,
  route,
}) {
  const { showPopup } = useToast();

  const [state, setState] = useState('');
  const [stateModal, setStateModal] = useState(false);

  const fromPremium = route?.params?.fromPremium;
  const needsCreateUser =
    route?.params?.needsCreateUser;
  const autoOpen = route?.params?.autoOpen;
  const preselectedState =
    route?.params?.preselectedState;

  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!preselectedState) return;

    setState(String(preselectedState));
  }, [preselectedState]);

  useEffect(() => {
    if (!autoOpen) return;

    setTimeout(() => setStateModal(true), 80);

    navigation.setParams({
      autoOpen: undefined,
    });
  }, [autoOpen, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (e) => {
        if (allowLeaveRef.current) return;

        const targetRoute =
          e.data.action.payload?.name;

        if (targetRoute === 'DistrictSelect')
          return;

        e.preventDefault();
      }
    );

    return unsubscribe;
  }, [navigation]);

  const handleClose = () => {
    allowLeaveRef.current = true;
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!state) {
      showPopup(
        'Please select your state to continue.',
        'error'
      );

      return;
    }

    try {
      navigation.replace('DistrictSelect', {
        selectedState: state,
        fromPremium,
        needsCreateUser,
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleStateSelect = (selectedState) => {
    setState(selectedState);

    
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
                name="location-outline"
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
                Select Your State
              </Text>

              <Text style={styles.formSubtitle}>
                Choose your state to continue
              </Text>
            </View>

            {/* State Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                State{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.inputWrap}
                onPress={() => setStateModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#a78bfa"
                />

                <Text
                  style={[
                    styles.input,
                    !state && {
                      color: '#64748b',
                    },
                  ]}
                >
                  {state || 'Select your state'}
                </Text>

                <Ionicons
                  name="chevron-down-outline"
                  size={18}
                  color="#a78bfa"
                />
              </TouchableOpacity>
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

        <DropdownModal
          visible={stateModal}
          title="Select State"
          items={INDIAN_STATES}
          selected={state}
          onSelect={handleStateSelect}
          onClose={() => setStateModal(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}