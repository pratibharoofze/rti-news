import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';

const laws = [
  {
    title: 'माहितीचा अधिकार अधिनियम, २००५',
    short: 'RTI Act 2005',
    desc: 'हा कायदा भारतीय नागरिकांना सरकारी माहिती मागण्याचा अधिकार देतो. सार्वजनिक प्राधिकरणांनी ३० दिवसांत माहिती द्यावी.',
    color: '#f97316',
    icon: '📜',
  },
  {
    title: 'दफ्तर दिरंगाई कायदा',
    short: 'Delay Prevention Act',
    desc: 'महाराष्ट्र शासकीय कर्मचान्यांच्या बदल्यांचे विनियमन व शासकीय कर्तव्ये पार पाडताना होणाऱ्या विलंबास प्रतिबंध अधिनियम, २००५.',
    color: '#3b82f6',
    icon: '⚖️',
  },
  {
    title: 'केंद्रीय माहिती आयोग (CIC)',
    short: 'Central Information Commission',
    desc: 'केंद्र सरकारच्या सार्वजनिक क्षेत्रातील प्राधिकरणांविषयाच्या तक्रारींसाठी. पत्ता: ऑगस्ट क्रांती भवन, भिकाजी कामा प्लेस, नवी दिल्ली ११०००६.',
    color: '#16a34a',
    icon: '🏛️',
  },
  {
    title: 'राज्य माहिती आयोग (SIC)',
    short: 'State Information Commission',
    desc: 'राज्य सरकारच्या सार्वजनिक क्षेत्रातील प्राधिकरणांविषयाच्या तक्रारींसाठी संबंधित राज्याच्या माहिती आयोगाकडे दाखल कराव्यात.',
    color: '#a855f7',
    icon: '🏢',
  },
  {
    title: 'कलम ८ - माहिती देण्यास नकार',
    short: 'Section 8 - Exemptions',
    desc: 'राष्ट्रीय सुरक्षा, व्यक्तिगत गोपनीयता, न्यायालयीन प्रकरणे यांसारख्या बाबतीत माहिती देण्यास नकार देता येतो.',
    color: '#ef4444',
    icon: '🚫',
  },
  {
    title: 'कलम ९ - कॉपीराईट माहिती',
    short: 'Section 9 - Copyright',
    desc: 'जर माहिती राज्याव्यतिरिक्त इतर कोण्या व्यक्तिच्या कॉपीराईटमध्ये मोडत असेल तर ती देण्यास नकार देता येतो.',
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

export default function ImportantLawsScreen({ navigation }) {
  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <AppHeader navigation={navigation} />
      <AppNavbar navigation={navigation} activeScreen="ImportantLaws" />

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroCircle1} />
        <View style={s.heroCircle2} />
        <Text style={s.heroEmoji}>⚖️</Text>
        <Text style={s.heroTitle}>Important Laws</Text>
        <Text style={s.heroSub}>RTI Act आणि संबंधित महत्त्वाचे कायदे जे प्रत्येक नागरिकाने जाणले पाहिजेत.</Text>
      </View>

      <View style={s.body}>

        {/* Key Facts */}
        <View style={s.factsRow}>
          {keyFacts.map((f) => (
            <View key={f.label} style={s.factCard}>
              <Text style={s.factIcon}>{f.icon}</Text>
              <Text style={s.factValue}>{f.value}</Text>
              <Text style={s.factLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Section Title */}
        <Text style={s.sectionLabel}>IMPORTANT LAWS & ACTS</Text>
        <Text style={s.sectionTitle}>महत्त्वाचे कायदे</Text>

        {/* Law Cards */}
        {laws.map((law, idx) => (
          <View key={idx} style={[s.lawCard, { borderLeftColor: law.color }]}>
            <View style={s.lawCardHeader}>
              <View style={[s.lawIcon, { backgroundColor: law.color }]}>
                <Text style={s.lawIconText}>{law.icon}</Text>
              </View>
              <View style={s.lawTitleWrap}>
                <Text style={[s.lawShort, { color: law.color }]}>{law.short}</Text>
                <Text style={s.lawTitle}>{law.title}</Text>
              </View>
            </View>
            <Text style={s.lawDesc}>{law.desc}</Text>
          </View>
        ))}

        {/* RTI Process Steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>📋 RTI अर्ज प्रक्रिया</Text>
          {[
            { step: '1', title: 'अर्ज तयार करा', desc: 'साध्या कागदावर हातात किंवा टाइप करून माहिती मागणीचा अर्ज लिहा.' },
            { step: '2', title: 'शुल्क भरा', desc: '₹10 चा डिमांड ड्राफ्ट, पोस्टल ऑर्डर किंवा रोख रक्कम भरा. BPL धारकांना माफी.' },
            { step: '3', title: 'अर्ज सादर करा', desc: 'संबंधित जन माहिती अधिकाऱ्याकडे अर्ज सादर करा व पोहच घ्या.' },
            { step: '4', title: 'उत्तराची प्रतीक्षा करा', desc: '३० दिवसांत उत्तर येणे अपेक्षित आहे. उत्तर न मिळाल्यास नकार समजावा.' },
            { step: '5', title: 'अपील दाखल करा', desc: 'समाधान न झाल्यास ३० दिवसांत प्रथम अपील, नंतर CIC/SIC कडे दाखल करा.' },
          ].map((item) => (
            <View key={item.step} style={s.stepItem}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{item.step}</Text>
              </View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{item.title}</Text>
                <Text style={s.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact CIC Banner */}
        <View style={s.cicBanner}>
          <Text style={s.cicTitle}>🏛️ केंद्रीय माहिती आयोग</Text>
          <Text style={s.cicAddress}>ऑगस्ट क्रांती भवन, भिकाजी कामा प्लेस,{'\n'}नवी दिल्ली - ११०००६</Text>
          <Text style={s.cicWeb}>🌐 www.cic.gov.in</Text>
        </View>

      </View>

      <AppFooter navigation={navigation} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Hero
  hero: { backgroundColor: '#1e293b', padding: 28, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  heroCircle1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(249,115,22,0.15)' },
  heroCircle2: { position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(249,115,22,0.1)' },
  heroEmoji: { fontSize: 40, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  heroSub: { color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  body: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8 },

  // Facts
  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  factCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  factIcon: { fontSize: 24, marginBottom: 6 },
  factValue: { fontSize: 18, fontWeight: '900', color: '#f97316', marginBottom: 2 },
  factLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'center' },

  // Section labels
  sectionLabel: { color: '#f97316', fontWeight: '800', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { color: '#111827', fontWeight: '900', fontSize: 20, textAlign: 'center', marginBottom: 16 },

  // Law Cards
  lawCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 4, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
  lawCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  lawIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lawIconText: { fontSize: 20 },
  lawTitleWrap: { flex: 1 },
  lawShort: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  lawTitle: { fontSize: 13, fontWeight: '800', color: '#111827', lineHeight: 18 },
  lawDesc: { fontSize: 12, color: '#6b7280', lineHeight: 20 },

  // Steps
  stepsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  stepDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  // CIC Banner
  cicBanner: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 14, alignItems: 'center' },
  cicTitle: { color: '#f97316', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  cicAddress: { color: '#e2e8f0', fontSize: 13, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  cicWeb: { color: '#38bdf8', fontSize: 13, fontWeight: '700' },
});