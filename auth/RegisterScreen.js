import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { UserStore } from '../store/UserStore';
import styles from '../styles/RegisterStyles';

const CERTIFICATE_LOGO = require('../assets/images/certificate_logo.jpg');


// ── Local Toast ───────────────────────────────────────────────────────────────
function Toast({ toast, opacity, translateY }) {
  if (!toast) return null;
  const config = {
    success: { bg: '#052e16', border: '#16a34a', icon: 'checkmark-circle', iconColor: '#4ade80', textColor: '#bbf7d0', label: 'Success' },
    error:   { bg: '#2d0a0a', border: '#dc2626', icon: 'close-circle',     iconColor: '#f87171', textColor: '#fecaca', label: 'Error'   },
  };
  const c = config[toast.type] || config.error;
  return (
    <Animated.View style={[toastStyles.toast, { backgroundColor: c.bg, borderColor: c.border, opacity, transform: [{ translateY }] }]}>
      <Ionicons name={c.icon} size={22} color={c.iconColor} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[toastStyles.label, { color: c.iconColor }]}>{c.label.toUpperCase()}</Text>
        <Text style={[toastStyles.message, { color: c.textColor }]}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 20,
  },
  label:   { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 2 },
  message: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
});

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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a1329',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.16)',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: '#4b3579',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16, fontWeight: '800',
    color: '#faf5ff', marginBottom: 12,
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
    flex: 1, fontSize: 14, color: '#f5f3ff',
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
    fontSize: 14, color: '#ddd6fe', fontWeight: '500',
  },
  itemTextSelected: {
    color: '#c4b5fd', fontWeight: '700',
  },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const [name, setName]               = useState('');
  const [mobile, setMobile]           = useState('');
  const [email, setEmail]             = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const [toast, setToast]       = useState(null);
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef   = useRef(null);

  const showToast = (message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 2500);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      showToast('Please enter your full name', 'error'); return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error'); return;
    }
    if (!email.trim()) {
      showToast('Please enter your email address', 'error'); return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error'); return;
    }

    const existing = await UserStore.getUser(email);
    if (existing) {
      showToast('This email is already registered!', 'error'); return;
    }

    const result = await UserStore.saveUser({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      referral_code_used: referralCode.trim() || null,
      password,
    });

    if (result && !result.ok) {
      showToast(result.message || 'Registration failed', 'error'); return;
    }

    await UserStore.setCurrentUser(email.trim().toLowerCase());

    showToast(`Welcome, ${name}! Account created successfully! 🚀`, 'success');
    setTimeout(() => navigation.replace('StateSelect'), 2600);
  };


  return (
    // ✅ FIX 1: KeyboardAvoidingView with flex:1
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ✅ FIX 2: root View has flex:1 but NO overflow:hidden so ScrollView can scroll */}
      <View style={styles.root}>

        {/* Glow effects are purely decorative — keep them absolute */}
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        {/* ✅ FIX 3: ScrollView gets style={{ flex: 1 }} so it fills available height on web */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.topAccent} />

            <View style={styles.brandLogoWrap}>
              <Image source={CERTIFICATE_LOGO} style={styles.brandLogo} resizeMode="cover" />
            </View>

            <View style={styles.headerBlock}>
              <View style={styles.formIconWrap}>
                <Ionicons name="person-add-outline" size={18} color="#c4b5fd" />
              </View>
              <Text style={styles.welcomeBack}>Create your account</Text>
              <Text style={styles.formTitle}>Join the platform</Text>
              <Text style={styles.formSubtitle}>Set up your profile and start using RTI News</Text>
            </View>

            {/* ── Full Name ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* ── Mobile ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#64748b"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* ── Email ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* ── Referral Code ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Referral Code <Text style={styles.optional}>(optional)</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="gift-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter referral code e.g. RTI-AB12CD"
                  placeholderTextColor="#64748b"
                  value={referralCode}
                  onChangeText={(t) => setReferralCode(t.toUpperCase())}
                  autoCapitalize="characters"
                />
                {referralCode.length > 0 && (
                  <TouchableOpacity onPress={() => setReferralCode('')}>
                    <Ionicons name="close-circle-outline" size={18} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ── Password ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#a78bfa" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Confirm Password ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#64748b"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color="#a78bfa" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Submit ── */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
              <Text style={styles.submitBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text style={styles.switchLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Toast toast={toast} opacity={opacity} translateY={translateY} />
      </View>
    </KeyboardAvoidingView>
  );
}