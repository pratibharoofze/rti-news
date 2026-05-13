import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated, useWindowDimensions, Share, Linking,
} from 'react-native';
import styles from './FeedScreenStyles';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import AppNavbar from '../components/AppNavbar';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';
import { safePause, safePlay, safeSetMuted } from '../utils/videoPlayerSafe';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const MOBILE_BREAKPOINT = 768;

// Real video with audio — public domain MP4
const SAMPLE_REEL_VIDEO       = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_REEL_VIDEO_ALT   = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const SAMPLE_REEL_VIDEO_ALT2  = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('idb-media:')) return true;
  // blob: URLs valid hain (resolved object URLs)
  if (url.startsWith('blob:')) return true;  // ← CHANGE THIS
  if (url.startsWith('http://localhost')) return false;
  return true;
}

function isPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return false;
  if (/(youtube\.com|youtu\.be)/i.test(uri)) return false;

  if (Platform.OS !== 'web') return true;
  if (/^(blob:|data:|idb-media:)/i.test(uri)) return true;
  return /^https?:/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
}

// Share Handler
function handleSharePost(post) {
  const shareText = `📰 ${post.headline}\n\n${post.caption}\n\n📍 ${post.location}\n\n🗞️ Read more on RTI News`;
  const shareUrl  = `https://rtinews.in/reel/${post.id}`;
  const fullMsg   = `${shareText}\n${shareUrl}`;

  if (Platform.OS === 'web') {
    return { text: shareText, url: shareUrl };
  }
  Share.share({ message: fullMsg, title: post.headline, url: shareUrl })
    .catch(() => {});
  return null;
}

// Icons
function HeartIcon({ filled, size = 24 }) {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : '#fff'}
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size - 2, color: filled ? '#ff3b5c' : '#fff' }}>{filled ? '♥' : '♡'}</Text>;
}

function CommentIcon({ size = 24 }) {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size - 2, color: '#fff' }}>💬</Text>;
}

function ShareIcon({ size = 24 }) {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size - 2, color: '#fff' }}>📤</Text>;
}

function BookmarkIcon({ filled, size = 24 }) {
  if (Platform.OS === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={filled ? '#f97316' : 'none'} stroke={filled ? '#f97316' : '#fff'}
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size - 2, color: filled ? '#f97316' : '#fff' }}>{filled ? '🔖' : '🏷'}</Text>;
}

function MuteIcon({ muted, size = 20 }) {
  if (Platform.OS === 'web') {
    return muted ? (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  return <Text style={{ fontSize: size, color: '#fff' }}>{muted ? '🔇' : '🔊'}</Text>;
}

// Share Modal
function ShareModal({ visible, onClose, post }) {
  if (!post) return null;

  const shareText = encodeURIComponent(`📰 ${post.headline}\n\n${post.caption}\n\n📍 ${post.location}`);
  const shareUrl  = encodeURIComponent(`https://rtinews.in/reel/${post.id}`);

  const platforms = [
    {
      name: 'WhatsApp',
      emoji: '💬',
      color: '#25D366',
      action: () => {
        const url = `https://wa.me/?text=${shareText}%0A${shareUrl}`;
        Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
      },
    },
    {
      name: 'Telegram',
      emoji: '✈️',
      color: '#0088cc',
      action: () => {
        const url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
        Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
      },
    },
    {
      name: 'Twitter / X',
      emoji: '🐦',
      color: '#1DA1F2',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
      },
    },
    {
      name: 'Facebook',
      emoji: '📘',
      color: '#1877F2',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
      },
    },
    {
      name: 'Copy Link',
      emoji: '🔗',
      color: '#6b7280',
      action: () => {
        const link = `https://rtinews.in/reel/${post.id}`;
        if (Platform.OS === 'web' && navigator?.clipboard) {
          navigator.clipboard.writeText(link).then(() => Alert.alert('Copied!', 'Link copied to clipboard'));
        } else {
          Alert.alert('Link', link);
        }
        onClose();
      },
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={localShareStyles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={localShareStyles.sheet}>
          <View style={localShareStyles.handle} />
          <Text style={localShareStyles.title}>🚀 Share This Story</Text>

          <View style={localShareStyles.previewBox}>
            <Text style={localShareStyles.previewHeadline} numberOfLines={2}>{post.headline}</Text>
            <Text style={localShareStyles.previewCaption} numberOfLines={2}>{post.caption}</Text>
            <Text style={localShareStyles.previewLocation}>📍 {post.location}</Text>
          </View>

          <View style={localShareStyles.grid}>
            {platforms.map((p) => (
              <TouchableOpacity key={p.name} style={localShareStyles.platformBtn} onPress={p.action} activeOpacity={0.8}>
                <View style={[localShareStyles.platformCircle, { backgroundColor: p.color }]}>
                  <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                </View>
                <Text style={localShareStyles.platformName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={localShareStyles.closeBtn} onPress={onClose}>
            <Text style={localShareStyles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const localShareStyles = StyleSheet.create({
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  handle:          { width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 14 },
  title:           { fontSize: 18, fontWeight: '800', color: '#f1f5f9', textAlign: 'center', marginBottom: 14, letterSpacing: -0.3 },
  previewBox:      { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  previewHeadline: { color: '#f1f5f9', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  previewCaption:  { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 6 },
  previewLocation: { color: '#f97316', fontSize: 11, fontWeight: '700' },
  grid:            { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: 16 },
  platformBtn:     { alignItems: 'center', width: '18%', marginBottom: 8 },
  platformCircle:  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  platformName:    { color: '#94a3b8', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  closeBtn:        { alignItems: 'center', paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText:    { color: '#64748b', fontSize: 14, fontWeight: '700' },
});

// Description Modal
function DescriptionModal({ visible, onClose, post, onShare }) {
  if (!post) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={localDescStyles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={localDescStyles.sheet}>
          <View style={localDescStyles.handle} />

          <View style={[localDescStyles.tagBadge, { backgroundColor: post.tagColor || '#16a34a' }]}>
            <Text style={localDescStyles.tagText}>{post.tag}</Text>
          </View>

          <Text style={localDescStyles.headline}>{post.headline}</Text>

          <View style={localDescStyles.userRow}>
            <Image source={{ uri: post.avatar || 'https://i.pravatar.cc/100?img=5' }} style={localDescStyles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={localDescStyles.userName}>{post.user}</Text>
                {Boolean(post.verified) && <Text style={{ color: '#60a5fa', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={localDescStyles.userMeta}>{post.role} · {post.time}</Text>
            </View>
          </View>

          <View style={localDescStyles.locRow}>
            <Text>📍 </Text>
            <Text style={localDescStyles.locText}>{post.location}</Text>
          </View>

          <ScrollView style={localDescStyles.captionScroll} showsVerticalScrollIndicator={false}>
            <Text style={localDescStyles.caption}>{post.caption}</Text>
            {post.fullDescription ? (
              <Text style={localDescStyles.fullDesc}>{post.fullDescription}</Text>
            ) : null}
          </ScrollView>

          <View style={localDescStyles.statsRow}>
            <View style={localDescStyles.statItem}>
              <Text style={localDescStyles.statNum}>{post.likes >= 1000 ? (post.likes / 1000).toFixed(1) + 'K' : post.likes}</Text>
              <Text style={localDescStyles.statLabel}>Likes</Text>
            </View>
            <View style={localDescStyles.statDivider} />
            <View style={localDescStyles.statItem}>
              <Text style={localDescStyles.statNum}>{Array.isArray(post.comments) ? post.comments.length : 0}</Text>
              <Text style={localDescStyles.statLabel}>Comments</Text>
            </View>
            <View style={localDescStyles.statDivider} />
            <View style={localDescStyles.statItem}>
              <Text style={localDescStyles.statNum}>{post.shares >= 1000 ? (post.shares / 1000).toFixed(1) + 'K' : post.shares}</Text>
              <Text style={localDescStyles.statLabel}>Shares</Text>
            </View>
          </View>

          <View style={localDescStyles.actionRow}>
            <TouchableOpacity style={localDescStyles.shareBtn} onPress={() => { onClose(); onShare(post.id); }} activeOpacity={0.85}>
              <Text style={localDescStyles.shareBtnText}>📤 Share This Story</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localDescStyles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={localDescStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const localDescStyles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  handle:        { width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 14 },
  tagBadge:      { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  tagText:       { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  headline:      { color: '#f1f5f9', fontSize: 20, fontWeight: '900', lineHeight: 28, marginBottom: 14, letterSpacing: -0.3 },
  userRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar:        { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: '#f97316' },
  userName:      { color: '#f1f5f9', fontWeight: '800', fontSize: 14 },
  userMeta:      { color: '#64748b', fontSize: 12 },
  locRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locText:       { color: '#f97316', fontSize: 12, fontWeight: '700' },
  captionScroll: { maxHeight: 160, marginBottom: 14 },
  caption:       { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
  fullDesc:      { color: '#94a3b8', fontSize: 13, lineHeight: 21, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  statsRow:      { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statItem:      { flex: 1, alignItems: 'center' },
  statNum:       { color: '#f1f5f9', fontSize: 18, fontWeight: '900' },
  statLabel:     { color: '#64748b', fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider:   { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  actionRow:     { flexDirection: 'row', gap: 10 },
  shareBtn:      { flex: 2, backgroundColor: '#f97316', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  shareBtnText:  { color: '#fff', fontWeight: '800', fontSize: 14 },
  closeBtn:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText:  { color: '#64748b', fontSize: 14, fontWeight: '700' },
});

// Dummy Data
const DUMMY_POSTS = [
  {
    id: '1', user: 'Rahul Sharma', avatar: 'https://i.pravatar.cc/100?img=11',
    verified: true, role: 'RTI Activist', location: 'Lucknow, Uttar Pradesh', time: '2 min ago',
    type: 'video', media: SAMPLE_REEL_VIDEO,
    thumbnail: 'https://picsum.photos/seed/rti1/600/900',
    headline: 'RTI exposed missing water supply funds!',
    caption: 'Ward 14 in Lucknow had no water for 3 months. Filed an RTI, got a response in 30 days — pipeline repair budget was finally released. 🎉 #RTI #JanAdhikar #Water',
    fullDescription: 'Under the Right to Information Act 2005, I filed an application to the Municipal Corporation seeking records of water pipeline maintenance for Ward 14. After initial denial and first appeal, the information was finally provided revealing Rs. 14 lakh allocated for repairs had not been utilized for over 2 years. Following media coverage of the RTI response, the civic body released the funds and work commenced within 15 days. This is the power of RTI — every citizen can hold their government accountable.',
    likes: 1240, shares: 312,
    comments: [{ id: 'c1', user: 'Priya Verma', text: 'Great work bhai! 👏' }, { id: 'c2', user: 'Mohan Lal', text: 'RTI is a powerful tool!' }],
    liked: false, bookmarked: false, tag: 'Success Story', tagColor: '#16a34a',
  },
  {
    id: '2', user: 'Anjali Singh', avatar: 'https://i.pravatar.cc/100?img=47',
    verified: false, role: 'Teacher', location: 'Bhopal, Madhya Pradesh', time: '15 min ago',
    type: 'video', media: SAMPLE_REEL_VIDEO_ALT,
    thumbnail: 'https://picsum.photos/seed/rti2/600/900',
    headline: 'Where did the school funds go? Filed an RTI!',
    caption: 'Government Primary School No. 7 had no account of mid-day meal funds. Filed an RTI — documents requested within 20 days. #RTI #Education',
    fullDescription: 'As a teacher in a government primary school, I noticed discrepancies in the mid-day meal scheme records. Children were not receiving adequate meals despite full budget allocation. I filed an RTI application to the District Education Office requesting meal distribution records and fund utilization reports for the past 3 years. The response revealed significant irregularities which have now been referred to the State Vigilance Commission.',
    likes: 890, shares: 145,
    comments: [{ id: 'c3', user: 'Admin RTI', text: 'Best of luck!' }],
    liked: false, bookmarked: false, tag: 'Application Filed', tagColor: '#2563eb',
  },
  {
    id: '3', user: 'Vikram Patel', avatar: 'https://i.pravatar.cc/100?img=33',
    verified: true, role: 'Journalist', location: 'Ahmedabad, Gujarat', time: '1 hr ago',
    type: 'video', media: SAMPLE_REEL_VIDEO_ALT2,
    thumbnail: 'https://picsum.photos/seed/rti3/600/900',
    headline: 'Road built after RTI — this is people power!',
    caption: 'Narol area had no road for 2 years. Filed RTI and PWD started work within 15 days. 🛣️ #RTI #Gujarat',
    fullDescription: 'The residents of Narol locality had been complaining about a broken road for over 2 years. Multiple petitions went unheard. Using the RTI Act, I filed an application to the Public Works Department asking for the status of funds allocated for road repair under PMGSY. The RTI response revealed the funds had been sitting idle. Within 2 weeks of the RTI response being made public, the PWD commenced road construction. This story proves that transparency is the best weapon against government inaction.',
    likes: 3120, shares: 890,
    comments: [{ id: 'c5', user: 'Neha Shah', text: 'Inspiring!' }, { id: 'c6', user: 'Suresh Bhai', text: 'How did you file it?' }],
    liked: true, bookmarked: false, tag: 'Victory', tagColor: '#d97706',
  },
  {
    id: '4', user: 'Dr. Meera Devi', avatar: 'https://i.pravatar.cc/100?img=25',
    verified: true, role: 'Doctor & Activist', location: 'Patna, Bihar', time: '3 hrs ago',
    type: 'video', media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/seed/rti4/600/900',
    headline: 'Where is the hospital medicine stock?',
    caption: 'Essential medicines were out of stock at Patna Civil Hospital. Filed an RTI for medicine purchase records. 💊 #RTI #Health',
    fullDescription: 'Essential medicines including antibiotics, antihypertensives and diabetes medication were consistently out of stock at Patna Civil Hospital for months. Patients were being forced to buy expensive medicines from private pharmacies. I filed an RTI application to the Civil Surgeon office demanding medicine procurement records, stock registers and expenditure statements. The documents revealed systematic pilferage and a parallel black market operation. The matter is now under CBI investigation.',
    likes: 2050, shares: 567,
    comments: [{ id: 'c8', user: 'Asha Devi', text: 'Same problem here!' }],
    liked: false, bookmarked: true, tag: 'Health RTI', tagColor: '#dc2626',
  },
  {
    id: '5', user: 'RTI Portal Official', avatar: 'https://i.pravatar.cc/100?img=60',
    verified: true, role: 'Official Account', location: 'New Delhi', time: '5 hrs ago',
    type: 'video', media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: 'https://picsum.photos/seed/rti5/600/900',
    headline: 'File RTI from home — takes just 5 minutes!',
    caption: '📢 File RTI online at rtionline.gov.in. No fee, no agents! #RTIOnline #DigitalIndia',
    fullDescription: 'The RTI Online Portal (rtionline.gov.in) allows any Indian citizen to file an RTI application from their home in under 5 minutes. No fee is required for BPL cardholders. The application fee is just Rs. 10 for others (payable online). You can track your application status, receive responses digitally, and file first appeals — all without visiting any government office. Over 2 crore RTI applications have been filed online since 2013. Know your rights, exercise your rights.',
    likes: 8910, shares: 4200,
    comments: [{ id: 'c10', user: 'Raj Mishra', text: 'Very useful!' }],
    liked: false, bookmarked: false, tag: 'Official Update', tagColor: '#7c3aed',
  },
];

// Upload Modal
function UploadModal({ visible, onClose, onPost }) {
  const [caption, setCaption] = useState('');
  const [headline, setHeadline] = useState('');
  const [tag, setTag] = useState('Success Story');
  const tagOptions = ['Success Story', 'Application Filed', 'Victory', 'Question', 'Official Update', 'Corruption Exposed'];

  const handlePost = () => {
    if (!caption.trim()) { Alert.alert('Caption required', 'Please write something.'); return; }
    onPost({ caption, headline, tag });
    setCaption(''); setHeadline(''); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.uploadSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>📰 New Post</Text>
          <TouchableOpacity style={styles.mediaBox} activeOpacity={0.7}>
            <Text style={styles.mediaBoxIcon}>🎥</Text>
            <Text style={styles.mediaBoxText}>Add Video / Photo</Text>
            <Text style={styles.mediaBoxSub}>(choose from gallery)</Text>
          </TouchableOpacity>
          <TextInput style={[styles.captionInput, { minHeight: 44, marginBottom: 10 }]} placeholder="Headline..." placeholderTextColor="#475569" value={headline} onChangeText={setHeadline} maxLength={100} />
          <TextInput style={styles.captionInput} placeholder="Write your RTI story..." placeholderTextColor="#475569" multiline value={caption} onChangeText={setCaption} maxLength={300} />
          <Text style={styles.charCount}>{caption.length}/300</Text>
          <Text style={styles.tagLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
            {tagOptions.map((t) => (
              <TouchableOpacity key={t} style={[styles.tagChip, tag === t && styles.tagChipActive]} onPress={() => setTag(t)}>
                <Text style={[styles.tagChipText, tag === t && styles.tagChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.postBtn} onPress={handlePost}><Text style={styles.postBtnText}>Post 🚀</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Comments Modal
function CommentsModal({ visible, onClose, post, comments, onAddComment, onEditComment, onDeleteComment, onLikeComment }) {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const { height: WH } = useWindowDimensions();
  const safeComments = Array.isArray(comments) ? comments : [];

  // Get current user identity when modal opens
  useEffect(() => {
    if (visible) {
      const getCurrentUser = async () => {
        try {
          const user = await UserStore.getCurrentUser();
          if (user) {
            if (user.email) {
              setCurrentUserEmail(String(user.email).trim().toLowerCase());
            }
            const realName = String(user.name || user.full_name || user.username || user.email?.split('@')[0] || 'User');
            setCurrentUserName(realName.trim());
          }
        } catch (error) {
          console.error('Error getting current user:', error);
        }
      };
      getCurrentUser();
    }
  }, [visible]);
  const totalCount = safeComments.reduce((sum, c) => sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0), 0);

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async () => {
    if (!editingCommentText.trim()) return;
    if (onEditComment) {
      await onEditComment(editingCommentId, editingCommentText.trim());
    }
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleReplyComment = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyText('');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    if (onAddComment) {
      await onAddComment(replyText.trim(), replyingToCommentId);
    }
    setReplyingToCommentId(null);
    setReplyText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.commentsSheet, { maxHeight: WH * 0.75 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Comments {totalCount ? `(${totalCount})` : ''}</Text>
          {post ? (
            <View style={{ marginBottom: 10 }}>
              {post.headline ? <Text style={styles.commentPostHeadline} numberOfLines={2}>{post.headline}</Text> : null}
              {post.caption ? <Text style={styles.commentPostCaption} numberOfLines={2}>{post.caption}</Text> : null}
            </View>
          ) : null}
          <ScrollView style={{ maxHeight: WH * 0.42, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
            {safeComments.length === 0 && <Text style={styles.noComments}>No comments yet. Be the first! 👇</Text>}
            {safeComments.map((c) => {
              const ownerMatch = (
                (currentUserEmail && String(c.author_email || '').trim().toLowerCase() === currentUserEmail) ||
                (currentUserName && String(c.user || c.author || '').trim().toLowerCase() === currentUserName.trim().toLowerCase())
              );
              const liked = Array.isArray(c.liked_by) && currentUserEmail && c.liked_by.includes(currentUserEmail);

              return (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{String(c.user || 'U').charAt(0)}</Text></View>
                  <View style={styles.commentBubble}>
                    <View style={styles.commentTopRow}>
                      <Text style={styles.commentUser}>{c.user}</Text>
                      <Text style={styles.commentDate}>{c.date || ''}{c.edited_at ? ' • Edited' : ''}</Text>
                    </View>

                    {editingCommentId === c.id ? (
                      <TextInput
                        style={styles.commentEditInput}
                        value={editingCommentText}
                        onChangeText={setEditingCommentText}
                        multiline
                      />
                    ) : (
                      <Text style={styles.commentText}>{c.text}</Text>
                    )}

                    <View style={styles.commentActionRow}>
                      <TouchableOpacity
                        style={[styles.commentActionBtn, liked && styles.commentActionBtnActive]}
                        onPress={() => onLikeComment && onLikeComment(c.id)}
                      >
                        <Text style={[styles.commentActionText, liked && styles.commentActionTextActive]}>
                          {liked ? '♥' : '♡'} {c.likes ? `(${c.likes})` : ''}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.commentActionBtn}
                        onPress={() => handleReplyComment(c.id)}
                      >
                        <Text style={styles.commentActionText}>Reply</Text>
                      </TouchableOpacity>

                      {ownerMatch ? (
                        editingCommentId === c.id ? (
                          <>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={handleSaveEdit}>
                              <Text style={styles.commentMiniBtnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={handleCancelEdit}>
                              <Text style={styles.commentMiniBtnText}>Cancel</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleStartEdit(c)}>
                              <Text style={styles.commentMiniBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={() => onDeleteComment && onDeleteComment(c.id)}>
                              <Text style={[styles.commentMiniBtnText, { color: '#ef4444' }]}>Delete</Text>
                            </TouchableOpacity>
                          </>
                        )
                      ) : null}
                    </View>

                    {/* Reply Form */}
                    {replyingToCommentId === c.id && (
                      <View style={styles.commentReplyForm}>
                        <TextInput
                          style={styles.commentReplyInput}
                          placeholder="Write a reply..."
                          placeholderTextColor="#94a3b8"
                          value={replyText}
                          onChangeText={setReplyText}
                          multiline
                        />
                        <View style={styles.commentReplyActions}>
                          <TouchableOpacity
                            style={styles.commentReplyBtn}
                            onPress={handleSubmitReply}
                            disabled={!replyText.trim()}
                          >
                            <Text style={styles.commentReplyBtnText}>Reply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.commentReplyBtn, styles.commentCancelBtn]}
                            onPress={handleCancelReply}
                          >
                            <Text style={styles.commentCancelBtnText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Replies */}
                    {Array.isArray(c.replies) && c.replies.length > 0 && (
                      <View style={styles.commentReplies}>
                        {c.replies.map((reply) => {
                          const replyOwnerMatch = (
                            (currentUserEmail && String(reply.author_email || '').trim().toLowerCase() === currentUserEmail) ||
                            (currentUserName && String(reply.user || reply.author || '').trim().toLowerCase() === currentUserName.trim().toLowerCase())
                          );
                          const replyLiked = Array.isArray(reply.liked_by) && currentUserEmail && reply.liked_by.includes(currentUserEmail);

                          return (
                            <View key={reply.id} style={styles.commentReplyItem}>
                              <View style={styles.commentTopRow}>
                                <Text style={styles.commentAuthor}>{reply.author || 'User'}</Text>
                                <Text style={styles.commentDate}>{reply.date || ''}{reply.edited_at ? ' • Edited' : ''}</Text>
                              </View>

                              {editingCommentId === reply.id ? (
                                <TextInput
                                  style={styles.commentEditInput}
                                  value={editingCommentText}
                                  onChangeText={setEditingCommentText}
                                  multiline
                                />
                              ) : (
                                <Text style={styles.commentText}>{reply.text}</Text>
                              )}

                              <View style={styles.commentActionRow}>
                                <TouchableOpacity
                                  style={[styles.commentActionBtn, replyLiked && styles.commentActionBtnActive]}
                                  onPress={() => onLikeComment && onLikeComment(reply.id)}
                                >
                                  <Text style={[styles.commentActionText, replyLiked && styles.commentActionTextActive]}>
                                    {replyLiked ? '♥' : '♡'} {reply.likes ? `(${reply.likes})` : ''}
                                  </Text>
                                </TouchableOpacity>

                                {replyOwnerMatch ? (
                                  editingCommentId === reply.id ? (
                                    <>
                                      <TouchableOpacity style={styles.commentMiniBtn} onPress={handleSaveEdit}>
                                        <Text style={styles.commentMiniBtnText}>Save</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.commentMiniBtn} onPress={handleCancelEdit}>
                                        <Text style={styles.commentMiniBtnText}>Cancel</Text>
                                      </TouchableOpacity>
                                    </>
                                  ) : (
                                    <>
                                      <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleStartEdit(reply)}>
                                        <Text style={styles.commentMiniBtnText}>Edit</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.commentMiniBtn} onPress={() => onDeleteComment && onDeleteComment(reply.id)}>
                                        <Text style={[styles.commentMiniBtnText, { color: '#ef4444' }]}>Delete</Text>
                                      </TouchableOpacity>
                                    </>
                                  )
                                ) : null}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.commentInputRow}>
              <View style={{ flex: 1 }}>
                {replyTo ? (
                  <View style={styles.replyingPill}>
                    <Text style={styles.replyingText}>Replying to {replyTo.user}</Text>
                    <TouchableOpacity onPress={() => setReplyTo(null)}>
                      <Text style={styles.replyingClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <TextInput
                  style={styles.commentInput}
                  placeholder={replyTo ? `Reply to ${replyTo.user}...` : 'Write a comment...'}
                  placeholderTextColor="#475569"
                  value={text}
                  onChangeText={setText}
                />
              </View>
              <TouchableOpacity style={styles.sendBtn} onPress={() => { if (!text.trim()) return; onAddComment(text.trim()); setText(''); }}>
                <Text style={styles.sendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Action Column
function ActionColumn({ post, onLike, onComment, onShare, onBookmark, onDescription, scaleAnim, isMobileLayout }) {
  const formatCount = (n) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' :
    n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : String(n);

  const likeCount    = formatCount(post.liked ? (Number(post.likes) + 1) : Number(post.likes));
  const shareCount   = formatCount(Number(post.shares));
  const commentCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

  const sz = isMobileLayout ? 44 : 52;
  const iconSz = isMobileLayout ? 22 : 26;

  const circle = (bg) => ({
    width: sz, height: sz, borderRadius: sz / 2,
    backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 3,
  });

  const textShadow = Platform.OS !== 'web'
    ? { textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }
    : {};

  const containerStyle = isMobileLayout
    ? { position: 'absolute', right: 10, bottom: 110, alignItems: 'center', gap: 18, zIndex: 20 }
    : { width: 90, paddingLeft: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', height: '100%', gap: 22, flexShrink: 0 };

  const btn          = { alignItems: 'center', gap: 2 };
  const countStyle   = { color: '#fff', fontSize: 12, fontWeight: '700', ...textShadow };
  const labelStyle   = { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600', ...textShadow };

  return (
    <View style={containerStyle}>
      <TouchableOpacity style={btn} onPress={() => onLike(post.id)} activeOpacity={0.75}>
        <Animated.View style={[circle(post.liked ? 'rgba(255,59,92,0.28)' : 'rgba(0,0,0,0.5)'), { transform: [{ scale: scaleAnim }] }]}>
          <HeartIcon filled={post.liked} size={iconSz} />
        </Animated.View>
        <Text style={[countStyle, { color: post.liked ? '#ff3b5c' : '#fff' }]}>{likeCount}</Text>
        <Text style={labelStyle}>Like</Text>
      </TouchableOpacity>

      <TouchableOpacity style={btn} onPress={() => onComment(post.id)} activeOpacity={0.75}>
        <View style={circle('rgba(0,0,0,0.5)')}><CommentIcon size={iconSz} /></View>
        <Text style={countStyle}>{commentCount}</Text>
        <Text style={labelStyle}>Comment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={btn} onPress={() => onShare(post.id)} activeOpacity={0.75}>
        <View style={circle('rgba(0,0,0,0.5)')}><ShareIcon size={iconSz} /></View>
        <Text style={countStyle}>{shareCount}</Text>
        <Text style={labelStyle}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity style={btn} onPress={() => onBookmark(post.id)} activeOpacity={0.75}>
        <View style={circle(post.bookmarked ? 'rgba(249,115,22,0.3)' : 'rgba(0,0,0,0.5)')}>
          <BookmarkIcon filled={post.bookmarked} size={iconSz} />
        </View>
        <Text style={labelStyle}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

// Reel Card
function ReelCard({ post, onLike, onBookmark, onComment, onShare, onDescription, onProfilePress, onFollow, isActive, cardWidth, cardHeight, isMobileLayout }) {
  const safePost = post || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [muted, setMuted] = useState(false); // Default false (unmuted) for audio
  const [paused, setPaused] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [resolvedMediaUri, setResolvedMediaUri] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const comments    = Array.isArray(safePost.comments) ? safePost.comments : [];
  const caption     = String(safePost.caption || '');
  const userName    = String(safePost.user || 'User');
  const avatarUri   = String(safePost.avatar || safePost.author_profile_image || '');
  const location    = String(safePost.location || safePost.author_seat_name || '');
  const headline    = String(safePost.headline || '');
  const role        = String(safePost.role || safePost.author_role || '');
  const time        = String(safePost.time || '');
  const verified    = Boolean(safePost.verified || safePost.author_is_premium || false);
  const postId      = String(safePost.id || '');
  const authorEmail = String(safePost.createdBy || safePost.created_by || '').trim().toLowerCase();
  const shares      = Number(safePost.shares || 0);

  // Check follow status and get current user email on mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Get current user email
        const currentUser = await UserStore.getCurrentUser();
        if (currentUser && currentUser.email) {
          setCurrentUserEmail(currentUser.email);
        }

        // Check follow status
        if (authorEmail && onFollow) {
          const status = await UserStore.getFollowStatus(authorEmail);
          setIsFollowing(status.isFollowing);
        }
      } catch (error) {
        console.error('Error initializing component:', error);
      }
    };
    initializeComponent();
  }, [authorEmail, onFollow]);

  const handleFollowPress = async () => {
    if (!authorEmail || followLoading) return;

    try {
      // Check if current user is trying to follow themselves
      const currentUser = await UserStore.getCurrentUser();
      if (currentUser && currentUser.email === authorEmail) {
        Alert.alert('Cannot Follow', 'You cannot follow yourself.');
        return;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      Alert.alert('Error', 'Unable to verify user. Please try again.');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await UserStore.unfollowUser(authorEmail);
        setIsFollowing(false);
      } else {
        await UserStore.followUser(authorEmail);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Unable to update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const safeAvatarUrl = useMemo(() =>
    !avatarError && isValidImageUrl(avatarUri) ? avatarUri : 'https://i.pravatar.cc/100?img=5',
    [avatarUri, avatarError]);

  const [resolvedThumbnailUrl, setResolvedThumbnailUrl] = useState(null);

useEffect(() => {
  let alive = true;
  const t = safePost?.thumbnail || safePost?.image;
  if (!t) { setResolvedThumbnailUrl(null); return; }
  if (isIdbMediaUri(t)) {
    resolveIdbMediaUriToObjectUrl(t).then((url) => {
      if (alive && url) setResolvedThumbnailUrl(url);
    });
  } else {
    setResolvedThumbnailUrl(t);
  }
  return () => { alive = false; };
}, [safePost?.thumbnail, safePost?.image]);

const safeThumbnailUrl = useMemo(() => {
  const t = resolvedThumbnailUrl;
  if (!thumbnailError && t && (
    t.startsWith('blob:') || 
    t.startsWith('https://') || 
    t.startsWith('http://') ||
    isValidImageUrl(t)
  )) {
    return t;
  }
  return `https://picsum.photos/400/700?random=${postId}`;
}, [resolvedThumbnailUrl, thumbnailError, postId]);
  const mediaUri = String(safePost.media || '').trim();

  useEffect(() => {
    let alive = true;
    let objectUrl = null;

    (async () => {
      if (Platform.OS !== 'web') { setResolvedMediaUri(null); return; }
      if (!isIdbMediaUri(mediaUri)) { setResolvedMediaUri(null); return; }
      const next = await resolveIdbMediaUriToObjectUrl(mediaUri);
      if (!alive) return;
      objectUrl = next;
      setResolvedMediaUri(next);
    })();

    return () => {
      alive = false;
      try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch {}
    };
  }, [mediaUri]);

  const effectiveMediaUri = useMemo(() => {
    if (Platform.OS === 'web' && isIdbMediaUri(mediaUri)) return resolvedMediaUri || '';
    return mediaUri;
  }, [mediaUri, resolvedMediaUri]);

  const canPlayVideo = safePost.type === 'video' && isPlayableVideoSource(effectiveMediaUri);

  const player = useVideoPlayer(
    canPlayVideo ? { uri: effectiveMediaUri } : null,
    (p) => { p.loop = true; }
  );

  useEffect(() => { setShowPoster(true); }, [mediaUri, effectiveMediaUri, safeThumbnailUrl, canPlayVideo]);
  useEffect(() => { setCaptionExpanded(false); }, [postId]);
  
  // Apply muted state to player
  useEffect(() => {
    if (!canPlayVideo) return;
    safeSetMuted(player, muted);
  }, [canPlayVideo, muted, player]);
  
  // Handle video playback based on active state
  useEffect(() => {
    if (!canPlayVideo) return;
    if (isActive && !paused) {
      const ok = safePlay(player);
      if (!ok) {
        setPaused(true);
        setShowPoster(true);
      }
      return;
    }
    safePause(player);
  }, [canPlayVideo, isActive, paused, player]);

  // Cleanup on unmount
  useEffect(() => () => { safePause(player); }, [player]);

  // Pause video when component is not active (for navigation)
  useEffect(() => {
    if (!canPlayVideo) return;
    if (!isActive) {
      safePause(player);
      setPaused(true);
    }
  }, [isActive, canPlayVideo, player]);

  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.45, duration: 110, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 110, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
    onLike(postId);
  };

  const videoWidth = isMobileLayout ? cardWidth : Math.min(cardWidth - 100, 430);

  const navbarH   = Platform.OS === 'ios' ? 82 : 60;
  const safeBot   = Platform.OS === 'ios' ? 34 : 0;
  const bottomBottom = isMobileLayout ? (navbarH + safeBot + 12) : 28;
  const bottomRight  = isMobileLayout ? 76 : 14;

  return (
    <View style={{
      width: cardWidth, height: cardHeight, backgroundColor: '#000',
      flexDirection: isMobileLayout ? 'column' : 'row',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{
        width: videoWidth,
        height: isMobileLayout ? cardHeight : Math.min(cardHeight * 0.92, 780),
        position: 'relative', overflow: 'hidden',
        borderRadius: isMobileLayout ? 0 : 12,
      }}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            if (!canPlayVideo) return;
            if (paused) {
              setPaused(false);
              const ok = safePlay(player);
              if (!ok) setPaused(true);
              return;
            }
            setPaused(true);
            safePause(player);
          }}
        >
          {canPlayVideo ? (
            <>
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
                fullscreenOptions={{ enabled: false }}
                playsInline
                onFirstFrameRender={() => setShowPoster(false)}
              />
              {showPoster && (
                <Image source={{ uri: safeThumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setThumbnailError(true)} />
              )}
            </>
          ) : (
            <Image source={{ uri: safeThumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setThumbnailError(true)} />
          )}
        </TouchableOpacity>

        <View style={{ ...styles.reelOverlayBottom, pointerEvents: 'none' }} />

        {paused ? (
          <View style={[styles.pausedOverlay, Platform.OS === 'web' ? { pointerEvents: 'none' } : null]}>
            <Text style={styles.pausedIcon}>||</Text>
          </View>
        ) : null}

        <View style={styles.reelTopBar}>
          <TouchableOpacity
            style={[styles.muteBtn, { backgroundColor: muted ? 'rgba(249,115,22,0.8)' : 'rgba(0,0,0,0.5)' }]}
            onPress={() => setMuted(v => !v)}
            activeOpacity={0.8}
          >
            <MuteIcon muted={muted} size={20} />
          </TouchableOpacity>
        </View>

        {isMobileLayout ? (
          <ActionColumn
            post={{ ...safePost, likes: Number(safePost.likes || 0), shares, comments, commentsCount: safePost.commentsCount ?? comments.length }}
            onLike={handleLikePress} onComment={onComment} onShare={onShare}
            onBookmark={onBookmark} onDescription={onDescription}
            scaleAnim={scaleAnim} isMobileLayout={true}
          />
        ) : null}

        <View style={[styles.reelBottom, { bottom: bottomBottom, right: bottomRight }]}>
          <View style={[styles.reelTagBadge, { backgroundColor: String(safePost.tagColor || '#16a34a') }]}>
            <Text style={styles.reelTagText}>{String(safePost.tag || '')}</Text>
          </View>

          <View style={styles.reelUserRow}>
            <TouchableOpacity style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }} onPress={() => onProfilePress(safePost)} activeOpacity={0.85}>
              <Image source={{ uri: safeAvatarUrl }} style={styles.reelUserAvatar} onError={() => setAvatarError(true)} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.reelUserName}>{userName}</Text>
                  {Boolean(verified) ? <Text style={{ color: '#60a5fa', fontSize: 12 }}>{'\u2713'}</Text> : null}
                </View>
                <Text style={styles.reelUserRole}>{role} · {time}</Text>
              </View>
            </TouchableOpacity>
            {authorEmail && currentUserEmail !== authorEmail ? (
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followBtnFollowing]}
                onPress={handleFollowPress}
                disabled={followLoading}
                activeOpacity={0.8}
              >
                <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextFollowing]}>
                  {followLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.reelLocationRow}>
            <Text style={styles.reelLocationIcon}>📍</Text>
            <Text style={styles.reelLocationText}>{location}</Text>
          </View>

          {headline ? <Text style={styles.reelHeadline}>{headline}</Text> : null}

          <TouchableOpacity activeOpacity={0.85} onPress={() => onDescription(postId)}>
            <Text style={styles.reelCaption} numberOfLines={captionExpanded ? undefined : 2}>{caption}</Text>
            {caption.length > 80 && (
              <Text style={styles.reelCaptionMore}>▼ Read More</Text>
            )}
          </TouchableOpacity>

          {(safePost.commentsCount > 0 || comments.length > 0) && (
  <TouchableOpacity onPress={() => onComment(postId)} style={{ marginTop: 5 }}>
    <Text style={styles.reelViewComments}>💬 View all {safePost.commentsCount ?? comments.length} comments</Text>
  </TouchableOpacity>
)}
        </View>
      </View>

      {!isMobileLayout && (
        <ActionColumn
          post={{ ...safePost, likes: Number(safePost.likes || 0), shares, comments }}
          onLike={handleLikePress} onComment={onComment} onShare={onShare}
          onBookmark={onBookmark} onDescription={onDescription}
          scaleAnim={scaleAnim} isMobileLayout={false}
        />
      )}
    </View>
  );
}

// Main Feed Screen
export default function FeedScreen({ navigation }) {
  const [posts, setPosts]               = useState(DUMMY_POSTS);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [commentPost, setCommentPost]   = useState(null);
  const [sharePost, setSharePost]       = useState(null);
  const [descPost, setDescPost]         = useState(null);
  const [activeIndex, setActiveIndex]   = useState(0);
  const [currentUser, setCurrentUser]   = useState({ name: 'User', avatar: null });
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const isScreenFocused = useIsFocused();

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isMobileLayout  = windowWidth <= MOBILE_BREAKPOINT;
  const isWebPlatform   = Platform.OS === 'web';

  const NAVBAR_H      = Platform.OS === 'ios' ? 82 : 60;
  const WEB_TOPNAV_H  = 60;
  const cardHeight    = isWebPlatform ? windowHeight - WEB_TOPNAV_H : windowHeight - NAVBAR_H;
  const cardWidth     = isMobileLayout ? windowWidth : Math.min(windowWidth * 0.65, 560);

 const handleLike = useCallback(async (id) => {
  setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  try {
    const result = await UserStore.updateNewsFeedItem(id, 'like');
    if (result?.ok && typeof result.liked === 'boolean') {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: result.liked } : p));
    } else {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
    }
  } catch {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  }
}, []);

  const handleBookmark = useCallback(async (id) => {
  setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
  try {
    const result = await UserStore.updateNewsFeedItem(id, 'bookmark');
    if (result?.ok && typeof result.bookmarked === 'boolean') {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: result.bookmarked } : p));
    } else {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    }
  } catch {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
  }
}, []);
  const handleComment = useCallback(async (id) => {
  setCommentPost(id);
  try {
    const summary = await UserStore.getNewsFeedSummary({ focusItemId: id });
    const item = summary?.items?.find(i => String(i.id) === String(id));
    if (item && Array.isArray(item.comments_list)) {
      setPosts(prev => prev.map(p => p.id === id
        ? {
            ...p,
            comments: item.comments_list.map(c => ({
              id: String(c.id || ''),
              user: String(c.author || c.user || 'User'),
              author: String(c.author || c.user || 'User'),
              author_email: String(c.user_email || c.author_email || '').trim().toLowerCase(),
              text: String(c.text || ''),
              replies: Array.isArray(c.replies)
                ? c.replies.map(r => ({
                    id: String(r.id || ''),
                    user: String(r.author || r.user || 'User'),
                    author: String(r.author || r.user || 'User'),
                    author_email: String(r.user_email || r.author_email || '').trim().toLowerCase(),
                    text: String(r.text || ''),
                    likes: Number(r.likes || 0),
                    liked_by: Array.isArray(r.liked_by) ? r.liked_by : [],
                    date: String(r.date || ''),
                    edited_at: r.edited_at || null,
                  }))
                : [],
            })),
            commentsCount: item.comments_list.length,
          }
        : p
      ));
    }
  } catch {}
}, []);

  const handleShare = useCallback((id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, shares: (Number(p.shares) || 0) + 1 } : p));
    setSharePost(id);
  }, []);

  const handleDescription = useCallback((id) => setDescPost(id), []);

  const handleAddComment = useCallback(async (text, replyToId = null) => {
  const tempId = Date.now().toString();
  const newComment = {
    id: tempId,
    user: currentUser.name,
    author: currentUser.name,
    author_email: currentUserEmail || '',
    text,
    date: new Date().toISOString().split('T')[0],
    likes: 0,
    liked_by: [],
  };

  // Turant UI mein dikhao
  setPosts(prev =>
  prev.map(p => p.id === commentPost
    ? {
        ...p,
        comments: replyToId
          ? p.comments.map(c => c.id === replyToId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
            )
          : [...(Array.isArray(p.comments) ? p.comments : []), newComment],
        commentsCount: (p.commentsCount ?? (Array.isArray(p.comments) ? p.comments.length : 0)) + 1,
      }
    : p)
);
  // UserStore mein save karo
  try {
    if (replyToId) {
      await UserStore.replyNewsComment(commentPost, replyToId, text);
    } else {
      await UserStore.addNewsComment(commentPost, text);
    }
  } catch {}
}, [commentPost, currentUser.name]);

  const handleEditComment = useCallback(async (commentId, newText) => {
    setPosts(prev =>
      prev.map(p => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments.map(c => {
          if (c.id === commentId) return { ...c, text: newText, edited_at: new Date().toISOString() };
          if (Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map(r => r.id === commentId ? { ...r, text: newText, edited_at: new Date().toISOString() } : r)
            };
          }
          return c;
        }) : p.comments
      }))
    );
    try {
      await UserStore.editNewsComment(commentPost, commentId, newText);
    } catch {}
  }, [commentPost]);

  const handleDeleteComment = useCallback(async (commentId) => {
    setPosts(prev =>
      prev.map(p => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments.filter(c => {
          if (c.id === commentId) return false;
          if (Array.isArray(c.replies)) {
            c.replies = c.replies.filter(r => r.id !== commentId);
          }
          return true;
        }) : p.comments,
        commentsCount: Math.max(0, (p.commentsCount ?? (Array.isArray(p.comments) ? p.comments.length : 0)) - 1)
      }))
    );
    try {
      await UserStore.deleteNewsComment(commentPost, commentId);
    } catch {}
  }, [commentPost]);

  const handleLikeComment = useCallback(async (commentId) => {
    setPosts(prev =>
      prev.map(p => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments.map(c => {
          if (c.id === commentId) {
            const liked = Array.isArray(c.liked_by) && c.liked_by.includes('current_user@example.com');
            return {
              ...c,
              liked_by: liked
                ? c.liked_by.filter(email => email !== 'current_user@example.com')
                : [...(c.liked_by || []), 'current_user@example.com'],
              likes: liked ? (c.likes || 0) - 1 : (c.likes || 0) + 1
            };
          }
          if (Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map(r => {
                if (r.id === commentId) {
                  const liked = Array.isArray(r.liked_by) && r.liked_by.includes('current_user@example.com');
                  return {
                    ...r,
                    liked_by: liked
                      ? r.liked_by.filter(email => email !== 'current_user@example.com')
                      : [...(r.liked_by || []), 'current_user@example.com'],
                    likes: liked ? (r.likes || 0) - 1 : (r.likes || 0) + 1
                  };
                }
                return r;
              })
            };
          }
          return c;
        }) : p.comments
      }))
    );
    try {
      await UserStore.likeNewsComment(commentPost, commentId);
    } catch {}
  }, [commentPost]);
  const handleNewPost = useCallback(({ caption, headline, tag }) => {
    const seed = Date.now();
    setPosts(prev => [{
      id: String(seed), user: currentUser.name,
      avatar: currentUser.avatar || 'https://i.pravatar.cc/100?img=5',
      verified: false, role: 'Citizen', location: 'India', time: 'Just now',
      type: 'image', media: `https://picsum.photos/seed/${seed}/600/900`,
      thumbnail: `https://picsum.photos/seed/${seed}/600/900`,
      headline: headline || 'My RTI Story',
      caption, fullDescription: caption,
      likes: 0, shares: 0, comments: [],
      liked: false, bookmarked: false, tag, tagColor: '#16a34a',
    }, ...prev]);
  }, [currentUser]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const activeCommentData = posts.find(p => p.id === commentPost);
  const activeShareData   = posts.find(p => p.id === sharePost);
  const activeDescData    = posts.find(p => p.id === descPost);

  // Reset active index when screen loses focus to stop videos
  useEffect(() => {
    if (!isScreenFocused) {
      setActiveIndex(-1);
    }
  }, [isScreenFocused]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchFeed = async () => {
        try {
          const [summary, userProfile] = await Promise.allSettled([
            UserStore.getReelsFeedSummary?.() ?? UserStore.getNewsFeedSummary(),
            UserStore.getUserProfile?.() ?? Promise.resolve(null),
          ]);
          if (!active) return;

          const profileData = userProfile?.value;
          if (profileData) {
            const realName   = profileData.name || profileData.full_name || profileData.username || profileData.email?.split('@')[0] || 'User';
            const realAvatar = isValidImageUrl(profileData.avatar || profileData.profile_image) ? (profileData.avatar || profileData.profile_image) : null;
            setCurrentUser({ name: realName, avatar: realAvatar });
            if (profileData.email) {
              setCurrentUserEmail(String(profileData.email).trim().toLowerCase());
            }
          }

          if (summary?.value?.items) {
            const cleanedPosts = summary.value.items.map(item => ({
              ...item,
              id: String(item.id || Date.now()),
              avatar: isValidImageUrl(item.avatar) ? item.avatar : null,
              thumbnail: isValidImageUrl(item.thumbnail) ? item.thumbnail : null,
              image: isValidImageUrl(item.image) ? item.image : null,
              comments: Array.isArray(item.comments) ? item.comments : [],
              commentsCount: Number(
                item.commentsCount ??
                item.comments_count ??
                (Array.isArray(item.comments) ? item.comments.length : Number(item.comments ?? 0))
              ),
              likes: Number(item.likes) || 0, shares: Number(item.shares) || 0,
              liked: Boolean(item.liked), bookmarked: Boolean(item.bookmarked),
            }));
            setPosts(cleanedPosts);
          }
        } catch (e) { console.log('Feed fetch error:', e); }
      };
      fetchFeed();
      return () => { active = false; };
    }, [])
  );

  const page = (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {isWebPlatform ? <AppNavbar navigation={navigation} activeScreen="Feed" hideTopHeader={true} /> : null}

      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'flex-start' }}>
        <View style={{
          width: cardWidth, height: cardHeight, overflow: 'hidden',
          ...(!isMobileLayout && windowWidth > MOBILE_BREAKPOINT
            ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }
            : {}),
        }}>
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <ReelCard
                post={item}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onComment={handleComment}
                onShare={handleShare}
                onDescription={handleDescription}
                onProfilePress={(postData) =>
                  navigation.navigate('UserProfile', {
                    email: String(postData.createdBy || postData.created_by || '').trim().toLowerCase(),
                    author: {
                      name: postData.user,
                      author_profile_image: isValidImageUrl(postData.avatar) ? postData.avatar : null,
                      author_role_label: postData.role,
                      author_seat_name: postData.location,
                      author_is_premium: Boolean(postData.verified),
                      author_is_subscriber: false,
                      createdBy: String(postData.createdBy || postData.created_by || '').trim().toLowerCase(),
                    },
                  })
                }
                onFollow={true}
                isActive={index === activeIndex && isScreenFocused}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                isMobileLayout={isMobileLayout}
              />
            )}
            pagingEnabled
            snapToInterval={cardHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({ length: cardHeight, offset: cardHeight * index, index })}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 0 }}
          />
        </View>
      </View>

      <UploadModal visible={uploadVisible} onClose={() => setUploadVisible(false)} onPost={handleNewPost} />

      {activeCommentData ? (
        <CommentsModal
          visible={!!commentPost}
          onClose={() => setCommentPost(null)}
          post={activeCommentData}
          comments={Array.isArray(activeCommentData?.comments) ? activeCommentData.comments.map(c => ({
  ...c,
  user: c.user || c.author || 'User',
  text: c.text || '',
})) : []}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
        />
      ) : null}

      <ShareModal
        visible={!!sharePost}
        onClose={() => setSharePost(null)}
        post={activeShareData}
      />

      <DescriptionModal
        visible={!!descPost}
        onClose={() => setDescPost(null)}
        post={activeDescData}
        onShare={(id) => { setDescPost(null); handleShare(id); }}
      />

      {!isWebPlatform && <AppNavbar navigation={navigation} activeScreen="Feed" hideTopHeader={true} />}
    </View>
  );

  return isWebPlatform ? <WebLayout>{page}</WebLayout> : page;
}

