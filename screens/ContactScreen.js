import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Linking, Alert, Platform, Modal, FlatList,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';

const addresses = [
  {
    label: 'Address 1',
    line1: 'Flat No. 1106 Lotus Residency',
    line2: 'A Wing Ram Mandir Chowk SV Road',
    line3: 'Mahatma Jyotiba Phule Nagar, Jogeshwari West',
    city: 'Mumbai - 400102',
    state: 'Maharashtra',
  },
  {
    label: 'Address 2',
    line1: '',   // Yahan Address 2 fill karo
    line2: '',
    line3: '',
    city: '',
    state: '',
  },
];

const faqs = [
  {
    q: 'How can I file an RTI application?',
    a: 'You can file an RTI application online through the official RTI Online Portal (rtionline.gov.in) or submit a physical application to the concerned Public Information Officer (PIO). We also provide free RTI guides on our website.',
  },
  {
    q: 'How much does it cost to file an RTI?',
    a: 'The application fee for filing an RTI is ₹10 for central government departments. State government fees may vary. BPL cardholders are exempt from paying the fee.',
  },
  {
    q: 'How long does it take to get a response?',
    a: 'Under the RTI Act, the Public Information Officer must respond within 30 days from the date of application. In case of matters related to life or liberty, the response must be provided within 48 hours.',
  },
  {
    q: 'Can I get help with drafting an RTI application?',
    a: 'Yes! Our team provides free guidance on drafting RTI applications. You can reach out to us via email or phone, and we\'ll help you frame your questions effectively.',
  },
];

const subjects = ['General Inquiry', 'News Tip', 'RTI Assistance', 'Feedback', 'Partnership', 'Other'];

const mapUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.6895!2d72.8344!3d19.1381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63b5c5c5c5d%3A0x5c5c5c5c5c5c5c5c!2sJogeshwari%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000';

// ── Map Component (Platform specific) ──
function MapEmbed() {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: 12, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  // For Android - use WebView with Google Maps
  const androidMapUrl = 'https://www.google.com/maps?q=Jogeshwari+West+Mumbai+Maharashtra&z=15&output=embed';
  
  return (
    <View style={{ flex: 1, height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
      <WebView
        source={{ uri: androidMapUrl }}
        style={{ flex: 1, backgroundColor: '#f3f4f6' }}
        scrollEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          console.warn('WebView error:', syntheticEvent.nativeEvent.description);
        }}
        onLoadEnd={() => {
          console.log('WebView loaded successfully');
        }}
      />
    </View>
  );
}

// ── Subject Picker (custom modal dropdown) ──
function SubjectPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={s.pickerBtn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[s.pickerBtnText, !value && { color: '#9ca3af' }]}>
          {value || 'Select a subject'}
        </Text>
        <Text style={s.pickerArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Select a Subject</Text>
            {subjects.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[s.modalOption, value === sub && s.modalOptionActive]}
                onPress={() => { onChange(sub); setOpen(false); }}
              >
                <Text style={[s.modalOptionText, value === sub && s.modalOptionTextActive]}>
                  {sub}
                </Text>
                {value === sub && <Text style={s.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function ContactScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !selectedSubject || !form.message) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    Alert.alert('Success', 'Your message has been sent!');
    setForm({ name: '', phone: '', email: '', message: '' });
    setSelectedSubject('');
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <AppHeader navigation={navigation} />
      <AppNavbar navigation={navigation} activeScreen="Contact" />

      {/* ── Hero ── */}
      <View style={s.hero}>
        <View style={s.heroCircle1} />
        <View style={s.heroCircle2} />
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>📞 Get in Touch</Text>
        </View>
        <Text style={s.heroTitle}>Contact Us</Text>
        <Text style={s.heroSub}>
          We'd love to hear from you. Reach out with your queries, feedback, or news tips.
        </Text>
      </View>

      <View style={s.body}>

        {/* ── Address Cards (Address 1 & Address 2) ── */}
        {addresses.map((addr, idx) => {
          const hasContent = addr.line1 || addr.line3 || addr.city || addr.state;
          return (
            <View key={idx} style={s.infoCard}>
              <View style={[s.infoIcon, { backgroundColor: '#f97316' }]}>
                <Text style={s.infoIconText}>📍</Text>
              </View>
              <View style={s.infoContent}>
                <Text style={s.infoTitle}>{addr.label}</Text>
                {hasContent ? (
                  <>
                    {addr.line1 ? <Text style={s.infoText}>{addr.line1}</Text> : null}
                    {addr.line2 ? <Text style={s.infoText}>{addr.line2}</Text> : null}
                    {addr.line3 ? <Text style={s.infoText}>{addr.line3}</Text> : null}
                    {addr.city  ? <Text style={[s.infoText, { fontWeight: '700', color: '#111827' }]}>{addr.city}</Text> : null}
                    {addr.state ? <Text style={s.infoText}>{addr.state}</Text> : null}
                  </>
                ) : (
                  <Text style={[s.infoText, { fontStyle: 'italic', color: '#d1d5db' }]}>
                    Address not set
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={s.infoCard} onPress={() => Linking.openURL('tel:+917020667971')}>
          <View style={[s.infoIcon, { backgroundColor: '#16a34a' }]}>
            <Text style={s.infoIconText}>📞</Text>
          </View>
          <View style={s.infoContent}>
            <Text style={s.infoTitle}>Phone Number</Text>
            <Text style={[s.infoText, { color: '#16a34a', fontWeight: '700' }]}>(+91) 070206 67971</Text>
            <Text style={s.infoSubText}>Call us for inquiries</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.infoCard} onPress={() => Linking.openURL('mailto:info@rtinews.in')}>
          <View style={[s.infoIcon, { backgroundColor: '#3b82f6' }]}>
            <Text style={s.infoIconText}>✉️</Text>
          </View>
          <View style={s.infoContent}>
            <Text style={s.infoTitle}>Email Address</Text>
            <Text style={[s.infoText, { color: '#3b82f6', fontWeight: '700' }]}>info@rtinews.in</Text>
            <Text style={s.infoSubText}>We'll respond within 24 hours</Text>
          </View>
        </TouchableOpacity>

        <View style={s.infoCard}>
          <View style={[s.infoIcon, { backgroundColor: '#a855f7' }]}>
            <Text style={s.infoIconText}>🕐</Text>
          </View>
          <View style={s.infoContent}>
            <Text style={s.infoTitle}>Working Hours</Text>
            <Text style={s.infoText}>Mon - Sat: 10:00 AM - 7:00 PM</Text>
            <Text style={s.infoSubText}>Sunday Closed</Text>
          </View>
        </View>

        {/* ── Map Card ── */}
        <View style={s.mapCard}>
          <View style={s.mapHeader}>
            <View style={s.sectionBar} />
            <Text style={s.mapTitle}>📍  Our Location</Text>
          </View>
          <Text style={s.mapSubtitle}>Jogeshwari West, Mumbai - 400102</Text>
          <View style={s.mapContainer}>
            <MapEmbed />
          </View>
          <TouchableOpacity
            style={s.directionBtn}
            onPress={() => Linking.openURL('https://maps.google.com/?q=Jogeshwari+West+Mumbai')}
          >
            <Text style={s.directionBtnText}>🗺️  Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* ── Contact Form ── */}
        <View style={s.formCard}>
          {/* Section header with decorative lines */}
          <View style={s.sectionLabelRow}>
            <View style={s.sectionLabelLine} />
            <Text style={s.sectionLabel}>SEND US A MESSAGE</Text>
            <View style={s.sectionLabelLine} />
          </View>
          <Text style={s.sectionTitle}>Get in Touch</Text>
          <Text style={s.sectionSub}>
            Have a question or want to share a news tip? Fill out the form below.
          </Text>

          {/* Row 1: Name + Phone */}
          <View style={s.formRow}>
            <View style={s.formHalf}>
              <Text style={s.label}>Full Name <Text style={s.required}>*</Text></Text>
              <TextInput
                style={s.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={form.name}
                onChangeText={(t) => updateField('name', t)}
              />
            </View>
            <View style={s.formHalf}>
              <Text style={s.label}>Phone Number</Text>
              <TextInput
                style={s.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(t) => updateField('phone', t)}
              />
            </View>
          </View>

          {/* Row 2: Email full width */}
          <Text style={s.label}>Email Address <Text style={s.required}>*</Text></Text>
          <TextInput
            style={s.input}
            placeholder="Enter your email address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(t) => updateField('email', t)}
          />

          {/* Row 3: Subject dropdown */}
          <Text style={s.label}>Subject <Text style={s.required}>*</Text></Text>
          <SubjectPicker value={selectedSubject} onChange={setSelectedSubject} />

          {/* Row 4: Message */}
          <Text style={[s.label, { marginTop: 12 }]}>Message <Text style={s.required}>*</Text></Text>
          <TextInput
            style={[s.input, s.textarea]}
            placeholder="Write your message here..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={5}
            value={form.message}
            onChangeText={(t) => updateField('message', t)}
          />

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
            <Text style={s.submitBtnText}>✈️  Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* ── FAQ ── */}
        <View style={s.faqCard}>
          <View style={s.sectionLabelRow}>
            <View style={s.sectionLabelLine} />
            <Text style={s.sectionLabel}>COMMON QUESTIONS</Text>
            <View style={s.sectionLabelLine} />
          </View>
          <Text style={s.sectionTitle}>Frequently Asked Questions</Text>

          <View style={{ marginTop: 16 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[s.faqItem, isOpen && s.faqItemOpen]}
                  onPress={() => setOpenFaq(isOpen ? null : idx)}
                  activeOpacity={0.85}
                >
                  <View style={s.faqHeader}>
                    <Text style={s.faqQ}>
                      <Text style={s.faqQLabel}>Q. </Text>{faq.q}
                    </Text>
                    <View style={[s.faqToggleBubble, isOpen && s.faqToggleBubbleActive]}>
                      <Text style={[s.faqToggle, isOpen && s.faqToggleActive]}>
                        {isOpen ? '−' : '+'}
                      </Text>
                    </View>
                  </View>
                  {isOpen && (
                    <Text style={s.faqA}>
                      <Text style={s.faqALabel}>A. </Text>{faq.a}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </View>

      <AppFooter navigation={navigation} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },

  // ── Hero ──
  hero: {
    backgroundColor: '#f97316',
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircle1: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroCircle2: {
    position: 'absolute', bottom: -50, left: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  heroSub: { color: '#fed7aa', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // ── Info Cards ──
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  infoIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoIconText: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#6b7280', lineHeight: 20 },
  infoSubText: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  // ── Map Card ──
  mapCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  mapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionBar: { width: 4, height: 20, backgroundColor: '#f97316', borderRadius: 2, marginRight: 8 },
  mapTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  mapSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 12, marginLeft: 12 },
  mapContainer: { height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  directionBtn: {
    marginTop: 12, backgroundColor: '#f97316',
    borderRadius: 25, paddingVertical: 11, alignItems: 'center',
  },
  directionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Form Card ──
  formCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },

  // Section label with decorative lines (like screenshot)
  sectionLabelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
  },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: '#f97316', opacity: 0.4 },
  sectionLabel: {
    color: '#f97316', fontWeight: '800', fontSize: 11, letterSpacing: 1.2,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#111827', fontWeight: '900', fontSize: 22,
    textAlign: 'center', marginBottom: 6,
  },
  sectionSub: {
    color: '#6b7280', fontSize: 12, textAlign: 'center',
    marginBottom: 20, lineHeight: 18,
  },

  // 2-column row
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  formHalf: { flex: 1 },

  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 4 },
  required: { color: '#ef4444' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, color: '#111827',
    backgroundColor: '#f9fafb', marginBottom: 12,
  },
  textarea: { height: 120, textAlignVertical: 'top' },

  // Picker (dropdown style)
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#f9fafb', marginBottom: 4,
  },
  pickerBtnText: { fontSize: 13, color: '#111827', flex: 1 },
  pickerArrow: { fontSize: 16, color: '#6b7280', marginLeft: 8 },

  // Modal dropdown
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 8, width: '100%', maxWidth: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
  },
  modalTitle: {
    fontSize: 14, fontWeight: '800', color: '#111827',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 10, marginHorizontal: 4,
  },
  modalOptionActive: { backgroundColor: '#fff7ed' },
  modalOptionText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  modalOptionTextActive: { color: '#f97316', fontWeight: '700' },
  modalCheck: { color: '#f97316', fontWeight: '800', fontSize: 15 },

  submitBtn: {
    backgroundColor: '#f97316', borderRadius: 25,
    paddingVertical: 14, alignItems: 'center', marginTop: 12,
    alignSelf: 'center', paddingHorizontal: 40,
  },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // ── FAQ ──
  faqCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  faqItem: {
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  faqItemOpen: { borderColor: '#fdba74' },
  faqHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 10,
  },
  faqQ: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1, lineHeight: 20 },
  faqQLabel: { color: '#f97316', fontWeight: '800' },
  faqToggleBubble: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  faqToggleBubbleActive: { backgroundColor: '#fff7ed' },
  faqToggle: { fontSize: 18, color: '#6b7280', fontWeight: '800', lineHeight: 22 },
  faqToggleActive: { color: '#f97316' },
  faqA: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginTop: 12, paddingLeft: 16 },
  faqALabel: { color: '#16a34a', fontWeight: '800' },
});