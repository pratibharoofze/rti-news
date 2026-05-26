import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Share, Linking, Clipboard, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Apna app ka refer link yahan daalo ──────────────────────────────────────
const REFER_LINK = 'https://play.google.com/store/apps/details?id=com.yourcompany.rtiapp'; // Apna real link daalo
const APP_NAME   = 'RTI App';
const REFER_MSG  =
  `📢 *${APP_NAME}* use karo!\n\n` +
  `RTI (Right to Information) file karna ab bahut aasaan ho gaya hai. ` +
  `Seedha apne phone se RTI daalo, track karo aur jawab pao.\n\n` +
  `👉 Download karo: ${REFER_LINK}`;

// ── Social platforms config ─────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    bg: '#e9fbe9',
    getUrl: () => `https://wa.me/?text=${encodeURIComponent(REFER_MSG)}`,
  },
  {
    id: 'whatsapp_status',
    label: 'WhatsApp Status',
    icon: 'logo-whatsapp',
    color: '#128C7E',
    bg: '#e0f4f2',
    getUrl: () => `https://wa.me/?text=${encodeURIComponent(REFER_MSG)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    color: '#E1306C',
    bg: '#fde8ef',
    getUrl: () => `https://www.instagram.com/`,
    note: 'Link copy ho jayega',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    bg: '#e7f0fd',
    getUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(REFER_LINK)}`,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    bg: '#e7f5fd',
    getUrl: () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(REFER_MSG)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: 'paper-plane-outline',
    color: '#229ED9',
    bg: '#e4f4fb',
    getUrl: () =>
      `https://t.me/share/url?url=${encodeURIComponent(REFER_LINK)}&text=${encodeURIComponent('📢 RTI App use karo — apna haq maango!')}`,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    icon: 'mail-outline',
    color: '#EA4335',
    bg: '#fde9e7',
    getUrl: () =>
      `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(APP_NAME + ' — Apna Haq Maango!')}&body=${encodeURIComponent(REFER_MSG)}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: 'chatbubble-outline',
    color: '#6366f1',
    bg: '#eeeffd',
    getUrl: () =>
      Platform.OS === 'ios'
        ? `sms:&body=${encodeURIComponent(REFER_MSG)}`
        : `sms:?body=${encodeURIComponent(REFER_MSG)}`,
  },
  {
    id: 'more',
    label: 'More Options',
    icon: 'share-social-outline',
    color: '#64748b',
    bg: '#f1f5f9',
    isNativeShare: true,
  },
];

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReferScreen({ navigation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(REFER_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async (platform) => {
    if (platform.isNativeShare) {
      try {
        await Share.share({ message: REFER_MSG, url: REFER_LINK });
      } catch (e) {}
      return;
    }
    if (platform.id === 'instagram') {
      handleCopy();
      Linking.openURL('instagram://').catch(() =>
        Linking.openURL('https://www.instagram.com/')
      );
      return;
    }
    const url = platform.getUrl();
    Linking.openURL(url).catch(() => {
      Share.share({ message: REFER_MSG });
    });
  };

  return (
    <View style={styles.root}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>📢</Text>
          <Text style={styles.bannerTitle}>Apna Haq Maango!</Text>
          <Text style={styles.bannerSub}>
            Dosto aur family ko RTI App ke baare mein batao.{'\n'}
            Unhe bhi apna haq milega! 🇮🇳
          </Text>
        </View>

        {/* Refer Link Copy Box */}
        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>Tumhara Refer Link</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{REFER_LINK}</Text>
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnDone]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#fff" />
              <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share via */}
        <Text style={styles.sectionTitle}>Share via</Text>
        <View style={styles.grid}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.platformCard}
              onPress={() => handleShare(p)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, { backgroundColor: p.bg }]}>
                <Ionicons name={p.icon} size={28} color={p.color} />
              </View>
              <Text style={styles.platformLabel}>{p.label}</Text>
              {p.note && <Text style={styles.platformNote}>{p.note}</Text>}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },

  content: { padding: 16, paddingBottom: 40 },

  banner: {
    backgroundColor: '#1d4ed8', borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20,
  },
  bannerEmoji: { fontSize: 44, marginBottom: 8 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 6 },
  bannerSub: { fontSize: 13, color: '#bfdbfe', textAlign: 'center', lineHeight: 20 },

  linkBox: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24,
  },
  linkLabel: {
    fontSize: 11, color: '#64748b', fontWeight: '700',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '500' },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10,
  },
  copyBtnDone: { backgroundColor: '#16a34a' },
  copyBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 14 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  platformCard: {
    width: '29%', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#e2e8f0',
    elevation: 1,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  platformLabel: { fontSize: 12, color: '#334155', fontWeight: '700', textAlign: 'center' },
  platformNote: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 2 },
});