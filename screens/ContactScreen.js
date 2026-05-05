import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Linking, Alert, Platform, Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';

// ─────────────────────────────────────────────
// Static Data
// ─────────────────────────────────────────────
const addresses = [
  {
    label: 'Head Office',
    line1: 'Flat No. 1106, Lotus Residency',
    line2: 'A Wing, Ram Mandir Chowk, SV Road',
    line3: 'Mahatma Jyotiba Phule Nagar, Jogeshwari West',
    city: 'Mumbai - 400102',
    state: 'Maharashtra, India',
  },
  {
    label: 'Branch Office',
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
  },
];

const faqs = [
  {
    question: 'How can I file an RTI application?',
    answer:
      'You can file an RTI application online through the official RTI Online Portal (rtionline.gov.in) or submit a physical application to the concerned Public Information Officer (PIO). We also provide free RTI guides on our website.',
  },
  {
    question: 'How much does it cost to file an RTI?',
    answer:
      'The application fee for filing an RTI is ₹10 for central government departments. State government fees may vary. BPL cardholders are exempt from paying the fee.',
  },
  {
    question: 'How long does it take to get a response?',
    answer:
      'Under the RTI Act, the Public Information Officer must respond within 30 days from the date of application. In matters related to life or liberty, the response must be provided within 48 hours.',
  },
  {
    question: 'Can I get help drafting an RTI application?',
    answer:
      "Yes! Our team provides free guidance on drafting RTI applications. Reach out via email or phone and we'll help you frame your questions effectively.",
  },
];

const subjectOptions = ['General Inquiry', 'News Tip', 'RTI Assistance', 'Feedback', 'Partnership', 'Other'];

const contactInfoItems = [
  {
    icon: '📞',
    accentColor: '#16a34a',
    title: 'Phone Number',
    primaryText: '(+91) 070206 67971',
    secondaryText: 'Call us for inquiries',
    action: () => Linking.openURL('tel:+917020667971'),
    isLink: true,
  },
  {
    icon: '✉️',
    accentColor: '#3b82f6',
    title: 'Email Address',
    primaryText: 'info@rtinews.in',
    secondaryText: "We'll respond within 24 hours",
    action: () => Linking.openURL('mailto:info@rtinews.in'),
    isLink: true,
  },
  {
    icon: '🕐',
    accentColor: '#a855f7',
    title: 'Working Hours',
    primaryText: 'Mon – Sat: 10:00 AM – 7:00 PM',
    secondaryText: 'Closed on Sundays',
    action: null,
    isLink: false,
  },
];

const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.6895!2d72.8344!3d19.1381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63b5c5c5c5d%3A0x5c5c5c5c5c5c5c5c!2sJogeshwari%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000';

// ─────────────────────────────────────────────
// Platform Shadow Helpers
// ─────────────────────────────────────────────
const cardElevation = Platform.select({
  web: { boxShadow: '0px 2px 12px rgba(0,0,0,0.07)' },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
});

const modalElevation = Platform.select({
  web: { boxShadow: '0px 12px 32px rgba(0,0,0,0.18)' },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
});

// ─────────────────────────────────────────────
// Map Embed Component
// ─────────────────────────────────────────────
function MapEmbed() {
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={MAP_EMBED_URL}
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: 14, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  const mobileMapUrl =
    'https://www.google.com/maps?q=Jogeshwari+West+Mumbai+Maharashtra&z=15&output=embed';
  return (
    <View style={s.mapEmbedWrapper}>
      <WebView
        source={{ uri: mobileMapUrl }}
        style={s.mapWebView}
        scrollEnabled
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit={false}
        originWhitelist={['*']}
        onError={(e) => console.warn('Map WebView error:', e.nativeEvent.description)}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// Subject Picker Component
// ─────────────────────────────────────────────
function SubjectPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={s.pickerTrigger}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[s.pickerTriggerText, !value && s.pickerPlaceholderText]}>
          {value || 'Select a subject'}
        </Text>
        <Text style={s.pickerChevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={s.modalSheet}>
            <Text style={s.modalSheetTitle}>Select a Subject</Text>
            {subjectOptions.map((option) => {
              const isSelected = value === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[s.modalOptionRow, isSelected && s.modalOptionRowSelected]}
                  onPress={() => { onChange(option); setIsOpen(false); }}
                >
                  <Text style={[s.modalOptionLabel, isSelected && s.modalOptionLabelSelected]}>
                    {option}
                  </Text>
                  {isSelected && <Text style={s.modalOptionCheckmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// Divider with Label
// ─────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerLabel}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
const isWeb = Platform.OS === 'web';

export default function ContactScreen({ navigation }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [selectedSubject, setSelectedSubject] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const updateFormField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFormSubmit = () => {
    if (!formData.name || !formData.email || !selectedSubject || !formData.message) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }
    Alert.alert('Message Sent!', 'Thank you for reaching out. We will get back to you shortly.');
    setFormData({ name: '', phone: '', email: '', message: '' });
    setSelectedSubject('');
  };

  return (
    <View style={s.screenRoot}>
      {isWeb && <AppNavbar navigation={navigation} activeScreen="Contact" />}

      <ScrollView style={s.scrollArea} showsVerticalScrollIndicator={false}>
        <AppHeader navigation={navigation} />

        {/* ── Hero Banner ── */}
        <View style={s.heroBanner}>
          <View style={s.heroGlowTopRight} />
          <View style={s.heroGlowBottomLeft} />
          <View style={s.heroPill}>
            <Text style={s.heroPillText}>📞  Get in Touch</Text>
          </View>
          <Text style={s.heroHeading}>Contact Us</Text>
          <Text style={s.heroTagline}>
            We'd love to hear from you. Reach out with your queries, feedback, or news tips.
          </Text>
          {/* Stat strip */}
          <View style={s.heroStatStrip}>
            <View style={s.heroStatItem}>
              <Text style={s.heroStatValue}>24h</Text>
              <Text style={s.heroStatLabel}>Response Time</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStatItem}>
              <Text style={s.heroStatValue}>Free</Text>
              <Text style={s.heroStatLabel}>RTI Guidance</Text>
            </View>
            <View style={s.heroStatDivider} />
            <View style={s.heroStatItem}>
              <Text style={s.heroStatValue}>6 Days</Text>
              <Text style={s.heroStatLabel}>Available</Text>
            </View>
          </View>
        </View>

        <View style={s.pageBody}>

          {/* ── Address Cards ── */}
          {addresses.map((addr, idx) => {
            const hasContent = addr.line1 || addr.city || addr.state;
            return (
              <View key={idx} style={s.contactInfoCard}>
                <View style={[s.contactInfoIconBox, { backgroundColor: '#f97316' }]}>
                  <Text style={s.contactInfoIconEmoji}>📍</Text>
                </View>
                <View style={s.contactInfoTextBlock}>
                  <Text style={s.contactInfoCardTitle}>{addr.label}</Text>
                  {hasContent ? (
                    <>
                      {addr.line1 ? <Text style={s.contactInfoLine}>{addr.line1}</Text> : null}
                      {addr.line2 ? <Text style={s.contactInfoLine}>{addr.line2}</Text> : null}
                      {addr.line3 ? <Text style={s.contactInfoLine}>{addr.line3}</Text> : null}
                      {addr.city  ? <Text style={s.contactInfoCityText}>{addr.city}</Text> : null}
                      {addr.state ? <Text style={s.contactInfoLine}>{addr.state}</Text> : null}
                    </>
                  ) : (
                    <Text style={s.contactInfoEmptyText}>Address not configured yet.</Text>
                  )}
                </View>
              </View>
            );
          })}

          {/* ── Phone / Email / Hours ── */}
          {contactInfoItems.map((item) => {
            const CardWrapper = item.isLink ? TouchableOpacity : View;
            const wrapperProps = item.isLink ? { onPress: item.action, activeOpacity: 0.85 } : {};
            return (
              <CardWrapper key={item.title} style={s.contactInfoCard} {...wrapperProps}>
                <View style={[s.contactInfoIconBox, { backgroundColor: item.accentColor }]}>
                  <Text style={s.contactInfoIconEmoji}>{item.icon}</Text>
                </View>
                <View style={s.contactInfoTextBlock}>
                  <Text style={s.contactInfoCardTitle}>{item.title}</Text>
                  <Text style={[s.contactInfoPrimaryText, { color: item.accentColor }]}>
                    {item.primaryText}
                  </Text>
                  <Text style={s.contactInfoSecondaryText}>{item.secondaryText}</Text>
                </View>
                {item.isLink && (
                  <View style={[s.contactInfoArrowBadge, { backgroundColor: item.accentColor + '18' }]}>
                    <Text style={[s.contactInfoArrow, { color: item.accentColor }]}>→</Text>
                  </View>
                )}
              </CardWrapper>
            );
          })}

          {/* ── Map Section ── */}
          <View style={s.mapCard}>
            <View style={s.mapCardHeader}>
              <View style={s.mapCardAccentBar} />
              <Text style={s.mapCardTitle}>Our Location</Text>
            </View>
            <Text style={s.mapCardSubtitle}>Jogeshwari West, Mumbai – 400102</Text>
            <View style={s.mapFrame}>
              <MapEmbed />
            </View>
            <TouchableOpacity
              style={s.getDirectionsButton}
              onPress={() => Linking.openURL('https://maps.google.com/?q=Jogeshwari+West+Mumbai')}
              activeOpacity={0.88}
            >
              <Text style={s.getDirectionsButtonText}>🗺️  Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* ── Contact Form ── */}
          <View style={s.formCard}>
            <SectionDivider label="SEND US A MESSAGE" />
            <Text style={s.formCardHeading}>Get in Touch</Text>
            <Text style={s.formCardSubheading}>
              Have a question or a news tip? Fill out the form and we'll get back to you.
            </Text>

            {/* Name + Phone */}
            <View style={s.formTwoColumnRow}>
              <View style={s.formColumn}>
                <Text style={s.formFieldLabel}>
                  Full Name <Text style={s.formRequiredStar}>*</Text>
                </Text>
                <TextInput
                  style={s.formTextInput}
                  placeholder="Your full name"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(t) => updateFormField('name', t)}
                />
              </View>
              <View style={s.formColumn}>
                <Text style={s.formFieldLabel}>Phone Number</Text>
                <TextInput
                  style={s.formTextInput}
                  placeholder="Your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(t) => updateFormField('phone', t)}
                />
              </View>
            </View>

            {/* Email */}
            <Text style={s.formFieldLabel}>
              Email Address <Text style={s.formRequiredStar}>*</Text>
            </Text>
            <TextInput
              style={s.formTextInput}
              placeholder="your@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(t) => updateFormField('email', t)}
            />

            {/* Subject */}
            <Text style={s.formFieldLabel}>
              Subject <Text style={s.formRequiredStar}>*</Text>
            </Text>
            <SubjectPicker value={selectedSubject} onChange={setSelectedSubject} />

            {/* Message */}
            <Text style={[s.formFieldLabel, s.formFieldLabelSpacingTop]}>
              Message <Text style={s.formRequiredStar}>*</Text>
            </Text>
            <TextInput
              style={[s.formTextInput, s.formTextArea]}
              placeholder="Write your message here..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={5}
              value={formData.message}
              onChangeText={(t) => updateFormField('message', t)}
            />

            <TouchableOpacity
              style={s.formSubmitButton}
              onPress={handleFormSubmit}
              activeOpacity={0.88}
            >
              <Text style={s.formSubmitButtonText}>✈️  Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* ── FAQ ── */}
          <View style={s.faqCard}>
            <SectionDivider label="COMMON QUESTIONS" />
            <Text style={s.faqCardHeading}>Frequently Asked Questions</Text>

            <View style={s.faqListContainer}>
              {faqs.map((faq, idx) => {
                const isExpanded = openFaqIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[s.faqAccordionItem, isExpanded && s.faqAccordionItemExpanded]}
                    onPress={() => setOpenFaqIndex(isExpanded ? null : idx)}
                    activeOpacity={0.85}
                  >
                    <View style={s.faqAccordionHeader}>
                      <Text style={s.faqQuestionText}>
                        <Text style={s.faqQuestionPrefix}>Q.  </Text>
                        {faq.question}
                      </Text>
                      <View style={[s.faqToggleButton, isExpanded && s.faqToggleButtonExpanded]}>
                        <Text style={[s.faqToggleIcon, isExpanded && s.faqToggleIconExpanded]}>
                          {isExpanded ? '−' : '+'}
                        </Text>
                      </View>
                    </View>
                    {isExpanded && (
                      <Text style={s.faqAnswerText}>
                        <Text style={s.faqAnswerPrefix}>A.  </Text>
                        {faq.answer}
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

      {!isWeb && <AppNavbar navigation={navigation} activeScreen="Contact" />}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const ORANGE = '#f97316';
const ORANGE_LIGHT = '#fff7ed';
const ORANGE_BORDER = '#fdba74';
const DARK = '#111827';
const MUTED = '#6b7280';
const SUBTLE = '#9ca3af';
const BORDER = '#e5e7eb';
const SURFACE = '#ffffff';
const PAGE_BG = '#f1f5f9';
const INPUT_BG = '#f9fafb';

const s = StyleSheet.create({

  // ── Root Layout ──
  screenRoot: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  pageBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  // ── Hero Banner ──
  heroBanner: {
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroHeading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroTagline: {
    color: '#fed7aa',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: 24,
  },
  heroStatStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  heroStatLabel: {
    color: '#fed7aa',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // ── Contact Info Cards ──
  contactInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    ...cardElevation,
  },
  contactInfoIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfoIconEmoji: {
    fontSize: 22,
  },
  contactInfoTextBlock: {
    flex: 1,
  },
  contactInfoCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  contactInfoLine: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 20,
  },
  contactInfoCityText: {
    fontSize: 13,
    color: DARK,
    fontWeight: '700',
    lineHeight: 20,
  },
  contactInfoEmptyText: {
    fontSize: 13,
    color: '#d1d5db',
    fontStyle: 'italic',
  },
  contactInfoPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  contactInfoSecondaryText: {
    fontSize: 11,
    color: SUBTLE,
    marginTop: 3,
  },
  contactInfoArrowBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  contactInfoArrow: {
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Map Card ──
  mapCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    ...cardElevation,
  },
  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapCardAccentBar: {
    width: 4,
    height: 22,
    backgroundColor: ORANGE,
    borderRadius: 3,
    marginRight: 10,
  },
  mapCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.3,
  },
  mapCardSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 14,
    marginLeft: 14,
  },
  mapFrame: {
    height: 230,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  mapEmbedWrapper: {
    flex: 1,
    height: 230,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  getDirectionsButton: {
    marginTop: 14,
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 13,
    alignItems: 'center',
  },
  getDirectionsButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Section Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ORANGE,
    opacity: 0.35,
  },
  dividerLabel: {
    color: ORANGE,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.4,
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    ...cardElevation,
  },
  formCardHeading: {
    color: DARK,
    fontWeight: '900',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  formCardSubheading: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  formTwoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  formFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
    marginTop: 6,
  },
  formFieldLabelSpacingTop: {
    marginTop: 14,
  },
  formRequiredStar: {
    color: '#ef4444',
  },
  formTextInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 13,
    color: DARK,
    backgroundColor: INPUT_BG,
    marginBottom: 12,
  },
  formTextArea: {
    height: 130,
    textAlignVertical: 'top',
  },
  formSubmitButton: {
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 14,
    alignSelf: 'center',
    paddingHorizontal: 48,
  },
  formSubmitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Subject Picker ──
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: INPUT_BG,
    marginBottom: 4,
  },
  pickerTriggerText: {
    fontSize: 13,
    color: DARK,
    flex: 1,
  },
  pickerPlaceholderText: {
    color: SUBTLE,
  },
  pickerChevron: {
    fontSize: 16,
    color: MUTED,
    marginLeft: 8,
  },

  // ── Subject Picker Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalSheet: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 8,
    width: '100%',
    maxWidth: 400,
    ...modalElevation,
  },
  modalSheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  modalOptionRowSelected: {
    backgroundColor: ORANGE_LIGHT,
  },
  modalOptionLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  modalOptionLabelSelected: {
    color: ORANGE,
    fontWeight: '700',
  },
  modalOptionCheckmark: {
    color: ORANGE,
    fontWeight: '800',
    fontSize: 15,
  },

  // ── FAQ Card ──
  faqCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    ...cardElevation,
  },
  faqCardHeading: {
    color: DARK,
    fontWeight: '900',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  faqListContainer: {
    gap: 10,
  },
  faqAccordionItem: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  faqAccordionItemExpanded: {
    borderColor: ORANGE_BORDER,
    backgroundColor: ORANGE_LIGHT,
  },
  faqAccordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
    flex: 1,
    lineHeight: 21,
  },
  faqQuestionPrefix: {
    color: ORANGE,
    fontWeight: '800',
  },
  faqToggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqToggleButtonExpanded: {
    backgroundColor: ORANGE,
  },
  faqToggleIcon: {
    fontSize: 18,
    color: MUTED,
    fontWeight: '800',
    lineHeight: 22,
  },
  faqToggleIconExpanded: {
    color: '#fff',
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 21,
    marginTop: 12,
    paddingLeft: 4,
  },
  faqAnswerPrefix: {
    color: '#16a34a',
    fontWeight: '800',
  },
});