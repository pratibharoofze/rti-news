import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Razorpay Config ────────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID     = 'rzp_test_XXXXXXXXXXXXXXX'; // apna Key ID daalo
const RAZORPAY_KEY_SECRET = 'XXXXXXXXXXXXXXXXXXXXXXXX'; // apna Key Secret daalo

async function createRazorpayPaymentLink({ amount, description, customerName, customerContact, customerEmail }) {
  const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const expireBy    = Math.floor(Date.now() / 1000) + 86400;

  const body = {
    amount:           amount * 100,
    currency:         'INR',
    accept_partial:   false,
    description:      description,
    expire_by:        expireBy,
    reminder_enable:  false,
    notify:           { sms: !!customerContact, email: !!customerEmail },
    ...(customerName || customerContact || customerEmail ? {
      customer: {
        name:    customerName    || 'Customer',
        contact: customerContact || '',
        email:   customerEmail   || '',
      },
    } : {}),
    options: {
      checkout: {
        name: 'Shuru App',
        prefill: {
          name:    customerName    || '',
          contact: customerContact || '',
          email:   customerEmail   || '',
        },
      },
    },
  };

  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.description || 'Payment link create karne mein error aaya');
  return data.short_url;
}

// ── Benefits list ──────────────────────────────────────────────────────────────
const BENEFITS = [
  { icon: '⭐', text: 'Get Blue tick on Profile' },
  { icon: '📝', text: 'For creators, grow profile faster' },
  { icon: '💎', text: 'Achieve 2X reach and more visibility' },
  { icon: '📺', text: 'Watch unlimited, local & premium' },
];

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function PurchaseBlueTickScreen({ navigation, route }) {
  const user = route?.params?.user || {};
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const PRICE = 1; // ₹1 trial

  const handleStartTrial = async () => {
    setLoading(true);
    
    // Simulate API call or payment processing
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        // Navigate back or to next screen after success
        // navigation.goBack();
        // OR
        // navigation.navigate('SuccessScreen');
      }, 3000);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={s.backText}>back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Get Blue tick ₹1</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Success Message Toast ── */}
      {showSuccess && (
        <View style={s.successToast}>
          <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
          <Text style={s.successText}>Trial started successfully! 🎉</Text>
          <TouchableOpacity onPress={handleCloseSuccess} style={s.successClose}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Blue Tick Badge ── */}
        <View style={s.badgeWrap}>
          <View style={s.badgeCircle}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
        </View>

        {/* ── Title ── */}
        <Text style={s.title}>Verified tick comes with many</Text>
        <Text style={s.titleHighlight}>Benefits</Text>

        {/* ── Benefits Cards ── */}
        <View style={s.benefitsList}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={s.benefitCard}>
              <Text style={s.benefitIcon}>{b.icon}</Text>
              <Text style={s.benefitText}>{b.text}</Text>
              <Ionicons name="checkmark" size={18} color="#fff" style={s.benefitCheck} />
            </View>
          ))}
        </View>

        {/* ── Trial Label ── */}
        <Text style={s.trialLabel}>3 day trial, then ₹90 quarterly</Text>

        {/* ── Info Points ── */}
        <View style={s.infoBox}>
          <View style={s.infoRow}>
            <Text style={s.infoDot}>•</Text>
            <Text style={s.infoText}>
              Your plan auto-renews based on the selected plan. You can cancel anytime from settings before renewal, your subscription stays active until it expires.
            </Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoDot}>•</Text>
            <Text style={s.infoText}>
              All services of Shuru local news app are paid, to watch local news you will have to start a subscription.
            </Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={s.bottomBar}>
        <View style={s.bottomLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('TermsConditions')}>
            <Text style={s.bottomLink}>Terms & C...</Text>
          </TouchableOpacity>
          <Text style={s.bottomDot}>•</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RefundPolicy')}>
            <Text style={s.bottomLink}>Refund Policy</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.priceTag}>₹1/-</Text>
        <Text style={s.priceSubtitle}>Become premium member in just ₹1</Text>

        <TouchableOpacity
          style={[s.ctaBtn, loading && s.ctaBtnDisabled]}
          onPress={handleStartTrial}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.ctaBtnText}>Start Trial now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const DARK_BLUE = '#0A1628';
const MID_BLUE  = '#0D2245';
const BTN_BLUE  = '#1565C0';
const CARD_BLUE = '#1A3A6B';
const GREEN     = '#2ECC71';

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: DARK_BLUE },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: MID_BLUE,
  },
  backBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText:   { color: '#fff', fontSize: 14, fontWeight: '500' },
  headerTitle:{ fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center', flex: 1 },

  // Badge
  badgeWrap:   { alignItems: 'center', marginTop: 36, marginBottom: 24 },
  badgeCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: BTN_BLUE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#4FC3F7',
    elevation: 8, shadowColor: '#4FC3F7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },

  // Title
  title:          { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 4 },
  titleHighlight: { fontSize: 22, fontWeight: '900', color: '#4FC3F7', textAlign: 'center', marginBottom: 24 },

  // Benefits
  benefitsList: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  benefitCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_BLUE,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: '#1E4D8C',
  },
  benefitIcon:  { fontSize: 18, marginRight: 12 },
  benefitText:  { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff' },
  benefitCheck: { marginLeft: 8 },

  // Trial label
  trialLabel: { textAlign: 'center', fontSize: 13, color: '#94A3B8', marginBottom: 20, paddingHorizontal: 16 },

  // Info
  infoBox:  { paddingHorizontal: 20, gap: 12 },
  infoRow:  { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  infoDot:  { color: '#94A3B8', fontSize: 16, lineHeight: 20 },
  infoText: { flex: 1, fontSize: 12, color: '#94A3B8', lineHeight: 18 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: MID_BLUE,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#1E3A5F',
    elevation: 20,
  },
  bottomLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 },
  bottomLink:  { fontSize: 12, color: '#4FC3F7', textDecorationLine: 'underline' },
  bottomDot:   { color: '#4FC3F7', fontSize: 12 },

  priceTag:      { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 2 },
  priceSubtitle: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', textAlign: 'center', marginBottom: 14 },

  ctaBtn: {
    backgroundColor: GREEN,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  ctaBtnDisabled: { opacity: 0.7 },
  ctaBtnText:     { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },

  // Success Toast Styles
  successToast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#0D2245',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  successText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  successClose: {
    padding: 4,
  },
});