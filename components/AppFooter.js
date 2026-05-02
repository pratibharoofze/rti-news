import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Linking, StyleSheet, Platform,
} from 'react-native';

const quickLinks = [
  { label: 'Home',           screen: 'Home' },
  { label: 'About Us',       screen: 'About' },
  { label: 'What is RTI?',   screen: 'WhatIsRTI' },
  { label: 'Important Laws', screen: 'ImportantLaws' },
  { label: 'Contact Us',     screen: 'Contact' },
];

const socialLinks = [
  { icon: 'f',  label: 'Facebook',  url: '#', color: '#1877f2' },
  { icon: '𝕏',  label: 'Twitter',   url: '#', color: '#0ea5e9' },
  { icon: '📸', label: 'Instagram', url: '#', color: '#e1306c' },
  { icon: '💬', label: 'WhatsApp',  url: '#', color: '#25d366' },
  { icon: '▶',  label: 'YouTube',   url: '#', color: '#ff0000' },
];

// ✅ Mobile web detection
const IS_WEB = Platform.OS === 'web';
const IS_WEB_MOBILE = IS_WEB && (
  typeof window !== 'undefined' ? window.innerWidth < 768 : false
);

export default function AppFooter({ navigation }) {
  const [email, setEmail] = useState('');

  // ✅ Native mobile pe nahi dikhega (pehle se tha)
  if (Platform.OS !== 'web') return null;

  // ✅ NEW: Mobile web pe bhi nahi dikhega — bottom tab bar hai wahan
  if (IS_WEB_MOBILE) return null;

  // ✅ Sirf Desktop web pe dikhega
  return (
    <View style={s.footer}>
      <View style={s.orangeStrip} />

      {/* Column 1 */}
      <View style={s.section}>
        <Text style={s.footerLogo}>📰 RTI News</Text>
        <Text style={s.footerAbout}>
          RTI News – सरल सवाल, सटीक जवाब, संविधान द्वारा।{'\n'}
          Simple questions, precise answers – By the Constitution.
        </Text>
        <View style={s.socialRow}>
          {socialLinks.map((sl) => (
            <TouchableOpacity
              key={sl.label}
              style={[s.socialBtn, { backgroundColor: sl.color }]}
              onPress={() => sl.url !== '#' && Linking.openURL(sl.url)}
            >
              <Text style={s.socialIcon}>{sl.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Column 2 */}
      <View style={s.section}>
        <Text style={s.colTitle}>QUICK LINKS</Text>
        <View style={s.divider} />
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.label}
            style={s.linkRow}
            onPress={() => navigation?.navigate(link.screen)}
          >
            <Text style={s.linkArrow}>›</Text>
            <Text style={s.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Column 3 */}
      <View style={s.section}>
        <Text style={s.colTitle}>CONTACT US</Text>
        <View style={s.divider} />
        <View style={s.contactRow}>
          <Text style={s.contactIcon}>📍</Text>
          <Text style={s.contactText}>India – RTI News Network, Headquarters</Text>
        </View>
        <TouchableOpacity style={s.contactRow} onPress={() => Linking.openURL('tel:+911234567890')}>
          <Text style={s.contactIcon}>📞</Text>
          <Text style={[s.contactText, s.contactLink]}>+91 12345 67890</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.contactRow} onPress={() => Linking.openURL('mailto:info@rtinews.in')}>
          <Text style={s.contactIcon}>✉️</Text>
          <Text style={[s.contactText, s.contactLink]}>info@rtinews.in</Text>
        </TouchableOpacity>
        <Text style={s.newsletterLabel}>Subscribe to newsletter:</Text>
        <View style={s.newsletterRow}>
          <TextInput
            style={s.newsletterInput}
            placeholder="Your email..."
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={s.joinBtn}>
            <Text style={s.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom */}
      <View style={s.footerBottom}>
        <Text style={s.bottomText}>
          © {new Date().getFullYear()}{' '}
          <Text style={s.bottomOrange}>RTI News</Text>
          {'. All rights reserved. | Designed with ❤️ for transparency & justice.'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  footer: { backgroundColor: '#111827' },
  orangeStrip: { height: 4, backgroundColor: '#f97316' },
  section: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  footerLogo: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  footerAbout: { color: '#9ca3af', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  socialIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  colTitle: { color: '#fb923c', fontWeight: '800', fontSize: 14, letterSpacing: 1, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#f97316', marginBottom: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  linkArrow: { color: '#f97316', fontSize: 16, fontWeight: '700' },
  linkText: { color: '#9ca3af', fontSize: 13 },
  contactRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  contactIcon: { fontSize: 14, marginTop: 1 },
  contactText: { color: '#9ca3af', fontSize: 13, flex: 1 },
  contactLink: { color: '#fb923c' },
  newsletterLabel: { color: '#9ca3af', fontSize: 13, marginBottom: 8, marginTop: 4 },
  newsletterRow: { flexDirection: 'row' },
  newsletterInput: {
    flex: 1, backgroundColor: '#1f2937', color: '#fff',
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 13,
    borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
    borderWidth: 1, borderColor: '#374151',
  },
  joinBtn: {
    backgroundColor: '#f97316', paddingHorizontal: 16,
    justifyContent: 'center', borderTopRightRadius: 20, borderBottomRightRadius: 20,
  },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  footerBottom: { backgroundColor: '#030712', paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#1f2937' },
  bottomText: { color: '#6b7280', fontSize: 11, textAlign: 'center', lineHeight: 18 },
  bottomOrange: { color: '#fb923c', fontWeight: '700' },
});