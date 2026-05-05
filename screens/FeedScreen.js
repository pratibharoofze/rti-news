import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated, useWindowDimensions,
} from 'react-native';
import styles from './FeedScreenStyles';
import { useFocusEffect } from '@react-navigation/native';
import { VideoView, useVideoPlayer } from 'expo-video';
import AppNavbar from '../components/AppNavbar';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

// ✅ KEY: Use screen WIDTH to decide layout, NOT Platform.OS
// This way browser DevTools mobile simulation works correctly
const MOBILE_BREAKPOINT = 500;

const SAMPLE_REEL_VIDEO = 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4';
const SAMPLE_REEL_VIDEO_ALT = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('blob:') || url.startsWith('http://localhost') || url.startsWith('file://')) return false;
  if (url === '' || url === 'null' || url === 'undefined') return false;
  return true;
}

function isPlayableVideoSource(uri) {
  return typeof uri === 'string'
    && /^(https?:|blob:|data:)/i.test(uri)
    && !/(youtube\.com|youtu\.be)/i.test(uri)
    && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
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
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_POSTS = [
  {
    id: '1', user: 'Rahul Sharma', avatar: 'https://i.pravatar.cc/100?img=11',
    verified: true, role: 'RTI Activist', location: 'Lucknow, Uttar Pradesh', time: '2 min ago',
    type: 'video', media: SAMPLE_REEL_VIDEO,
    thumbnail: 'https://images.shiksha.com/mediadata/images/articles/1733209282phpDQvZRu.png',
    headline: 'RTI exposed missing water supply funds!',
    caption: 'Ward 14 in Lucknow had no water for 3 months. Filed an RTI, got a response in 30 days — pipeline repair budget was finally released. 🎉 #RTI #JanAdhikar #Water',
    likes: 1240, shares: 312,
    comments: [{ id: 'c1', user: 'Priya Verma', text: 'Great work bhai! 👏' }, { id: 'c2', user: 'Mohan Lal', text: 'RTI is a powerful tool!' }],
    liked: false, bookmarked: false, tag: 'Success Story', tagColor: '#16a34a',
  },
  {
    id: '2', user: 'Anjali Singh', avatar: 'https://i.pravatar.cc/100?img=47',
    verified: false, role: 'Teacher', location: 'Bhopal, Madhya Pradesh', time: '15 min ago',
    type: 'video', media: SAMPLE_REEL_VIDEO_ALT,
    headline: 'Where did the school funds go? Filed an RTI!',
    caption: 'Government Primary School No. 7 had no account of mid-day meal funds. Filed an RTI — documents requested within 20 days. #RTI #Education',
    likes: 890, shares: 145,
    comments: [{ id: 'c3', user: 'Admin RTI', text: 'Best of luck!' }],
    liked: false, bookmarked: false, tag: 'Application Filed', tagColor: '#2563eb',
  },
  {
    id: '3', user: 'Vikram Patel', avatar: 'https://i.pravatar.cc/100?img=33',
    verified: true, role: 'Journalist', location: 'Ahmedabad, Gujarat', time: '1 hr ago',
    type: 'video', media: SAMPLE_REEL_VIDEO,
    thumbnail: 'https://images.shiksha.com/mediadata/images/articles/1733209282phpDQvZRu.png',
    headline: 'Road built after RTI — this is people power!',
    caption: 'Narol area had no road for 2 years. Filed RTI and PWD started work within 15 days. 🛣️ #RTI #Gujarat',
    likes: 3120, shares: 890,
    comments: [{ id: 'c5', user: 'Neha Shah', text: 'Inspiring!' }, { id: 'c6', user: 'Suresh Bhai', text: 'How did you file it?' }],
    liked: true, bookmarked: false, tag: 'Victory', tagColor: '#d97706',
  },
  {
    id: '4', user: 'Dr. Meera Devi', avatar: 'https://i.pravatar.cc/100?img=25',
    verified: true, role: 'Doctor & Activist', location: 'Patna, Bihar', time: '3 hrs ago',
    type: 'video', media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/seed/news4/600/900',
    headline: 'Where is the hospital medicine stock?',
    caption: 'Essential medicines were out of stock at Patna Civil Hospital. Filed an RTI for medicine purchase records. 💊 #RTI #Health',
    likes: 2050, shares: 567,
    comments: [{ id: 'c8', user: 'Asha Devi', text: 'Same problem here!' }],
    liked: false, bookmarked: true, tag: 'Health RTI', tagColor: '#dc2626',
  },
  {
    id: '5', user: 'RTI Portal Official', avatar: 'https://i.pravatar.cc/100?img=60',
    verified: true, role: 'Official Account', location: 'New Delhi', time: '5 hrs ago',
    type: 'video', media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: 'https://picsum.photos/seed/news5/600/900',
    headline: 'File RTI from home — takes just 5 minutes!',
    caption: '📢 File RTI online at rtionline.gov.in. No fee, no agents! #RTIOnline #DigitalIndia',
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
// isMobileLayout=true  → INSIDE video (absolute, right side) — Instagram style
// isMobileLayout=false → OUTSIDE video (right column) — YouTube Shorts desktop
// ─────────────────────────────────────────────────────────────────────────────
function ActionColumn({ post, onLike, onComment, onShare, onBookmark, scaleAnim, isMobileLayout }) {
  const formatCount = (n) =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' :
    n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : String(n);

  const likeCount = formatCount(post.liked ? (Number(post.likes) + 1) : Number(post.likes));
  const shareCount = formatCount(Number(post.shares));
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
    ? {
        position: 'absolute',
        right: 10,
        bottom: 110,      // above the bottom navbar
        alignItems: 'center',
        gap: 18,
        zIndex: 20,
      }
    : {
        width: 90,
        paddingLeft: 16,
        paddingBottom: 80,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 22,
        flexShrink: 0,
      };

  const btn = { alignItems: 'center', gap: 2 };
  const countStyle = { color: '#fff', fontSize: 12, fontWeight: '700', ...textShadow };
  const labelStyle = { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600', ...textShadow };

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

      {/* Share */}
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
function ReelCard({ post, onLike, onBookmark, onComment, onShare, onProfilePress, isActive, cardWidth, cardHeight, isMobileLayout }) {
  const safePost = post || {};
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPoster, setShowPoster] = useState(!!safePost.thumbnail);
  const [avatarError, setAvatarError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const comments = Array.isArray(safePost.comments) ? safePost.comments : [];
  const caption = String(safePost.caption || '');
  const userName = String(safePost.user || 'User');
  const avatarUri = String(safePost.avatar || safePost.author_profile_image || '');
  const location = String(safePost.location || safePost.author_seat_name || '');
  const headline = String(safePost.headline || '');
  const role = String(safePost.role || safePost.author_role || '');
  const time = String(safePost.time || '');
  const verified = Boolean(safePost.verified || safePost.author_is_premium || false);
  const postId = String(safePost.id || '');
  const shares = Number(safePost.shares || 0);

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

  const navbarH = Platform.OS === 'ios' ? 82 : 60;
  const safeBot = Platform.OS === 'ios' ? 34 : 0;

  // On mobile: video = full card width. On desktop: video = card minus action column
  const videoWidth = isMobileLayout ? cardWidth : Math.min(cardWidth - 100, 430);
  const bottomBottom = isMobileLayout ? (navbarH + safeBot + 12) : 28;
  const bottomRight = isMobileLayout ? 76 : 14; // leave room for action icons on mobile

  return (
    <View style={{
      width: cardWidth,
      height: cardHeight,
      backgroundColor: '#000',
      flexDirection: isMobileLayout ? 'column' : 'row',
      alignItems: isMobileLayout ? 'stretch' : 'flex-end',
      justifyContent: isMobileLayout ? 'flex-start' : 'center',
    }}>

      {/* ── VIDEO PANEL ─────────────────────────────── */}
      <View style={{ width: videoWidth, height: cardHeight, position: 'relative', overflow: 'hidden' }}>

        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPaused(v => !v)}>
          {canPlayVideo ? (
            <>
              <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover"
                nativeControls={false} allowsFullscreen={false} playsInline
                onFirstFrameRender={() => setShowPoster(false)} />
              {showPoster && (
                <Image source={{ uri: safeThumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setThumbnailError(true)} />
              )}
            </>
          ) : (
            <Image source={{ uri: safeThumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setThumbnailError(true)} />
          )}
        </TouchableOpacity>

        {/* Gradient */}
       <View 
  style={{ ...styles.reelOverlayBottom, pointerEvents: 'none' }} 
/>

        {/* Paused */}
        {paused && (
          <View style={styles.pausedOverlay} pointerEvents="none">
            <Text style={styles.pausedIcon}>⏸</Text>
          </View>
        )}

        {/* Mute — top right */}
        <View style={styles.reelTopBar}>
          <TouchableOpacity style={styles.muteBtn} onPress={() => setMuted(v => !v)} activeOpacity={0.8}>
            <MuteIcon muted={muted} size={20} />
          </TouchableOpacity>
        </View>

        {/* ✅ Action icons INSIDE video on mobile */}
        {isMobileLayout && (
          <ActionColumn
            post={{ ...safePost, likes: Number(safePost.likes || 0), shares, comments }}
            onLike={handleLikePress} onComment={onComment} onShare={onShare} onBookmark={onBookmark}
            scaleAnim={scaleAnim} isMobileLayout={true}
          />
        )}

        {/* Bottom info */}
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

          <TouchableOpacity activeOpacity={0.85} onPress={() => setCaptionExpanded(v => !v)}>
            <Text style={styles.reelCaption} numberOfLines={captionExpanded ? undefined : 2}>{caption}</Text>
            {caption.length > 80 && (
              <Text style={styles.reelCaptionMore}>{captionExpanded ? '▲ Less' : '▼ More'}</Text>
            )}
          </TouchableOpacity>

          {comments.length > 0 && (
            <TouchableOpacity onPress={() => onComment(postId)} style={{ marginTop: 5 }}>
              <Text style={styles.reelViewComments}>💬 View all {comments.length} comments</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ✅ Action icons OUTSIDE on desktop */}
      {!isMobileLayout && (
        <ActionColumn
          post={{ ...safePost, likes: Number(safePost.likes || 0), shares, comments }}
          onLike={handleLikePress} onComment={onComment} onShare={onShare} onBookmark={onBookmark}
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
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState({ name: 'User', avatar: null });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // ✅ Layout is based on WIDTH, not platform
  // This makes browser DevTools mobile simulation work correctly
  const isMobileLayout = windowWidth <= MOBILE_BREAKPOINT;
  const isWebPlatform = Platform.OS === 'web';

  const cardWidth = isMobileLayout ? windowWidth : Math.min(windowWidth, 530);
  const cardHeight = windowHeight;

  const handleLike = useCallback((id) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p)), []);

  const handleBookmark = useCallback((id) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)), []);

  const handleComment = useCallback((id) => setCommentPost(id), []);

  const handleShare = useCallback((id) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, shares: (Number(p.shares) || 0) + 1 } : p)), []);

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
      caption, likes: 0, shares: 0, comments: [],
      liked: false, bookmarked: false, tag, tagColor: '#16a34a',
    }, ...prev]);
  }, [currentUser]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const activeCommentData = posts.find(p => p.id === commentPost);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchFeed = async () => {
        try {
          const [summary, userProfile] = await Promise.allSettled([
            UserStore.getNewsFeedSummary(),
            UserStore.getUserProfile?.() ?? Promise.resolve(null),
          ]);
          if (!active) return;

          const profileData = userProfile?.value;
          if (profileData) {
            const realName = profileData.name || profileData.full_name || profileData.username || profileData.email?.split('@')[0] || 'User';
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
      {/* Top navbar only on desktop web */}
      {isWebPlatform && !isMobileLayout && <AppNavbar navigation={navigation} activeScreen="Feed" />}

      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center' }}>
        <View style={{
          width: cardWidth, flex: 1, overflow: 'hidden',
          ...(!isMobileLayout && windowWidth > 530
            ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }
            : {}),
        }}>
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <ReelCard
                post={item}
                onLike={handleLike} onBookmark={handleBookmark}
                onComment={handleComment} onShare={handleShare}
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
          />
        </View>
      </View>

      <UploadModal visible={uploadVisible} onClose={() => setUploadVisible(false)} onPost={handleNewPost} />

      {activeCommentData && (
        <CommentsModal
          visible={!!commentPost}
          onClose={() => setCommentPost(null)}
          comments={Array.isArray(activeCommentData.comments) ? activeCommentData.comments : []}
          onAddComment={handleAddComment}
        />
      )}

      {/* Bottom navbar: on mobile always, on desktop web only if mobile layout */}
      {(!isWebPlatform || isMobileLayout) && <AppNavbar navigation={navigation} activeScreen="Feed" />}
    </View>
  );

  return isWebPlatform ? <WebLayout>{page}</WebLayout> : page;
}