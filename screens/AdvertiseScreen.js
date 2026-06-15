import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Alert, Modal, Dimensions, Platform, StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getResponsiveWindowWidth } from '../utils/webDevice';
import { UserStore } from '../store/UserStore';
import { useToast } from '../components/ui/ToastProvider';

// ── Theme Colors ───────────────────────────────────────────────────────────────
const C = {
  orange:      '#ea580c',
  orangeLight:   '#fff0f5',
  orangeBorder:  '#ffe4ef',
  orangeMid:     '#fda4be',
  green:       '#16a34a',
  greenLight:  '#f0fdf4',
  greenBorder: '#bbf7d0',
  white:       '#ffffff',
  bg:          '#ffffff',
  text:        '#0f172a',
  textSub:     '#94a3b8',
  border:      '#ffe4ef',
};

const { width: RAW_SW } = Dimensions.get('window');
const SW = getResponsiveWindowWidth(RAW_SW);

const HEADER_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight || 24) + 10
  : 54;

// ── Redirect Options ───────────────────────────────────────────────────────────
const REDIRECT_OPTIONS = [
  { id: 'profile',   title: 'My RTI Profile',      desc: 'Users will directly reach your profile on clicking',  icon: 'person-circle-outline', extra: null },
  { id: 'website',   title: 'My Website',           desc: 'Users will be directly sent to your website',         icon: 'globe-outline',         extra: 'website_url' },
  { id: 'shop',      title: 'My Shop',              desc: 'Users will be directly sent to your online shop',     icon: 'storefront-outline',    extra: 'shop_url' },
  { id: 'lead_form', title: 'Lead Form',            desc: 'Users can fill out a form you created',               icon: 'document-text-outline', extra: null },
  { id: 'whatsapp',  title: 'My Whatsapp Number',   desc: 'Users will be able to message you on WhatsApp',       icon: 'logo-whatsapp',         extra: 'whatsapp_number' },
];

const normalizeIndianMobileNumber = (value = '') => {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
};

const isValidIndianMobileNumber = (value = '') => /^[6-9]\d{9}$/.test(normalizeIndianMobileNumber(value));

const buildNextExtraValues = (key, value, previous = {}) => ({
  ...previous,
  [key]: key === 'whatsapp_number' ? normalizeIndianMobileNumber(value) : value,
});

// ── Step Badge Component ───────────────────────────────────────────────────────
function StepBadge({ number, label, hint }) {
  return (
    <View style={st.row}>
      <View style={st.badge}>
        <Text style={st.badgeNum}>{number}</Text>
      </View>
      <View style={st.badgeInfo}>
        <Text style={st.label}>{label} <Text style={st.req}>*</Text></Text>
        {hint ? <Text style={st.hint}>{hint}</Text> : null}
      </View>
    </View>
  );
}
const st = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  badge:    { width: 28, height: 28, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  badgeNum: { color: '#fff', fontSize: 13, fontWeight: '800' },
  badgeInfo:{ flex: 1 },
  label:    { fontSize: 15, fontWeight: '800', color: C.text },
  req:      { color: C.orange },
  hint:     { fontSize: 12, color: C.textSub, marginTop: 2 },
});

// ── Ad Preview Modal ────────────────────────────────────────────────────────────
function AdPreviewModal({ visible, onClose, onNext, adData }) {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={wpm.overlay}>
          <TouchableOpacity style={wpm.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={wpm.box}>
            {/* Header */}
            <View style={wpm.header}>
              <TouchableOpacity onPress={onClose} style={wpm.backBtn}>
                <Ionicons name="arrow-back" size={18} color="#111111" />
              </TouchableOpacity>
              <Text style={wpm.headerTitle}>Your Ad will look like this</Text>
              <View style={{ width: 34 }} />
            </View>

            {/* Ad Preview Card */}
            <View style={wpm.adCard}>
              <View style={wpm.adBadgeRow}>
                <View style={wpm.adBadge}>
                  <Text style={wpm.adBadgeEmoji}>👑</Text>
                  <Text style={wpm.adBadgeText}>Advertisement</Text>
                </View>
              </View>
              <Text style={wpm.adTitle}>{adData.title || 'Ad Title'}</Text>
              <Text style={wpm.adDesc}>{adData.description || 'Ad Description'}</Text>
              {adData.photo ? (
                <Image source={{ uri: adData.photo }} style={wpm.adImage} resizeMode="cover" />
              ) : (
                <View style={wpm.adImagePlaceholder}>
                  <Ionicons name="image-outline" size={36} color="#CCCCCC" />
                </View>
              )}
              <View style={wpm.ctaRow}>
                <TouchableOpacity style={wpm.ctaWhatsapp}>
                  <Ionicons name="logo-whatsapp" size={15} color="#fff" />
                  <Text style={wpm.ctaWhatsappText}>Message on Whatsapp</Text>
                  <Ionicons name="chevron-forward" size={14} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={wpm.ctaCall}>
                  <Ionicons name="call-outline" size={15} color="#16a34a" />
                  <Text style={wpm.ctaCallText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={wpm.btnRow}>
              <TouchableOpacity style={wpm.changeBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={wpm.changeBtnText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={wpm.nextBtn} onPress={onNext} activeOpacity={0.85}>
                <Text style={wpm.nextBtnText}>Next  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // MOBILE — same as before
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={pm.overlay}>
        <View style={pm.sheet}>
          <View style={pm.handle} />
          <View style={pm.header}>
            <TouchableOpacity onPress={onClose} style={pm.backBtn}>
              <Ionicons name="arrow-back" size={20} color={C.text} />
            </TouchableOpacity>
            <Text style={pm.headerTitle}>Your Ad will look like this</Text>
          </View>
          <View style={pm.adCard}>
            <View style={pm.adBadgeRow}>
              <View style={pm.adBadge}>
                <Text style={pm.adBadgeEmoji}>👑</Text>
                <Text style={pm.adBadgeText}>Advertisement</Text>
              </View>
            </View>
            <Text style={pm.adTitle}>{adData.title || 'Ad Title'}</Text>
            <Text style={pm.adDesc}>{adData.description || 'Ad Description'}</Text>
            {adData.photo ? (
              <Image source={{ uri: adData.photo }} style={pm.adImage} resizeMode="cover" />
            ) : (
              <View style={pm.adImagePlaceholder}>
                <Ionicons name="image-outline" size={36} color={C.textSub} />
              </View>
            )}
            <View style={pm.ctaRow}>
              <TouchableOpacity style={pm.ctaWhatsapp}>
                <Ionicons name="logo-whatsapp" size={15} color="#fff" />
                <Text style={pm.ctaWhatsappText}>Message on Whatsapp</Text>
                <Ionicons name="chevron-forward" size={14} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={pm.ctaCall}>
                <Ionicons name="call-outline" size={15} color={C.green} />
                <Text style={pm.ctaCallText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={pm.btnRow}>
            <TouchableOpacity style={pm.changeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={pm.changeBtnText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={pm.nextBtn} onPress={onNext} activeOpacity={0.85}>
              <Text style={pm.nextBtnText}>Next  →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const pm = StyleSheet.create({
  overlay:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:              { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 36 },
  handle:             { width: 44, height: 4, backgroundColor: C.border, borderRadius: 99, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header:             { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:            { padding: 6, borderRadius: 8, backgroundColor: C.pinkLight },
  headerTitle:        { fontSize: 16, fontWeight: '800', color: C.text },
  adCard:             { marginHorizontal: 16, marginTop: 14, backgroundColor: '#fffaf5', borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: C.pinkBorder },
  adBadgeRow:         { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  adBadge:            { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.orangeLight, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adBadgeEmoji:       { fontSize: 13 },
  adBadgeText:        { fontSize: 11, color: C.orange, fontWeight: '700' },
  adTitle:            { fontSize: 15, fontWeight: '800', color: C.text, paddingHorizontal: 12, paddingBottom: 2 },
  adDesc:             { fontSize: 12, color: C.textSub, paddingHorizontal: 12, paddingBottom: 10 },
  adImage:            { width: '100%', height: 180 },
  adImagePlaceholder: { width: '100%', height: 180, backgroundColor: C.orangeLight, alignItems: 'center', justifyContent: 'center' },
  ctaRow:             { flexDirection: 'row', height: 48 },
  ctaWhatsapp:        { flex: 1, backgroundColor: C.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  ctaWhatsappText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  ctaCall:            { width: 88, backgroundColor: C.greenLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderLeftWidth: 1, borderLeftColor: C.greenBorder },
  ctaCallText:        { color: C.green, fontWeight: '700', fontSize: 13 },
  btnRow:             { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  changeBtn:          { flex: 1, borderWidth: 2, borderColor: C.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  changeBtnText:      { color: C.orange, fontWeight: '700', fontSize: 15 },
  nextBtn:            { flex: 1, backgroundColor: C.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 4, shadowColor: C.o, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  nextBtnText:        { color: '#fff', fontWeight: '800', fontSize: 15 },
});

const wpm = StyleSheet.create({
  overlay:   { flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center', padding:24 },
  backdrop:  { position:'absolute', top:0, left:0, right:0, bottom:0 },
  box:       { width:'100%', maxWidth:520, backgroundColor:'#ffffff', borderRadius:24, overflow:'hidden' },

  header:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'#FFE8D6' },
  backBtn:   { width:34, height:34, borderRadius:8, backgroundColor:'#FFF7ED', alignItems:'center', justifyContent:'center' },
  headerTitle: { fontSize:15, fontWeight:'800', color:'#111111' },

  adCard:    { margin:16, backgroundColor:'#fffaf5', borderRadius:16, overflow:'hidden', borderWidth:1.5, borderColor:'#FFE8D6' },
  adBadgeRow:{ paddingHorizontal:12, paddingTop:10, paddingBottom:4 },
  adBadge:   { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#FFF0F5', alignSelf:'flex-start', paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  adBadgeEmoji: { fontSize:13 },
  adBadgeText:  { fontSize:11, color:'#ea580c', fontWeight:'700' },
  adTitle:   { fontSize:15, fontWeight:'800', color:'#111111', paddingHorizontal:12, paddingBottom:2 },
  adDesc:    { fontSize:12, color:'#888888', paddingHorizontal:12, paddingBottom:10 },
  adImage:   { width:'100%', height:200 },
  adImagePlaceholder: { width:'100%', height:200, backgroundColor:'#FFF7ED', alignItems:'center', justifyContent:'center' },

  ctaRow:        { flexDirection:'row', height:48 },
  ctaWhatsapp:   { flex:1, backgroundColor:'#ea580c', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5 },
  ctaWhatsappText: { color:'#fff', fontWeight:'700', fontSize:13 },
  ctaCall:       { width:88, backgroundColor:'#f0fdf4', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, borderLeftWidth:1, borderLeftColor:'#bbf7d0' },
  ctaCallText:   { color:'#16a34a', fontWeight:'700', fontSize:13 },

  btnRow:    { flexDirection:'row', gap:12, padding:16 },
  changeBtn: { flex:1, borderWidth:2, borderColor:'#ea580c', borderRadius:12, paddingVertical:13, alignItems:'center' },
  changeBtnText: { color:'#ea580c', fontWeight:'700', fontSize:14 },
  nextBtn:   { flex:1, backgroundColor:'#ea580c', borderRadius:12, paddingVertical:13, alignItems:'center' },
  nextBtnText: { color:'#ffffff', fontWeight:'800', fontSize:14 },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function AdvertiseScreen({ navigation, route }) {
  const editAd = route?.params?.editAd || null;
  const isEditing = Boolean(editAd?.id);
  const { showToast } = useToast();

  const [photo, setPhoto]                       = useState(editAd?.photo || null);
  const [title, setTitle]                       = useState(editAd?.title || '');
  const [description, setDescription]           = useState(editAd?.description || '');
  const [selectedRedirect, setSelectedRedirect] = useState(editAd?.redirect || 'whatsapp');
  const [extraValues, setExtraValues]           = useState(editAd?.extraValues || {});
  const [allowCalls, setAllowCalls]             = useState(editAd?.allowCalls !== undefined ? Boolean(editAd.allowCalls) : true);
  const [showPreview, setShowPreview]           = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const webWidth = getResponsiveWindowWidth(windowWidth);
  const isWebSmall = Platform.OS === 'web' && webWidth < 920;
  const isWebCompact = Platform.OS === 'web' && webWidth < 720;

  const tutorialPlayer = useVideoPlayer(
    { uri: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    (player) => {
      player.loop = false;
    }
  );

  useEffect(() => {
    if (!editAd) return;
    setPhoto(editAd.photo || null);
    setTitle(editAd.title || '');
    setDescription(editAd.description || '');
    setSelectedRedirect(editAd.redirect || 'whatsapp');
    setExtraValues(editAd.extraValues || {});
    setAllowCalls(editAd.allowCalls !== undefined ? Boolean(editAd.allowCalls) : true);
  }, [editAd]);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleNext = async () => {
    if (!photo)             { Alert.alert('Required', 'Please add an advertisement photo.'); return; }
    if (!title.trim())      { Alert.alert('Required', 'Please write an advertisement title.'); return; }
    if (!description.trim()){ Alert.alert('Required', 'Please write a description.'); return; }
    if (selectedRedirect === 'whatsapp' && !isValidIndianMobileNumber(extraValues.whatsapp_number)) {
      showToast('Please enter a valid 10 digit WhatsApp number.', 'error');
      return;
    }
    if (!isEditing) {
  // Check if user has active ad credits
  const adSummary = await UserStore.getAdCreditsSummary();
  const hasCredits = adSummary && !adSummary.expired && adSummary.credits > 0;

  if (!hasCredits) {
    showToast('Please take a subscription to post an advertisement.', 'info');
    setTimeout(() => {
      navigation.navigate('AdPlans');
    }, 1200);
    return;
  }
}
setShowPreview(true);
  };

  const handlePreviewNext = async () => {
    setShowPreview(false);

    await new Promise(resolve => setTimeout(resolve, 300)); // modal band hone do

    if (isEditing) {
      const spendAdCredit = UserStore.useAdCredit;
      const result = await spendAdCredit('edit', {
        id:          editAd.id,
        title:       title.trim(),
        description: description.trim(),
        photo,
        redirect:    selectedRedirect,
        extraValues,
        allowCalls,
      });

      if (!result.ok) {
        Alert.alert('Unable to Update', result.message || 'Unable to update ad.');
        return;
      }

      showToast('Ad updated successfully. 1 credit has been used.', 'success');
      navigation.navigate('MyAds');
      return;
    }

    navigation.navigate('ChoosePlan', {
  adData: { photo, title, description, redirect: selectedRedirect, extraValues, allowCalls },
  showSubscriptionToast: true,
});
  };

  // ── WEB LAYOUT ─────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={ws.root}>
        {/* Top Bar */}
        <View style={[ws.topBar, isWebCompact && ws.topBarCompact]}>
          <TouchableOpacity style={ws.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={16} color="#C8700F" />
            <Text style={ws.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={[ws.topBarTitle, isWebCompact && ws.topBarTitleCompact]}>Fill Advertisement Information</Text>
          {!isWebCompact ? <View style={{ width: 80 }} /> : null}
        </View>

        <ScrollView style={ws.scroll} contentContainerStyle={[ws.scrollContent, isWebCompact && ws.scrollContentCompact]} showsVerticalScrollIndicator={false}>
          <View style={ws.innerWrap}>

            {/* Page Header */}
            <View style={[ws.pageHeader, isWebSmall && ws.pageHeaderStack]}>
              <View style={ws.pageHeaderLeft}>
                <Text style={ws.pageHeaderEyebrow}>ADVERTISE</Text>
                <Text style={ws.pageHeaderTitle}>Create Your Advertisement</Text>
                <Text style={ws.pageHeaderSub}>Fill in your ad details below and reach thousands of users.</Text>
              </View>
              <View style={[ws.tutorialCard, isWebSmall && ws.tutorialCardFull]}> 
                <VideoView
                  player={tutorialPlayer}
                  style={ws.tutorialVideo}
                  nativeControls
                  contentFit="cover"
                />
                <View style={ws.tutorialVideoTag}>
                  <Ionicons name="play-circle" size={13} color="#ea580c" />
                  <Text style={ws.tutorialVideoTagText}>How to advertise — watch this</Text>
                </View>
              </View>
            </View>

            {/* Two-column form */}
            <View style={[ws.formGrid, isWebSmall && ws.formGridWrap, isWebSmall && ws.formGridColumn]}>

              {/* LEFT COLUMN */}
              <View style={[ws.col, isWebSmall && ws.colFull]}>

                {/* Photo Upload */}
                <View style={ws.card}>
                  <View style={ws.cardHeader}>
                    <View style={ws.stepCircle}><Text style={ws.stepNum}>1</Text></View>
                    <View>
                      <Text style={ws.cardTitle}>Advertisement Photo <Text style={{ color: '#ea580c' }}>*</Text></Text>
                      <Text style={ws.cardSub}>Visiting card, Shop, Pamphlet, Poster</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[ws.photoBox, photo && ws.photoBoxFilled]} onPress={handlePickPhoto} activeOpacity={0.85}>
                    {photo ? (
                      <>
                        <Image source={{ uri: photo }} style={ws.photoPreview} resizeMode="cover" />
                        <TouchableOpacity style={ws.changeOverlay} onPress={handlePickPhoto}>
                          <Ionicons name="pencil" size={14} color="#fff" />
                          <Text style={ws.changeOverlayText}>Change</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={ws.photoEmpty}>
                        <View style={ws.photoIconCircle}>
                          <MaterialIcons name="add-photo-alternate" size={36} color="#ea580c" />
                        </View>
                        <Text style={ws.photoEmptyTitle}>Click to add photo</Text>
                        <Text style={ws.photoEmptyHint}>jpeg / png supported</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Title */}
                <View style={ws.card}>
                  <View style={ws.cardHeader}>
                    <View style={ws.stepCircle}><Text style={ws.stepNum}>2</Text></View>
                    <View>
                      <Text style={ws.cardTitle}>Advertisement Title <Text style={{ color: '#ea580c' }}>*</Text></Text>
                      <Text style={ws.cardSub}>Main headline for your promotion</Text>
                    </View>
                  </View>
                  <TextInput
                    style={ws.input}
                    placeholder="Eg. Best Electronics Shop in your area"
                    placeholderTextColor="#FBCFA0"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                  />
                  <Text style={ws.charCount}>{title.length}/100</Text>
                </View>

                {/* Description */}
                <View style={ws.card}>
                  <View style={ws.cardHeader}>
                    <View style={ws.stepCircle}><Text style={ws.stepNum}>3</Text></View>
                    <View>
                      <Text style={ws.cardTitle}>Description <Text style={{ color: '#ea580c' }}>*</Text></Text>
                      <Text style={ws.cardSub}>Add a promotional message for this ad</Text>
                    </View>
                  </View>
                  <TextInput
                    style={ws.inputMulti}
                    placeholder="Eg. We sell washing machines, air conditioners and televisions."
                    placeholderTextColor="#FBCFA0"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={300}
                  />
                  <Text style={ws.charCount}>{description.length}/300</Text>
                </View>

              </View>

              {/* RIGHT COLUMN */}
              <View style={[ws.col, isWebSmall && ws.colFull]}>

                {/* Redirect */}
                <View style={ws.card}>
                  <View style={ws.cardHeader}>
                    <View style={ws.stepCircle}><Text style={ws.stepNum}>4</Text></View>
                    <View>
                      <Text style={ws.cardTitle}>Redirect Users To</Text>
                      <Text style={ws.cardSub}>Where users go when they click your ad</Text>
                    </View>
                  </View>
                  {REDIRECT_OPTIONS.map((opt) => {
                    const sel = selectedRedirect === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[ws.radioCard, sel && ws.radioCardSel]}
                        onPress={() => setSelectedRedirect(opt.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[ws.radioIcon, sel && ws.radioIconSel]}>
                          <Ionicons name={opt.icon} size={17} color={sel ? '#fff' : '#AAAAAA'} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[ws.radioTitle, sel && ws.radioTitleSel]}>{opt.title}</Text>
                          <Text style={ws.radioDesc}>{opt.desc}</Text>
                          {sel && opt.extra && (
                            <View style={ws.extraWrap}>
                              <Text style={ws.extraLabel}>
                                {opt.extra === 'whatsapp_number' ? 'Enter WhatsApp number'
                                  : opt.extra === 'website_url' ? 'Enter website URL' : 'Enter shop URL'}
                              </Text>
                              <TextInput
                                style={ws.extraInput}
                                placeholder={opt.extra === 'whatsapp_number' ? 'Eg. 9999999999' : 'https://...'}
                                placeholderTextColor="#FBCFA0"
                                value={extraValues[opt.extra] || ''}
                                onChangeText={(v) => setExtraValues(p => buildNextExtraValues(opt.extra, v, p))}
                                keyboardType={opt.extra === 'whatsapp_number' ? 'phone-pad' : 'url'}
                                maxLength={opt.extra === 'whatsapp_number' ? 10 : undefined}
                              />
                            </View>
                          )}
                        </View>
                        <View style={[ws.radioCircle, sel && ws.radioCircleSel]}>
                          {sel && <View style={ws.radioCircleDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Allow Calls */}
                <TouchableOpacity
                  style={[ws.checkRow, allowCalls && ws.checkRowOn, isWebSmall && ws.checkRowColumn]}
                  onPress={() => setAllowCalls(!allowCalls)}
                  activeOpacity={0.8}
                >
                  <View style={[ws.checkbox, allowCalls && ws.checkboxOn]}>
                    {allowCalls && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ws.checkLabel}>Allow people to call you</Text>
                    <Text style={ws.checkHint}>A call button will appear under your advertisement</Text>
                  </View>
                  <Ionicons name="call-outline" size={20} color={allowCalls ? '#16a34a' : '#DDDDDD'} />
                </TouchableOpacity>

                {/* Next Button */}
                <TouchableOpacity style={[ws.nextBtn, isWebSmall && ws.nextBtnFull]} onPress={handleNext} activeOpacity={0.85}>
                  <Text style={ws.nextBtnText}>Preview & Continue</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </ScrollView>

        <AdPreviewModal
          visible={showPreview}
          onClose={() => setShowPreview(false)}
          onNext={handlePreviewNext}
          adData={{ photo, title, description, redirect: selectedRedirect }}
        />
      </View>
    );
  }

  return (
    <View style={s.root}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={C.orange} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fill advertisement information below</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Tutorial Video ── */}
        <View style={s.videoWrapper}>
          <VideoView
            player={tutorialPlayer}
            style={s.video}
            nativeControls
            contentFit="cover"
          />
          <View style={s.videoTag}>
            <Ionicons name="play-circle" size={13} color={C.orange} />
            <Text style={s.videoTagText}>How to advertise — watch this</Text>
          </View>
        </View>

        {/* ── 1. Photo ── */}
        <View style={s.section}>
          <StepBadge number="1" label="Select Advertisement Photo" hint="Add photo of Visiting card, Shop, Pamphlet, Poster" />
          <TouchableOpacity
            style={[s.photoBox, photo ? s.photoBoxFilled : null]}
            onPress={handlePickPhoto}
            activeOpacity={0.85}
          >
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={s.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={s.changePhotoBtn} onPress={handlePickPhoto}>
                  <Ionicons name="pencil" size={12} color="#fff" />
                  <Text style={s.changePhotoBtnText}>Change</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={s.photoEmpty}>
                <View style={s.photoIconCircle}>
                  <MaterialIcons name="add-photo-alternate" size={34} color={C.orange} />
                </View>
                <Text style={s.photoEmptyTitle}>Tap to add photo</Text>
                <Text style={s.photoEmptyHint}>jpeg / png supported</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── 2. Title ── */}
        <View style={s.section}>
          <StepBadge number="2" label="Write Advertisement Title" hint="Main headline for your promotion" />
          <TextInput
            style={s.input}
            placeholder="Eg. Best Electronics Shop in your area"
            placeholderTextColor={C.pinkMid}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={s.charCount}>{title.length}/100</Text>
        </View>

        {/* ── 3. Description ── */}
        <View style={s.section}>
          <StepBadge number="3" label="Write Description For Advertisement" hint="Add a promotional message for this ad" />
          <TextInput
            style={s.inputMulti}
            placeholder="Eg. We sell washing machines, air conditioners and televisions."
            placeholderTextColor={C.pinkMid}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={s.charCount}>{description.length}/300</Text>
        </View>

        {/* ── 4. Redirect ── */}
        <View style={s.section}>
          <StepBadge number="4" label="Redirect users on banner click to" />
          {REDIRECT_OPTIONS.map((opt) => {
            const sel = selectedRedirect === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[s.radioCard, sel && s.radioCardSelected]}
                onPress={() => setSelectedRedirect(opt.id)}
                activeOpacity={0.8}
              >
                <View style={[s.radioIcon, sel && s.radioIconSelected]}>
                  <Ionicons name={opt.icon} size={18} color={sel ? C.white : C.textSub} />
                </View>
                <View style={s.radioInfo}>
                  <Text style={[s.radioTitle, sel && s.radioTitleSel]}>{opt.title}</Text>
                  <Text style={s.radioDesc}>{opt.desc}</Text>
                  {sel && opt.extra && (
                    <View style={s.extraWrap}>
                      <Text style={s.extraLabel}>
                        {opt.extra === 'whatsapp_number' ? 'Enter WhatsApp number'
                          : opt.extra === 'website_url' ? 'Enter website URL' : 'Enter shop URL'}
                      </Text>
                      <TextInput
                        style={s.extraInput}
                        placeholder={opt.extra === 'whatsapp_number' ? 'Eg. 9999999999' : 'https://...'}
                        placeholderTextColor={C.pinkMid}
                        value={extraValues[opt.extra] || ''}
                        onChangeText={(v) => setExtraValues(p => buildNextExtraValues(opt.extra, v, p))}
                        keyboardType={opt.extra === 'whatsapp_number' ? 'phone-pad' : 'url'}
                        maxLength={opt.extra === 'whatsapp_number' ? 10 : undefined}
                      />
                    </View>
                  )}
                </View>
                <View style={[s.radioCircle, sel && s.radioCircleSel]}>
                  {sel && <View style={s.radioCircleDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Allow Calls ── */}
        <TouchableOpacity
          style={[s.checkboxRow, allowCalls && s.checkboxRowOn]}
          onPress={() => setAllowCalls(!allowCalls)}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, allowCalls && s.checkboxOn]}>
            {allowCalls && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <View style={s.checkboxInfo}>
            <Text style={s.checkboxLabel}>Allow people to call you</Text>
            <Text style={s.checkboxHint}>A call button will appear under your advertisement</Text>
          </View>
          <Ionicons name="call-outline" size={20} color={allowCalls ? C.green : C.border} />
        </TouchableOpacity>

        {/* ── Next Button ── */}
        <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.nextBtnText}>Next</Text>
          <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
        </TouchableOpacity>

      </ScrollView>

      <AdPreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        onNext={handlePreviewNext}
        adData={{ photo, title, description, redirect: selectedRedirect }}
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
    gap: 10,
    paddingTop: HEADER_TOP,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    elevation: 3,
    shadowColor: C.orange,
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
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Video ──
  videoWrapper: {
    width: SW,
    backgroundColor: '#000',
  },
  video: {
    width: SW,
    height: Math.round(SW * 9 / 16),
  },
  videoTag: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  videoTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },

  // ── Photo ──
  photoBox: {
    borderWidth: 2,
    borderColor: C.pinkBorder,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: C.pinkLight,
    minHeight: 140,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBoxFilled: {
    borderStyle: 'solid',
    borderColor: C.orange,
    backgroundColor: C.white,
  },
  photoEmpty: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  photoIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.orange,
  },
  photoEmptyHint: {
    fontSize: 11,
    color: C.textSub,
  },
  photoPreview: {
    width: '100%',
    height: 200,
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changePhotoBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Inputs ──
  input: {
    borderWidth: 1.5,
    borderColor: C.pinkBorder,
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
  },
  inputMulti: {
    borderWidth: 1.5,
    borderColor: C.pinkBorder,
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: C.textSub,
    marginTop: 4,
  },

  // ── Radio ──
  radioCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  radioCardSelected: {
    borderColor: C.orange,
    backgroundColor: C.orangeLight,
  },
  radioIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIconSelected: {
    backgroundColor: C.orange,
  },
  radioInfo: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  radioTitleSel: {
    color: C.orange,
  },
  radioDesc: {
    fontSize: 11,
    color: C.textSub,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSel: {
    borderColor: C.orange,
  },
  radioCircleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.orange,
  },

  // ── Extra input inside radio ──
  extraWrap: {
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    padding: 10,
  },
  extraLabel: {
    fontSize: 11,
    color: C.orange,
    fontWeight: '700',
    marginBottom: 4,
  },
  extraInput: {
    fontSize: 13,
    color: C.text,
  },

  // ── Checkbox ──
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  checkboxRowOn: {
    borderColor: C.green,
    backgroundColor: C.greenLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  checkboxInfo: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  checkboxHint: {
    fontSize: 11,
    color: C.textSub,
    marginTop: 2,
  },

  // ── Next Button ──
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 5,
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

// ── Web Styles ─────────────────────────────────────────────────────────────────
const ws = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7ED', minHeight: '100vh' },

  // Top Bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 14, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#FFE8D6' },
  topBarCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFE8D6', borderRadius: 8 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#C8700F' },
  topBarTitle: { fontSize: 15, fontWeight: '800', color: '#111111' },
  topBarTitleCompact: { textAlign: 'center' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 60, alignItems: 'center' },
  scrollContentCompact: { paddingHorizontal: 16 },
  innerWrap: { width: '100%', maxWidth: 1100, alignSelf: 'center' },

  // Page Header
  pageHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  pageHeaderStack: { flexDirection: 'column', alignItems: 'stretch', gap: 20 },
  pageHeaderLeft: { flex: 1, minWidth: 0 },
  pageHeaderEyebrow: { fontSize: 11, fontWeight: '800', color: '#ea580c', letterSpacing: 1.5, marginBottom: 6 },
  pageHeaderTitle: { fontSize: 26, fontWeight: '900', color: '#111111', marginBottom: 6 },
  pageHeaderSub: { fontSize: 14, color: '#888888' },

  tutorialCard: { width: 320, flexShrink: 0, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#FFE8D6', marginLeft: 24, backgroundColor: '#000', position: 'relative' },
  tutorialCardFull: { width: '100%', marginLeft: 0, marginTop: 20 },
  tutorialVideo: { width: '100%', height: 180, minHeight: 180 },
  tutorialVideoTag: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tutorialVideoTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Grid
  formGrid: { flexDirection: 'row', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  formGridWrap: { justifyContent: 'space-between' },
  formGridColumn: { flexDirection: 'column' },
  col: { flex: 1, minWidth: 0, gap: 16 },
  colFull: { width: '100%' },

  // Card
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FFE8D6' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111111', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#AAAAAA' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ea580c', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNum: { color: '#ffffff', fontSize: 13, fontWeight: '800' },

  // Photo
  photoBox: { borderWidth: 2, borderColor: '#FFE8D6', borderStyle: 'dashed', borderRadius: 14, backgroundColor: '#FFF7ED', minHeight: 160, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photoBoxFilled: { borderStyle: 'solid', borderColor: '#ea580c', backgroundColor: '#ffffff' },
  photoEmpty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  photoIconCircle: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center' },
  photoEmptyTitle: { fontSize: 14, fontWeight: '700', color: '#ea580c' },
  photoEmptyHint: { fontSize: 11, color: '#AAAAAA' },
  photoPreview: { width: '100%', height: 220 },
  changeOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5 },
  changeOverlayText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Inputs
  input: { borderWidth: 1.5, borderColor: '#FFE8D6', borderRadius: 10, backgroundColor: '#FFFAF7', paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111111' },
  inputMulti: { borderWidth: 1.5, borderColor: '#FFE8D6', borderRadius: 10, backgroundColor: '#FFFAF7', paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111111', minHeight: 110, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 11, color: '#AAAAAA', marginTop: 4 },

  // Radio
  radioCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFAF7', borderWidth: 1.5, borderColor: '#FFE8D6', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  radioCardSel: { borderColor: '#ea580c', backgroundColor: '#FFF7ED' },
  radioIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  radioIconSel: { backgroundColor: '#ea580c' },
  radioTitle: { fontSize: 13, fontWeight: '700', color: '#111111', marginBottom: 2 },
  radioTitleSel: { color: '#ea580c' },
  radioDesc: { fontSize: 11, color: '#AAAAAA', lineHeight: 16 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioCircleSel: { borderColor: '#ea580c' },
  radioCircleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ea580c' },
  extraWrap: { marginTop: 8, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#FFE8D6', padding: 10 },
  extraLabel: { fontSize: 11, color: '#ea580c', fontWeight: '700', marginBottom: 4 },
  extraInput: { fontSize: 13, color: '#111111' },

  // Checkbox
  checkRow: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#FFE8D6' },
  checkRowColumn: { flexDirection: 'column', alignItems: 'stretch' },
  checkRowOn: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#FFE8D6', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkLabel: { fontSize: 13, fontWeight: '700', color: '#111111' },
  checkHint: { fontSize: 11, color: '#AAAAAA', marginTop: 2 },

  // Next Button
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ea580c', borderRadius: 14, paddingVertical: 16, borderWidth: 0 },
  nextBtnFull: { width: '100%' },
  nextBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});
