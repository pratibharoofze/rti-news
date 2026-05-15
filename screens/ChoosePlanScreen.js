import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Modal, FlatList, TextInput, Alert,
  ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INDIAN_STATES, getDistricts } from '../pages/locationData';

// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  orange:       '#FF6B00',
  orangeLight:  '#FFF3E8',
  orangeBorder: '#FFD4A8',
  green:        '#1DB954',
  greenLight:   '#E8FAF0',
  greenBorder:  '#A8E6C0',
  white:        '#FFFFFF',
  bg:           '#F7F9F7',
  text:         '#1A1A1A',
  textSub:      '#6B7280',
  border:       '#E5E7EB',
  red:          '#E53935',
  redLight:     '#FFF0F0',
};

// ── Razorpay Config ────────────────────────────────────────────────────────────
// ⚠️ IMPORTANT: key_id aur key_secret ko apne backend se lena chahiye
// Direct frontend mein secret mat rakho production mein!
const RAZORPAY_KEY_ID     = 'rzp_test_XXXXXXXXXXXXXXX'; // apna Key ID yahan daalo
const RAZORPAY_KEY_SECRET = 'XXXXXXXXXXXXXXXXXXXXXXXX'; // apna Key Secret yahan daalo

// Razorpay Payment Link banane ka function
async function createRazorpayPaymentLink({ amount, description, customerName, customerContact, customerEmail }) {
  const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

  // Expiry: aaj se 24 ghante baad
  const expireBy = Math.floor(Date.now() / 1000) + 86400;

  const body = {
    amount: amount * 100, // paise mein (₹1 = 100 paise)
    currency: 'INR',
    accept_partial: false,
    description: description,
    expire_by: expireBy,
    reminder_enable: false,
    notify: {
      sms: customerContact ? true : false,
      email: customerEmail ? true : false,
    },
    ...(customerName || customerContact || customerEmail
      ? {
          customer: {
            name: customerName || 'Customer',
            contact: customerContact || '',
            email: customerEmail || '',
          },
        }
      : {}),
    options: {
      checkout: {
        name: 'Shuru App',
        prefill: {
          name: customerName || '',
          contact: customerContact || '',
          email: customerEmail || '',
        },
      },
    },
  };

  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || 'Payment link create karne mein error aaya');
  }

  return data.short_url; // ye Razorpay ka short URL hai jo browser mein open hoga
}

// ── Duration Plans ─────────────────────────────────────────────────────────────
const DURATION_PLANS = [
  { id: '1d',  label: '1 Day'   },
  { id: '3d',  label: '3 Days'  },
  { id: '7d',  label: '7 Days'  },
  { id: '15d', label: '15 Days' },
  { id: '30d', label: '1 Month' },
];

// Pricing matrix: location_scope → placement → price/day (₹)
const PRICE_MATRIX = {
  district: { home: 150,  full: 250  },
  state:    { home: 450,  full: 750  },
  india:    { home: 2999, full: 4999 },
};

const daysMap = { '1d': 1, '3d': 3, '7d': 7, '15d': 15, '30d': 30 };

// ── Dropdown Modal ─────────────────────────────────────────────────────────────
function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={dm.overlay} activeOpacity={1} onPress={onClose} />
      <View style={dm.sheet}>
        <View style={dm.handle} />
        <Text style={dm.title}>{title}</Text>
        <View style={dm.searchWrap}>
          <Ionicons name="search-outline" size={16} color={C.orange} />
          <TextInput
            style={dm.searchInput}
            placeholder="Search..."
            placeholderTextColor="#B0B8C1"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 340 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[dm.item, selected === item && dm.itemSel]}
              onPress={() => { onSelect(item); onClose(); setSearch(''); }}
            >
              <Text style={[dm.itemText, selected === item && dm.itemTextSel]}>{item}</Text>
              {selected === item && <Ionicons name="checkmark-circle" size={18} color={C.orange} />}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}
const dm = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle:      { width: 44, height: 4, backgroundColor: C.border, borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  title:       { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 12, textAlign: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  item:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 2 },
  itemSel:     { backgroundColor: C.orangeLight },
  itemText:    { fontSize: 14, color: C.textSub, fontWeight: '500' },
  itemTextSel: { color: C.orange, fontWeight: '700' },
});

// ── Step Header ────────────────────────────────────────────────────────────────
function StepHeader({ number, label }) {
  return (
    <View style={sh.row}>
      <View style={sh.badge}><Text style={sh.num}>{number}</Text></View>
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  num:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  label: { fontSize: 16, fontWeight: '800', color: C.text },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function ChoosePlanScreen({ navigation, route }) {
  const adData = route?.params?.adData || {};

  // Step 1 — Location
  const [selState,    setSelState]    = useState('');
  const [selDistrict, setSelDistrict] = useState('');
  const [stateModal,  setStateModal]  = useState(false);
  const [distModal,   setDistModal]   = useState(false);

  // Step 2 — Promote scope
  const [promoteScope, setPromoteScope] = useState('district');

  // Step 3 — Placement
  const [placement, setPlacement] = useState('full');

  // Step 4 — Duration
  const [duration, setDuration] = useState('');

  // Loading state for payment link generation
  const [loadingPayment, setLoadingPayment] = useState(false);
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Step 5 — Start date
  const todayStr = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };
  const [startDate] = useState(todayStr());

  const districtList = selState ? getDistricts(selState) : [];

  // Promote scope options
  const promoteOptions = useMemo(() => {
    const opts = [];
    if (selDistrict) opts.push({ id: 'district', label: selDistrict, priceDay: null, free: true });
    if (selState)    opts.push({ id: 'state',    label: selState,    priceDay: PRICE_MATRIX.state[placement] });
    opts.push(        { id: 'india',    label: 'India',         priceDay: PRICE_MATRIX.india[placement] });
    return opts;
  }, [selState, selDistrict, placement]);

  // Computed price/day
  const pricePerDay = promoteScope === 'district' ? 0
    : promoteScope === 'state' ? PRICE_MATRIX.state[placement]
    : PRICE_MATRIX.india[placement];

  // Total charge
  const totalCharge = duration
    ? pricePerDay * (daysMap[duration] || 0)
    : null;

  // Function to show success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // ── Handle Buy ───────────────────────────────────────────────────────────────
  const handleBuy = async () => {
    // Validations
    if (!selState)    { Alert.alert('Required', 'Please select your state.'); return; }
    if (!selDistrict) { Alert.alert('Required', 'Please select your city/district.'); return; }
    if (!promoteScope){ Alert.alert('Required', 'Please choose where to promote.'); return; }
    if (!placement)   { Alert.alert('Required', 'Please choose a placement.'); return; }
    if (!duration && promoteScope !== 'district') {
      Alert.alert('Required', 'Please choose a promotion duration.');
      return;
    }

    // District FREE case
    if (promoteScope === 'district') {
      showSuccessMessage(`🎉 Free Promotion Activated! Your ad is now promoted in ${selDistrict} for FREE!`);
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
      return;
    }

    // Paid case — Razorpay Payment Link banao
    setLoadingPayment(true);

    try {
      const durationLabel = DURATION_PLANS.find(p => p.id === duration)?.label || duration;
      const description   = `Shuru App Promotion: ${promoteScope === 'state' ? selState : 'India'} • ${placement === 'full' ? 'Full Page' : 'Home Page'} • ${durationLabel}`;

      const paymentUrl = await createRazorpayPaymentLink({
        amount:          totalCharge,
        description:     description,
        customerName:    adData?.ownerName   || '',
        customerContact: adData?.phone       || '',
        customerEmail:   adData?.email       || '',
      });

      setLoadingPayment(false);

      // Browser mein Razorpay Payment Link kholo
      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        showSuccessMessage(`✅ Payment link created successfully! Redirecting to payment...`);
      } else {
        Alert.alert('Error', 'Payment link open nahi ho pa raha. Baad mein try karein.');
      }

    } catch (error) {
      setLoadingPayment(false);
      Alert.alert('Payment Error', error.message || 'Payment link create karne mein problem aayi. Dobara try karein.');
    }
  };

  // Handle successful payment (to be called from webview or deep link)
  const handlePaymentSuccess = () => {
    showSuccessMessage(`🎉 Payment Successful! Your promotion has been activated.`);
    setTimeout(() => {
      navigation.goBack();
    }, 3000);
  };

  return (
    <View style={s.root}>

      {/* ── Success Toast Message ── */}
      {showSuccess && (
        <View style={s.successToast}>
          <Ionicons name="checkmark-circle" size={24} color={C.green} />
          <Text style={s.successText}>{successMessage}</Text>
          <TouchableOpacity 
            onPress={() => setShowSuccess(false)} 
            style={s.successClose}
          >
            <Ionicons name="close" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Choose your plan</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Ad Preview Card ──────────────────────────────────── */}
        <View style={s.previewCard}>
          <View style={s.previewBadge}>
            <Text style={s.previewBadgeText}>Preview</Text>
          </View>
          <View style={s.previewInner}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={s.previewTitle} numberOfLines={2}>{adData.title || 'Ad Title'}</Text>
              <Text style={s.previewDesc}  numberOfLines={2}>{adData.description || 'Ad Description'}</Text>
            </View>
            {adData.photo ? (
              <Image source={{ uri: adData.photo }} style={s.previewThumb} resizeMode="cover" />
            ) : (
              <View style={[s.previewThumb, s.previewThumbPlaceholder]}>
                <Ionicons name="image-outline" size={24} color={C.textSub} />
              </View>
            )}
          </View>
        </View>

        {/* ── Step 1: Location ─────────────────────────────────── */}
        <View style={s.section}>
          <StepHeader number="1" label="Select your location" />

          <Text style={s.fieldLabel}>State <Text style={s.req}>*</Text></Text>
          <TouchableOpacity style={s.dropdown} onPress={() => setStateModal(true)} activeOpacity={0.8}>
            <Text style={[s.dropdownText, !selState && s.placeholder]}>{selState || 'Select State'}</Text>
            <Ionicons name="chevron-down" size={18} color={C.textSub} />
          </TouchableOpacity>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>City (District) <Text style={s.req}>*</Text></Text>
          <TouchableOpacity
            style={[s.dropdown, !selState && s.dropdownDisabled]}
            onPress={() => selState && setDistModal(true)}
            activeOpacity={0.8}
          >
            <Text style={[s.dropdownText, !selDistrict && s.placeholder]}>
              {selDistrict || 'Select City / District'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={C.textSub} />
          </TouchableOpacity>
        </View>

        {/* ── Step 2: Where to promote ─────────────────────────── */}
        <View style={s.section}>
          <StepHeader number="2" label="Where do you want to promote?" />
          {promoteOptions.length === 0 ? (
            <Text style={s.emptyHint}>Select your location first</Text>
          ) : (
            promoteOptions.map((opt) => {
              const isSel = promoteScope === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[s.radioCard, isSel && s.radioCardSel]}
                  onPress={() => { setPromoteScope(opt.id); setDuration(''); }}
                  activeOpacity={0.8}
                >
                  <View style={[s.radioCircle, isSel && s.radioCircleSel]}>
                    {isSel && <View style={s.radioCircleDot} />}
                  </View>
                  <Text style={[s.radioLabel, isSel && s.radioLabelSel]}>{opt.label}</Text>
                  {opt.free ? (
                    <View style={s.freeBadge}><Text style={s.freeBadgeText}>FREE</Text></View>
                  ) : (
                    <View style={s.priceBadge}>
                      <Text style={s.priceBadgeText}>₹ {opt.priceDay}/day</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Step 3: Placement ────────────────────────────────── */}
        <View style={s.section}>
          <StepHeader number="3" label="Choose Placement" />

          {/* Home Page */}
          <TouchableOpacity
            style={[s.placementCard, placement === 'home' && s.placementCardSel]}
            onPress={() => setPlacement('home')}
            activeOpacity={0.8}
          >
            <View style={[s.radioCircle, placement === 'home' && s.radioCircleSel]}>
              {placement === 'home' && <View style={s.radioCircleDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.placementTitle, placement === 'home' && s.placementTitleSel]}>Home Page</Text>
              <Text style={s.placementDesc}>Your advertisement will be shown on the home page in Shuru App</Text>
            </View>
            <View style={s.placementMock}>
              <Text style={s.placementMockTop}>HOME</Text>
              <View style={s.placementMockAd}><Text style={s.placementMockAdText}>Ads</Text></View>
              <View style={s.placementMockLines}>
                <View style={s.placementMockLine} />
                <View style={s.placementMockLine} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Full Page — Best Results */}
          <View style={s.bestResultsWrap}>
            <View style={s.bestResultsBadge}>
              <Text style={s.bestResultsText}>🔥 Best Results</Text>
            </View>
            <TouchableOpacity
              style={[s.placementCard, s.placementCardFullPage, placement === 'full' && s.placementCardSel]}
              onPress={() => setPlacement('full')}
              activeOpacity={0.8}
            >
              <View style={[s.radioCircle, placement === 'full' && s.radioCircleSel]}>
                {placement === 'full' && <View style={s.radioCircleDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.placementTitle, placement === 'full' && s.placementTitleSel]}>Full Page</Text>
                <Text style={s.placementDesc}>Shown on home page and as full page when user opens the Shuru App</Text>
              </View>
              <View style={[s.placementMock, s.placementMockFull]}>
                <View style={s.placementMockFullAd}><Text style={s.placementMockAdText}>Ads</Text></View>
                <View style={s.placementMockLine} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Step 4: Duration ─────────────────────────────────── */}
        <View style={s.section}>
          <StepHeader number="4" label="Choose your Promotion duration" />
          {promoteScope === 'district' ? (
            <View style={s.freeNotice}>
              <Ionicons name="gift-outline" size={18} color={C.green} />
              <Text style={s.freeNoticeText}>District promotion is FREE — no duration needed!</Text>
            </View>
          ) : (
            <View style={s.durationGrid}>
              {DURATION_PLANS.map((plan) => {
                const days  = daysMap[plan.id];
                const price = pricePerDay * days;
                const isSel = duration === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[s.durationCard, isSel && s.durationCardSel]}
                    onPress={() => setDuration(plan.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.durationLabel, isSel && s.durationLabelSel]}>{plan.label}</Text>
                    <Text style={[s.durationPrice, isSel && s.durationPriceSel]}>₹{price}</Text>
                    {isSel && (
                      <View style={s.durationCheck}>
                        <Ionicons name="checkmark-circle" size={16} color={C.orange} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Step 5: Start date ───────────────────────────────── */}
        <View style={s.section}>
          <StepHeader number="5" label="Starting date of promotion" />
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={C.orange} />
            <Text style={s.dateText}>{startDate}</Text>
            <Text style={s.dateSub}>(starts today)</Text>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Fixed Bottom Bar ──────────────────────────────────── */}
      <View style={s.bottomBar}>
        <View>
          <Text style={s.bottomLabel}>Total Charge</Text>
          <Text style={s.bottomPrice}>
            {promoteScope === 'district'
              ? '₹0 (FREE)'
              : totalCharge !== null
              ? `₹${totalCharge}`
              : '₹N/A'}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.buyBtn, loadingPayment && s.buyBtnDisabled]}
          onPress={handleBuy}
          activeOpacity={0.85}
          disabled={loadingPayment}
        >
          {loadingPayment ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.buyBtnText}>Creating Link...</Text>
            </>
          ) : (
            <>
              <Text style={s.buyBtnText}>Buy Promotion</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <DropdownModal
        visible={stateModal} title="Select State" items={INDIAN_STATES}
        selected={selState}
        onSelect={(v) => { setSelState(v); setSelDistrict(''); setPromoteScope('district'); }}
        onClose={() => setStateModal(false)}
      />
      <DropdownModal
        visible={distModal} title="Select City / District" items={districtList}
        selected={selDistrict}
        onSelect={(v) => { setSelDistrict(v); setPromoteScope('district'); }}
        onClose={() => setDistModal(false)}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.text },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 20 },

  previewCard: {
    marginHorizontal: 16, backgroundColor: C.white,
    borderRadius: 18, padding: 16, marginBottom: 8,
    borderWidth: 1.5, borderColor: C.border,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  previewBadge:            { backgroundColor: C.orange, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  previewBadgeText:        { color: '#fff', fontSize: 12, fontWeight: '800' },
  previewInner:            { flexDirection: 'row', alignItems: 'center' },
  previewTitle:            { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 4 },
  previewDesc:             { fontSize: 12, color: C.textSub },
  previewThumb:            { width: 80, height: 70, borderRadius: 12 },
  previewThumbPlaceholder: { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  section: { paddingHorizontal: 16, paddingTop: 24 },

  fieldLabel:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 },
  req:              { color: C.orange },
  dropdown:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  dropdownDisabled: { opacity: 0.5 },
  dropdownText:     { fontSize: 14, color: C.text, fontWeight: '500' },
  placeholder:      { color: '#B0B8C1' },

  emptyHint: { fontSize: 13, color: C.textSub, fontStyle: 'italic', paddingVertical: 8 },

  radioCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10, gap: 12 },
  radioCardSel:  { borderColor: C.orange, backgroundColor: C.orangeLight },
  radioCircle:   { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioCircleSel:{ borderColor: C.orange },
  radioCircleDot:{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange },
  radioLabel:    { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  radioLabelSel: { color: C.orange, fontWeight: '700' },
  freeBadge:     { backgroundColor: C.greenLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.greenBorder },
  freeBadgeText: { fontSize: 12, color: C.green, fontWeight: '700' },
  priceBadge:    { backgroundColor: C.orangeLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.orangeBorder },
  priceBadgeText:{ fontSize: 12, color: C.orange, fontWeight: '700' },

  placementCard:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  placementCardSel:     { borderColor: C.orange, backgroundColor: C.orangeLight },
  placementCardFullPage:{ marginBottom: 0 },
  placementTitle:       { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 3 },
  placementTitleSel:    { color: C.orange },
  placementDesc:        { fontSize: 12, color: C.textSub, lineHeight: 17 },

  placementMock:       { width: 56, alignItems: 'center', gap: 3 },
  placementMockTop:    { fontSize: 9, fontWeight: '800', color: C.textSub },
  placementMockAd:     { width: 48, height: 20, backgroundColor: '#4A90E2', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  placementMockAdText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  placementMockLines:  { gap: 3 },
  placementMockLine:   { width: 44, height: 4, backgroundColor: C.border, borderRadius: 2 },
  placementMockFull:   { justifyContent: 'center' },
  placementMockFullAd: { width: 48, height: 52, backgroundColor: '#4A90E2', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },

  bestResultsWrap:  { position: 'relative', marginTop: 4 },
  bestResultsBadge: { position: 'absolute', top: -12, left: 14, zIndex: 10, backgroundColor: C.orange, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  bestResultsText:  { color: '#fff', fontSize: 12, fontWeight: '800' },

  durationGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationCard:    { width: '30%', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  durationCardSel: { borderColor: C.orange, backgroundColor: C.orangeLight },
  durationLabel:   { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4 },
  durationLabelSel:{ color: C.orange },
  durationPrice:   { fontSize: 13, fontWeight: '800', color: C.textSub },
  durationPriceSel:{ color: C.orange },
  durationCheck:   { position: 'absolute', top: 6, right: 6 },

  freeNotice:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenLight, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.greenBorder },
  freeNoticeText: { fontSize: 13, color: C.green, fontWeight: '600', flex: 1 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  dateText: { fontSize: 15, fontWeight: '700', color: C.text },
  dateSub:  { fontSize: 12, color: C.textSub },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.white, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: C.border,
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  bottomLabel: { fontSize: 12, color: C.textSub, marginBottom: 2 },
  bottomPrice: { fontSize: 22, fontWeight: '900', color: C.text },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.orange, borderRadius: 14,
    paddingHorizontal: 22, paddingVertical: 14,
    elevation: 4, shadowColor: C.orange, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6,
  },
  buyBtnDisabled: { opacity: 0.7 },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Success Toast Styles
  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: C.green,
  },
  successText: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  successClose: {
    padding: 4,
  },
});