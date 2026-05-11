import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/RegisterStyles';

const CERTIFICATE_LOGO = require('../assets/images/certificate_logo.jpg');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function isValidEmailAddress(value) {
  const emailValue = String(value || '').trim().toLowerCase();
  if (!emailValue) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailValue);
}

// ✅ NEW: Indian mobile number validation (6-9 se shuru, exactly 10 digits)
function isValidMobileNumber(value) {
  const mobile = String(value || '').trim();
  return /^[6-9]\d{9}$/.test(mobile);
}

function getPasswordChecks(value) {
  const passwordValue = String(value || '');
  return {
    length: passwordValue.length >= 8,
    lower:  /[a-z]/.test(passwordValue),
    upper:  /[A-Z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
    noSpace: !/\s/.test(passwordValue),
  };
}

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #0f0a1e;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

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

export function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
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

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [name, setName]               = useState('');
  const [mobile, setMobile]           = useState('');
  const [email, setEmail]             = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false); // ✅ NEW

  const [toast, setToast]       = useState(null);
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef   = useRef(null);

  const normalizedEmail = useMemo(() => String(email || '').trim().toLowerCase(), [email]);
  const emailOk = useMemo(() => isValidEmailAddress(normalizedEmail), [normalizedEmail]);

  const mobileOk = useMemo(() => isValidMobileNumber(mobile), [mobile]); // ✅ NEW

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrong = useMemo(
    () =>
      passwordChecks.length
      && passwordChecks.lower
      && passwordChecks.upper
      && passwordChecks.number
      && passwordChecks.special
      && passwordChecks.noSpace,
    [passwordChecks]
  );

  const formOk = useMemo(() => {
    const nameOk = Boolean(String(name || '').trim());
    const confirmOk = password && confirm && password === confirm;
    return nameOk && mobileOk && emailOk && passwordStrong && confirmOk; // ✅ mobileOk use kiya
  }, [name, mobileOk, emailOk, passwordStrong, password, confirm]);

  const showToast = (message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: USE_NATIVE_DRIVER }),
      ]).start(() => setToast(null));
    }, 2500);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      showToast('Please enter your full name', 'error'); return;
    }
    if (!mobileOk) {
      setMobileTouched(true); // ✅ box red ho jaayega
      showToast('Please enter a valid 10-digit Indian mobile number', 'error'); return;
    }
    if (!normalizedEmail) {
      setEmailTouched(true);
      showToast('Please enter your email address', 'error'); return;
    }
    if (!emailOk) {
      setEmailTouched(true);
      showToast('Please enter a valid email address (e.g. you@example.com)', 'error'); return;
    }
    if (!passwordStrong) {
      setPasswordTouched(true);
      showToast('Use a strong password (8+ chars with Aa, 1 number, 1 symbol)', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error'); return;
    }

    const existing = await UserStore.getUser(normalizedEmail);
    if (existing) {
      if (!existing.location_complete) {
        await UserStore.setCurrentUser(existing.email);
        login();
        showToast('Account found. Continue location setup.', 'success');
        navigation.navigate('StateSelect', {
          fromPremium: false,
          needsCreateUser: false,
          preselectedState: existing.state || undefined,
          autoOpen: true,
        });
        return;
      }

      showToast('This email is already registered! Please sign in.', 'error');
      navigation.navigate('Login');
      return;
    }

    const ok = await UserStore.setPendingRegistration({
      name: name.trim(),
      mobile: mobile.trim(),
      email: normalizedEmail,
      referral_code_used: referralCode.trim() || null,
      password,
    });

    if (!ok) {
      showToast('Registration failed. Please try again.', 'error');
      return;
    }

    navigation.navigate('StateSelect', { fromPremium: false, needsCreateUser: true });
  };

  const handleClose = () => {
    navigation.navigate('Home');
  };

  // ✅ Mobile box error condition
  const mobileShowError = mobileTouched && mobile.length > 0 && !mobileOk;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.root}>
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close-outline" size={24} color="#94a3b8" />
            </TouchableOpacity>

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
              <View style={[
                styles.inputWrap,
                mobileShowError && styles.inputWrapError, // ✅ red border
              ]}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={mobileShowError ? '#ef4444' : '#a78bfa'} // ✅ icon bhi red
                />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#64748b"
                  value={mobile}
                  onChangeText={setMobile}
                  onBlur={() => setMobileTouched(true)} // ✅ box se bahar jaate hi check
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {/* ✅ Valid ho toh green tick, invalid touched ho toh red cross */}
                {mobileOk && (
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                )}
                {mobileShowError && (
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                )}
              </View>
              {/* ✅ Error message */}
              {mobileShowError && (
                <Text style={styles.errorText}>
                  Enter a valid 10-digit Indian mobile number (starts with 6-9)
                </Text>
              )}
            </View>

            {/* ── Email ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrap, emailTouched && !emailOk && styles.inputWrapError]}>
                <Ionicons name="mail-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => setEmailTouched(true)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {emailTouched && !emailOk && normalizedEmail.length > 0 ? (
                <Text style={styles.errorText}>Enter a valid email, e.g. you@example.com</Text>
              ) : null}
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
              <View style={[styles.inputWrap, passwordTouched && !passwordStrong && styles.inputWrapError]}>
                <Ionicons name="lock-closed-outline" size={18} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="Use a strong password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setPasswordTouched(true)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#a78bfa" />
                </TouchableOpacity>
              </View>

              {passwordStrong ? null : (
                (passwordTouched || password.length > 0) ? (
                  <View style={styles.passwordHintsBox}>
                    <Text style={styles.helperTitle}>Password must include:</Text>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.length ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.length ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.length && styles.helperTextOk]}>8+ characters</Text>
                    </View>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.upper ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.upper ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.upper && styles.helperTextOk]}>1 uppercase (A-Z)</Text>
                    </View>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.lower ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.lower ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.lower && styles.helperTextOk]}>1 lowercase (a-z)</Text>
                    </View>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.number ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.number ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.number && styles.helperTextOk]}>1 number (0-9)</Text>
                    </View>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.special ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.special ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.special && styles.helperTextOk]}>1 symbol (!@#$...)</Text>
                    </View>
                    <View style={styles.hintRow}>
                      <Ionicons name={passwordChecks.noSpace ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={passwordChecks.noSpace ? '#22c55e' : '#64748b'} />
                      <Text style={[styles.helperText, passwordChecks.noSpace && styles.helperTextOk]}>No spaces</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.helperText}>Tip: Use something like `Rti@2026News`</Text>
                )
              )}
            </View>

            {/* ── Confirm Password ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrap, confirm.length > 0 && password !== confirm && styles.inputWrapError]}>
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
              {confirm.length > 0 && password !== confirm ? (
                <Text style={styles.errorText}>Passwords do not match</Text>
              ) : null}
            </View>

            {/* ── Submit ── */}
            <TouchableOpacity
              style={[styles.submitBtn, !formOk && styles.submitBtnDisabled]}
              onPress={handleRegister}
            >
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