import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import {
  Alert, Clipboard, Image, Platform,
  Modal,
  Pressable,
  Share,
  ScrollView, Text, TextInput, TouchableOpacity, View,
  useWindowDimensions,
} from 'react-native';
import AutoAppointmentLetterPreview from '../components/AppointmentLetterPreview';
import AppNavbar from '../components/AppNavbar';
import AutoIdCardPreview from '../components/IdCardPreview';
import VerifiedBadge from '../components/VerifiedBadge';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import ProfileStyles from '../styles/ProfileStyles';
import { RankBadge, ReferralCodeCard, SavedProfileCard } from '../components/ProfileComponents';
import { initialForm, MAX_IMAGE_SIZE, DEFAULT_AVATAR } from '../constants/profileConstants';
import { getResponsiveWindowWidth } from '../utils/webDevice';
import {
  getRank,
  generateReferralCode,
  generateMemberId,
  hasDocumentSource,
  safeName,
} from '../utils/profileHelpers';
import { compressImageToBase64 } from '../utils/imageHandling';
import { buildIdCardHtml, buildAppointmentLetterHtml } from '../utils/documentGenerator';

// ── Web-only inline styles (Instagram desktop style) ─────────────────────────
const WEB_COL = 935;
const ORANGE = '#F97316';

const w = {
  root:        { flex: 1, backgroundColor: '#fafafa', minHeight: '100vh' },
  topBar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 13, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dbdbdb' },
  topBarNarrow: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  topLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topLeftNarrow: { flexWrap: 'wrap', gap: 12 },
  topRight:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topRightNarrow: { flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%', gap: 8 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  iconBtn:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  scroll:      { flex: 1 },
  scrollContent: { alignItems: 'center', paddingBottom: 60 },
  col:         { width: WEB_COL, maxWidth: '100%', paddingHorizontal: 20 },

  // Profile header row
  profileRow:  { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 44, paddingBottom: 28, gap: 80 },
  profileRowNarrow: { flexDirection: 'column', alignItems: 'center', gap: 24 },
  avatarWrap:  { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: ORANGE, flexShrink: 0, overflow: 'hidden', backgroundColor: '#FFF7ED' },
  avatarWrapNarrow: { alignSelf: 'center' },
  avatar:      { width: '100%', height: '100%' },
  profileInfo: { flex: 1, paddingTop: 8 },
  profileInfoNarrow: { width: '100%' },

  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' },
  name:        { fontSize: 26, fontWeight: '300', color: '#0f172a', letterSpacing: -0.3 },

  editBtn:     { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbdbdb' },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  postBtn:     { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: ORANGE },
  postBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  moreBtn:     { padding: 4 },

  statsRow:    { flexDirection: 'row', gap: 44, marginBottom: 18 },
  statsRowNarrow: { flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' },
  statItem:    { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statNum:     { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  statLabel:   { fontSize: 16, color: '#0f172a' },

  bioSection:  { gap: 5 },
  bioName:     { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  bioText:     { fontSize: 14, color: '#0f172a', lineHeight: 20 },
  bioMeta:     { fontSize: 14, color: '#737373' },
  rankRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rankText:    { fontSize: 14, fontWeight: '600' },

  divider:     { height: 1, backgroundColor: '#dbdbdb', marginTop: 8 },

  // Info cards below divider
  cardsRow:    { paddingTop: 28, gap: 16 },
  cardsRowNarrow: { flexDirection: 'column' },

  // Progress card
  progressCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  progressLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  progressVal:   { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  memberIdLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4, textAlign: 'right' },
  memberIdVal:   { fontSize: 15, fontWeight: '800', color: ORANGE, textAlign: 'right' },
  progressTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: '#0f172a', borderRadius: 3 },

  // Two-col layout for cards
  twoCol:      { flexDirection: 'row', gap: 16 },
  twoColNarrow: { flexDirection: 'column' },
  halfCard:    { flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  fullCard:    { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },

  // Referral card
  referralCard: { borderRadius: 16, padding: 20, backgroundColor: ORANGE },
  referralEye:  { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  referralCode: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: 1, marginBottom: 4 },
  referralSub:  { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  copyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  copyBtnText:  { fontSize: 13, fontWeight: '700', color: '#ffffff' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 },

  // Guest
  guestCard:   { backgroundColor: '#ffffff', borderRadius: 16, padding: 40, alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 28 },
  guestTitle:  { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  guestText:   { fontSize: 14, color: '#64748b', textAlign: 'center' },
  loginBtn:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ORANGE, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
};

export default function ProfileScreen({ navigation }) {
  const { showToast } = useToast();
  const { width: windowWidth } = useWindowDimensions();
  const webWidth = getResponsiveWindowWidth(windowWidth);
  const isWebNarrow = Platform.OS === 'web' && webWidth < 860;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savedProfile, setSavedProfile] = useState(initialForm);
  const [form, setForm] = useState(initialForm);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileStats, setProfileStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [followLists, setFollowLists] = useState({ followers: [], following: [] });
  const [followModalType, setFollowModalType] = useState('');
  const [documentPreviewType, setDocumentPreviewType] = useState('');

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    const user = await UserStore.getCurrentUser();
    setLoading(false);

    if (!user) {
      setIsLoggedIn(false);
      setProfileStats({ posts: 0, followers: 0, following: 0 });
      setFollowLists({ followers: [], following: [] });
      return;
    }

    setIsLoggedIn(true);

    const rawImage = user.profile_image || '';
    const safeImage = rawImage.startsWith('blob:') ? '' : rawImage;
    const refCode = user.my_referral_code || generateReferralCode(user.email);

    const profileData = {
      name: user.name || '',
      email: user.email || '',
      village: user.village || '',
      state: user.state || '',
      bio: user.bio || '',
      contact_number: user.contact_number || '',
      phone_number: user.phone_number || '',
      mobile_number: user.mobile_number || user.mobile || user.contact_number || '',
      subscription_type: user.subscription_type || '',
      state_seat: user.state_seat || null,
      profile_image: safeImage,
      role_label: user.role_label || UserStore.getRoleLabel(user.role || 'free'),
      is_subscribed: UserStore.hasActiveSubscription(user),
      has_blue_tick: UserStore.hasBlueTick(user),
      id_card_image: user.id_card_image || '',
      appointment_letter_image: user.appointment_letter_image || '',
      id_card_status: user.id_card_status || '',
      appointment_letter_status: user.appointment_letter_status || '',
      referral_count: user.referral_count || 0,
      referral_code: refCode,
    };

    if (rawImage.startsWith('blob:')) {
      await UserStore.updateUser(user.email, { profile_image: '' });
    }

    const [feedSummary, followSummary] = await Promise.all([
      UserStore.getNewsFeedSummary?.(),
      UserStore.getFollowSummary(user.email),
    ]);
    const normalizedEmail = String(user.email || '').trim().toLowerCase();
    const ownFeedPosts = Array.isArray(feedSummary?.items)
      ? feedSummary.items.filter((item) => String(item?.createdBy || item?.created_by || '').trim().toLowerCase() === normalizedEmail)
      : [];
    const ownLocalPosts = [
      ...(Array.isArray(user.news) ? user.news : []),
      ...(Array.isArray(user.news_feed) ? user.news_feed : []),
    ];
    const mergedPostKeys = new Set([...ownFeedPosts, ...ownLocalPosts].map((item, index) => String(item?.id || `local-${index}`)));

    setProfileStats({
      posts: mergedPostKeys.size,
      followers: Number(followSummary?.followersCount ?? 0),
      following: Number(followSummary?.followingCount ?? 0),
    });
    setFollowLists({
      followers: Array.isArray(followSummary?.followers) ? followSummary.followers : [],
      following: Array.isArray(followSummary?.following) ? followSummary.following : [],
    });
    setSavedProfile(profileData);
    setForm(profileData);
  }, [navigation, showToast]);

  useFocusEffect(useCallback(() => {
    loadCurrentUser();
  }, [loadCurrentUser]));

  const openEdit = () => { setForm(savedProfile); setIsEditing(true); };
  const closeEdit = () => { setForm(savedProfile); setIsEditing(false); };
  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const hasDocumentSubscription = Boolean((isEditing ? form : savedProfile).is_subscribed);

  const handleGoHome = useCallback(() => { navigation?.navigate?.('QuickMenu'); }, [navigation]);
  const handleOpenSettings = useCallback(() => { navigation?.navigate?.('Settings'); }, [navigation]);
  const handleOpenNotifications = useCallback(() => { navigation?.navigate?.('Notifications'); }, [navigation]);

  const handleShareProfile = useCallback(async () => {
    try {
      const name = (savedProfile?.name || 'RTI News Member').trim();
      const code = savedProfile?.referral_code || generateReferralCode(savedProfile?.email || '');
      const message = `${name}\nReferral Code: ${code}\n\nRTI News App`;
      await Share.share({ title: 'RTI News', message });
    } catch {}
  }, [savedProfile]);

  const handlePostNews = useCallback(async () => {
    const user = await UserStore.getCurrentUser();
    if (!user) { navigation.replace('Login'); return; }
    const isAdmin = user.role === 'admin';
    const hasSubscription = UserStore.hasActiveSubscription(user);
    if (!isAdmin && !hasSubscription) { showToast('Premium access required to add news.', 'error'); return; }
    if (!isAdmin && hasSubscription && !user.location_complete) {
      showToast('Select your location to activate premium services.', 'error');
      navigation.navigate('StateSelect', { fromPremium: true });
      return;
    }
    navigation.navigate('Add News');
  }, [navigation, showToast]);

  const openFollowList = (type) => { if (!isLoggedIn) return; setFollowModalType(type); };
  const closeFollowList = () => setFollowModalType('');
  const closeDocumentPreview = () => setDocumentPreviewType('');

  const openDocumentPreview = (type) => {
    if (!hasDocumentSource(savedProfile)) {
      showToast('Complete profile to generate document.', 'error');
      return;
    }

    setDocumentPreviewType(type);
  };

  const promptSubscriptionRequired = useCallback((documentLabel) => {
    Alert.alert('Subscription Required', `${documentLabel} dekhne ke liye subscription lena zaroori hai.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Subscription', onPress: () => navigation.navigate('Subscription Plans') },
    ]);
  }, [navigation]);

  const handleCopyReferralCode = () => {
    const code = savedProfile.referral_code || generateReferralCode(savedProfile.email);
    if (Platform.OS === 'web' && navigator?.clipboard) { navigator.clipboard.writeText(code); }
    else { Clipboard.setString(code); }
    showToast('Referral code copied!', 'success');
  };

  const handlePickImage = async () => {
    try {
      setUploading(true);
      if (ImagePicker.requestMediaLibraryPermissionsAsync) {
        const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!p.granted) { showToast('Gallery permission is required.', 'error'); setUploading(false); return; }
      }
      const mediaType = ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images;
      const normalizedMediaType = typeof mediaType === 'string' && mediaType.toLowerCase().includes('images') ? ImagePicker.MediaType?.Images || 'images' : mediaType;
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: normalizedMediaType || 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: false, exif: false, maxWidth: 800, maxHeight: 800 });
      if (!r.canceled && r.assets?.length) {
        const asset = r.assets[0];
        if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) { showToast('Image is too large (max 5MB).', 'error'); setUploading(false); return; }
        let uri = asset.uri || '';
        if (typeof document !== 'undefined' && uri) {
          try { const dataUri = await compressImageToBase64(uri); handleChange('profile_image', dataUri); }
          catch { handleChange('profile_image', uri); }
        } else { handleChange('profile_image', uri); }
        showToast('Image selected successfully.', 'success');
      }
    } catch (err) { showToast('Unable to pick image right now.', 'error'); }
    finally { setUploading(false); }
  };

  const handleDownloadDocument = async (type) => {
    const profile = isEditing ? form : savedProfile;
    if (!profile.is_subscribed) { promptSubscriptionRequired(type === 'id-card' ? 'ID Card' : 'Appointment Letter'); return; }
    if (!hasDocumentSource(profile)) { showToast('Please complete profile details first.', 'error'); return; }
    try {
      setDownloadingDoc(type);
      let printWindow = null;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        printWindow = window.open('', '_blank');
        if (printWindow) { try { printWindow.document.open(); printWindow.document.write('<!doctype html><html><head><meta charset="utf-8"/><title>Generating…</title></head><body style="font-family:Arial,sans-serif;padding:18px;color:#111827;"><h3 style="margin:0 0 8px 0;">Generating…</h3><div style="color:#6b7280;">Please wait.</div></body></html>'); printWindow.document.close(); } catch (_) {} }
      }
      const html = type === 'id-card' ? await buildIdCardHtml(profile, { webPreview: Platform.OS === 'web' && Boolean(printWindow) }) : await buildAppointmentLetterHtml(profile, { webPreview: Platform.OS === 'web' && Boolean(printWindow) });
      if (Platform.OS === 'web' && printWindow) {
        printWindow.document.open(); printWindow.document.write(html); printWindow.document.close();
        try { const start = Date.now(); const timer = setInterval(() => { if (!printWindow || printWindow.closed) { clearInterval(timer); return; } const ready = Boolean(printWindow.__PDF_READY__); if (ready) { clearInterval(timer); try { printWindow.focus(); } catch (_) {} try { printWindow.print(); } catch (_) {} return; } if (Date.now() - start > 20000) { clearInterval(timer); try { printWindow.focus(); } catch (_) {} showToast('PDF tab is open. Click "Download PDF" in that tab to print/save.', 'success'); } }, 120); } catch (_) {}
        showToast("Preparing PDF... print dialog will open.", 'success'); return;
      }
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const printViaIframe = async (htmlToPrint) => { const iframe = document.createElement('iframe'); iframe.setAttribute('title', 'pdf-print'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;'; document.body.appendChild(iframe); const win = iframe.contentWindow; const doc = iframe.contentDocument || win?.document; if (!win || !doc) throw new Error('iframe not ready'); doc.open(); doc.write(htmlToPrint); doc.close(); const waitForImages = async (timeoutMs = 15000) => { const start = Date.now(); while (Date.now() - start < timeoutMs) { const imgs = Array.from(doc.images || []); const allOk = imgs.every((img) => img.complete && (typeof img.naturalWidth !== 'number' || img.naturalWidth > 0)); if (allOk) return; await new Promise((r) => setTimeout(r, 80)); } }; await waitForImages(); try { win.focus(); } catch (_) {} win.print(); setTimeout(() => { try { iframe.remove(); } catch (_) {} }, 1200); };
        try { await printViaIframe(html); showToast('Print dialog opened. Choose "Save as PDF" to download.', 'success'); } catch (_) { showToast('Unable to open print dialog.', 'error'); } return;
      }
      const a4 = { width: 595, height: 842 };
      let uri = '';
      try { ({ uri } = await Print.printToFileAsync({ html, base64: false, ...a4 })); } catch (e) { try { await Print.printAsync({ html, ...a4 }); showToast('Print opened.', 'success'); return; } catch (_) { throw e; } }
      const filename = `${type === 'id-card' ? 'ID-Card' : 'Appointment-Letter'}-${safeName(profile?.name)}.pdf`;
      const saved = await trySaveAndroid(uri, filename);
      if (saved) { showToast('PDF saved successfully.', 'success'); return; }
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) { await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: type === 'id-card' ? 'Save ID Card PDF' : 'Save Appointment Letter PDF', UTI: 'com.adobe.pdf' }); showToast('PDF ready!', 'success'); }
      else { showToast(`PDF saved: ${uri.split('/').pop()}`, 'success'); }
    } catch (err) { showToast('Unable to generate PDF. Please try again.', 'error'); }
    finally { setDownloadingDoc(''); }
  };

  const trySaveAndroid = async (uri, filename) => {
    try {
      if (Platform.OS !== 'android') return false;
      const FileSystem = await import('expo-file-system/legacy');
      const SAF = FileSystem.StorageAccessFramework;
      if (!SAF?.requestDirectoryPermissionsAsync || !SAF?.createFileAsync) return false;
      const permissions = await SAF.requestDirectoryPermissionsAsync();
      if (!permissions?.granted) return false;
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const dest = await SAF.createFileAsync(permissions.directoryUri, filename, 'application/pdf');
      await FileSystem.writeAsStringAsync(dest, b64, { encoding: FileSystem.EncodingType.Base64 });
      return true;
    } catch (_) { return false; }
  };

  const handleSave = async () => {
    const nextName = String(form.name || '').trim();
    const nextVillage = String(form.village || '').trim();
    const nextBio = String(form.bio || '').trim();
    const nextContactRaw = String(form.contact_number || '').trim();
    const nextContactDigits = nextContactRaw.replace(/\D/g, '');
    if (!nextName) { showToast('Name is required.', 'error'); return; }
    if (nextContactDigits && nextContactDigits.length !== 10) { showToast('Enter a valid 10-digit mobile number.', 'error'); return; }
    const updates = { name: nextName, village: nextVillage, bio: nextBio, contact_number: nextContactDigits || '', profile_image: form.profile_image || '' };
    const hasChanges = updates.name !== (savedProfile.name || '') || updates.village !== (savedProfile.village || '') || updates.bio !== (savedProfile.bio || '') || updates.contact_number !== (savedProfile.contact_number || '') || updates.profile_image !== (savedProfile.profile_image || '');
    if (!hasChanges) { showToast('No changes to save.', 'info'); return; }
    setSaving(true);
    const updated = await UserStore.updateUser(form.email, updates);
    setSaving(false);
    if (!updated) { showToast('Error saving profile.', 'error'); return; }
    const next = { ...savedProfile, ...updates, name: updated.name || updates.name, village: updated.village || updates.village, bio: updated.bio || updates.bio, contact_number: updated.contact_number || updates.contact_number, profile_image: updated.profile_image || updates.profile_image };
    setSavedProfile(next); setForm(next); setIsEditing(false);
    setSuccessMessage('Profile updated successfully.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const displayProfile = isEditing ? form : savedProfile;
  const displayHasBlueTick = Boolean(isLoggedIn && UserStore.hasBlueTick(displayProfile));
  const referralCode = displayProfile.referral_code || generateReferralCode(displayProfile.email);
  const rank = getRank(displayProfile.referral_count || 0);
  const completionPct = isLoggedIn
    ? (displayProfile.bio && displayProfile.contact_number && displayProfile.profile_image ? '88%' : '62%')
    : '0%';

  const editProfileForm = (
    <View style={ProfileStyles.formCard}>
      <View style={ProfileStyles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={ProfileStyles.sectionHeading}>Edit Profile</Text>
          <Text style={ProfileStyles.sectionSubtitle}>Update your basic details and profile photo.</Text>
          {successMessage ? <Text style={ProfileStyles.successText}>{successMessage}</Text> : null}
        </View>
        <TouchableOpacity style={ProfileStyles.uploadPill} onPress={handlePickImage} disabled={uploading}>
          <Feather name="image" size={14} color="#6d3df5" />
          <Text style={ProfileStyles.uploadPillText}>{uploading ? 'Opening...' : 'Photo'}</Text>
        </TouchableOpacity>
      </View>
      <View style={ProfileStyles.fieldGrid}>
        <View style={ProfileStyles.fullWidthGroup}>
          <Text style={ProfileStyles.inputLabel}>Full Name *</Text>
          <View style={ProfileStyles.inputWrap}>
            <Feather name="user" size={16} color="#8a94a6" />
            <TextInput style={ProfileStyles.input} value={form.name} onChangeText={(v) => handleChange('name', v)} placeholder="Enter your name" placeholderTextColor="#94a3b8" />
          </View>
        </View>
        <View style={ProfileStyles.fullWidthGroup}>
          <Text style={ProfileStyles.inputLabel}>Email</Text>
          <View style={[ProfileStyles.inputWrap, ProfileStyles.inputWrapDisabled]}>
            <Feather name="mail" size={16} color="#8a94a6" />
            <TextInput style={[ProfileStyles.input, ProfileStyles.inputDisabled]} value={form.email} editable={false} />
          </View>
        </View>
        <View style={ProfileStyles.inputGroup}>
          <Text style={ProfileStyles.inputLabel}>Village</Text>
          <View style={ProfileStyles.inputWrap}>
            <Feather name="home" size={16} color="#8a94a6" />
            <TextInput style={ProfileStyles.input} value={form.village} onChangeText={(v) => handleChange('village', v)} placeholder="Village" placeholderTextColor="#94a3b8" />
          </View>
        </View>
        <View style={ProfileStyles.inputGroup}>
          <Text style={ProfileStyles.inputLabel}>Mobile Number</Text>
          <View style={ProfileStyles.inputWrap}>
            <Feather name="smartphone" size={16} color="#8a94a6" />
            <TextInput style={ProfileStyles.input} value={form.contact_number} onChangeText={(v) => handleChange('contact_number', v)} placeholder="10-digit mobile" placeholderTextColor="#94a3b8" keyboardType="phone-pad" maxLength={14} />
          </View>
        </View>
        <View style={ProfileStyles.fullWidthGroup}>
          <Text style={ProfileStyles.inputLabel}>Bio</Text>
          <View style={[ProfileStyles.inputWrap, ProfileStyles.textAreaWrap]}>
            <Feather name="file-text" size={16} color="#8a94a6" style={ProfileStyles.textAreaIcon} />
            <TextInput style={[ProfileStyles.input, ProfileStyles.textArea]} value={form.bio} onChangeText={(v) => handleChange('bio', v)} placeholder="Write something about you" placeholderTextColor="#94a3b8" multiline />
          </View>
        </View>
      </View>
      <View style={ProfileStyles.previewRow}>
        <Image source={form.profile_image ? { uri: form.profile_image } : DEFAULT_AVATAR} style={ProfileStyles.formPreviewAvatar} />
        <View style={ProfileStyles.previewInfo}>
          <Text style={ProfileStyles.previewTitle}>Profile Photo</Text>
          <Text style={ProfileStyles.helperText}>{form.profile_image ? 'Image selected.' : 'No image selected yet.'}</Text>
        </View>
        {form.profile_image ? (
          <TouchableOpacity style={ProfileStyles.removeMiniButton} onPress={() => handleChange('profile_image', '')}>
            <Feather name="x" size={15} color="#EA580C" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={ProfileStyles.formFooterRow}>
        <TouchableOpacity style={ProfileStyles.cancelButton} onPress={closeEdit}>
          <Text style={ProfileStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ProfileStyles.submitButton} onPress={handleSave} disabled={saving}>
          <Text style={ProfileStyles.submitButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Follow modal (shared by both web and mobile) ──────────────────────────
  const followModal = (
    <Modal visible={Boolean(followModalType)} transparent animationType="slide" onRequestClose={closeFollowList}>
      <View style={ProfileStyles.followModalOverlay}>
        <View style={ProfileStyles.followModalCard}>
          <View style={ProfileStyles.followModalHeader}>
            <Text style={ProfileStyles.followModalTitle}>
              {followModalType === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <TouchableOpacity style={ProfileStyles.followModalClose} onPress={closeFollowList} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#111111" />
            </TouchableOpacity>
          </View>
          <ScrollView style={ProfileStyles.followModalList} contentContainerStyle={ProfileStyles.followModalListContent}>
            {(followLists[followModalType] || []).length ? (
              (followLists[followModalType] || []).map((item) => (
                <TouchableOpacity key={item.email} style={ProfileStyles.followUserRow} activeOpacity={0.8}
                  onPress={() => { closeFollowList(); navigation.navigate('UserPublicProfile', { email: item.email, author: item }); }}
                >
                  <Image source={item.profile_image ? { uri: item.profile_image } : DEFAULT_AVATAR} style={ProfileStyles.followUserAvatar} />
                  <View style={ProfileStyles.followUserInfo}>
                    <Text style={ProfileStyles.followUserName} numberOfLines={1}>{item.name || 'User'}</Text>
                    <Text style={ProfileStyles.followUserEmail} numberOfLines={1}>{item.email || ''}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#BBBBBB" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={ProfileStyles.followEmptyText}>
                {followModalType === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const documentPreviewModal = (
    <Modal visible={Boolean(documentPreviewType)} transparent animationType="slide" onRequestClose={closeDocumentPreview}>
      <View style={ProfileStyles.followModalOverlay}>
        <View style={[ProfileStyles.followModalCard, { maxHeight: '90%' }]}>
          <View style={ProfileStyles.followModalHeader}>
            <Text style={ProfileStyles.followModalTitle}>
              {documentPreviewType === 'id-card' ? 'ID Card' : 'Appointment Letter'}
            </Text>
            <TouchableOpacity style={ProfileStyles.followModalClose} onPress={closeDocumentPreview} activeOpacity={0.75}>
              <Feather name="x" size={18} color="#111111" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            {documentPreviewType === 'id-card' ? (
              <AutoIdCardPreview profile={savedProfile} />
            ) : documentPreviewType === 'appointment-letter' ? (
              <AutoAppointmentLetterPreview profile={savedProfile} />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ══════════════════════════════════════════════════════════════════
  // WEB DESKTOP — Instagram-style, sirf Platform.OS === 'web' pe
  // Mobile layout neeche, bilkul same as before
  // ══════════════════════════════════════════════════════════════════
  if (Platform.OS === 'web') {
    return (
      <View style={w.root}>
        {followModal}
        {documentPreviewModal}

        {/* Top Bar */}
        <View style={[w.topBar, isWebNarrow && w.topBarNarrow]}>
          <View style={[w.topLeft, isWebNarrow && w.topLeftNarrow]}>
            <Pressable
              style={({ pressed }) => [
                w.backBtn,
                Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                pressed ? { opacity: 0.75 } : null,
              ]}
              onPress={handleGoHome}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={20} color="#0f172a" />
            </Pressable>
            <Text style={w.topBarTitle}>Profile</Text>
          </View>
          <View style={[w.topRight, isWebNarrow && w.topRightNarrow]}>
            {isLoggedIn && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    w.iconBtn,
                    Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                    pressed ? { opacity: 0.75 } : null,
                  ]}
                  onPress={openEdit}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="edit-2" size={18} color="#0f172a" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    w.iconBtn,
                    Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                    pressed ? { opacity: 0.75 } : null,
                  ]}
                  onPress={handleOpenSettings}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="settings" size={18} color="#0f172a" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    w.iconBtn,
                    Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                    pressed ? { opacity: 0.75 } : null,
                  ]}
                  onPress={handleOpenNotifications}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="bell" size={18} color="#0f172a" />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    w.iconBtn,
                    Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                    pressed ? { opacity: 0.75 } : null,
                  ]}
                  onPress={handleShareProfile}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="share-2" size={18} color="#0f172a" />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <ScrollView style={w.scroll} contentContainerStyle={w.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={w.col}>

            {/* ── Profile Header Row ── */}
            <View style={[w.profileRow, isWebNarrow && w.profileRowNarrow]}>

              {/* LEFT: Avatar */}
              <View style={[w.avatarWrap, isWebNarrow && w.avatarWrapNarrow]}>
                <Image
                  source={isLoggedIn && displayProfile.profile_image ? { uri: displayProfile.profile_image } : DEFAULT_AVATAR}
                  style={w.avatar}
                  resizeMode="cover"
                />
              </View>

              {/* RIGHT: Info */}
              <View style={[w.profileInfo, isWebNarrow && w.profileInfoNarrow]}>

                {/* Row 1: name + verified + action buttons */}
                <View style={w.nameRow}>
                  <Text style={w.name}>
                    {isLoggedIn ? (displayProfile.name || 'Your Name') : 'RTI News Member'}
                  </Text>
                  {displayHasBlueTick ? <VerifiedBadge size={20} /> : null}
                  {isLoggedIn ? (
                    <>
                      <Pressable
                        style={({ pressed }) => [
                          w.editBtn,
                          Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                          pressed ? { opacity: 0.85 } : null,
                        ]}
                        onPress={openEdit}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={w.editBtnText}>Edit Profile</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          w.postBtn,
                          Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                          pressed ? { opacity: 0.85 } : null,
                        ]}
                        onPress={handlePostNews}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={w.postBtnText}>Post News</Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>

                {/* Row 2: posts · followers · following */}
                <View style={[w.statsRow, isWebNarrow && w.statsRowNarrow]}>
                  <View style={w.statItem}>
                    <Text style={w.statNum}>{profileStats.posts}</Text>
                    <Text style={w.statLabel}> posts</Text>
                  </View>
                  <TouchableOpacity style={w.statItem} onPress={() => openFollowList('followers')} activeOpacity={0.75}>
                    <Text style={w.statNum}>{isLoggedIn ? profileStats.followers : 0}</Text>
                    <Text style={w.statLabel}> followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={w.statItem} onPress={() => openFollowList('following')} activeOpacity={0.75}>
                    <Text style={w.statNum}>{isLoggedIn ? profileStats.following : 0}</Text>
                    <Text style={w.statLabel}> following</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 3: bio / rank / location */}
                {isLoggedIn ? (
                  <View style={w.bioSection}>
                    {displayProfile.name ? <Text style={w.bioName}>{displayProfile.name}</Text> : null}
                    {displayProfile.bio ? <Text style={w.bioText}>{displayProfile.bio}</Text> : null}
                    <View style={w.rankRow}>
                      <Text style={[w.rankText, { color: rank.color }]}>{rank.icon} {rank.title}</Text>
                      {displayProfile.state ? (
                        <>
                          <Text style={{ color: '#dbdbdb', fontSize: 14 }}>·</Text>
                          <Text style={w.bioMeta}>📍 {displayProfile.state}</Text>
                        </>
                      ) : null}
                    </View>
                    {generateMemberId(displayProfile.email) ? (
                      <Text style={w.bioMeta}>Member ID: <Text style={{ fontWeight: '700', color: ORANGE }}>{generateMemberId(displayProfile.email)}</Text></Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>

            {/* Divider */}
            <View style={w.divider} />

            {/* ── Content below divider ── */}
            {!isLoggedIn ? (
              <View style={w.guestCard}>
                <Feather name="user" size={48} color={ORANGE} />
                <Text style={w.guestTitle}>Login to view your profile</Text>
                <Text style={w.guestText}>Access your posts, followers, referral code and more.</Text>
                <TouchableOpacity style={w.loginBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                  <Feather name="log-in" size={16} color="#ffffff" />
                  <Text style={w.loginBtnText}>Login / Sign Up</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[w.cardsRow, isWebNarrow && w.cardsRowNarrow]}>
                {isEditing ? editProfileForm : (
                  <>

                {/* Progress card */}
                <View style={w.progressCard}>
                  <View style={w.progressHeader}>
                    <View>
                      <Text style={w.progressLabel}>Profile Completion</Text>
                      <Text style={w.progressVal}>{completionPct}</Text>
                    </View>
                    <View>
                      <Text style={w.memberIdLabel}>Member ID</Text>
                      <Text style={w.memberIdVal}>{generateMemberId(displayProfile.email)}</Text>
                    </View>
                  </View>
                  <View style={w.progressTrack}>
                    <View style={[w.progressFill, { width: completionPct }]} />
                  </View>
                </View>

                {/* Referral + Rank — two columns */}
                <View style={[w.twoCol, isWebNarrow && w.twoColNarrow]}>
                  {/* Referral card */}
                  <View style={[w.referralCard, { flex: 1 }]}>
                    <Text style={w.referralEye}>MY REFERRAL CODE</Text>
                    <Text style={w.referralCode}>{referralCode}</Text>
                    <Text style={w.referralSub}>Share this code to earn referral bonus</Text>
                    <TouchableOpacity style={w.copyBtn} onPress={handleCopyReferralCode} activeOpacity={0.8}>
                      <Feather name="copy" size={14} color="#ffffff" />
                      <Text style={w.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Rank card */}
                  <View style={[w.halfCard, { flex: 1 }]}>
                    <Text style={w.sectionTitle}>Your Rank</Text>
                    <RankBadge referralCount={savedProfile.referral_count || 0} />
                  </View>
                </View>

                {/* Saved Profile card */}
                <View style={w.fullCard}>
                  <Text style={w.sectionTitle}>Saved Profile</Text>
                  <SavedProfileCard
                    profile={savedProfile}
                    onOpenIdCard={() => openDocumentPreview('id-card')}
                    onOpenAppointmentLetter={() => openDocumentPreview('appointment-letter')}
                  />
                </View>
                  </>
                )}

              </View>
            )}

            {loading ? <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>Loading profile...</Text> : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT — bilkul same as document 10, koi change nahi
  // ══════════════════════════════════════════════════════════════════

  return (
    <View style={ProfileStyles.root}>
      <View style={ProfileStyles.bgOrbPrimary} />
      <View style={ProfileStyles.bgOrbSecondary} />
      <View style={ProfileStyles.bgOrbTertiary} />

      <View style={ProfileStyles.topBar}>
        <TouchableOpacity style={ProfileStyles.topBarBackBtn} onPress={handleGoHome} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={ProfileStyles.topBarActions}>
          {isLoggedIn && (
            <>
              <TouchableOpacity style={ProfileStyles.topBarIconBtn} onPress={openEdit} activeOpacity={0.75} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="edit-2" size={18} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity style={ProfileStyles.topBarIconBtn} onPress={handleOpenSettings} activeOpacity={0.75} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="settings" size={18} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity style={ProfileStyles.topBarIconBtn} onPress={handleOpenNotifications} activeOpacity={0.75} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="bell" size={18} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity style={ProfileStyles.topBarIconBtn} onPress={handleShareProfile} activeOpacity={0.75} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="share-2" size={18} color="#0f172a" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={ProfileStyles.scrollView} contentContainerStyle={ProfileStyles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={ProfileStyles.profileShell}>

          <View style={ProfileStyles.summaryCard}>
            <View style={ProfileStyles.summaryTopRow}>
              <View style={ProfileStyles.avatarRing}>
                <Image
                  source={isLoggedIn && displayProfile.profile_image ? { uri: displayProfile.profile_image } : DEFAULT_AVATAR}
                  style={ProfileStyles.avatar}
                />
                <View style={ProfileStyles.onlineDot} />
              </View>
              <View style={ProfileStyles.summaryContent}>
                <View style={ProfileStyles.profileNameRow}>
                  <Text style={ProfileStyles.profileName}>
                    {isLoggedIn ? (displayProfile.name || 'Your Name') : 'RTI News Member'}
                  </Text>
                  {displayHasBlueTick ? <VerifiedBadge size={18} /> : null}
                </View>
                <View style={ProfileStyles.statsRow}>
                  <View style={ProfileStyles.statItem}>
                    <Text style={ProfileStyles.statValue}>{profileStats.posts}</Text>
                    <Text style={ProfileStyles.statLabel}>posts</Text>
                  </View>
                  <TouchableOpacity style={ProfileStyles.statItem} onPress={() => openFollowList('followers')} activeOpacity={0.75}>
                    <Text style={ProfileStyles.statValue}>{isLoggedIn ? profileStats.followers : 0}</Text>
                    <Text style={ProfileStyles.statLabel}>followers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={ProfileStyles.statItem} onPress={() => openFollowList('following')} activeOpacity={0.75}>
                    <Text style={ProfileStyles.statValue}>{isLoggedIn ? profileStats.following : 0}</Text>
                    <Text style={ProfileStyles.statLabel}>following</Text>
                  </TouchableOpacity>
                </View>
                {isLoggedIn ? (
                  <View style={ProfileStyles.summaryRankRow}>
                    <Text style={ProfileStyles.summaryRankEmoji}>{rank.icon}</Text>
                    <Text style={[ProfileStyles.summaryRankText, { color: rank.color }]}>{rank.title}</Text>
                    {displayProfile.state ? (
                      <>
                        <Text style={ProfileStyles.summaryDot}>·</Text>
                        <MaterialIcons name="location-on" size={13} color="#F97316" />
                        <Text style={ProfileStyles.locationText}>{displayProfile.state}</Text>
                      </>
                    ) : null}
                  </View>
                ) : (
                  <View style={ProfileStyles.summaryRankRow}>
                    <Text style={ProfileStyles.summaryRankEmoji}>👤</Text>
                    <Text style={[ProfileStyles.summaryRankText, { color: '#AAAAAA' }]}>Guest</Text>
                  </View>
                )}
              </View>
            </View>
            {isLoggedIn && displayProfile.bio ? (
              <Text style={ProfileStyles.profileBio}>{displayProfile.bio}</Text>
            ) : null}

            <View style={ProfileStyles.uploadBarCard}>
              <View style={ProfileStyles.metricRow}>
                <View>
                  <Text style={ProfileStyles.metricLabel}>Profile Completion</Text>
                  <Text style={ProfileStyles.metricValuePrimary}>{completionPct}</Text>
                </View>
                <View style={ProfileStyles.metricRightBlock}>
                  <Text style={ProfileStyles.metricLabel}>Member ID</Text>
                  <Text style={ProfileStyles.metricValueAccent}>
                    {isLoggedIn ? generateMemberId(displayProfile.email) : '—'}
                  </Text>
                </View>
              </View>
              <View style={ProfileStyles.uploadBarTrack}>
                <View style={[ProfileStyles.uploadWaveOne, { width: completionPct }]} />
              </View>
              {isLoggedIn && (
                <View style={ProfileStyles.quickIconRow}>
                  <TouchableOpacity style={ProfileStyles.quickIconButton} onPress={openEdit} activeOpacity={0.75} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={ProfileStyles.quickIconButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={ProfileStyles.quickPostNewsBtn} onPress={handlePostNews} activeOpacity={0.85} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name="plus-circle" size={14} color="#111111" />
                    <Text style={ProfileStyles.quickPostNewsBtnText}>Post News</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {!isLoggedIn ? (
            <View style={ProfileStyles.loginPromptWrap}>
              <View style={ProfileStyles.loginPromptIconWrap}>
                <Feather name="user" size={32} color="#F97316" />
              </View>
              <Text style={ProfileStyles.loginPromptHeading}>Login</Text>
              <Text style={ProfileStyles.loginPromptText}></Text>
              <TouchableOpacity style={ProfileStyles.loginPromptBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
                <Feather name="log-in" size={16} color="#ffffff" />
                <Text style={ProfileStyles.loginPromptBtnText}>Login / Sign Up</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {!isEditing && (
                <>
                  <RankBadge referralCount={savedProfile.referral_count || 0} />
                  <ReferralCodeCard referralCode={referralCode} onCopy={handleCopyReferralCode} />
                </>
              )}
              {isEditing ? (
                <View style={ProfileStyles.formCard}>
                  <View style={ProfileStyles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={ProfileStyles.sectionHeading}>Edit Profile</Text>
                      <Text style={ProfileStyles.sectionSubtitle}>Update your basic details and profile photo.</Text>
                      {successMessage ? <Text style={ProfileStyles.successText}>{successMessage}</Text> : null}
                    </View>
                    <TouchableOpacity style={ProfileStyles.uploadPill} onPress={handlePickImage} disabled={uploading}>
                      <Feather name="image" size={14} color="#6d3df5" />
                      <Text style={ProfileStyles.uploadPillText}>{uploading ? 'Opening...' : 'Photo'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={ProfileStyles.fieldGrid}>
                    <View style={ProfileStyles.fullWidthGroup}>
                      <Text style={ProfileStyles.inputLabel}>Full Name *</Text>
                      <View style={ProfileStyles.inputWrap}>
                        <Feather name="user" size={16} color="#8a94a6" />
                        <TextInput style={ProfileStyles.input} value={form.name} onChangeText={(v) => handleChange('name', v)} placeholder="Enter your name" placeholderTextColor="#94a3b8" />
                      </View>
                    </View>
                    <View style={ProfileStyles.fullWidthGroup}>
                      <Text style={ProfileStyles.inputLabel}>Email</Text>
                      <View style={[ProfileStyles.inputWrap, ProfileStyles.inputWrapDisabled]}>
                        <Feather name="mail" size={16} color="#8a94a6" />
                        <TextInput style={[ProfileStyles.input, ProfileStyles.inputDisabled]} value={form.email} editable={false} />
                      </View>
                    </View>
                    <View style={ProfileStyles.inputGroup}>
                      <Text style={ProfileStyles.inputLabel}>Village</Text>
                      <View style={ProfileStyles.inputWrap}>
                        <Feather name="home" size={16} color="#8a94a6" />
                        <TextInput style={ProfileStyles.input} value={form.village} onChangeText={(v) => handleChange('village', v)} placeholder="Village" placeholderTextColor="#94a3b8" />
                      </View>
                    </View>
                    <View style={ProfileStyles.inputGroup}>
                      <Text style={ProfileStyles.inputLabel}>Mobile Number</Text>
                      <View style={ProfileStyles.inputWrap}>
                        <Feather name="smartphone" size={16} color="#8a94a6" />
                        <TextInput style={ProfileStyles.input} value={form.contact_number} onChangeText={(v) => handleChange('contact_number', v)} placeholder="10-digit mobile" placeholderTextColor="#94a3b8" keyboardType="phone-pad" maxLength={14} />
                      </View>
                    </View>
                    <View style={ProfileStyles.fullWidthGroup}>
                      <Text style={ProfileStyles.inputLabel}>Bio</Text>
                      <View style={[ProfileStyles.inputWrap, ProfileStyles.textAreaWrap]}>
                        <Feather name="file-text" size={16} color="#8a94a6" style={ProfileStyles.textAreaIcon} />
                        <TextInput style={[ProfileStyles.input, ProfileStyles.textArea]} value={form.bio} onChangeText={(v) => handleChange('bio', v)} placeholder="Write something about you" placeholderTextColor="#94a3b8" multiline />
                      </View>
                    </View>
                  </View>
                  <View style={ProfileStyles.previewRow}>
                    <Image source={form.profile_image ? { uri: form.profile_image } : DEFAULT_AVATAR} style={ProfileStyles.formPreviewAvatar} />
                    <View style={ProfileStyles.previewInfo}>
                      <Text style={ProfileStyles.previewTitle}>Profile Photo</Text>
                      <Text style={ProfileStyles.helperText}>{form.profile_image ? 'Image selected.' : 'No image selected yet.'}</Text>
                    </View>
                    {form.profile_image ? (
                      <TouchableOpacity style={ProfileStyles.removeMiniButton} onPress={() => handleChange('profile_image', '')}>
                        <Feather name="x" size={15} color="#EA580C" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={ProfileStyles.fullWidthGroup}>
                    <Text style={ProfileStyles.inputLabel}>Subscription</Text>
                    <View style={[ProfileStyles.inputWrap, ProfileStyles.inputWrapDisabled]}>
                      <Feather name="star" size={16} color="#8a94a6" />
                      <TextInput style={[ProfileStyles.input, ProfileStyles.inputDisabled]} value={form.role_label ? `${form.role_label} (${form.subscription_type || 'free'})` : form.subscription_type || 'free'} editable={false} />
                    </View>
                    {!form.is_subscribed ? (
                      <TouchableOpacity style={[ProfileStyles.uploadPill, { marginTop: 10 }]} onPress={() => navigation.navigate('Subscription Plans')}>
                        <Feather name="credit-card" size={14} color="#6d3df5" />
                        <Text style={ProfileStyles.uploadPillText}>Take Subscription</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <View style={[ProfileStyles.fullWidthGroup, { marginBottom: 0 }]}>
                    <Text style={ProfileStyles.inputLabel}>Your Referral Code</Text>
                    <View style={[ProfileStyles.inputWrap, ProfileStyles.inputWrapDisabled]}>
                      <Feather name="share-2" size={16} color="#8a94a6" />
                      <TextInput style={[ProfileStyles.input, ProfileStyles.inputDisabled]} value={form.referral_code || generateReferralCode(form.email)} editable={false} />
                    </View>
                  </View>
                  <View style={[ProfileStyles.fullWidthGroup, { marginTop: 10 }]}>
                    <RankBadge referralCount={form.referral_count || 0} />
                  </View>
                  <View style={ProfileStyles.documentSection}>
                    <Text style={ProfileStyles.documentSectionTitle}>Documents (Auto Generated)</Text>
                    <View style={ProfileStyles.documentRow}>
                      <View style={ProfileStyles.documentInfo}>
                        <Feather name="credit-card" size={20} color="#ea580c" />
                        <Text style={ProfileStyles.documentLabel}>ID Card</Text>
                      </View>
                      <Text style={ProfileStyles.autoDocHint}>PDF Download</Text>
                    </View>
                    {hasDocumentSource(form) && hasDocumentSubscription ? (
                      <>
                        <AutoIdCardPreview profile={form} />
                        <TouchableOpacity style={ProfileStyles.generatedDownloadBtn} onPress={() => handleDownloadDocument('id-card')} disabled={downloadingDoc === 'id-card'}>
                          <Feather name="download" size={16} color="#fff" />
                          <Text style={ProfileStyles.generatedDownloadText}>{downloadingDoc === 'id-card' ? 'Generating PDF...' : 'Download ID Card (PDF)'}</Text>
                        </TouchableOpacity>
                      </>
                    ) : hasDocumentSource(form) ? (
                      <>
                        <Text style={ProfileStyles.helperText}>Subscription lene ke baad hi ID Card dekh sakte hain.</Text>
                        <TouchableOpacity style={ProfileStyles.generatedDownloadBtn} onPress={() => promptSubscriptionRequired('ID Card')}>
                          <Feather name="lock" size={16} color="#fff" />
                          <Text style={ProfileStyles.generatedDownloadText}>Take Subscription</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={ProfileStyles.helperText}>Complete profile to generate ID Card.</Text>
                    )}
                    <View style={ProfileStyles.documentSpacer} />
                    <View style={ProfileStyles.documentRow}>
                      <View style={ProfileStyles.documentInfo}>
                        <Feather name="file" size={20} color="#f97316" />
                        <Text style={ProfileStyles.documentLabel}>Appointment Letter</Text>
                      </View>
                      <Text style={ProfileStyles.autoDocHint}>PDF Download</Text>
                    </View>
                    {hasDocumentSource(form) && hasDocumentSubscription ? (
                      <>
                        <AutoAppointmentLetterPreview profile={form} />
                        <TouchableOpacity style={[ProfileStyles.generatedDownloadBtn, ProfileStyles.generatedDownloadBtnAlt]} onPress={() => handleDownloadDocument('appointment-letter')} disabled={downloadingDoc === 'appointment-letter'}>
                          <Feather name="download" size={16} color="#fff" />
                          <Text style={ProfileStyles.generatedDownloadText}>{downloadingDoc === 'appointment-letter' ? 'Generating PDF...' : 'Download Appointment Letter (PDF)'}</Text>
                        </TouchableOpacity>
                      </>
                    ) : hasDocumentSource(form) ? (
                      <>
                        <Text style={ProfileStyles.helperText}>Subscription lene ke baad hi Appointment Letter dekh sakte hain.</Text>
                        <TouchableOpacity style={[ProfileStyles.generatedDownloadBtn, ProfileStyles.generatedDownloadBtnAlt]} onPress={() => promptSubscriptionRequired('Appointment Letter')}>
                          <Feather name="lock" size={16} color="#fff" />
                          <Text style={ProfileStyles.generatedDownloadText}>Take Subscription</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                  <View style={ProfileStyles.formFooterRow}>
                    <TouchableOpacity style={ProfileStyles.cancelButton} onPress={closeEdit}>
                      <Text style={ProfileStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ProfileStyles.submitButton} onPress={handleSave} disabled={saving}>
                      <Text style={ProfileStyles.submitButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <SavedProfileCard
                  profile={savedProfile}
                  onOpenIdCard={() => openDocumentPreview('id-card')}
                  onOpenAppointmentLetter={() => openDocumentPreview('appointment-letter')}
                />
              )}
            </>
          )}
        </View>
        {loading ? <Text style={ProfileStyles.loadingText}>Loading profile...</Text> : null}
      </ScrollView>

      {followModal}
      {documentPreviewModal}

      {Platform.OS === 'android' ? (
        <View style={ProfileStyles.bottomShell}>
          <AppNavbar navigation={navigation} activeScreen="Profile" hideTopHeader={true} />
        </View>
      ) : null}
    </View>
  );
}


