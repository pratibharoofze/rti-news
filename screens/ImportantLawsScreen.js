import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';

const laws = [
  {
    title: 'Right to Information Act, 2005',
    short: 'RTI Act 2005',
    desc: 'This act gives Indian citizens the right to request information from government authorities. Public authorities must provide information within 30 days.',
    color: '#f97316',
    icon: '📜',
  },
  {
    title: 'Prevention of Delay in Government Offices Act',
    short: 'Delay Prevention Act',
    desc: 'Maharashtra Government Act regulating transfers of government employees and preventing delays in discharging official duties, 2005.',
    color: '#3b82f6',
    icon: '⚖️',
  },
  {
    title: 'Central Information Commission (CIC)',
    short: 'Central Information Commission',
    desc: 'For complaints related to central government public sector authorities. Address: August Kranti Bhawan, Bhikaji Cama Place, New Delhi 110006.',
    color: '#16a34a',
    icon: '🏛️',
  },
  {
    title: 'State Information Commission (SIC)',
    short: 'State Information Commission',
    desc: 'Complaints related to state government public sector authorities should be filed with the respective State Information Commission.',
    color: '#a855f7',
    icon: '🏢',
  },
  {
    title: 'Section 8 - Refusal to Provide Information',
    short: 'Section 8 - Exemptions',
    desc: 'Information can be refused in matters such as national security, personal privacy, and court proceedings.',
    color: '#ef4444',
    icon: '🚫',
  },
  {
    title: 'Section 9 - Copyrighted Information',
    short: 'Section 9 - Copyright',
    desc: 'If the information falls under the copyright of a person other than the state, it can be refused.',
    color: '#14b8a6',
    icon: '©️',
  },
];

const keyFacts = [
  { icon: '💰', label: 'Application Fee', value: '₹10 only' },
  { icon: '⏱️', label: 'Response Time', value: '30 Days' },
  { icon: '🚨', label: 'Life & Liberty', value: '48 Hours' },
  { icon: '🆓', label: 'BPL Citizens', value: 'Free' },
];

const rtiSteps = [
  {
    step: '1',
    title: 'Prepare Your Application',
    desc: 'Write the information request application by hand or typed on plain paper.',
  },
  {
    step: '2',
    title: 'Pay the Fee',
    desc: 'Pay ₹10 via demand draft, postal order, or cash. BPL cardholders are exempt.',
  },
  {
    step: '3',
    title: 'Submit the Application',
    desc: 'Submit the application to the concerned Public Information Officer and collect the acknowledgment receipt.',
  },
  {
    step: '4',
    title: 'Wait for a Response',
    desc: 'A response is expected within 30 days. No response is treated as a refusal.',
  },
  {
    step: '5',
    title: 'File an Appeal',
    desc: 'If not satisfied, file a first appeal within 30 days, then escalate to CIC/SIC.',
  },
];

const isWeb = Platform.OS === 'web';

export default function ImportantLawsScreen({ navigation }) {
  return (
    <View style={s.screenWrapper}>
      {/* Web: top navbar */}
      {isWeb && <AppNavbar navigation={navigation} activeScreen="ImportantLaws" />}

      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <AppHeader navigation={navigation} />

        {/* Hero Section */}
        <View style={s.heroSection}>
          <View style={s.heroDecorCircleTop} />
          <View style={s.heroDecorCircleBottom} />
          <Text style={s.heroEmoji}>⚖️</Text>
          <Text style={s.heroTitle}>Important Laws</Text>
          <Text style={s.heroSubtitle}>
            RTI Act and related important laws that every citizen should know.
          </Text>
        </View>

        <View style={s.bodyContainer}>

          {/* Key Facts Row */}
          <View style={s.keyFactsRow}>
            {keyFacts.map((fact) => (
              <View key={fact.label} style={s.keyFactCard}>
                <Text style={s.keyFactIcon}>{fact.icon}</Text>
                <Text style={s.keyFactValue}>{fact.value}</Text>
                <Text style={s.keyFactLabel}>{fact.label}</Text>
              </View>
            ))}
          </View>

          {/* Section Header */}
          <Text style={s.sectionBadge}>IMPORTANT LAWS & ACTS</Text>
          <Text style={s.sectionHeading}>Key Laws at a Glance</Text>

          {/* Law Cards */}
          {laws.map((law, idx) => (
            <View key={idx} style={[s.lawCard, { borderLeftColor: law.color }]}>
              <View style={s.lawCardHeader}>
                <View style={[s.lawIconWrapper, { backgroundColor: law.color }]}>
                  <Text style={s.lawIconEmoji}>{law.icon}</Text>
                </View>
                <View style={s.lawTitleBlock}>
                  <Text style={[s.lawShortTitle, { color: law.color }]}>{law.short}</Text>
                  <Text style={s.lawFullTitle}>{law.title}</Text>
                </View>
              </View>
              <Text style={s.lawDescription}>{law.desc}</Text>
            </View>
          ))}

          {/* RTI Process Steps */}
          <View style={s.stepsCard}>
            <Text style={s.stepsCardTitle}>📋 RTI Application Process</Text>
            {rtiSteps.map((item) => (
              <View key={item.step} style={s.stepRow}>
                <View style={s.stepNumberBadge}>
                  <Text style={s.stepNumberText}>{item.step}</Text>
                </View>
                <View style={s.stepTextBlock}>
                  <Text style={s.stepTitle}>{item.title}</Text>
                  <Text style={s.stepDescription}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CIC Contact Banner */}
          <View style={s.cicBanner}>
            <Text style={s.cicBannerTitle}>🏛️ Central Information Commission</Text>
            <Text style={s.cicBannerAddress}>
              August Kranti Bhawan, Bhikaji Cama Place,{'\n'}New Delhi - 110006
            </Text>
            <Text style={s.cicBannerWebsite}>🌐 www.cic.gov.in</Text>
          </View>

        </View>

        <AppFooter navigation={navigation} />
      </ScrollView>

      {/* Mobile: bottom navbar — outside ScrollView */}
      {!isWeb && <AppNavbar navigation={navigation} activeScreen="ImportantLaws" />}
    </View>
  );
}

const s = StyleSheet.create({
  // Layout
  screenWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  bodyContainer: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Hero Section
  heroSection: {
    backgroundColor: '#1e293b',
    padding: 28,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorCircleTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  heroDecorCircleBottom: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249,115,22,0.1)',
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Key Facts
  keyFactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  keyFactCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
  },
  keyFactIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  keyFactValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f97316',
    marginBottom: 2,
  },
  keyFactLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Section Header
  sectionBadge: {
    color: '#f97316',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Law Cards
  lawCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  lawCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  lawIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawIconEmoji: {
    fontSize: 20,
  },
  lawTitleBlock: {
    flex: 1,
  },
  lawShortTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  lawFullTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 18,
  },
  lawDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 20,
  },

  // RTI Steps Card
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
  },
  stepsCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  stepTextBlock: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },

  // CIC Banner
  cicBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  cicBannerTitle: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  cicBannerAddress: {
    color: '#e2e8f0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  cicBannerWebsite: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
});