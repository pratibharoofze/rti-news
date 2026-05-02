import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TextInput,
  TouchableOpacity, StyleSheet,
  Platform, useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';

const isWeb = Platform.OS === 'web';
const DEFAULT_AVATAR = require('../assets/images/icon.png');

const categoryColorMap = {
  orange: '#f97316', blue: '#3b82f6', green: '#16a34a',
  purple: '#a855f7', red: '#ef4444', teal: '#14b8a6',
};

const colorMap = {
  red:    { bg: '#fee2e2', text: '#b91c1c' },
  blue:   { bg: '#dbeafe', text: '#1d4ed8' },
  green:  { bg: '#dcfce7', text: '#15803d' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  purple: { bg: '#f3e8ff', text: '#7e22ce' },
  teal:   { bg: '#ccfbf1', text: '#0f766e' },
};

const reportTypeColorMap = {
  Crime: 'red',
  Murder: 'red',
  Accident: 'orange',
  Politics: 'blue',
  Other: 'teal',
};

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashToSeed(input) {
  const str = String(input || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000;
}

function toLatestNewsCardShape(item) {
  const title = item?.title || 'Untitled';
  const category = item?.report_type || item?.category || 'News';
  const categoryColor =
    reportTypeColorMap[item?.report_type] ||
    reportTypeColorMap[category] ||
    item?.categoryColor ||
    'orange';

  const mediaType =
    item?.mediaType ||
    (item?.video ? 'Video' : null) ||
    (Array.isArray(item?.images) && item.images.length > 0 ? 'Image' : null) ||
    (item?.file ? 'File' : null) ||
    'None';

  const image =
    item?.images?.[0] ||
    item?.image ||
    `https://picsum.photos/400/300?random=${hashToSeed(item?.id || title)}`;

  const description =
    stripHtml(item?.description) ||
    String(item?.excerpt || '').trim() ||
    String(item?.subtitle || '').trim() ||
    '';

  const excerpt =
    String(item?.excerpt || '').trim() ||
    String(item?.subtitle || '').trim() ||
    description ||
    '';

  const author = item?.author_name || item?.author || '';
  const date = item?.date || (item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '');

  return {
    id: item?.id || `news-${hashToSeed(title)}`,
    createdBy: String(item?.createdBy || item?.created_by || '').trim().toLowerCase(),
    author_name: item?.author_name || item?.author || '',
    author_profile_image: item?.author_profile_image || item?.authorProfileImage || item?.profile_image || '',
    author_seat_name: item?.author_seat_name || item?.authorSeatName || '',
    author_role_label: item?.author_role_label || item?.authorRoleLabel || '',
    author_is_premium: Boolean(item?.author_is_premium || item?.isPremium || item?.author_is_subscriber || item?.is_premium),
    title,
    category,
    categoryColor,
    mediaType,
    video: item?.video || null,
    image,
    date,
    author,
    excerpt,
    description,
    subtitle: stripHtml(item?.subtitle) || '',
    images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
    file: item?.file || null,
    state: item?.state || '',
    district: item?.district || '',
    taluka: item?.taluka || '',
    views: Number(item?.views || 0),
    shares: Number(item?.shares || 0),
    likes: Number(item?.likes || 0),
    comments: Number(item?.comments || 0),
  };
}

function useIsMobile() {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return true;
  return width < 768;
}

function SectionHeader({ title, icon, isMobile }) {
  return (
    <View style={sh.header}>
      <View style={sh.left}>
        <View style={sh.bar} />
        {icon ? <Text style={sh.icon}>{icon}</Text> : null}
        <Text style={[sh.title, isMobile && sh.titleMobile]}>{title}</Text>
      </View>
    </View>
  );
}

const sh = StyleSheet.create({
  header: { marginBottom: 14 },
  left:   { flexDirection: 'row', alignItems: 'center' },
  bar:    { width: 4, height: 20, backgroundColor: '#f97316', marginRight: 8, borderRadius: 2 },
  icon:   { marginRight: 6, fontSize: 16 },
  title:  { fontWeight: '800', fontSize: 16, letterSpacing: 0.5, color: '#111827' },
  titleMobile: { fontSize: 14 },
});

function TopStoryCard({ article, isMobile, isLast, onPress }) {
  const { title, category, categoryColor = 'orange', image, date, author, excerpt } = article;
  const badge = colorMap[categoryColor] || colorMap.orange;
  return (
    <TouchableOpacity
      style={[
        ts.card,
        isMobile
          ? [ts.cardMobile, !isLast && ts.cardMobileGap]
          : [ts.cardWeb, !isLast && ts.cardWebGap],
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[ts.imageContainer, isMobile && ts.imageContainerMobile]}>
        <Image source={{ uri: image }} style={ts.image} resizeMode="cover" />
        <View style={[ts.badge, { backgroundColor: badge.bg }]}>
          <Text style={[ts.badgeText, { color: badge.text }]}>{category}</Text>
        </View>
      </View>
      <View style={ts.content}>
        <Text style={[ts.title, isMobile && ts.titleMobile]} numberOfLines={3}>{title}</Text>
        {excerpt ? <Text style={[ts.excerpt, isMobile && ts.excerptMobile]} numberOfLines={2}>{excerpt}</Text> : null}
        <View style={ts.meta}>
          <Text style={[ts.date, isMobile && ts.dateMobile]}>{date}</Text>
          {author ? (
            <View style={ts.authorInline}>
              <Text style={[ts.dot, isMobile && ts.dateMobile]}>{' | '}</Text>
              <Text style={[ts.author, isMobile && ts.dateMobile]}>{author}</Text>
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          <Text style={[ts.readMore, isMobile && ts.dateMobile]}>{'Read more →'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ts = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.06)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      default: {},
    }),
  },
  cardWeb:        { flex: 1 },
  cardWebGap:     { marginRight: 16 },
  cardMobile:     { width: '100%' },
  cardMobileGap:  { marginBottom: 10 },
  imageContainer:       { height: 200, position: 'relative' },
  imageContainerMobile: { height: 140 },
  image:      { width: '100%', height: '100%' },
  badge:      { position: 'absolute', top: 10, left: 10, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  content:    { padding: 12 },
  title:      { fontSize: 15, fontWeight: '700', color: '#111827', lineHeight: 22, marginBottom: 4 },
  titleMobile:{ fontSize: 13, lineHeight: 18 },
  excerpt:    { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 6 },
  excerptMobile: { fontSize: 12, lineHeight: 16 },
  meta:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  date:       { fontSize: 12, color: '#9ca3af' },
  dateMobile: { fontSize: 11 },
  dot:        { fontSize: 12, color: '#d1d5db' },
  authorInline: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '62%' },
  authorAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#e5e7eb' },
  author:     { fontSize: 12, color: '#f97316', fontWeight: '600' },
  readMore:   { fontSize: 12, color: '#f97316', fontWeight: '700' },
});

function LatestNewsCard({ article, isMobile, isLast, colIndex = 0, isLastRow = false, onPress, onAuthorPress }) {
  const {
    title, category, categoryColor = 'orange', image, date, author,
    author_profile_image, author_seat_name, author_is_premium,
    excerpt, mediaType, video,
    views = 0, likes = 0, comments = 0, shares = 0,
  } = article;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [shareCount, setShareCount] = useState(shares);
  const [viewCount, setViewCount] = useState(views);

  const badge = colorMap[categoryColor] || colorMap.orange;
  const hasVideo = mediaType === 'Video' && typeof video === 'string' && video.length > 0;
  const avatarPressRef = useRef(false);
  const showAuthor = Boolean((author || '').trim() || (author_profile_image || '').trim());

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  }, [isLiked, likeCount]);

  const handleComment = useCallback(() => { setCommentCount(commentCount + 1); }, [commentCount]);
  const handleShare = useCallback(() => { setShareCount(shareCount + 1); }, [shareCount]);
  const handleView = useCallback(() => { setViewCount(viewCount + 1); }, [viewCount]);

  const handleCardPress = () => {
    if (avatarPressRef.current) { avatarPressRef.current = false; return; }
    onPress?.();
  };

  const webCardStyle = [
    ln.cardWeb,
    colIndex < 2 && ln.cardWebMarginRight,
    !isLastRow && ln.cardWebMarginBottom,
  ];

  return (
    <TouchableOpacity
      style={[ln.card, isMobile ? [ln.cardMobile, !isLast && ln.cardMobileGap] : webCardStyle]}
      activeOpacity={0.85}
      onPress={handleCardPress}
    >
      {showAuthor ? (
        <View style={[ln.authorHeader, isMobile && ln.authorHeaderMobile]}>
          <TouchableOpacity
            style={ln.authorHeaderContent}
            onPressIn={() => { avatarPressRef.current = true; }}
            onPress={() => { onAuthorPress?.(article); setTimeout(() => { avatarPressRef.current = false; }, 0); }}
            activeOpacity={0.85}
          >
            <Image
              source={author_profile_image ? { uri: author_profile_image } : DEFAULT_AVATAR}
              style={[ln.authorHeaderAvatar, isMobile && ln.authorHeaderAvatarMobile]}
            />
            <View style={ln.authorHeaderText}>
              <View style={ln.authorNameRow}>
                <Text style={[ln.authorHeaderName, isMobile && ln.authorHeaderNameMobile]} numberOfLines={1}>
                  {author || 'User'}
                </Text>
                {author_is_premium ? (
                  <Ionicons name="checkmark-circle-sharp" size={isMobile ? 16 : 18} color="#3b82f6" style={ln.blueTick} />
                ) : null}
              </View>
              {author_seat_name ? (
                <Text style={[ln.authorSeatName, isMobile && ln.authorSeatNameMobile]} numberOfLines={1}>
                  {author_seat_name}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={ln.content}>
        <Text
          style={[ln.title, { color: categoryColorMap[categoryColor] || '#111827' }, isMobile && ln.titleMobile]}
          numberOfLines={2}
        >{title}</Text>
        {excerpt ? <Text style={[ln.excerpt, isMobile && ln.excerptMobile]} numberOfLines={2}>{excerpt}</Text> : null}
        <View style={ln.meta}>
          <Text style={[ln.date, isMobile && ln.dateMobile]}>{date}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[ln.readMore, isMobile && ln.dateMobile]}>{'Read more →'}</Text>
        </View>
      </View>

      <View style={[ln.imageContainer, isMobile && ln.imageContainerMobile]}>
        {hasVideo ? (
          <>
            <Image source={{ uri: image }} style={ln.image} resizeMode="cover" />
            <View style={ln.videoOverlay}>
              <Ionicons name="play-circle" size={44} color="#ffffff" />
            </View>
          </>
        ) : (
          <Image source={{ uri: image }} style={ln.image} resizeMode="cover" />
        )}
        <View style={[ln.badge, { backgroundColor: badge.bg }]}>
          <Text style={[ln.badgeText, { color: badge.text }]}>{category}</Text>
        </View>
      </View>

      <View style={[ln.actionBar, isMobile && ln.actionBarMobile]}>
        <TouchableOpacity style={ln.actionButton} onPress={handleView} activeOpacity={0.7}>
          <Ionicons name="eye-outline" size={isMobile ? 16 : 18} color="#6b7280" />
          <Text style={[ln.actionLabel, isMobile && ln.actionLabelMobile]}>{viewCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ln.actionButton} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={isMobile ? 16 : 18} color={isLiked ? '#ef4444' : '#6b7280'} />
          <Text style={[ln.actionLabel, isMobile && ln.actionLabelMobile, isLiked && ln.actionLabelLiked]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ln.actionButton} onPress={handleComment} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={isMobile ? 16 : 18} color="#6b7280" />
          <Text style={[ln.actionLabel, isMobile && ln.actionLabelMobile]}>{commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ln.actionButton} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={isMobile ? 16 : 18} color="#6b7280" />
          <Text style={[ln.actionLabel, isMobile && ln.actionLabelMobile]}>{shareCount}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const ln = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.06)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      default: {},
    }),
  },
  cardWeb: { width: '33.33%' },
  cardWebMarginRight: { paddingRight: 16 },
  cardWebMarginBottom: { marginBottom: 24 },
  cardMobile: { width: '100%' },
  cardMobileGap: { marginBottom: 10 },
  authorHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  authorHeaderMobile: { padding: 10 },
  authorHeaderContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorHeaderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 10 },
  authorHeaderAvatarMobile: { width: 36, height: 36, borderRadius: 18 },
  authorHeaderText: { flex: 1 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorHeaderName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  authorHeaderNameMobile: { fontSize: 13 },
  authorSeatName: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  authorSeatNameMobile: { fontSize: 11 },
  blueTick: { marginLeft: 2 },
  imageContainer: { height: 180, position: 'relative' },
  imageContainerMobile: { height: 120 },
  image: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  badge: { position: 'absolute', top: 10, left: 10, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  content: { padding: 12 },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
  titleMobile: { fontSize: 13, lineHeight: 18 },
  excerpt: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 6 },
  excerptMobile: { fontSize: 12, lineHeight: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  date: { fontSize: 12, color: '#9ca3af' },
  dateMobile: { fontSize: 11 },
  dot: { fontSize: 12, color: '#d1d5db' },
  author: { fontSize: 12, color: '#f97316', fontWeight: '600' },
  authorInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorAvatar: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#e5e7eb' },
  readMore: { fontSize: 12, color: '#f97316', fontWeight: '700' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 8 },
  actionBarMobile: { paddingVertical: 6, paddingHorizontal: 6 },
  actionButton: { flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, paddingVertical: 4 },
  actionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  actionLabelMobile: { fontSize: 11 },
  actionLabelLiked: { color: '#ef4444', fontWeight: '600' },
});

function KnowYourRightsCard({ isMobile }) {
  return (
    <View style={[kyr.card, isMobile && kyr.cardMobile]}>
      <Text style={[kyr.title, isMobile && kyr.titleMobile]}>{'Know Your Rights'}</Text>
      <Text style={[kyr.desc, isMobile && kyr.descMobile]}>
        {'File an RTI and get a reply from any government office within 30 days.'}
      </Text>
      <TouchableOpacity style={kyr.btn} activeOpacity={0.85}>
        <Text style={[kyr.btnText, isMobile && kyr.btnTextMobile]}>{'Learn about RTI →'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const kyr = StyleSheet.create({
  card: { backgroundColor: '#f97316', borderRadius: 12, padding: 20 },
  cardMobile: { padding: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  titleMobile: { fontSize: 14 },
  desc: { fontSize: 13, color: '#fff', lineHeight: 20, marginBottom: 16, opacity: 0.9 },
  descMobile: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  btn: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' },
  btnText: { color: '#f97316', fontWeight: '700', fontSize: 13 },
  btnTextMobile: { fontSize: 11 },
});

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [latestNews, setLatestNews] = useState([]);

  const openDetails = useCallback((article) => {
    if (!article) return;
    navigation?.navigate?.('NewsDetails', { article });
  }, [navigation]);

  const openAuthorProfile = useCallback((article) => {
    if (!article) return;
    const authorEmail = String(article.createdBy || '').trim().toLowerCase();
    const fallbackAuthor = {
      name: article.author_name || article.author || '',
      author_profile_image: article.author_profile_image || '',
      author_seat_name: article.author_seat_name || '',
      author_role_label: article.author_role_label || '',
      author_is_premium: Boolean(article.author_is_premium),
      author_is_subscriber: Boolean(article.author_is_subscriber),
    };
    if (!authorEmail && !fallbackAuthor.name && !fallbackAuthor.author_profile_image) return;
    navigation?.navigate?.('UserProfile', { email: authorEmail, author: fallbackAuthor });
  }, [navigation]);

  const loadLatestNews = useCallback(async () => {
    try {
      const summary = await UserStore.getNewsFeedSummary();
      if (!summary?.currentUser) { setLatestNews([]); return; }
      const allNews = (summary.items || []).map(toLatestNewsCardShape).filter((item) => item?.title);
      setLatestNews(allNews);
    } catch { setLatestNews([]); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => { if (!active) return; await loadLatestNews(); })();
      return () => { active = false; };
    }, [loadLatestNews])
  );

  const displayedNews = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    let filtered = latestNews;
    if (q) {
      filtered = latestNews.filter((item) => {
        const haystack = `${item.title} ${item.category} ${item.excerpt} ${item.author}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    const grouped = {};
    filtered.forEach((item) => {
      const state = item?.state || 'Other';
      if (!grouped[state]) grouped[state] = [];
      grouped[state].push(item);
    });
    return grouped;
  }, [latestNews, searchQuery]);

  const pageContent = (
    <>
      <View style={[s.searchContainer, isMobile && s.searchContainerMobile]}>
        <View style={s.searchBox}>
          <TextInput
            style={[s.searchInput, isMobile && s.searchInputMobile]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your news..."
          />
        </View>
      </View>

      <View style={[s.body, isMobile && s.bodyMobile]}>
        <View style={[s.section, isMobile && s.sectionMobile]}>
          <SectionHeader title="All News" isMobile={isMobile} />

          {Object.keys(displayedNews).length > 0 ? (
            Object.keys(displayedNews).sort().map((state) => (
              <View key={state} style={s.stateSection}>
                <View style={[s.stateHeader, isMobile && s.stateHeaderMobile]}>
                  <Ionicons name="location" size={isMobile ? 16 : 18} color="#f97316" style={{ marginRight: 6 }} />
                  <Text style={[s.stateTitle, isMobile && s.stateTitleMobile]}>{state}</Text>
                  <Text style={[s.stateCount, isMobile && s.stateCountMobile]}>
                    {String(displayedNews[state].length)}
                  </Text>
                </View>
                <View style={isMobile ? s.colStack : s.threeColGridWrap}>
                  {displayedNews[state].map((a, i) => (
                    <LatestNewsCard
                      key={a.id}
                      article={a}
                      isMobile={isMobile}
                      isLast={i === displayedNews[state].length - 1}
                      colIndex={i % 3}
                      isLastRow={i >= displayedNews[state].length - 3}
                      onPress={() => openDetails(a)}
                      onAuthorPress={openAuthorProfile}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={s.emptyBox}>
              <Text style={s.emptyTitle}>{'No news yet'}</Text>
              <Text style={s.emptyText}>{'Aap jo news add karenge, wahi yahan show hogi.'}</Text>
              <TouchableOpacity
                style={s.emptyCta}
                onPress={() => navigation?.navigate?.('Add News')}
                activeOpacity={0.85}
              >
                <Text style={s.emptyCtaText}>{'Add your first news'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <AppFooter navigation={navigation} />
    </>
  );

  // ✅ KEY FIX: flex column layout — navbar naturally bottom pe rahega
  const page = (
    <View style={s.pageContainer}>
      {isWeb && <AppNavbar navigation={navigation} activeScreen="Home" />}

      <ScrollView
        style={s.scrollArea}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader navigation={navigation} compact={!isWeb} />
        {pageContent}
      </ScrollView>

      {/* ✅ Mobile navbar — flex mein last, touches kisi ko block nahi karega */}
      {!isWeb && <AppNavbar navigation={navigation} activeScreen="Home" />}
    </View>
  );

  return isWeb ? <WebLayout>{page}</WebLayout> : page;
}

const s = StyleSheet.create({
  // ✅ KEY FIX: flex:1 + column direction
  pageContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f9fafb',
  },
  scrollArea: {
    flex: 1, // ✅ ScrollView remaining space lega, navbar push hoga neeche
  },
  scrollContent: {
    paddingBottom: 16, // Sirf thoda breathing room
  },

  container: { flex: 1, backgroundColor: '#f9fafb' },

  searchContainer:       { paddingHorizontal: 24, paddingVertical: 12 },
  searchContainerMobile: { paddingHorizontal: 12, paddingVertical: 8 },
  searchBox:   { flexDirection: 'row', backgroundColor: '#eee', padding: 10, borderRadius: 20, borderColor: '#ddd', borderWidth: 1 },
  searchInput:       { marginLeft: 10, flex: 1, fontSize: 14, padding: 0 },
  searchInputMobile: { marginLeft: 6, fontSize: 13 },

  body:       { paddingHorizontal: 24, paddingVertical: 10 },
  bodyMobile: { paddingHorizontal: 12, paddingVertical: 8 },

  section:       { marginBottom: 28 },
  sectionMobile: { marginBottom: 20 },

  stateSection: { marginBottom: 28 },
  stateHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 14, borderBottomWidth: 2, borderBottomColor: '#f97316' },
  stateHeaderMobile: { paddingVertical: 10, marginBottom: 12 },
  stateTitle: { fontSize: 16, fontWeight: '800', color: '#111827', flex: 1 },
  stateTitleMobile: { fontSize: 14 },
  stateCount: { fontSize: 13, fontWeight: '700', color: '#f97316', backgroundColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stateCountMobile: { fontSize: 12 },

  emptyBox: { marginTop: 10, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  emptyText: { fontSize: 13, color: '#64748b', lineHeight: 19, textAlign: 'center' },
  emptyCta: { marginTop: 6, backgroundColor: '#0f172a', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
  emptyCtaText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },

  threeColGridWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  colStack:     { flexDirection: 'column' },

  myNewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  addNewsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  addNewsBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },

  sidebarCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      default: {},
    }),
  },
  sidebarCardMobile: { padding: 14 },
  fullWidth: { width: '100%' },
  mainCol: { flex: 3, marginRight: 24 },
  sidebar: { flex: 1, minWidth: 260 },
});