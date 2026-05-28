import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Modal, FlatList, TextInput, Alert,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INDIAN_STATES, getDistricts } from '../pages/locationData';
import { UserStore } from '../store/UserStore';

// ── Theme ──────────────────────────────────────────────────────────────────────
const C = {
  pink:        '#FF2D78',
  pinkLight:   '#fff0f5',
  pinkBorder:  '#ffe4ef',
  pinkMid:     '#fda4be',
  green:       '#16a34a',
  greenLight:  '#f0fdf4',
  greenBorder: '#bbf7d0',
  white:       '#ffffff',
  bg:          '#ffffff',
  text:        '#0f172a',
  textSub:     '#94a3b8',
  border:      '#ffe4ef',
  red:         '#ef4444',
  redLight:    '#fff0f5',
};

const HEADER_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight || 24) + 10
  : 54;

// ── Duration Plans ─────────────────────────────────────────────────────────────
const DURATION_PLANS = [
  { id: '1d',  label: '1 Day'   },
  { id: '3d',  label: '3 Days'  },
  { id: '7d',  label: '7 Days'  },
  { id: '15d', label: '15 Days' },
  { id: '30d', label: '1 Month' },
];

const PRICE_MATRIX = {
  district: { home: 150,  full: 250  },
  state:    { home: 450,  full: 750  },
  india:    { home: 2999, full: 4999 },
};

const daysMap = { '1d': 1, '3d': 3, '7d': 7, '15d': 15, '30d': 30 };

// ── Dropdown Modal ─────────────────────────────────────────────────────────────
function DropdownModal({ visible, title, items, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const isWeb = Platform.OS === 'web';
  const filtered = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));

  if (isWeb) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={wdm.overlay}>
          <TouchableOpacity style={wdm.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={wdm.box}>
            {/* Header */}
            <View style={wdm.header}>
              <Text style={wdm.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={wdm.closeBtn}>
                <Ionicons name="close" size={18} color="#555555" />
              </TouchableOpacity>
            </View>
            {/* Search */}
            <View style={wdm.searchWrap}>
              <Ionicons name="search-outline" size={15} color="#F97316" />
              <TextInput
                style={wdm.searchInput}
                placeholder="Search..."
                placeholderTextColor="#FBCFA0"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={15} color="#AAAAAA" />
                </TouchableOpacity>
              )}
            </View>
            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={i => i}
              showsVerticalScrollIndicator={false}
              style={wdm.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[wdm.item, selected === item && wdm.itemSel]}
                  onPress={() => { onSelect(item); onClose(); setSearch(''); }}
                >
                  <Text style={[wdm.itemText, selected === item && wdm.itemTextSel]}>{item}</Text>
                  {selected === item && <Ionicons name="checkmark-circle" size={18} color="#F97316" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // MOBILE — same as before
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={dm.overlay} activeOpacity={1} onPress={onClose} />
      <View style={dm.sheet}>
        <View style={dm.handle} />
        <Text style={dm.title}>{title}</Text>
        <View style={dm.searchWrap}>
          <Ionicons name="search-outline" size={16} color={C.pink} />
          <TextInput
            style={dm.searchInput}
            placeholder="Search..."
            placeholderTextColor={C.pinkMid}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filtered}
          keyExtractor={i => i}
          showsVerticalScrollIndicator={false}
          style={dm.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[dm.item, selected === item && dm.itemSel]}
              onPress={() => { onSelect(item); onClose(); setSearch(''); }}
            >
              <Text style={[dm.itemText, selected === item && dm.itemTextSel]}>{item}</Text>
              {selected === item && <Ionicons name="checkmark-circle" size={18} color={C.pink} />}
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
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.pinkLight, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  list:        { maxHeight: 340 },
  item:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 2 },
  itemSel:     { backgroundColor: C.pinkLight },
  itemText:    { fontSize: 14, color: C.textSub, fontWeight: '500' },
  itemTextSel: { color: C.pink, fontWeight: '700' },
});

const wdm = StyleSheet.create({
  overlay:   { flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center', padding:24 },
  backdrop:  { position:'absolute', top:0, left:0, right:0, bottom:0 },
  box:       { width:'100%', maxWidth:460, backgroundColor:'#ffffff', borderRadius:20, overflow:'hidden', maxHeight:520 },

  header:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:16, borderBottomWidth:1, borderBottomColor:'#FFE8D6' },
  title:     { fontSize:16, fontWeight:'800', color:'#111111' },
  closeBtn:  { width:32, height:32, borderRadius:8, backgroundColor:'#FFF7ED', alignItems:'center', justifyContent:'center' },

  searchWrap:  { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#FFF7ED', borderWidth:1, borderColor:'#FFE8D6', borderRadius:10, paddingHorizontal:12, paddingVertical:10, margin:14, marginBottom:6 },
  searchInput: { flex:1, fontSize:13, color:'#111111', padding:0 },

  list:        { maxHeight:360 },
  item:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:13, paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:'#FFF7ED' },
  itemSel:     { backgroundColor:'#FFF7ED' },
  itemText:    { fontSize:14, color:'#555555', fontWeight:'500' },
  itemTextSel: { color:'#F97316', fontWeight:'700' },
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
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.pink, alignItems: 'center', justifyContent: 'center' },
  num:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  label: { fontSize: 16, fontWeight: '800', color: C.text },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function ChoosePlanScreen({ navigation, route }) {
  const adData = route?.params?.adData || {};

  const [selState,    setSelState]    = useState('');
  const [selDistrict, setSelDistrict] = useState('');
  const [stateModal,  setStateModal]  = useState(false);
  const [distModal,   setDistModal]   = useState(false);
  const [promoteScope, setPromoteScope] = useState('district');
  const [placement, setPlacement]       = useState('full');
  const [duration, setDuration]         = useState('');
  const [showSuccess, setShowSuccess]   = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const todayStr = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };
  const [startDate] = useState(todayStr());

  const districtList = selState ? getDistricts(selState) : [];

  const promoteOptions = useMemo(() => {
    const opts = [];
    if (selDistrict) opts.push({ id: 'district', label: selDistrict, priceDay: null, free: true });
    if (selState)    opts.push({ id: 'state',    label: selState,    priceDay: PRICE_MATRIX.state[placement] });
    opts.push(        { id: 'india',    label: 'India',         priceDay: PRICE_MATRIX.india[placement] });
    return opts;
  }, [selState, selDistrict, placement]);

  const pricePerDay = promoteScope === 'district' ? 0
    : promoteScope === 'state' ? PRICE_MATRIX.state[placement]
    : PRICE_MATRIX.india[placement];

  const totalCharge = duration ? pricePerDay * (daysMap[duration] || 0) : null;

  const showSuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBuy = async () => {
    if (!selState)    { Alert.alert('Required', 'Please select your state.'); return; }
    if (!selDistrict) { Alert.alert('Required', 'Please select your city/district.'); return; }
    if (!promoteScope){ Alert.alert('Required', 'Please choose where to promote.'); return; }
    if (!placement)   { Alert.alert('Required', 'Please choose a placement.'); return; }
    if (!duration && promoteScope !== 'district') {
      Alert.alert('Required', 'Please choose a promotion duration.');
      return;
    }

    // ── Ad UserStore mein save karo ──
    if (adData && adData.title) {
      await UserStore.useAdCredit('post', {
        title:       adData.title,
        description: adData.description,
        photo:       adData.photo,
        redirect:    adData.redirect,
        extraValues:  adData.extraValues,
        allowCalls:   adData.allowCalls,
        scope:       promoteScope,
        placement:   placement,
        duration:    duration,
        state:       selState,
        district:    selDistrict,
      });
    }

    if (promoteScope === 'district') {
      showSuccessToast(`🎉 Free Promotion Activated! Your ad is now promoted in ${selDistrict} for FREE!`);
      setTimeout(() => navigation.navigate('MyAds'), 3000);
      return;
    }

    const scopeLabel     = promoteScope === 'state' ? selState : 'All of India';
    const placementLabel = placement === 'full' ? 'Full Page' : 'Home Page';
    const durationLabel  = DURATION_PLANS.find(p => p.id === duration)?.label || duration;

    showSuccessToast(`✅ Promotion Activated! Your ad is now live on ${scopeLabel} — ${placementLabel} for ${durationLabel}.`);
    setTimeout(() => navigation.navigate('MyAds'), 3000);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={ws.root}>
        {/* Top Bar */}
        <View style={ws.topBar}>
          <TouchableOpacity style={ws.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={16} color="#C8700F" />
            <Text style={ws.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={ws.topBarTitle}>Choose Your Plan</Text>
          <View style={{ width: 80 }} />
        </View>

        {/* Success Toast */}
        {showSuccess && (
          <View style={ws.toast}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={ws.toastText}>{successMessage}</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)}>
              <Ionicons name="close" size={18} color="#555" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={ws.scroll} contentContainerStyle={ws.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={ws.innerWrap}>

            {/* Two Column Layout */}
            <View style={ws.grid}>

              {/* LEFT: Form */}
              <View style={ws.leftCol}>

                {/* Ad Preview */}
                <View style={ws.card}>
                  <View style={ws.cardTitleRow}>
                    <View style={ws.previewBadge}><Text style={ws.previewBadgeText}>Preview</Text></View>
                  </View>
                  <View style={ws.previewInner}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={ws.previewTitle} numberOfLines={2}>{adData.title || 'Ad Title'}</Text>
                      <Text style={ws.previewDesc} numberOfLines={2}>{adData.description || 'Ad Description'}</Text>
                    </View>
                    {adData.photo ? (
                      <Image source={{ uri: adData.photo }} style={ws.previewThumb} resizeMode="cover" />
                    ) : (
                      <View style={ws.previewThumbEmpty}>
                        <Ionicons name="image-outline" size={24} color="#CCCCCC" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Step 1: Location */}
                <View style={ws.card}>
                  <View style={ws.stepRow}>
                    <View style={ws.stepBadge}><Text style={ws.stepNum}>1</Text></View>
                    <Text style={ws.stepTitle}>Select your location</Text>
                  </View>
                  <Text style={ws.fieldLabel}>State <Text style={ws.req}>*</Text></Text>
                  <TouchableOpacity style={ws.dropdown} onPress={() => setStateModal(true)} activeOpacity={0.8}>
                    <Text style={[ws.dropdownText, !selState && ws.placeholder]}>{selState || 'Select State'}</Text>
                    <Ionicons name="chevron-down" size={16} color="#AAAAAA" />
                  </TouchableOpacity>
                  <Text style={ws.fieldLabelSpaced}>City (District) <Text style={ws.req}>*</Text></Text>
                  <TouchableOpacity
                    style={[ws.dropdown, !selState && ws.dropdownDisabled]}
                    onPress={() => selState && setDistModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[ws.dropdownText, !selDistrict && ws.placeholder]}>
                      {selDistrict || 'Select City / District'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#AAAAAA" />
                  </TouchableOpacity>
                </View>

                {/* Step 4: Duration */}
                <View style={ws.card}>
                  <View style={ws.stepRow}>
                    <View style={ws.stepBadge}><Text style={ws.stepNum}>4</Text></View>
                    <Text style={ws.stepTitle}>Promotion Duration</Text>
                  </View>
                  {promoteScope === 'district' ? (
                    <View style={ws.freeNotice}>
                      <Ionicons name="gift-outline" size={16} color="#16a34a" />
                      <Text style={ws.freeNoticeText}>District promotion is FREE — no duration needed!</Text>
                    </View>
                  ) : (
                    <View style={ws.durationGrid}>
                      {DURATION_PLANS.map((plan) => {
                        const days  = daysMap[plan.id];
                        const price = pricePerDay * days;
                        const isSel = duration === plan.id;
                        return (
                          <TouchableOpacity
                            key={plan.id}
                            style={[ws.durationCard, isSel && ws.durationCardSel]}
                            onPress={() => setDuration(plan.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={[ws.durationLabel, isSel && ws.durationLabelSel]}>{plan.label}</Text>
                            <Text style={[ws.durationPrice, isSel && ws.durationPriceSel]}>₹{price}</Text>
                            {isSel && <View style={ws.durationCheck}><Ionicons name="checkmark-circle" size={15} color="#F97316" /></View>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Step 5: Start Date */}
                <View style={ws.card}>
                  <View style={ws.stepRow}>
                    <View style={ws.stepBadge}><Text style={ws.stepNum}>5</Text></View>
                    <Text style={ws.stepTitle}>Starting date of promotion</Text>
                  </View>
                  <View style={ws.dateRow}>
                    <Ionicons name="calendar-outline" size={18} color="#F97316" />
                    <Text style={ws.dateText}>{startDate}</Text>
                    <Text style={ws.dateSub}>(starts today)</Text>
                  </View>
                </View>

              </View>

              {/* RIGHT: Promote + Placement + Summary */}
              <View style={ws.rightCol}>

                {/* Step 2: Where to Promote */}
                <View style={ws.card}>
                  <View style={ws.stepRow}>
                    <View style={ws.stepBadge}><Text style={ws.stepNum}>2</Text></View>
                    <Text style={ws.stepTitle}>Where to promote?</Text>
                  </View>
                  {promoteOptions.length === 0 ? (
                    <Text style={ws.emptyHint}>Select your location first</Text>
                  ) : (
                    promoteOptions.map((opt) => {
                      const isSel = promoteScope === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[ws.radioCard, isSel && ws.radioCardSel]}
                          onPress={() => { setPromoteScope(opt.id); setDuration(''); }}
                          activeOpacity={0.8}
                        >
                          <View style={[ws.radioCircle, isSel && ws.radioCircleSel]}>
                            {isSel && <View style={ws.radioCircleDot} />}
                          </View>
                          <Text style={[ws.radioLabel, isSel && ws.radioLabelSel]}>{opt.label}</Text>
                          {opt.free ? (
                            <View style={ws.freeBadge}><Text style={ws.freeBadgeText}>FREE</Text></View>
                          ) : (
                            <View style={ws.priceBadge}><Text style={ws.priceBadgeText}>₹{opt.priceDay}/day</Text></View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>

                {/* Step 3: Placement */}
                <View style={ws.card}>
                  <View style={ws.stepRow}>
                    <View style={ws.stepBadge}><Text style={ws.stepNum}>3</Text></View>
                    <Text style={ws.stepTitle}>Choose Placement</Text>
                  </View>

                  <TouchableOpacity
                    style={[ws.placementCard, placement === 'home' && ws.placementCardSel]}
                    onPress={() => setPlacement('home')}
                    activeOpacity={0.8}
                  >
                    <View style={[ws.radioCircle, placement === 'home' && ws.radioCircleSel]}>
                      {placement === 'home' && <View style={ws.radioCircleDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[ws.placementTitle, placement === 'home' && ws.placementTitleSel]}>Home Page</Text>
                      <Text style={ws.placementDesc}>Shown on the home page in Shuru App</Text>
                    </View>
                    <View style={ws.placementMock}>
                      <Text style={ws.placementMockTop}>HOME</Text>
                      <View style={ws.placementMockAd}><Text style={ws.placementMockAdText}>Ad</Text></View>
                      <View style={ws.placementMockLine} />
                    </View>
                  </TouchableOpacity>

                  <View style={{ position: 'relative', marginTop: 10 }}>
                    <View style={ws.bestBadge}><Text style={ws.bestBadgeText}>🔥 Best Results</Text></View>
                    <TouchableOpacity
                      style={[ws.placementCard, placement === 'full' && ws.placementCardSel, { marginBottom: 0 }]}
                      onPress={() => setPlacement('full')}
                      activeOpacity={0.8}
                    >
                      <View style={[ws.radioCircle, placement === 'full' && ws.radioCircleSel]}>
                        {placement === 'full' && <View style={ws.radioCircleDot} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[ws.placementTitle, placement === 'full' && ws.placementTitleSel]}>Full Page</Text>
                        <Text style={ws.placementDesc}>Shown on home + full page when app opens</Text>
                      </View>
                      <View style={ws.placementMockFull}>
                        <View style={ws.placementMockFullAd}><Text style={ws.placementMockAdText}>Ad</Text></View>
                        <View style={ws.placementMockLine} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Summary Card */}
                <View style={ws.summaryCard}>
                  <Text style={ws.summaryTitle}>Order Summary</Text>
                  <View style={ws.summaryRow}>
                    <Text style={ws.summaryLabel}>Scope</Text>
                    <Text style={ws.summaryValue}>{promoteScope === 'district' ? selDistrict || '—' : promoteScope === 'state' ? selState || '—' : 'India'}</Text>
                  </View>
                  <View style={ws.summaryRow}>
                    <Text style={ws.summaryLabel}>Placement</Text>
                    <Text style={ws.summaryValue}>{placement === 'full' ? 'Full Page' : 'Home Page'}</Text>
                  </View>
                  <View style={ws.summaryRow}>
                    <Text style={ws.summaryLabel}>Duration</Text>
                    <Text style={ws.summaryValue}>{promoteScope === 'district' ? 'Ongoing (Free)' : DURATION_PLANS.find(p => p.id === duration)?.label || '—'}</Text>
                  </View>
                  <View style={ws.summaryRow}>
                    <Text style={ws.summaryLabel}>Start Date</Text>
                    <Text style={ws.summaryValue}>{startDate}</Text>
                  </View>
                  <View style={ws.summaryDivider} />
                  <View style={ws.summaryTotalRow}>
                    <Text style={ws.summaryTotalLabel}>Total Charge</Text>
                    <Text style={ws.summaryTotalPrice}>
                      {promoteScope === 'district' ? '₹0 (FREE)' : totalCharge !== null ? `₹${totalCharge}` : '₹N/A'}
                    </Text>
                  </View>
                  <TouchableOpacity style={ws.buyBtn} onPress={handleBuy} activeOpacity={0.85}>
                    <Text style={ws.buyBtnText}>Buy Promotion</Text>
                    <Ionicons name="chevron-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </ScrollView>

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

  return (
    <View style={s.root}>

      {/* ── Success Toast ── */}
      {showSuccess && (
        <View style={s.successToast}>
          <Ionicons name="checkmark-circle" size={24} color={C.green} />
          <Text style={s.successText}>{successMessage}</Text>
          <TouchableOpacity onPress={() => setShowSuccess(false)} style={s.successClose}>
            <Ionicons name="close" size={20} color={C.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={C.pink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Choose your plan</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Ad Preview Card ── */}
        <View style={s.previewCard}>
          <View style={s.previewBadge}>
            <Text style={s.previewBadgeText}>Preview</Text>
          </View>
          <View style={s.previewInner}>
            <View style={s.previewTextWrap}>
              <Text style={s.previewTitle} numberOfLines={2}>{adData.title || 'Ad Title'}</Text>
              <Text style={s.previewDesc}  numberOfLines={2}>{adData.description || 'Ad Description'}</Text>
            </View>
            {adData.photo ? (
              <Image source={{ uri: adData.photo }} style={s.previewThumb} resizeMode="cover" />
            ) : (
              <View style={s.previewThumbPlaceholder}>
                <Ionicons name="image-outline" size={24} color={C.textSub} />
              </View>
            )}
          </View>
        </View>

        {/* ── Step 1: Location ── */}
        <View style={s.section}>
          <StepHeader number="1" label="Select your location" />

          <Text style={s.fieldLabel}>State <Text style={s.req}>*</Text></Text>
          <TouchableOpacity style={s.dropdown} onPress={() => setStateModal(true)} activeOpacity={0.8}>
            <Text style={[s.dropdownText, !selState && s.placeholder]}>{selState || 'Select State'}</Text>
            <Ionicons name="chevron-down" size={18} color={C.textSub} />
          </TouchableOpacity>

          <Text style={s.fieldLabelSpaced}>City (District) <Text style={s.req}>*</Text></Text>
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

        {/* ── Step 2: Where to promote ── */}
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

        {/* ── Step 3: Placement ── */}
        <View style={s.section}>
          <StepHeader number="3" label="Choose Placement" />

          <TouchableOpacity
            style={[s.placementCard, placement === 'home' && s.placementCardSel]}
            onPress={() => setPlacement('home')}
            activeOpacity={0.8}
          >
            <View style={[s.radioCircle, placement === 'home' && s.radioCircleSel]}>
              {placement === 'home' && <View style={s.radioCircleDot} />}
            </View>
            <View style={s.placementInfo}>
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
              <View style={s.placementInfo}>
                <Text style={[s.placementTitle, placement === 'full' && s.placementTitleSel]}>Full Page</Text>
                <Text style={s.placementDesc}>Shown on home page and as full page when user opens the Shuru App</Text>
              </View>
              <View style={s.placementMockFull}>
                <View style={s.placementMockFullAd}><Text style={s.placementMockAdText}>Ads</Text></View>
                <View style={s.placementMockLine} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Step 4: Duration ── */}
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
                        <Ionicons name="checkmark-circle" size={16} color={C.pink} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Step 5: Start date ── */}
        <View style={s.section}>
          <StepHeader number="5" label="Starting date of promotion" />
          <View style={s.dateRow}>
            <Ionicons name="calendar-outline" size={20} color={C.pink} />
            <Text style={s.dateText}>{startDate}</Text>
            <Text style={s.dateSub}>(starts today)</Text>
          </View>
        </View>

        <View style={s.scrollSpacer} />
      </ScrollView>

      {/* ── Fixed Bottom Bar ── */}
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
          style={s.buyBtn}
          onPress={handleBuy}
          activeOpacity={0.85}
        >
          <Text style={s.buyBtnText}>Buy Promotion</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

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
  root: {
    flex: 1,
    backgroundColor: C.white,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: HEADER_TOP,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    elevation: 3,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: C.pinkLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 20 },
  scrollSpacer:  { height: 90 },

  // ── Preview Card ──
  previewCard: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  previewBadge: {
    backgroundColor: C.pink,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  previewBadgeText:        { color: '#fff', fontSize: 12, fontWeight: '800' },
  previewInner:            { flexDirection: 'row', alignItems: 'center' },
  previewTextWrap:         { flex: 1, paddingRight: 8 },
  previewTitle:            { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 4 },
  previewDesc:             { fontSize: 12, color: C.textSub },
  previewThumb:            { width: 80, height: 70, borderRadius: 12 },
  previewThumbPlaceholder: { width: 80, height: 70, borderRadius: 12, backgroundColor: C.pinkLight, alignItems: 'center', justifyContent: 'center' },

  section: { paddingHorizontal: 16, paddingTop: 24 },

  fieldLabel:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 },
  fieldLabelSpaced: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6, marginTop: 14 },
  req:              { color: C.pink },
  dropdown:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  dropdownDisabled: { opacity: 0.5 },
  dropdownText:     { fontSize: 14, color: C.text, fontWeight: '500' },
  placeholder:      { color: C.pinkMid },

  emptyHint: { fontSize: 13, color: C.textSub, fontStyle: 'italic', paddingVertical: 8 },

  // ── Radio ──
  radioCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10, gap: 12 },
  radioCardSel:   { borderColor: C.pink, backgroundColor: C.pinkLight },
  radioCircle:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioCircleSel: { borderColor: C.pink },
  radioCircleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.pink },
  radioLabel:     { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  radioLabelSel:  { color: C.pink, fontWeight: '700' },
  freeBadge:      { backgroundColor: C.greenLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.greenBorder },
  freeBadgeText:  { fontSize: 12, color: C.green, fontWeight: '700' },
  priceBadge:     { backgroundColor: C.pinkLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.pinkBorder },
  priceBadgeText: { fontSize: 12, color: C.pink, fontWeight: '700' },

  // ── Placement ──
  placementCard:         { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  placementCardSel:      { borderColor: C.pink, backgroundColor: C.pinkLight },
  placementCardFullPage: { marginBottom: 0 },
  placementInfo:         { flex: 1 },
  placementTitle:        { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 3 },
  placementTitleSel:     { color: C.pink },
  placementDesc:         { fontSize: 12, color: C.textSub, lineHeight: 17 },

  placementMock:       { width: 56, alignItems: 'center', gap: 3 },
  placementMockTop:    { fontSize: 9, fontWeight: '800', color: C.textSub },
  placementMockAd:     { width: 48, height: 20, backgroundColor: C.pink, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  placementMockAdText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  placementMockLines:  { gap: 3 },
  placementMockLine:   { width: 44, height: 4, backgroundColor: C.border, borderRadius: 2 },
  placementMockFull:   { width: 56, alignItems: 'center', justifyContent: 'center', gap: 4 },
  placementMockFullAd: { width: 48, height: 52, backgroundColor: C.pink, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },

  bestResultsWrap:  { position: 'relative', marginTop: 4 },
  bestResultsBadge: { position: 'absolute', top: -12, left: 14, zIndex: 10, backgroundColor: C.pink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  bestResultsText:  { color: '#fff', fontSize: 12, fontWeight: '800' },

  // ── Duration ──
  durationGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  durationCard:     { width: '30%', backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  durationCardSel:  { borderColor: C.pink, backgroundColor: C.pinkLight },
  durationLabel:    { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 4 },
  durationLabelSel: { color: C.pink },
  durationPrice:    { fontSize: 13, fontWeight: '800', color: C.textSub },
  durationPriceSel: { color: C.pink },
  durationCheck:    { position: 'absolute', top: 6, right: 6 },

  freeNotice:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenLight, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.greenBorder },
  freeNoticeText: { fontSize: 13, color: C.green, fontWeight: '600', flex: 1 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  dateText: { fontSize: 15, fontWeight: '700', color: C.text },
  dateSub:  { fontSize: 12, color: C.textSub },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: C.border,
    elevation: 12,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomLabel: { fontSize: 12, color: C.textSub, marginBottom: 2 },
  bottomPrice: { fontSize: 22, fontWeight: '900', color: C.text },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.pink,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // ── Success Toast ──
  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  successText:  { flex: 1, color: C.text, fontSize: 13, fontWeight: '600', marginLeft: 10 },
  successClose: { padding: 4 },
});

const ws = StyleSheet.create({
  root:        { flex:1, backgroundColor:'#FFF7ED', minHeight:'100vh' },

  topBar:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:32, paddingVertical:14, backgroundColor:'#ffffff', borderBottomWidth:1, borderBottomColor:'#FFE8D6' },
  backBtn:     { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:8, backgroundColor:'#FFF7ED', borderWidth:1, borderColor:'#FFE8D6', borderRadius:8 },
  backBtnText: { fontSize:13, fontWeight:'700', color:'#C8700F' },
  topBarTitle: { fontSize:15, fontWeight:'800', color:'#111111' },

  toast:       { position:'absolute', top:60, left:32, right:32, backgroundColor:'#ffffff', borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', gap:10, zIndex:1000, borderWidth:1, borderColor:'#bbf7d0', elevation:8 },
  toastText:   { flex:1, fontSize:13, fontWeight:'600', color:'#111111' },

  scroll:        { flex:1 },
  scrollContent: { paddingHorizontal:32, paddingTop:28, paddingBottom:60, alignItems:'center' },
  innerWrap:     { width:'100%', maxWidth:1000, alignSelf:'center' },

  grid:     { flexDirection:'row', gap:20, alignItems:'flex-start' },
  leftCol:  { flex:1.1, gap:16 },
  rightCol: { flex:0.9, gap:16 },

  card:        { backgroundColor:'#ffffff', borderRadius:16, padding:20, borderWidth:1, borderColor:'#FFE8D6' },
  cardTitleRow:{ marginBottom:12 },

  stepRow:   { flexDirection:'row', alignItems:'center', gap:10, marginBottom:16 },
  stepBadge: { width:28, height:28, borderRadius:14, backgroundColor:'#F97316', alignItems:'center', justifyContent:'center' },
  stepNum:   { color:'#ffffff', fontSize:13, fontWeight:'800' },
  stepTitle: { fontSize:15, fontWeight:'800', color:'#111111' },

  previewBadge:     { backgroundColor:'#F97316', alignSelf:'flex-start', borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginBottom:10 },
  previewBadgeText: { color:'#fff', fontSize:12, fontWeight:'800' },
  previewInner:     { flexDirection:'row', alignItems:'center' },
  previewTitle:     { fontSize:15, fontWeight:'800', color:'#111111', marginBottom:4 },
  previewDesc:      { fontSize:12, color:'#888888' },
  previewThumb:     { width:80, height:70, borderRadius:12 },
  previewThumbEmpty:{ width:80, height:70, borderRadius:12, backgroundColor:'#FFF7ED', alignItems:'center', justifyContent:'center' },

  fieldLabel:       { fontSize:12, fontWeight:'700', color:'#111111', marginBottom:6 },
  fieldLabelSpaced: { fontSize:12, fontWeight:'700', color:'#111111', marginBottom:6, marginTop:14 },
  req:              { color:'#F97316' },
  dropdown:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#FFFAF7', borderWidth:1.5, borderColor:'#FFE8D6', borderRadius:10, paddingHorizontal:14, paddingVertical:12 },
  dropdownDisabled: { opacity:0.4 },
  dropdownText:     { fontSize:14, color:'#111111', fontWeight:'500' },
  placeholder:      { color:'#FBCFA0' },

  emptyHint: { fontSize:13, color:'#AAAAAA', fontStyle:'italic' },

  radioCard:      { flexDirection:'row', alignItems:'center', backgroundColor:'#FFFAF7', borderWidth:1.5, borderColor:'#FFE8D6', borderRadius:12, paddingHorizontal:14, paddingVertical:13, marginBottom:8, gap:10 },
  radioCardSel:   { borderColor:'#F97316', backgroundColor:'#FFF7ED' },
  radioCircle:    { width:18, height:18, borderRadius:9, borderWidth:2, borderColor:'#FFE8D6', alignItems:'center', justifyContent:'center' },
  radioCircleSel: { borderColor:'#F97316' },
  radioCircleDot: { width:8, height:8, borderRadius:4, backgroundColor:'#F97316' },
  radioLabel:     { flex:1, fontSize:13, fontWeight:'600', color:'#111111' },
  radioLabelSel:  { color:'#F97316', fontWeight:'700' },
  freeBadge:      { backgroundColor:'#f0fdf4', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'#bbf7d0' },
  freeBadgeText:  { fontSize:11, color:'#16a34a', fontWeight:'700' },
  priceBadge:     { backgroundColor:'#FFF7ED', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'#FFE8D6' },
  priceBadgeText: { fontSize:11, color:'#F97316', fontWeight:'700' },

  placementCard:     { flexDirection:'row', alignItems:'flex-start', backgroundColor:'#FFFAF7', borderWidth:1.5, borderColor:'#FFE8D6', borderRadius:12, padding:14, gap:10, marginBottom:8 },
  placementCardSel:  { borderColor:'#F97316', backgroundColor:'#FFF7ED' },
  placementTitle:    { fontSize:13, fontWeight:'800', color:'#111111', marginBottom:2 },
  placementTitleSel: { color:'#F97316' },
  placementDesc:     { fontSize:11, color:'#AAAAAA', lineHeight:16 },
  placementMock:     { width:50, alignItems:'center', gap:3 },
  placementMockTop:  { fontSize:8, fontWeight:'800', color:'#AAAAAA' },
  placementMockAd:   { width:44, height:18, backgroundColor:'#F97316', borderRadius:4, alignItems:'center', justifyContent:'center' },
  placementMockAdText:{ color:'#fff', fontSize:9, fontWeight:'800' },
  placementMockLine: { width:40, height:3, backgroundColor:'#FFE8D6', borderRadius:2 },
  placementMockFull: { width:50, alignItems:'center', gap:4 },
  placementMockFullAd:{ width:44, height:46, backgroundColor:'#F97316', borderRadius:6, alignItems:'center', justifyContent:'center' },
  bestBadge:         { position:'absolute', top:-11, left:12, zIndex:10, backgroundColor:'#F97316', borderRadius:20, paddingHorizontal:10, paddingVertical:3 },
  bestBadgeText:     { color:'#fff', fontSize:11, fontWeight:'800' },

  durationGrid:     { flexDirection:'row', flexWrap:'wrap', gap:8 },
  durationCard:     { width:'30%', backgroundColor:'#FFFAF7', borderWidth:1.5, borderColor:'#FFE8D6', borderRadius:12, paddingVertical:13, alignItems:'center', position:'relative' },
  durationCardSel:  { borderColor:'#F97316', backgroundColor:'#FFF7ED' },
  durationLabel:    { fontSize:12, fontWeight:'700', color:'#111111', marginBottom:3 },
  durationLabelSel: { color:'#F97316' },
  durationPrice:    { fontSize:12, fontWeight:'800', color:'#AAAAAA' },
  durationPriceSel: { color:'#F97316' },
  durationCheck:    { position:'absolute', top:5, right:5 },

  freeNotice:     { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#f0fdf4', borderRadius:10, padding:12, borderWidth:1, borderColor:'#bbf7d0' },
  freeNoticeText: { fontSize:13, color:'#16a34a', fontWeight:'600', flex:1 },

  dateRow:  { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#FFFAF7', borderRadius:10, padding:12, borderWidth:1.5, borderColor:'#FFE8D6' },
  dateText: { fontSize:14, fontWeight:'700', color:'#111111' },
  dateSub:  { fontSize:12, color:'#AAAAAA' },

  summaryCard:       { backgroundColor:'#ffffff', borderRadius:16, padding:20, borderWidth:2, borderColor:'#F97316' },
  summaryTitle:      { fontSize:16, fontWeight:'900', color:'#111111', marginBottom:16 },
  summaryRow:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#FFF7ED' },
  summaryLabel:      { fontSize:13, color:'#AAAAAA', fontWeight:'500' },
  summaryValue:      { fontSize:13, fontWeight:'700', color:'#111111' },
  summaryDivider:    { height:1, backgroundColor:'#FFE8D6', marginVertical:12 },
  summaryTotalRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  summaryTotalLabel: { fontSize:14, fontWeight:'700', color:'#111111' },
  summaryTotalPrice: { fontSize:22, fontWeight:'900', color:'#F97316' },
  buyBtn:            { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'#F97316', borderRadius:12, paddingVertical:14 },
  buyBtnText:        { color:'#ffffff', fontSize:15, fontWeight:'800' },
});
