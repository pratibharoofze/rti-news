import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// ─── Sample Data ────────────────────────────────────────────────────────────

const MANDI_DATA = [
  { id: '1', saman: 'कद्दू', minPrice: 12400, maxPrice: 12650, mandi: 'किशनगंज', prakar: 'कद्दू', lastUpdate: '23 मई 2026' },
  { id: '2', saman: 'पत्ता गोभी', minPrice: 2000, maxPrice: 2200, mandi: 'बहादुरगंज', prakar: 'पत्ता गोभी', lastUpdate: '23 मई 2026' },
  { id: '3', saman: 'मसूर दाल', minPrice: 7200, maxPrice: 7400, mandi: 'पटना शहर', prakar: 'काला मसूर नया', lastUpdate: '24 मई 2026' },
  { id: '4', saman: 'लोबिया (शाकाहाटी)', minPrice: 2600, maxPrice: 3000, mandi: 'भागलपुर', prakar: 'लोबिया (शाकाहाटी)', lastUpdate: '23 मई 2026' },
  { id: '5', saman: 'कच्चा नारियल', minPrice: 2200, maxPrice: 2400, mandi: 'खगड़िया', prakar: 'कच्चा नारियल', lastUpdate: '23 मई 2026' },
  { id: '6', saman: 'पपीता', minPrice: 3500, maxPrice: 3800, mandi: 'बहादुरगंज', prakar: 'अन्य', lastUpdate: '25 मई 2026' },
  { id: '7', saman: 'अंगूर', minPrice: 6500, maxPrice: 7000, mandi: 'बहादुरगंज', prakar: 'अन्लाबेसहाय', lastUpdate: '22 मई 2026' },
  { id: '8', saman: 'कटहुना (कड़त्ती तरवुण)', minPrice: 2100, maxPrice: 2200, mandi: 'भागलपुर', prakar: 'कटहुना', lastUpdate: '25 मई 2026' },
  { id: '9', saman: 'केला - हटा', minPrice: 3000, maxPrice: 4000, mandi: 'नवादा', prakar: 'केला – हटा', lastUpdate: '23 मई 2026' },
  { id: '10', saman: 'शलजम', minPrice: 1600, maxPrice: 2400, mandi: 'गया', prakar: 'शलजम', lastUpdate: '22 मई 2026' },
];

const POPULAR_CITIES = [
  { id: 'c1', name: 'किशनगंज का भाव', color: '#f8c57a' },
  { id: 'c2', name: 'बहादुरगंज का भाव', color: '#a8d5e8' },
  { id: 'c3', name: 'पटना शहर का भाव', color: '#b8e4c9' },
  { id: 'c4', name: 'भागलपुर का भाव', color: '#f4a8c8' },
  { id: 'c5', name: 'खगड़िया', color: '#c8b4e8' },
];

const OTHER_ITEMS = [
  { id: 'o1', name: 'केला का भाव', color: '#d4f0c0' },
  { id: 'o2', name: 'खीरा का भाव', color: '#fde8b0' },
  { id: 'o3', name: 'मौसंबी (स्वीट लाइम) का भाव', color: '#f8c8d4' },
  { id: 'o4', name: 'फूलगोभी का भाव', color: '#d0e8f8' },
  { id: 'o5', name: 'आम का भाव', color: '#ffe0b2' },
];

const CITY_CARDS = [
  { id: 'cc1', name: 'भागलपुर', state: 'बिहार', color: '#e07b39' },
  { id: 'cc2', name: 'खगड़िया', state: 'बिहार', color: '#e84393' },
  { id: 'cc3', name: 'नौगछिया', state: 'बिहार', color: '#26bfbf' },
  { id: 'cc4', name: 'किशनगंज', state: 'बिहार', color: '#e05a2b' },
  { id: 'cc5', name: 'मुंघेर', state: 'बिहार', color: '#3b4fa8' },
  { id: 'cc6', name: 'गया', state: 'बिहार', color: '#7b52ab' },
  { id: 'cc7', name: 'बहादुरगंज', state: 'बिहार', color: '#e85a2b' },
  { id: 'cc8', name: 'बिहारशरीफ', state: 'बिहार', color: '#c0392b' },
  { id: 'cc9', name: 'औरंगाबाद', state: 'बिहार', color: '#2980b9' },
  { id: 'cc10', name: 'सिंहेश्वरस्थान', state: 'बिहार', color: '#d35400' },
  { id: 'cc11', name: 'नवादा', state: 'बिहार', color: '#27ae60' },
  { id: 'cc12', name: 'वीरपुर', state: 'बिहार', color: '#8e44ad' },
];

const FAQS = [
  {
    id: 'f1',
    question: 'क्या बिहार में किसान मंडी में खुद फसल बेच सकते हैं या बिचौलिया जरूरी है?',
    answer: 'किसान मंडी में सीधे भी बेच सकते हैं, चाहें खरीदार/व्यापारी मान्यता प्राप्त हो। PACS या MSP पर बेचने के लिए किसी बिचौलिए की जरूरत नहीं होती।',
  },
  {
    id: 'f2',
    question: 'बिहार में किसान मंडी में ट्रांसपोर्ट कैसे करते हैं?',
    answer: 'बिहार में किसान अपनी फसल मंडी या खरीद केंद्र तक पहुंचाने के लिए ट्रैक्टर-ट्रॉली, टेम्पो, पिकअप वैन, जीप या लोडेड जैसे कमर्शियल वाहन इस्तेमाल करते हैं। छोटे किसान कई बार ग्रुप ट्रांसपोर्ट एक ही वाहन किराये पर लेते हैं और किराया आपस में बांटते हैं जिससे खर्च कम होता है।',
  },
  {
    id: 'f3',
    question: 'क्या बिहार में मंडी टैक्स अभी भी लगता है?',
    answer: 'बिहार सरकार ने 2009 में APMC एक्ट खत्म कर दिया था, लेकिन कुछ नगर किसानों के लिए स्थानीय मंडी शुल्क लागू हैं। e-NAM मंडियों में नामांकन का शुल्क लिया जाता है, लेकिन पारंपरिक मंडियों में कुछ-कुछ सेवा शुल्क लिया जाता है।',
  },
  {
    id: 'f4',
    question: 'किसान बिहार मंडी भाव की जानकारी कैसे ले सकते हैं?',
    answer: 'बिहार मंडी भाव जानने के लिए किसान कृषि विभाग की वेबसाइट, स्थानीय मंडी समिति, e-NAM पोर्टल या मंडी पोर्टल में वॉइस बोर्ड से भी जानकारी ले सकते हैं। इसके अलावा, अप शुरू ऐप (Shuru App) की मदद से ले सकते हैं। यह App Google Play Store या Apple Store से फ्री में डाउनलोड कर सकते हैं।',
  },
  {
    id: 'f5',
    question: 'बिहार में मंडी से संबंधित धोखाधड़ी से कैसे बचें?',
    answer: 'मंडी से संबंधित धोखाधड़ी से बचने के लिए इन बातों का ध्यान रखना चाहिए: केवल पंजीकृत व्यापारियों या PACS के साथ लेनदेन करें। फसल की कीमत और मात्रा का लिखित अनुबंध करें। पेमेंट डिजिटल माध्यम (UPI, बैंक ट्रांसफर) से लें। eNAM पर कीमतों की तुलना करें। धोखाधड़ी की स्थिति में स्थानीय पुलिस या जिला कृषि अधिकारी को शिकायत दें।',
  },
  {
    id: 'f6',
    question: 'बिहार की मंडियों में कद्दू का भाव कैसे चेक करें?',
    answer: 'आप Shuru ऐप पर बिहार की भागलपुर और भागलपुर, खगड़िया, नौगछिया, किशनगंज, मुंघेर मंडियों में कद्दू की कीमत काफी आसानी से चेक कर सकते हैं। हमारी लिस्ट मई 2026 को अपडेट की गई है और कद्दू का भाव ₹12650.00 प्रति क्विंटल है।',
  },
  {
    id: 'f7',
    question: 'बिहार की मंडियां किसानों को कैसे लाभ पहुंचाती हैं?',
    answer: 'बिहार की मंडियां, जैसे भागलपुर और खगड़िया, नौगछिया, किशनगंज, मुंघेर मंडिया किसानों को उनकी फसलों, जैसे कद्दू, के लिए सही कीमत दिलाने में मदद करती हैं। Shuru ऐप आपको किसी भी फसल जैसे कद्दू के ताजा भाव के बारे में बताता है, जो e-NAM डेटा पर आधारित है।',
  },
  {
    id: 'f8',
    question: 'बिहार में कद्दू का भाव क्यों बदलती रहती है?',
    answer: 'बिहार की मंडियों, जैसे भागलपुर और खगड़िया, नौगछिया, किशनगंज, मुंघेर में कद्दू की कीमतें मांग, आपूर्ति और परिवहन लागत के कारण बदलती हैं। अभी मई 2026 को कद्दू की कीमत ₹12650.00/क्विंटल हैं, और यह कल भी बदल सकती है।',
  },
  {
    id: 'f9',
    question: 'बिहार में कुल कितनी मंडियां हैं?',
    answer: 'e-NAM पोर्टल के मुताबिक, बिहार में कुल 100 मंडियां हैं।',
  },
];

const STATE_TABS = [
  'अंडमान और निकोबार का भाव', 'आंध्र प्रदेश का भाव', 'असम का भाव',
  'बिहार का भाव', 'चंडीगढ़ का भाव', 'छत्तीसगढ़ का भाव', 'गोवा का भाव',
];

// ─── Sub Components ──────────────────────────────────────────────────────────

function SectionHeading({ title }) {
  return <Text style={styles.sectionHeading}>{title}</Text>;
}

function MandiTableRow({ item, isHeader }) {
  if (isHeader) {
    return (
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>सामान</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>न्यूनतम मूल्य (Rs./क्विंटल)</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>अधिकतम मूल्य (Rs./क्विंटल)</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>मंडी</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>प्रकार</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>अंतिम अपडेट</Text>
        <Text style={[styles.tableCell, styles.headerCell, { flex: 0.8 }]}>संपर्क करें</Text>
      </View>
    );
  }
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.linkCell, { flex: 1.5 }]}>{item.saman}</Text>
      <Text style={[styles.tableCell, { flex: 1.2 }]}>₹{item.minPrice.toLocaleString('en-IN')}</Text>
      <Text style={[styles.tableCell, { flex: 1.2 }]}>₹{item.maxPrice.toLocaleString('en-IN')}</Text>
      <Text style={[styles.tableCell, styles.linkCell, { flex: 1 }]}>{item.mandi}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.prakar}</Text>
      <Text style={[styles.tableCell, { flex: 1 }]}>{item.lastUpdate}</Text>
      <Text style={[styles.tableCell, styles.downloadCell, { flex: 0.8 }]}>डाउनलोड करें</Text>
    </View>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.8} style={styles.faqQuestion}>
        <Text style={styles.faqQ}>Q. {item.question}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
      </TouchableOpacity>
      {open && <Text style={styles.faqA}>A. {item.answer}</Text>}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BiharMandiBhavScreen({ navigation }) {
  const [activeSort, setActiveSort] = useState('min'); // 'min' | 'max'
  const [selectedState, setSelectedState] = useState('बिहार का भाव');

  const sortedData = [...MANDI_DATA].sort((a, b) =>
    activeSort === 'min' ? a.minPrice - b.minPrice : b.maxPrice - a.maxPrice
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={18} color="#0f172a" style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>बिहार मंडी भाव</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >

        {/* State Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
        >
          {STATE_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.stateTab, selectedState === tab && styles.stateTabActive]}
              onPress={() => setSelectedState(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.stateTabText, selectedState === tab && styles.stateTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Page Title */}
        <Text style={styles.pageTitle}>बिहार मंडी भाव ~ मई 2026</Text>

        {/* Intro Text */}
        <Text style={styles.introText}>
          बिहार मंडी भाव किसानों और व्यापारियों के लिए बाजार की नब्ज है। बिहार एक कृषि प्रधान राज्य है। यहाँ पर चावल, गेहूँ, मक्का, लीची और मखाना जैसी फसलों की खेती बड़े पैमाने पर होती है। साथ ही, यहाँ पर जूट, गन्ना, आम, केला, अमरुट और दाल की पैदावार अच्छी होती है। इसके अलावा, यहाँ पर आलू, प्याज, बैंगन, फूलगोभी और भिंडी जैसी सब्जियाँ भी उगाई जाती हैं। सब्जियों के मामले में बिहार देश का तीसरा सबसे बड़ा उत्पादक राज्य है। वहीं, फलों की पैदावार में इसका चौथा नंबर है।
        </Text>
        <Text style={[styles.introText, { marginTop: 8 }]}>
          पटना, गया और मुजफ्फरपुर बिहार की मुख्य मंडियाँ हैं। सटीक और विश्वसनीय मंडी भाव के लिए आप Shuru ऐप (Shuru App) इस्तेमाल कर सकते हैं। यह ऐप आपको बिहार मंडी भाव की ताजा जानकारी देता है, जिसकी मदद से आप बेहतर सौदे कर सकते हैं और अच्छा मुनाफा कमा सकते हैं।
        </Text>

        {/* Mandi Filter */}
        <View style={styles.filterBox}>
          <Text style={styles.filterTitle}>मंडी बदलें</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterSelect}>
              <Text style={styles.filterLabel}>राज्य चुनें</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>बिहार</Text>
                <Feather name="chevron-down" size={14} color="#64748b" />
              </View>
            </View>
            <View style={styles.filterSelect}>
              <Text style={styles.filterLabel}>मंडी चुनें</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>सभी</Text>
                <Feather name="chevron-down" size={14} color="#64748b" />
              </View>
            </View>
            <View style={styles.filterSelect}>
              <Text style={styles.filterLabel}>आकार</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>सभी</Text>
                <Feather name="chevron-down" size={14} color="#64748b" />
              </View>
            </View>
            <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
              <Text style={styles.searchBtnText}>दिखाएं  🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Count Banner */}
        <View style={styles.countBanner}>
          <Text style={styles.countText}>कुल मंडियां: 100+</Text>
        </View>

        {/* Sort Buttons */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortBtn, activeSort === 'min' && styles.sortBtnActive]}
            onPress={() => setActiveSort('min')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortBtnText, activeSort === 'min' && styles.sortBtnTextActive]}>
              न्यूनतम मूल्य
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, activeSort === 'max' && styles.sortBtnActiveGreen]}
            onPress={() => setActiveSort('max')}
            activeOpacity={0.8}
          >
            <Text style={[styles.sortBtnText, activeSort === 'max' && styles.sortBtnTextActive]}>
              अधिकतम मूल्य
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 700 }}>
              <MandiTableRow isHeader />
              {sortedData.map((item, idx) => (
                <View key={item.id} style={idx % 2 === 0 ? {} : styles.tableRowAlt}>
                  <MandiTableRow item={item} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Popular Cities */}
        <SectionHeading title="लोकप्रिय शहर" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {POPULAR_CITIES.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[styles.cityPill, { backgroundColor: city.color }]}
              activeOpacity={0.8}
            >
              <Text style={styles.cityPillText}>{city.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Other Items */}
        <SectionHeading title="अन्य वस्तुएं" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {OTHER_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemPill, { backgroundColor: item.color }]}
              activeOpacity={0.8}
            >
              <Text style={styles.itemPillText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* City Cards Grid */}
        <View style={styles.cityGrid}>
          {CITY_CARDS.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[styles.cityCard, { backgroundColor: city.color }]}
              activeOpacity={0.8}
            >
              <Text style={styles.cityCardName}>{city.name}</Text>
              <Text style={styles.cityCardState}>{city.state}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buy / Sell CTAs */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>क्या आप कृषि उत्पाद खरीदना चाहते हैं?</Text>
          <Text style={styles.ctaSubtitle}>
            हमें अपनी खरीद आवश्यकता बताएं, हम आपके लिए प्रमाणित सर्वश्रेष्ठ विक्रेता खोज लेंगे।
          </Text>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8}>
            <Text style={styles.ctaBtnText}>खरीद आवश्यकता पोस्ट करें</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>अपना उत्पाद मुफ़्त में लिस्ट करें</Text>
          <Text style={styles.ctaSubtitle}>
            अपना उत्पाद मुफ़्त में लिस्ट करें और प्रमाणित खरीदारों से जुड़ें।
          </Text>
          <TouchableOpacity style={[styles.ctaBtn, styles.ctaBtnOutline]} activeOpacity={0.8}>
            <Text style={styles.ctaBtnOutlineText}>विक्रय आवश्यकता पोस्ट करें</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <View style={styles.faqHeaderDot} />
            <Text style={styles.faqHeaderText}>अक्सर पूछे गए सवाल</Text>
          </View>
          {FAQS.map((faq) => (
            <FaqItem key={faq.id} item={faq} />
          ))}
        </View>

        {/* Info Sections */}
        <SectionHeading title="बिहार मंडी की पूरी जानकारी" />
        <Text style={styles.infoText}>
          बिहार मंडी भाव कृषि से जुड़े हर उस व्यक्ति के लिए जरूरी है, जो वास्तव में सही तस्वीर जानना चाहता है। इस राज्य की 70% आबादी खेती पर निर्भर है। बिहार में फसलों की कीमतें मौसम और फसल चक्र के आधार पर बदलती रहती हैं; जैसे- नवंबर-दिसंबर के दौरान धान की कटाई होने के कारण इसकी कीमतें आमतौर पर कम रहती हैं, जबकि गर्मियों में गेहूँ की मांग बढ़ने पर इसके दाम में उछाल आता है। बिहार की मुख्य फसल मक्का मार्च-अप्रैल में अच्छा मुनाफा देती है। हर साल बाढ़ की वजह से बिहार में खरीफ की फसलों का काफी नुकसान होता है।
        </Text>

        <SectionHeading title="किसानों और व्यापारियों के लिए टिप्स" />
        {[
          'मंडल मूल्य का ध्यान रखें: यह मंडी में उस दिन की औसत कीमत होती है। इसे अच्छे से समझें, ताकि आपको सही दाम मिल सकें।',
          'सुबह जल्दी पहुंचें: सुबह जल्दी मंडी पहुंचने से आपको ज्यादा मुनाफा हो सकता है। दरअसल, इस समय फसलों की कीमतें सबसे तेज होती हैं।',
          'डिजिटल टूल चेक करें: न्यूनतम भाव पर बेचने से पहले मंडी रिपोर्ट जरूर चेक करें। इसके साथ ही आपको यह भी पता होना चाहिए कि मंडी में किस फसल की डिमांड अधिक है।',
          'मंडी के नियम जानें: हर मंडी के अपने नियम और शुल्क होते हैं, जैसे-पटना मंडी में व्यापारी शुल्क लगता है। इसलिए किसी भी मंडी में अपनी फसल ले जाने से पहले वहाँ के नियम अच्छे से जान लें।',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipNum}>{i + 1}.</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        <SectionHeading title="बिहार सरकार की कृषि नीतियां और APMC पहल" />
        <Text style={styles.infoText}>
          बिहार सरकार ने 2006 में APMC एक्ट को खत्म कर दिया था, जिसके बाद प्राइमरी एग्रीकल्चरल क्रेडिट सोसाइटीज (PACS) के जरिए फसल खरीद हुई। वर्तमान में, लगभग 8,500 PACS बिहार में सक्रिय हैं, जो किसानों को न्यूनतम मूल्य (MSP) पर फसल बेचने का मौका देते हैं।
        </Text>

      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },

  // Header
  header: {
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backIcon: { marginRight: 6 },
  backText: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },

  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  // State Tabs
  tabsScroll: { backgroundColor: '#1e3a8a' },
  tabsContainer: { paddingHorizontal: 8, paddingVertical: 8, gap: 6 },
  stateTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stateTabActive: { backgroundColor: '#ffffff' },
  stateTabText: { color: '#ffffff', fontSize: 12, fontWeight: '500' },
  stateTabTextActive: { color: '#1e3a8a', fontWeight: '700' },

  // Page title & intro
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  introText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 21,
    paddingHorizontal: 16,
  },

  // Filter Box
  filterBox: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fef9ee',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0e6c4',
    padding: 14,
  },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' },
  filterSelect: { flex: 1, minWidth: 80 },
  filterLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  selectBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  selectText: { fontSize: 13, color: '#0f172a' },
  searchBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  searchBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },

  // Count Banner
  countBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },

  // Sort
  sortRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  sortBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  sortBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  sortBtnActiveGreen: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  sortBtnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  sortBtnTextActive: { color: '#ffffff' },

  // Table
  tableContainer: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  tableHeader: { backgroundColor: '#f1f5f9' },
  tableCell: { fontSize: 12, color: '#334155', paddingHorizontal: 4 },
  headerCell: { fontWeight: '700', color: '#0f172a', fontSize: 11 },
  linkCell: { color: '#2563eb', fontWeight: '600' },
  downloadCell: { color: '#16a34a', fontWeight: '600' },

  // Section heading
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 16,
  },

  // Horizontal scroll pills
  hScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  cityPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 130,
    alignItems: 'center',
  },
  cityPillText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  itemPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  itemPillText: { fontSize: 13, fontWeight: '600', color: '#1e293b', textAlign: 'center' },

  // City Cards Grid
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 20,
    marginBottom: 24,
  },
  cityCard: {
    width: '30%',
    minWidth: 100,
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityCardName: { color: '#ffffff', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  cityCardState: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4, textAlign: 'center' },

  // CTAs
  ctaCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 8 },
  ctaSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  ctaBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  ctaBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#0f172a' },
  ctaBtnOutlineText: { color: '#0f172a', fontWeight: '700', fontSize: 14 },

  // FAQ
  faqSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  faqHeaderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    marginRight: 10,
  },
  faqHeaderText: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 14,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQ: { fontSize: 14, fontWeight: '600', color: '#0f172a', flex: 1, lineHeight: 20, marginRight: 8 },
  faqA: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 10 },

  // Info & Tips
  infoText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 21,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipNum: { fontWeight: '700', color: '#0f172a', fontSize: 13, marginRight: 6, marginTop: 1 },
  tipText: { color: '#334155', fontSize: 13, lineHeight: 20, flex: 1 },
});