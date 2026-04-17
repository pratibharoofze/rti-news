import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/LoginStyles';
import { UserStore } from '../store/UserStore';
import { useToast } from '../components/ui/ToastProvider';
// import
export default function ForgotPasswordScreen({ navigation }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = await UserStore.getUser(email.trim());

      if (!user) {
        setLoading(false);
        showToast('Email not registered', 'error');
        return;
      }

      const generatedOtp = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      const expiresAt = Date.now() + 5 * 60 * 1000;

      const saved = await UserStore.saveResetOtp({
        email: email.trim(),
        otp: generatedOtp,
        expiresAt,
      });

      setLoading(false);

      if (!saved) {
        showToast('Unable to generate OTP. Please try again.', 'error');
        return;
      }

      showToast(`Mock OTP: ${generatedOtp}`, 'info');

      navigation.navigate('Otp', {
        email: email.trim(),
        expiresAt,
      });
    } catch (error) {
      setLoading(false);
      showToast('Something went wrong', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <View style={[styles.glow, styles.glowTop]} />
          <View style={[styles.glow, styles.glowBottom]} />

          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.formContainer,
                styles.forgotFormContainer,
              ]}
            >
              <View style={styles.topAccent} />

              <View style={styles.logoCircle}>
                <Ionicons
                  name="lock-open-outline"
                  size={28}
                  color="#eff6ff"
                />
              </View>

              <Text style={styles.brandName}>RTI News</Text>

              <View style={styles.headerBlock}>
                <View style={styles.formIconWrap}>
                  <Ionicons
                    name="mail-open-outline"
                    size={18}
                    color="#7dd3fc"
                  />
                </View>

                <Text style={styles.welcomeBack}>
                  Password recovery
                </Text>

                <Text style={styles.formTitle}>
                  Forgot Password
                </Text>

                <Text style={styles.formSubtitle}>
                  Enter your email to receive an OTP
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email address
                </Text>

                <View style={styles.inputWrap}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#38bdf8"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  loading && styles.btnDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.switchText}>
                  Back to{' '}
                  <Text style={styles.switchLink}>
                    Sign In
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}