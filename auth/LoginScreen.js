import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserStore } from '../store/UserStore';
import LoginStyles from '../styles/LoginStyles';

const CERTIFICATE_LOGO = require('../assets/images/certificate_logo.jpg');

export default function LoginScreen({ navigation }) {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({ email: '', password: '', general: '' });

  const clearErrors = () => setErrors({ email: '', password: '', general: '' });

  // NOTE: Keep users on Login screen after app start.
  // (Auto-redirect disabled intentionally.)

  const validate = () => {
    const newErrors = { email: '', password: '', general: '' };
    let valid = true;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required.';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    clearErrors();
    if (!validate()) return;
    setLoading(true);
    const user = await UserStore.getUser(email.trim().toLowerCase());
    setLoading(false);
    if (!user) {
      setErrors((prev) => ({ ...prev, email: 'Email not registered. Please sign up first.' }));
      return;
    }
    if (user.password !== password) {
      setErrors((prev) => ({ ...prev, password: 'Incorrect password. Please try again.' }));
      return;
    }
    await UserStore.setCurrentUser(user.email);
    const hasPremium = UserStore.hasPremiumAccess(user);
    if (hasPremium && !user.location_complete) {
      navigation.replace('StateSelect', { fromPremium: true });
    } else {
      navigation.replace('Dashboard', { userName: user.name });
    }
  };

  return (
    // ✅ FIX: Android pe 'height' use karne se footer ke paas extra space aata tha
    // Ab sirf iOS pe 'padding' use karo, Android pe behavior={undefined}
    <KeyboardAvoidingView
      style={LoginStyles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      <View style={LoginStyles.root}>
        <View style={[LoginStyles.glow, LoginStyles.glowTop]} />
        <View style={[LoginStyles.glow, LoginStyles.glowBottom]} />

        <ScrollView
          contentContainerStyle={LoginStyles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // ✅ FIX: bounces false rakho taaki scroll extra space na de
          bounces={false}
        >
          <View style={LoginStyles.formContainer}>
            <View style={LoginStyles.topAccent} />

            <View style={LoginStyles.brandLogoWrap}>
              <Image source={CERTIFICATE_LOGO} style={LoginStyles.brandLogo} resizeMode="cover" />
            </View>

            <View style={LoginStyles.headerBlock}>
              <View style={LoginStyles.formIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#7dd3fc" />
              </View>
              <Text style={LoginStyles.welcomeBack}>Welcome back</Text>
              <Text style={LoginStyles.formTitle}>Sign In</Text>
              <Text style={LoginStyles.formSubtitle}>
                Sign in to continue your newsroom workspace
              </Text>
            </View>

            {errors.general ? (
              <View style={LoginStyles.generalErrorBox}>
                <Ionicons name="alert-circle-outline" size={15} color="#f87171" />
                <Text style={LoginStyles.generalErrorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={LoginStyles.inputGroup}>
              <Text style={LoginStyles.inputLabel}>Email address</Text>
              <View style={[LoginStyles.inputWrap, errors.email ? LoginStyles.inputWrapError : null]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? '#f87171' : '#38bdf8'} />
                <TextInput
                  style={LoginStyles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? (
                <View style={LoginStyles.inlineErrorRow}>
                  <Ionicons name="alert-circle" size={13} color="#f87171" />
                  <Text style={LoginStyles.inlineErrorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>

            {/* Password */}
            <View style={LoginStyles.inputGroup}>
              <Text style={LoginStyles.inputLabel}>Password</Text>
              <View style={[LoginStyles.inputWrap, errors.password ? LoginStyles.inputWrapError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? '#f87171' : '#38bdf8'} />
                <TextInput
                  style={LoginStyles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#38bdf8" />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={LoginStyles.inlineErrorRow}>
                  <Ionicons name="alert-circle" size={13} color="#f87171" />
                  <Text style={LoginStyles.inlineErrorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity style={LoginStyles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={LoginStyles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[LoginStyles.submitBtn, loading && LoginStyles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={LoginStyles.submitBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
            </TouchableOpacity>

            <View style={LoginStyles.dividerRow}>
              <View style={LoginStyles.dividerLine} />
              <Text style={LoginStyles.dividerText}>or continue with</Text>
              <View style={LoginStyles.dividerLine} />
            </View>

            <View style={LoginStyles.socialRow}>
              {[{ icon: 'logo-google', label: 'Google' }, { icon: 'logo-apple', label: 'Apple' }].map((item) => (
                <TouchableOpacity key={item.label} style={LoginStyles.socialBtn}>
                  <Ionicons name={item.icon} size={16} color="#e2e8f0" />
                  <Text style={LoginStyles.socialText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
