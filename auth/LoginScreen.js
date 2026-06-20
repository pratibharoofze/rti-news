import { AuthAPI } from './ClientAPI/AuthApi';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStore } from '../store/UserStore';
import { useAuth } from '../contexts/AuthContext';
import LoginStyles from '../styles/LoginStyles';

if (Platform.OS === 'web') {
  try {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `html, body, #root { height: 100%; margin: 0; padding: 0; background-color: #F0F0F5; overflow: hidden; }`;
      document.head.appendChild(style);
    }
  } catch {}
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors,       setErrors]       = useState({ email: '', password: '', general: '' });

  const clearErrors = () => setErrors({ email: '', password: '', general: '' });

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    let valid = true;
    if (!email.trim()) {
      newErrors.email = 'Email or mobile number is required.';
      valid = false;
    } else {
      const identity = email.trim();
      const isEmail  = /\S+@\S+\.\S+/.test(identity);
      const isMobile = /^\d{10}$/.test(identity.replace(/\s+/g, ''));
      if (!isEmail && !isMobile) {
        newErrors.email = 'Enter a valid email or 10-digit mobile number.';
        valid = false;
      }
    }
    if (!password) { newErrors.password = 'Password is required.'; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    clearErrors();
    if (!validate()) return;
    setLoading(true);

    try {
      const safeReplace = (routeName, params) => {
        if (navigation && typeof navigation.replace === 'function') { navigation.replace(routeName, params); return; }
        if (navigation && typeof navigation.navigate === 'function') { navigation.navigate(routeName, params); }
      };

      const identityRaw      = email.trim();
      const isEmail          = /\S+@\S+\.\S+/.test(identityRaw);
      const mobileNormalized = identityRaw.replace(/\s+/g, '');

      // ── Step 1: API Login ──
      if (isEmail) {
        const apiResult = await AuthAPI.login({
          email:    identityRaw.toLowerCase(),
          password: password,
        });

        if (apiResult.ok) {
          // ✅ API login successful — seedha ghar bhejo
          setLoading(false);

          // Local user check karo sirf location ke liye
          let localUser = await UserStore.getUser(identityRaw.toLowerCase());
          
          // Agar local user nahi hai toh API user se banao
          if (!localUser && apiResult.user) {
            await UserStore.setPendingRegistration({
              name: `${apiResult.user.firstname || ''} ${apiResult.user.lastname || ''}`.trim(),
              mobile: apiResult.user.mobile_no || '',
              email: identityRaw.toLowerCase(),
              password: password,
            });
          }

          if (!localUser && apiResult.user) {
  const apiUser = apiResult.user;
  const savedResult = await UserStore.saveUser({
    name: `${apiUser.firstname || ''} ${apiUser.lastname || ''}`.trim() || apiUser.name || '',
    mobile: apiUser.mobile_no || apiUser.mobile || '',
    email: identityRaw.toLowerCase(),
    password: password,
    state: apiUser.state || '',
  });
  if (savedResult.ok) {
    localUser = savedResult.user;
  }
}

if (localUser) {
  await UserStore.setCurrentUser(localUser.email);
} else {
  await UserStore.setCurrentUser(identityRaw.toLowerCase());
}

login();
safeReplace('Home');
return;
        }

        if (!apiResult.isNetwork) {
          setLoading(false);
          setErrors((prev) => ({ ...prev, general: apiResult.message || 'Invalid credentials.' }));
          return;
        }
      }

      // ── Step 2: Mobile login — Local check ──
      let user = null;
      if (!isEmail && /^\d{10}$/.test(mobileNormalized)) {
        const all = await UserStore.getAllUsers();
        user = (all || []).find((u) => String(u.mobile || '').trim() === mobileNormalized) || null;
      }

      setLoading(false);

      if (!user) {
        setErrors((prev) => ({ ...prev, email: 'Account not found. Please sign up first.' }));
        return;
      }

      if (String(user.password || '') !== String(password || '')) {
        setErrors((prev) => ({ ...prev, password: 'Incorrect password. Please try again.' }));
        return;
      }

      await UserStore.setCurrentUser(user.email);
      login();
      safeReplace('Home');

    } catch (_err) {
      console.warn('Login error:', _err);
      setLoading(false);
      setErrors((prev) => ({ ...prev, general: 'Login failed. Please try again.' }));
    }
  };
      

  const handleClose = () => navigation.navigate('Home');

  return (
    <KeyboardAvoidingView
      style={LoginStyles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={LoginStyles.root}>

        <ScrollView
          style={LoginStyles.scrollView}
          contentContainerStyle={LoginStyles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={LoginStyles.formContainer}>

            {/* Close Button */}
            <TouchableOpacity style={LoginStyles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close-outline" size={22} color="#888888" />
            </TouchableOpacity>

            {/* Header */}
            <Text style={LoginStyles.pageTitle}>Sign In</Text>
            <Text style={LoginStyles.pageSubtitle}>Please enter your credentials to continue</Text>

            {/* General Error */}
            {errors.general ? (
              <View style={LoginStyles.generalErrorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#e8732a" />
                <Text style={LoginStyles.generalErrorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Email / Mobile */}
            <View style={LoginStyles.inputGroup}>
              <Text style={LoginStyles.inputLabel}>Email / Mobile</Text>
              <View style={[LoginStyles.inputWrap, errors.email ? LoginStyles.inputWrapError : null]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? '#e8732a' : '#AAAAAA'} />
                <TextInput
                  style={LoginStyles.input}
                  placeholder="you@example.com or 10-digit mobile"
                  placeholderTextColor="#CCCCCC"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? (
                <View style={LoginStyles.inlineErrorRow}>
                  <Ionicons name="alert-circle" size={13} color="#e8732a" />
                  <Text style={LoginStyles.inlineErrorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={LoginStyles.inputGroup}>
              <Text style={LoginStyles.inputLabel}>Password</Text>
              <View style={[LoginStyles.inputWrap, errors.password ? LoginStyles.inputWrapError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? '#e8732a' : '#AAAAAA'} />
                <TextInput
                  style={LoginStyles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#CCCCCC"
                  value={password}
                  onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={LoginStyles.inlineErrorRow}>
                  <Ionicons name="alert-circle" size={13} color="#e8732a" />
                  <Text style={LoginStyles.inlineErrorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={LoginStyles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={LoginStyles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[LoginStyles.submitBtn, loading && LoginStyles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={LoginStyles.submitBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            </TouchableOpacity>

            {/* Divider */}
            <View style={LoginStyles.dividerRow}>
              <View style={LoginStyles.dividerLine} />
              <Text style={LoginStyles.dividerText}>or continue with</Text>
              <View style={LoginStyles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={LoginStyles.socialRow}>
              {[{ icon: 'logo-google', label: 'Google' }, { icon: 'logo-apple', label: 'Apple' }].map((item) => (
                <TouchableOpacity key={item.label} style={LoginStyles.socialBtn}>
                  <Ionicons name={item.icon} size={16} color="#555555" />
                  <Text style={LoginStyles.socialText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Switch to Register */}
            <TouchableOpacity style={LoginStyles.switchBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={LoginStyles.switchText}>
                Don&apos;t have an account?{' '}
                <Text style={LoginStyles.switchLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}