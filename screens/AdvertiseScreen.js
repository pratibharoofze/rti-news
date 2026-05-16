import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Alert, Modal, Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';

// ── Theme Colors ───────────────────────────────────────────────────────────────
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
};

const { width: SW } = Dimensions.get('window');

// ── Redirect Options ───────────────────────────────────────────────────────────
const REDIRECT_OPTIONS = [
  { id: 'profile',   title: 'My RTI Profile',   desc: 'Users will directly reach your profile on clicking',  icon: 'person-circle-outline', extra: null },
  { id: 'website',   title: 'My Website',          desc: 'Users will be directly sent to your website',         icon: 'globe-outline',         extra: 'website_url' },
  { id: 'shop',      title: 'My Shop',             desc: 'Users will be directly sent to your online shop',     icon: 'storefront-outline',    extra: 'shop_url' },
  { id: 'lead_form', title: 'Lead Form',           desc: 'Users can fill out a form you created',               icon: 'document-text-outline', extra: null },
  { id: 'whatsapp',  title: 'My Whatsapp Number',  desc: 'Users will be able to message you on WhatsApp',       icon: 'logo-whatsapp',         extra: 'whatsapp_number' },
];

// ── Step Badge Component ───────────────────────────────────────────────────────
function StepBadge({ number, label, hint }) {
  return (
    <View style={st.row}>
      <View style={st.badge}>
        <Text style={st.badgeNum}>{number}</Text>
      </View>
      <View style={{ flex: 1 }}>
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
  label:    { fontSize: 15, fontWeight: '800', color: C.text },
  req:      { color: C.orange },
  hint:     { fontSize: 12, color: C.textSub, marginTop: 2 },
});

// ── Ad Preview Modal ────────────────────────────────────────────────────────────
function AdPreviewModal({ visible, onClose, onNext, adData }) {
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
              <View style={[pm.adImage, pm.adImagePlaceholder]}>
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
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 36 },
  handle:          { width: 44, height: 4, backgroundColor: C.border, borderRadius: 99, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:         { padding: 4 },
  headerTitle:     { fontSize: 16, fontWeight: '800', color: C.text },
  adCard:          { marginHorizontal: 16, marginTop: 14, backgroundColor: '#FFFAF5', borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: C.orangeBorder },
  adBadgeRow:      { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  adBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.orangeLight, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adBadgeEmoji:    { fontSize: 13 },
  adBadgeText:     { fontSize: 11, color: C.orange, fontWeight: '700' },
  adTitle:         { fontSize: 15, fontWeight: '800', color: C.text, paddingHorizontal: 12, paddingBottom: 2 },
  adDesc:          { fontSize: 12, color: C.textSub, paddingHorizontal: 12, paddingBottom: 10 },
  adImage:         { width: '100%', height: 180 },
  adImagePlaceholder: { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  ctaRow:          { flexDirection: 'row', height: 48 },
  ctaWhatsapp:     { flex: 1, backgroundColor: C.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  ctaWhatsappText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  ctaCall:         { width: 88, backgroundColor: C.greenLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderLeftWidth: 1, borderLeftColor: C.greenBorder },
  ctaCallText:     { color: C.green, fontWeight: '700', fontSize: 13 },
  btnRow:          { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  changeBtn:       { flex: 1, borderWidth: 2, borderColor: C.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  changeBtnText:   { color: C.orange, fontWeight: '700', fontSize: 15 },
  nextBtn:         { flex: 1, backgroundColor: C.orange, borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 4, shadowColor: C.orange, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6 },
  nextBtnText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function AdvertiseScreen({ navigation }) {
  const [photo, setPhoto]               = useState(null);
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [selectedRedirect, setSelectedRedirect] = useState('whatsapp');
  const [extraValues, setExtraValues]   = useState({});
  const [allowCalls, setAllowCalls]     = useState(true);
  const [showPreview, setShowPreview]   = useState(false);
  const videoRef = useRef(null);

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleNext = () => {
    if (!photo)             { Alert.alert('Required', 'Please add an advertisement photo.'); return; }
    if (!title.trim())      { Alert.alert('Required', 'Please write an advertisement title.'); return; }
    if (!description.trim()){ Alert.alert('Required', 'Please write a description.'); return; }
    setShowPreview(true);
  };

  const handlePreviewNext = () => {
    setShowPreview(false);
    navigation.navigate('ChoosePlan', {
      adData: { photo, title, description, redirect: selectedRedirect, extraValues, allowCalls },
    });
  };

  return (
    <View style={s.root}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Fill advertisement information below</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Tutorial Video (full width, 16:9) ───────────────────── */}
        <View style={s.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
            style={s.video}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping={false}
          />
          <View style={s.videoTag}>
            <Ionicons name="play-circle" size={13} color={C.orange} />
            <Text style={s.videoTagText}>How to advertise — watch this</Text>
          </View>
        </View>

        {/* ── 1. Photo ─────────────────────────────────────────────── */}
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

        {/* ── 2. Title ─────────────────────────────────────────────── */}
        <View style={s.section}>
          <StepBadge number="2" label="Write Advertisement Title" hint="Main headline for your promotion" />
          <TextInput
            style={s.input}
            placeholder="Eg. Best Electronics Shop in your area"
            placeholderTextColor="#B0B8C1"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={s.charCount}>{title.length}/100</Text>
        </View>

        {/* ── 3. Description ───────────────────────────────────────── */}
        <View style={s.section}>
          <StepBadge number="3" label="Write Description For Advertisement" hint="Add a promotional message for this ad" />
          <TextInput
            style={[s.input, s.inputMulti]}
            placeholder="Eg. We sell washing machines, air conditioners and televisions."
            placeholderTextColor="#B0B8C1"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={s.charCount}>{description.length}/300</Text>
        </View>

        {/* ── 4. Redirect ──────────────────────────────────────────── */}
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
                <View style={{ flex: 1 }}>
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
                        placeholderTextColor="#B0B8C1"
                        value={extraValues[opt.extra] || ''}
                        onChangeText={(v) => setExtraValues(p => ({ ...p, [opt.extra]: v }))}
                        keyboardType={opt.extra === 'whatsapp_number' ? 'phone-pad' : 'url'}
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

        {/* ── Allow Calls ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.checkboxRow, allowCalls && s.checkboxRowOn]}
          onPress={() => setAllowCalls(!allowCalls)}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, allowCalls && s.checkboxOn]}>
            {allowCalls && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.checkboxLabel}>Allow people to call you</Text>
            <Text style={s.checkboxHint}>A call button will appear under your advertisement</Text>
          </View>
          <Ionicons name="call-outline" size={20} color={allowCalls ? C.green : C.border} />
        </TouchableOpacity>

        {/* ── Next Button ──────────────────────────────────────────── */}
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
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: C.text },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Video: full device width, 16:9 ratio ──
  videoWrapper: { width: SW, backgroundColor: '#000' },
  video:        { width: SW, height: Math.round(SW * 9 / 16) },
  videoTag: {
    position: 'absolute', bottom: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  videoTagText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  section: { paddingHorizontal: 16, paddingTop: 22 },

  // Photo
  photoBox: {
    borderWidth: 2, borderColor: C.orangeBorder, borderStyle: 'dashed',
    borderRadius: 16, backgroundColor: C.orangeLight,
    minHeight: 140, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  photoBoxFilled:  { borderStyle: 'solid', borderColor: C.green, backgroundColor: '#fff' },
  photoEmpty:      { alignItems: 'center', paddingVertical: 28, gap: 6 },
  photoIconCircle: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: C.white, borderWidth: 2, borderColor: C.orangeBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  photoEmptyTitle: { fontSize: 14, fontWeight: '700', color: C.orange },
  photoEmptyHint:  { fontSize: 11, color: C.textSub },
  photoPreview:    { width: '100%', height: 200 },
  changePhotoBtn: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  changePhotoBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  // Inputs
  input: {
    borderWidth: 1.5, borderColor: C.orangeBorder, borderRadius: 12,
    backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text,
  },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  charCount:  { textAlign: 'right', fontSize: 11, color: C.textSub, marginTop: 4 },

  // Radio
  radioCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 14, padding: 12, marginBottom: 10, gap: 10,
  },
  radioCardSelected: { borderColor: C.orange, backgroundColor: C.orangeLight },
  radioIcon:        { width: 38, height: 38, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  radioIconSelected:{ backgroundColor: C.orange },
  radioTitle:       { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 2 },
  radioTitleSel:    { color: C.orange },
  radioDesc:        { fontSize: 11, color: C.textSub, lineHeight: 16 },
  radioCircle:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioCircleSel:   { borderColor: C.orange },
  radioCircleDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange },

  // Extra
  extraWrap:  { marginTop: 10, backgroundColor: C.white, borderRadius: 10, borderWidth: 1, borderColor: C.orangeBorder, padding: 10 },
  extraLabel: { fontSize: 11, color: C.orange, fontWeight: '700', marginBottom: 4 },
  extraInput: { fontSize: 13, color: C.text },

  // Checkbox
  checkboxRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 18, backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: C.border },
  checkboxRowOn:  { borderColor: C.green, backgroundColor: C.greenLight },
  checkbox:       { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:     { backgroundColor: C.green, borderColor: C.green },
  checkboxLabel:  { fontSize: 13, fontWeight: '700', color: C.text },
  checkboxHint:   { fontSize: 11, color: C.textSub, marginTop: 2 },

  // Next
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 24, backgroundColor: C.orange,
    borderRadius: 14, paddingVertical: 16,
    elevation: 6, shadowColor: C.orange,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  nextBtnText: { color: C.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
});