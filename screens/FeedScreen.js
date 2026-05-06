import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated, useWindowDimensions, Share, Linking,
} from 'react-native';
import styles from './FeedScreenStyles';
import { useFocusEffect } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import AppNavbar from '../components/AppNavbar';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const MOBILE_BREAKPOINT = 768;

// ✅ Real video with audio — public domain MP4
const SAMPLE_REEL_VIDEO       = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_REEL_VIDEO_ALT   = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const SAMPLE_REEL_VIDEO_ALT2  = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('blob:') || url.startsWith('http://localhost') || url.startsWith('file://')) return false;
  if (url === '' || url === 'null' || url === 'undefined') return false;
  return true;
}

function isPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return false;
  if (/(youtube\.com|youtu\.be)/i.test(uri)) return false;

  // Native (iOS/Android): allow local `file://` and other platform URIs.
  if (Platform.OS !== 'web') return true;

  // Web: blobs/data URIs might not have an extension but can still play.
  if (/^(blob:|data:)/i.test(uri)) return true;

  return /^https?:/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Handler — WhatsApp, Twitter, Facebook, Copy Link
// ─────────────────────────────────────────────────────────────────────────────
function handleSharePost(post) {
  const shareText = `📰 ${post.headline}\n\n${post.caption}\n\n📍 ${post.location}\n\n🗞️ Read more on RTI News`;
  const shareUrl  = `https://rtinews.in/reel/${post.id}`;
  const fullMsg   = `${shareText}\n${shareUrl}`;

  if (Platform.OS === 'web') {
    // Web: show share sheet modal (handled by ShareModal component)
    return { text: shareText, url: shareUrl };
  }
  // Native: use system share sheet
  Share.share({ message: fullMsg, title: post.headline, url: shareUrl })
    .catch(() => {});
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Share Modal — WhatsApp, Twitter/X, Facebook, Telegram, Copy
// ─────────────────────────────────────────────────────────────────────────────
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

          {/* Post preview */}
          <View style={localShareStyles.previewBox}>
            <Text style={localShareStyles.previewHeadline} numberOfLines={2}>{post.headline}</Text>
            <Text style={localShareStyles.previewCaption} numberOfLines={2}>{post.caption}</Text>
            <Text style={localShareStyles.previewLocation}>📍 {post.location}</Text>
          </View>

          {/* Share buttons */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Description Modal — full post details
// ─────────────────────────────────────────────────────────────────────────────
function DescriptionModal({ visible, onClose, post, onShare }) {
  if (!post) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={localDescStyles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={localDescStyles.sheet}>
          <View style={localDescStyles.handle} />

          {/* Tag */}
          <View style={[localDescStyles.tagBadge, { backgroundColor: post.tagColor || '#16a34a' }]}>
            <Text style={localDescStyles.tagText}>{post.tag}</Text>
          </View>

          {/* Headline */}
          <Text style={localDescStyles.headline}>{post.headline}</Text>

          {/* User row */}
          <View style={localDescStyles.userRow}>
            <Image source={{ uri: post.avatar || 'https://i.pravatar.cc/100?img=5' }} style={localDescStyles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={localDescStyles.userName}>{post.user}</Text>
                {post.verified && <Text style={{ color: '#60a5fa', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={localDescStyles.userMeta}>{post.role} · {post.time}</Text>
            </View>
          </View>

          {/* Location */}
          <View style={localDescStyles.locRow}>
            <Text>📍 </Text>
            <Text style={localDescStyles.locText}>{post.location}</Text>
          </View>

          {/* Full caption/description */}
          <ScrollView style={localDescStyles.captionScroll} showsVerticalScrollIndicator={false}>
            <Text style={localDescStyles.caption}>{post.caption}</Text>
            {post.fullDescription ? (
              <Text style={localDescStyles.fullDesc}>{post.fullDescription}</Text>
            ) : null}
          </ScrollView>

          {/* Stats row */}
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

          {/* Action buttons */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Dummy Data — with fullDescription & audio videos
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Upload Modal
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Comments Modal
// ─────────────────────────────────────────────────────────────────────────────
function CommentsModal({ visible, onClose, comments, onAddComment }) {
  const [text, setText] = useState('');
  const { height: WH } = useWindowDimensions();
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[styles.commentsSheet, { maxHeight: WH * 0.75 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>💬 Comments</Text>
          <ScrollView style={{ maxHeight: WH * 0.42, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
            {safeComments.length === 0 && <Text style={styles.noComments}>No comments yet. Be the first! 👇</Text>}
            {safeComments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{c.user[0]}</Text></View>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.commentInputRow}>
              <TextInput style={styles.commentInput} placeholder="Write a comment..." placeholderTextColor="#475569" value={text} onChangeText={setText} />
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

// ─────────────────────────────────────────────────────────────────────────────
// Action Column
// ─────────────────────────────────────────────────────────────────────────────
function ActionColumn({ post, onLike, onComment, onShare, onBookmark, onDescription, scaleAnim, isMobileLayout }) {
  const formatCount = (n) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' :
    n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : String(n);

  const likeCount    = formatCount(post.liked ? (Number(post.likes) + 1) : Number(post.likes));
  const shareCount   = formatCount(Number(post.shares));
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

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

      {/* Like */}
      <TouchableOpacity style={btn} onPress={() => onLike(post.id)} activeOpacity={0.75}>
        <Animated.View style={[circle(post.liked ? 'rgba(255,59,92,0.28)' : 'rgba(0,0,0,0.5)'), { transform: [{ scale: scaleAnim }] }]}>
          <HeartIcon filled={post.liked} size={iconSz} />
        </Animated.View>
        <Text style={[countStyle, { color: post.liked ? '#ff3b5c' : '#fff' }]}>{likeCount}</Text>
        <Text style={labelStyle}>Like</Text>
      </TouchableOpacity>

      {/* Comment */}
      <TouchableOpacity style={btn} onPress={() => onComment(post.id)} activeOpacity={0.75}>
        <View style={circle('rgba(0,0,0,0.5)')}><CommentIcon size={iconSz} /></View>
        <Text style={countStyle}>{commentCount}</Text>
        <Text style={labelStyle}>Comment</Text>
      </TouchableOpacity>

      {/* Share — opens share modal */}
      <TouchableOpacity style={btn} onPress={() => onShare(post.id)} activeOpacity={0.75}>
        <View style={circle('rgba(0,0,0,0.5)')}><ShareIcon size={iconSz} /></View>
        <Text style={countStyle}>{shareCount}</Text>
        <Text style={labelStyle}>Share</Text>
      </TouchableOpacity>

      {/* Save */}
      <TouchableOpacity style={btn} onPress={() => onBookmark(post.id)} activeOpacity={0.75}>
        <View style={circle(post.bookmarked ? 'rgba(249,115,22,0.3)' : 'rgba(0,0,0,0.5)')}>
          <BookmarkIcon filled={post.bookmarked} size={iconSz} />
        </View>
        <Text style={labelStyle}>Save</Text>
      </TouchableOpacity>


    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reel Card
// ─────────────────────────────────────────────────────────────────────────────
function ReelCard({ post, onLike, onBookmark, onComment, onShare, onDescription, onProfilePress, isActive, cardWidth, cardHeight, isMobileLayout }) {
  const safePost = post || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [captionExpanded, setCaptionExpanded] = useState(false);
  // ✅ Default muted=false so audio plays automatically
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPoster, setShowPoster] = useState(!!safePost.thumbnail);
  const [avatarError, setAvatarError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

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
  const shares      = Number(safePost.shares || 0);

  const safeAvatarUrl = useMemo(() =>
    !avatarError && isValidImageUrl(avatarUri) ? avatarUri : 'https://i.pravatar.cc/100?img=5',
    [avatarUri, avatarError]);

  const safeThumbnailUrl = useMemo(() => {
    const t = safePost?.thumbnail || safePost?.image;
    return (!thumbnailError && isValidImageUrl(t)) ? t : `https://picsum.photos/400/700?random=${postId}`;
  }, [safePost?.thumbnail, safePost?.image, thumbnailError, postId]);

  const canPlayVideo = safePost.type === 'video' && isPlayableVideoSource(safePost.media);

  const player = useVideoPlayer(
    canPlayVideo ? { uri: safePost.media } : null,
    (p) => { p.loop = true; }
  );

  useEffect(() => { setShowPoster(!!safePost.thumbnail); }, [safePost.thumbnail, safePost.media]);
  useEffect(() => { setCaptionExpanded(false); }, [postId]);
  // ✅ Apply muted state to player
  useEffect(() => { if (!canPlayVideo) return; player.muted = muted; }, [canPlayVideo, muted, player]);
  useEffect(() => {
    if (!canPlayVideo) return;
    if (isActive && !paused) { Promise.resolve(player.play()).catch(() => {}); return; }
    player.pause();
  }, [canPlayVideo, isActive, paused, player]);
  useEffect(() => () => { if (player) player.pause(); }, [player]);

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

      {/* ── VIDEO PANEL ── */}
      <View style={{
        width: videoWidth,
        height: isMobileLayout ? cardHeight : Math.min(cardHeight * 0.92, 780),
        position: 'relative', overflow: 'hidden',
        borderRadius: isMobileLayout ? 0 : 12,
      }}>

        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPaused(v => !v)}>
          {canPlayVideo ? (
            <>
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
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

        {/* Gradient overlay */}
        <View style={{ ...styles.reelOverlayBottom, pointerEvents: 'none' }} />

        {/* Paused indicator */}
        {paused && (
          <View
            style={[styles.pausedOverlay, Platform.OS === 'web' ? { pointerEvents: 'none' } : null]}
            {...(Platform.OS === 'web' ? {} : { pointerEvents: 'none' })}
          >
            <Text style={styles.pausedIcon}>||</Text>
          </View>
        )}

        {/* ✅ Mute/Unmute button — top right, prominent */}
        <View style={styles.reelTopBar}>
          <TouchableOpacity
            style={[styles.muteBtn, { backgroundColor: muted ? 'rgba(249,115,22,0.8)' : 'rgba(0,0,0,0.5)' }]}
            onPress={() => setMuted(v => !v)}
            activeOpacity={0.8}
          >
            <MuteIcon muted={muted} size={20} />
          </TouchableOpacity>
        </View>

        {/* ✅ Mobile: action icons inside video */}
        {isMobileLayout && (
          <ActionColumn
            post={{ ...safePost, likes: Number(safePost.likes || 0), shares, comments }}
            onLike={handleLikePress} onComment={onComment} onShare={onShare}
            onBookmark={onBookmark} onDescription={onDescription}
            scaleAnim={scaleAnim} isMobileLayout={true}
          />
        )}

        {/* Bottom info overlay */}
        <View style={[styles.reelBottom, { bottom: bottomBottom, right: bottomRight }]}>
          <View style={[styles.reelTagBadge, { backgroundColor: String(safePost.tagColor || '#16a34a') }]}>
            <Text style={styles.reelTagText}>{String(safePost.tag || '')}</Text>
          </View>

          <TouchableOpacity style={styles.reelUserRow} onPress={() => onProfilePress(safePost)} activeOpacity={0.85}>
            <Image source={{ uri: safeAvatarUrl }} style={styles.reelUserAvatar} onError={() => setAvatarError(true)} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.reelUserName}>{userName}</Text>
                {verified && <Text style={{ color: '#60a5fa', fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={styles.reelUserRole}>{role} · {time}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.reelLocationRow}>
            <Text style={styles.reelLocationIcon}>📍</Text>
            <Text style={styles.reelLocationText}>{location}</Text>
          </View>

          {headline ? <Text style={styles.reelHeadline}>{headline}</Text> : null}

          {/* ✅ Tap caption to open description modal */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => onDescription(postId)}>
            <Text style={styles.reelCaption} numberOfLines={captionExpanded ? undefined : 2}>{caption}</Text>
            {caption.length > 80 && (
              <Text style={styles.reelCaptionMore}>▼ Read More</Text>
            )}
          </TouchableOpacity>

          {comments.length > 0 && (
            <TouchableOpacity onPress={() => onComment(postId)} style={{ marginTop: 5 }}>
              <Text style={styles.reelViewComments}>💬 View all {comments.length} comments</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ✅ Desktop: action icons outside video */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Feed Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function FeedScreen({ navigation }) {
  const [posts, setPosts]               = useState(DUMMY_POSTS);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [commentPost, setCommentPost]   = useState(null);
  const [sharePost, setSharePost]       = useState(null);   // ✅ share modal
  const [descPost, setDescPost]         = useState(null);   // ✅ description modal
  const [activeIndex, setActiveIndex]   = useState(0);
  const [currentUser, setCurrentUser]   = useState({ name: 'User', avatar: null });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isMobileLayout  = windowWidth <= MOBILE_BREAKPOINT;
  const isWebPlatform   = Platform.OS === 'web';

  const NAVBAR_H      = Platform.OS === 'ios' ? 82 : 60;
  const WEB_TOPNAV_H  = 60;
  const cardHeight    = isWebPlatform ? windowHeight - WEB_TOPNAV_H : windowHeight - NAVBAR_H;
  const cardWidth     = isMobileLayout ? windowWidth : Math.min(windowWidth * 0.65, 560);

  const handleLike = useCallback((id) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p)), []);

  const handleBookmark = useCallback((id) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)), []);

  const handleComment = useCallback((id) => setCommentPost(id), []);

  // ✅ Share: increment count + show share modal
  const handleShare = useCallback((id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, shares: (Number(p.shares) || 0) + 1 } : p));
    setSharePost(id);
  }, []);

  // ✅ Description modal
  const handleDescription = useCallback((id) => setDescPost(id), []);

  const handleAddComment = useCallback((text) => {
    setPosts(prev =>
      prev.map(p => p.id === commentPost
        ? { ...p, comments: [...(Array.isArray(p.comments) ? p.comments : []), { id: Date.now().toString(), user: currentUser.name, text }] }
        : p)
    );
  }, [commentPost, currentUser.name]);

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
          }

          if (summary?.value?.items) {
            const cleanedPosts = summary.value.items.map(item => ({
              ...item,
              id: String(item.id || Date.now()),
              avatar: isValidImageUrl(item.avatar) ? item.avatar : null,
              thumbnail: isValidImageUrl(item.thumbnail) ? item.thumbnail : null,
              image: isValidImageUrl(item.image) ? item.image : null,
              comments: Array.isArray(item.comments) ? item.comments : [],
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
      {isWebPlatform && <AppNavbar navigation={navigation} activeScreen="Feed" />}

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
                    email: String(postData.user || '').trim().toLowerCase().replace(/\s+/g, '.'),
                    author: {
                      name: postData.user,
                      author_profile_image: isValidImageUrl(postData.avatar) ? postData.avatar : null,
                      author_role_label: postData.role,
                      author_seat_name: postData.location,
                      author_is_premium: Boolean(postData.verified),
                      author_is_subscriber: false,
                    },
                  })
                }
                isActive={index === activeIndex}
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

      {/* ✅ Comments Modal */}
      {activeCommentData && (
        <CommentsModal
          visible={!!commentPost}
          onClose={() => setCommentPost(null)}
          comments={Array.isArray(activeCommentData.comments) ? activeCommentData.comments : []}
          onAddComment={handleAddComment}
        />
      )}

      {/* ✅ Share Modal — WhatsApp, Telegram, Twitter, Facebook, Copy */}
      <ShareModal
        visible={!!sharePost}
        onClose={() => setSharePost(null)}
        post={activeShareData}
      />

      {/* ✅ Description Modal */}
      <DescriptionModal
        visible={!!descPost}
        onClose={() => setDescPost(null)}
        post={activeDescData}
        onShare={(id) => { setDescPost(null); handleShare(id); }}
      />

      {!isWebPlatform && <AppNavbar navigation={navigation} activeScreen="Feed" />}
    </View>
  );

  return isWebPlatform ? <WebLayout>{page}</WebLayout> : page;
}



