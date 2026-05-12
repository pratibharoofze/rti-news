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

// ─────────────────────────────────────────────────────────
// OTP Service — abhi mock hai, baad mein real API lagana
// ─────────────────────────────────────────────────────────
const OTPService = {
  // 6-digit OTP generate karo
  generate() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  // SMS bhejo — abhi mock hai
  // TODO: Fast2SMS / MSG91 API key aane pe yahan real call lagana
  async sendSMS(mobile, otp) {
    console.log(`[OTP] SMS to +91${mobile}: ${otp}`);

    // ── Real SMS (Fast2SMS) — uncomment when API key milega ──
    // const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    //   method: 'POST',
    //   headers: {
    //     'authorization': 'YOUR_FAST2SMS_API_KEY',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     route: 'otp',
    //     variables_values: otp,
    //     numbers: mobile,
    //   }),
    // });
    // return response.ok;

    // Mock: hamesha success
    return true;
  },

  // Email bhejo — abhi mock hai
  // TODO: EmailJS / SendGrid API key aane pe yahan real call lagana
  async sendEmail(email, otp) {
    console.log(`[OTP] Email to ${email}: ${otp}`);

    // ── Real Email (EmailJS) — uncomment when API key milega ──
    // const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     service_id: 'YOUR_SERVICE_ID',
    //     template_id: 'YOUR_TEMPLATE_ID',
    //     user_id: 'YOUR_PUBLIC_KEY',
    //     template_params: {
    //       to_email: email,
    //       otp_code: otp,
    //       app_name: 'RTI News',
    //     },
    //   }),
    // });
    // return response.ok;

    // Mock: hamesha success
    return true;
  },
};

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function isValidEmailAddress(value) {
  const emailValue = String(value || '').trim().toLowerCase();
  if (!emailValue) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(emailValue);
}

function isValidMobileNumber(value) {
  const mobile = String(value || '').trim();
  return /^[6-9]\d{9}$/.test(mobile);
}

function getPasswordChecks(value) {
  const passwordValue = String(value || '');
  return {
    length:  passwordValue.length >= 8,
    lower:   /[a-z]/.test(passwordValue),
    upper:   /[A-Z]/.test(passwordValue),
    number:  /\d/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
    noSpace: !/\s/.test(passwordValue),
  };
}

if (Platform.OS === 'web') {
  try {
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
  } catch {}
}

// ─────────────────────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────────────────────
function Toast({ toast, opacity, translateY }) {
  if (!toast) return null;
  const config = {
    success: { bg: '#052e16', border: '#16a34a', icon: 'checkmark-circle', iconColor: '#4ade80', textColor: '#bbf7d0', label: 'Success' },
    error:   { bg: '#2d0a0a', border: '#dc2626', icon: 'close-circle',     iconColor: '#f87171', textColor: '#fecaca', label: 'Error'   },
    info:    { bg: '#0c1a3a', border: '#3b82f6', icon: 'information-circle', iconColor: '#60a5fa', textColor: '#bfdbfe', label: 'Info'  },
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

// ─────────────────────────────────────────────────────────
// OTP Modal — 6 digit boxes
// ─────────────────────────────────────────────────────────
function OTPModal({ visible, onClose, onVerify, mobile, email, otpSentTo }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Timer shuru karo
  const startTimer = () => {
    setResendTimer(30);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Modal open hone par timer shuru karo
  useMemo(() => {
    if (visible) {
      setDigits(['', '', '', '', '', '']);
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const handleDigitChange = (text, index) => {
    const newDigits = [...digits];
    // Sirf numbers allow karo
    const clean = text.replace(/[^0-9]/g, '').slice(-1);
    newDigits[index] = clean;
    setDigits(newDigits);
    // Next box pe jump karo
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return;
    setLoading(true);
    await onVerify(otp);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setDigits(['', '', '', '', '', '']);
    startTimer();
    await onVerify('RESEND');
  };

  const otp = digits.join('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={otpStyles.overlay}>
        <View style={otpStyles.card}>
          {/* Header */}
          <View style={otpStyles.iconWrap}>
            <Ionicons name="shield-checkmark" size={32} color="#a78bfa" />
          </View>
          <Text style={otpStyles.title}>Verify OTP</Text>
          <Text style={otpStyles.subtitle}>
            OTP has been sent to:
          </Text>
          <Text style={otpStyles.sentTo}>📱 +91{mobile}</Text>
          {email ? <Text style={otpStyles.sentTo}>📧 {email}</Text> : null}
          <Text style={otpStyles.devNote}>
            💡 Testing mode: Check OTP in console
          </Text>

          {/* 6 Digit Boxes */}
          <View style={otpStyles.digitRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  otpStyles.digitBox,
                  digit ? otpStyles.digitBoxFilled : null,
                ]}
                value={digit}
                onChangeText={text => handleDigitChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[otpStyles.verifyBtn, otp.length < 6 && otpStyles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={otp.length < 6 || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={otpStyles.verifyBtnText}>Verifying...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={otpStyles.verifyBtnText}>Verify OTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={otpStyles.resendRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={otpStyles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={otpStyles.resendTimer}>
                Resend in <Text style={{ color: '#a78bfa', fontWeight: '700' }}>{resendTimer}s</Text>
              </Text>
            )}
          </View>

          {/* Close */}
          <TouchableOpacity style={otpStyles.closeBtn} onPress={onClose}>
            <Text style={otpStyles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const otpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1a1329',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.2)',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#faf5ff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  sentTo: {
    fontSize: 13,
    color: '#c4b5fd',
    fontWeight: '700',
    marginBottom: 2,
  },
  devNote: {
    fontSize: 11,
    color: '#f59e0b',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  digitRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  digitBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#302246',
    backgroundColor: '#120d1d',
    color: '#faf5ff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  digitBoxFilled: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  verifyBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  verifyBtnDisabled: {
    opacity: 0.45,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  resendRow: {
    marginBottom: 14,
  },
  resendTimer: {
    color: '#64748b',
    fontSize: 13,
  },
  resendLink: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  closeBtn: {
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});

// ─────────────────────────────────────────────────────────
// Dropdown Modal
// ─────────────────────────────────────────────────────────
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1a1329', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 36, borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.16)',
  },
  handle: { width: 40, height: 4, backgroundColor: '#4b3579', borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '800', color: '#faf5ff', marginBottom: 12, textAlign: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#120d1d', borderWidth: 1, borderColor: '#302246',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#f5f3ff' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 4 },
  itemSelected: { backgroundColor: 'rgba(124,58,237,0.18)' },
  itemText: { fontSize: 14, color: '#ddd6fe', fontWeight: '500' },
  itemTextSelected: { color: '#c4b5fd', fontWeight: '700' },
});

// ─────────────────────────────────────────────────────────
// Main Register Screen
// ─────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();

  // Name fields
  const [firstName, setFirstName]   = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName]     = useState('');

  const [mobile, setMobile]             = useState('');
  const [email, setEmail]               = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);

  // ── OTP States ──
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileVerified, setMobileVerified]   = useState(false);
  const [otpSending, setOtpSending]           = useState(false);
  const [currentOtp, setCurrentOtp]           = useState('');    // generated OTP store
  const [verifiedMobile, setVerifiedMobile]   = useState('');    // jo mobile verify hua

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsTouched, setTermsTouched]   = useState(false);

  const [toast, setToast]       = useState(null);
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef   = useRef(null);

  const normalizedEmail = useMemo(() => String(email || '').trim().toLowerCase(), [email]);
  const emailOk  = useMemo(() => isValidEmailAddress(normalizedEmail), [normalizedEmail]);
  const mobileOk = useMemo(() => isValidMobileNumber(mobile), [mobile]);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passwordStrong = useMemo(
    () => passwordChecks.length && passwordChecks.lower && passwordChecks.upper
          && passwordChecks.number && passwordChecks.special && passwordChecks.noSpace,
    [passwordChecks]
  );

  const fullName = useMemo(() => {
    return [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');
  }, [firstName, middleName, lastName]);

  // Mobile change hone par verification reset karo
  const handleMobileChange = (text) => {
    setMobile(text);
    if (mobileVerified && text !== verifiedMobile) {
      setMobileVerified(false);
      setVerifiedMobile('');
    }
  };

  // ✅ Submit button — mobileVerified bhi zaroori hai
  const formOk = useMemo(() => {
    const nameOk = Boolean(firstName.trim()) && Boolean(lastName.trim());
    const confirmOk = password && confirm && password === confirm;
    return nameOk && mobileOk && mobileVerified && emailOk && passwordStrong && confirmOk && termsAccepted;
  }, [firstName, lastName, mobileOk, mobileVerified, emailOk, passwordStrong, password, confirm, termsAccepted]);

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
    }, 3000);
  };

  // ── OTP Bhejo ──
  const handleSendOTP = async () => {
    if (!mobileOk) {
      setMobileTouched(true);
      showToast('Enter a valid 10-digit mobile number', 'error');
      return;
    }

    setOtpSending(true);
    const otp = OTPService.generate();
    setCurrentOtp(otp);

    // SMS bhejo
    await OTPService.sendSMS(mobile, otp);

    // Email bhi bhejo agar filled hai
    if (emailOk) {
      await OTPService.sendEmail(normalizedEmail, otp);
    }

    setOtpSending(false);
    setOtpModalVisible(true);
    showToast(`OTP bheja gaya! (Testing: ${otp})`, 'info');
  };

  // ── OTP Verify karo ──
  const handleVerifyOTP = async (enteredOtp) => {
    // Resend request
    if (enteredOtp === 'RESEND') {
      const newOtp = OTPService.generate();
      setCurrentOtp(newOtp);
      await OTPService.sendSMS(mobile, newOtp);
      if (emailOk) await OTPService.sendEmail(normalizedEmail, newOtp);
      showToast(`'OTP resent successfully!'! (Testing: ${newOtp})`, 'info');
      return;
    }

    if (enteredOtp === currentOtp) {
      setMobileVerified(true);
      setVerifiedMobile(mobile);
      setOtpModalVisible(false);
      showToast('Mobile number verified successfully! ✅', 'success');
    } else {
      showToast('Invalid OTP. Please try again.', 'error');
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim()) {
      showToast('First name daalo', 'error'); return;
    }
    if (!lastName.trim()) {
      showToast('Last name daalo', 'error'); return;
    }
    if (!mobileOk) {
      setMobileTouched(true);
      showToast('Valid 10-digit Indian mobile number daalo', 'error'); return;
    }
    if (!mobileVerified) {
      showToast('Mobile number verify karo pehle', 'error'); return;
    }
    if (!normalizedEmail) {
      setEmailTouched(true);
      showToast('Email address daalo', 'error'); return;
    }
    if (!emailOk) {
      setEmailTouched(true);
      showToast('Valid email address daalo', 'error'); return;
    }
    if (!passwordStrong) {
      setPasswordTouched(true);
      showToast('Strong password use karo', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords match nahi kar rahe', 'error'); return;
    }
    if (!termsAccepted) {
      setTermsTouched(true);
      showToast('Terms & Conditions accept karo', 'error'); return;
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
      name: fullName,
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

  const handleClose = () => { navigation.navigate('Home'); };
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
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
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

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#a78bfa" />
                <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#64748b" value={firstName} onChangeText={setFirstName} />
              </View>
            </View>

            {/* Middle Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Middle Name <Text style={styles.optional}>(optional)</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#a78bfa" />
                <TextInput style={styles.input} placeholder="Enter middle name" placeholderTextColor="#64748b" value={middleName} onChangeText={setMiddleName} />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#a78bfa" />
                <TextInput style={styles.input} placeholder="Enter your surname" placeholderTextColor="#64748b" value={lastName} onChangeText={setLastName} />
              </View>
            </View>

            {/* ── Mobile Number + OTP Button ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Mobile Number <Text style={styles.required}>*</Text>
                {mobileVerified && (
                  <Text style={localStyles.verifiedBadge}> ✅ Verified</Text>
                )}
              </Text>

              <View style={[styles.inputWrap, mobileShowError && styles.inputWrapError, mobileVerified && localStyles.inputWrapVerified]}>
                <Ionicons name="call-outline" size={18} color={mobileVerified ? '#22c55e' : mobileShowError ? '#ef4444' : '#a78bfa'} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#64748b"
                  value={mobile}
                  onChangeText={handleMobileChange}
                  onBlur={() => setMobileTouched(true)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!mobileVerified}
                />
                {mobileVerified ? (
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                ) : mobileOk ? (
                  // ✅ Send OTP Button
                  <TouchableOpacity
                    style={localStyles.sendOtpBtn}
                    onPress={handleSendOTP}
                    disabled={otpSending}
                    activeOpacity={0.8}
                  >
                    <Text style={localStyles.sendOtpBtnText}>
                      {otpSending ? 'Sending...' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : mobileShowError ? (
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                ) : null}
              </View>

              {mobileShowError && (
                <Text style={styles.errorText}>
                  Valid 10-digit Indian mobile number daalo (6-9 se shuru)
                </Text>
              )}

              {/* OTP send hone ka hint */}
              {mobileOk && !mobileVerified && (
                <Text style={localStyles.otpHint}>
                  '👆 Press "Send OTP" to verify your mobile number'
                </Text>
              )}
            </View>

            {/* Email */}
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
                <Text style={styles.errorText}>Valid email daalo, e.g. you@example.com</Text>
              ) : null}
            </View>

            {/* Referral Code */}
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

            {/* Password */}
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
                    <Text style={styles.helperTitle}>Password must include::</Text>
                    {[
                      { key: 'length',  label: '8+ characters' },
                      { key: 'upper',   label: '1 uppercase (A-Z)' },
                      { key: 'lower',   label: '1 lowercase (a-z)' },
                      { key: 'number',  label: '1 number (0-9)' },
                      { key: 'special', label: '1 symbol (!@#$...)' },
                      { key: 'noSpace', label: 'No spaces' },
                    ].map(({ key, label }) => (
                      <View key={key} style={styles.hintRow}>
                        <Ionicons
                          name={passwordChecks[key] ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={passwordChecks[key] ? '#22c55e' : '#64748b'}
                        />
                        <Text style={[styles.helperText, passwordChecks[key] && styles.helperTextOk]}>
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.helperText}>'Tip: Use something like \Rti@2026News`'`</Text>
                )
              )}
            </View>

            {/* Confirm Password */}
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
                <Text style={styles.errorText}>'Passwords do not match'</Text>
              ) : null}
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={localStyles.termsRow}
              onPress={() => { setTermsAccepted(!termsAccepted); setTermsTouched(true); }}
              activeOpacity={0.8}
            >
              <View style={[localStyles.checkbox, termsAccepted && localStyles.checkboxChecked, termsTouched && !termsAccepted && localStyles.checkboxError]}>
                {termsAccepted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={localStyles.termsText}>
                I accept the <Text style={localStyles.termsLink}>Terms & Conditions</Text> and <Text style={localStyles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {termsTouched && !termsAccepted && (
              <Text style={[styles.errorText, { marginTop: 4, marginBottom: 6 }]}>
                'Please accept the Terms & Conditions'
              </Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !formOk && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={!formOk}
            >
              <Text style={styles.submitBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* Mobile verify nahi hua to hint */}
            {mobileOk && !mobileVerified && (
              <Text style={localStyles.verifyHintBottom}>
                ⚠️ Mobile verification is required to create account
              </Text>
            )}

            <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Toast toast={toast} opacity={opacity} translateY={translateY} />
      </View>

      {/* OTP Modal */}
      <OTPModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        onVerify={handleVerifyOTP}
        mobile={mobile}
        email={emailOk ? normalizedEmail : ''}
      />
    </KeyboardAvoidingView>
  );
}

// ── Local styles ──────────────────────────────────────────
const localStyles = StyleSheet.create({
  // Mobile field verified state
  inputWrapVerified: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.05)',
  },
  verifiedBadge: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '700',
  },

  // Send OTP button (inline)
  sendOtpBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sendOtpBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Hints
  otpHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
  },
  verifyHintBottom: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },

  // Terms checkbox
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#4b3579',
    backgroundColor: '#120d1d',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  checkboxError:   { borderColor: '#ef4444' },
  termsText: { flex: 1, fontSize: 13, color: '#a78bfa', lineHeight: 20 },
  termsLink: { color: '#c4b5fd', fontWeight: '700', textDecorationLine: 'underline' },
});