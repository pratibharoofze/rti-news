import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TextInput,
  TouchableOpacity, StyleSheet,
  Platform, Dimensions, useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';

import {
  featuredNews, topStories, latestNews,
  trendingNews, categories,
} from '../data/newsData';

const isWeb = Platform.OS === 'web';

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

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useIsMobile() {
  if (Platform.OS !== 'web') return true;

  const getWidth = () => {
    if (typeof document !== 'undefined') {
      return document.documentElement.clientWidth;
    }
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1200;
  };

  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setWidth(getWidth());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return width < 768;
}

// ─── Section Header ───────────────────────────────────────────────────────────

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

// ─── Top Story Card ───────────────────────────────────────────────────────────

function TopStoryCard({ article, isMobile, isLast }) {
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
    >
      <View style={[ts.imageContainer, isMobile && ts.imageContainerMobile]}>
        <Image source={{ uri: image }} style={ts.image} />
        <View style={[ts.badge, { backgroundColor: badge.bg }]}>
          <Text style={[ts.badgeText, { color: badge.text }]}>{category}</Text>
        </View>
      </View>
      <View style={ts.content}>
        <Text style={[ts.title, isMobile && ts.titleMobile]} numberOfLines={3}>{title}</Text>
        {excerpt && <Text style={[ts.excerpt, isMobile && ts.excerptMobile]} numberOfLines={2}>{excerpt}</Text>}
        <View style={ts.meta}>
          <Text style={[ts.date, isMobile && ts.dateMobile]}>{date}</Text>
          {author && (
            <>
              <Text style={[ts.dot, isMobile && ts.dateMobile]}> | </Text>
              <Text style={[ts.author, isMobile && ts.dateMobile]}>{author}</Text>
            </>
          )}
          <View style={{ flex: 1 }} />
          <Text style={[ts.readMore, isMobile && ts.dateMobile]}>Read more →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ts = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardWeb:        { flex: 1 },
  cardWebGap:     { marginRight: 16 },
  cardMobile:     { width: '100%' },
  cardMobileGap:  { marginBottom: 10 },
  imageContainer:       { height: 200, position: 'relative' },
  imageContainerMobile: { height: 140 },
  image:      { width: '100%', height: '100%', resizeMode: 'cover' },
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
  author:     { fontSize: 12, color: '#f97316', fontWeight: '600' },
  readMore:   { fontSize: 12, color: '#f97316', fontWeight: '700' },
});

// ─── Latest News Card ─────────────────────────────────────────────────────────

function LatestNewsCard({ article, isMobile, isLast, colIndex = 0, isLastRow = false }) {
  const { title, category, categoryColor = 'orange', image, date, author, excerpt } = article;
  const badge = colorMap[categoryColor] || colorMap.orange;
  const webCardStyle = [
    ln.cardWeb,
    colIndex < 2 && ln.cardWebMarginRight,
    !isLastRow && ln.cardWebMarginBottom,
  ];
  return (
    <TouchableOpacity
      style={[
        ln.card,
        isMobile
          ? [ln.cardMobile, !isLast && ln.cardMobileGap]
          : webCardStyle,
      ]}
      activeOpacity={0.85}
    >
      <View style={[ln.imageContainer, isMobile && ln.imageContainerMobile]}>
        <Image source={{ uri: image }} style={ln.image} />
        <View style={[ln.badge, { backgroundColor: badge.bg }]}>
          <Text style={[ln.badgeText, { color: badge.text }]}>{category}</Text>
        </View>
      </View>
      <View style={ln.content}>
        <Text
          style={[ln.title, { color: categoryColorMap[categoryColor] || '#111827' }, isMobile && ln.titleMobile]}
          numberOfLines={2}
        >{title}</Text>
        {excerpt && <Text style={[ln.excerpt, isMobile && ln.excerptMobile]} numberOfLines={2}>{excerpt}</Text>}
        <View style={ln.meta}>
          <Text style={[ln.date, isMobile && ln.dateMobile]}>{date}</Text>
          {author && (
            <>
              <Text style={[ln.dot, isMobile && ln.dateMobile]}> | </Text>
              <Text style={[ln.author, isMobile && ln.dateMobile]}>{author}</Text>
            </>
          )}
          <View style={{ flex: 1 }} />
          <Text style={[ln.readMore, isMobile && ln.dateMobile]}>Read more →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ln = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardWeb:              { width: '33.33%' },
  cardWebMarginRight:   { paddingRight: 16 },
  cardWebMarginBottom:  { marginBottom: 24 },
  cardMobile:     { width: '100%' },
  cardMobileGap:  { marginBottom: 10 },
  imageContainer:       { height: 180, position: 'relative' },
  imageContainerMobile: { height: 120 },
  image:      { width: '100%', height: '100%', resizeMode: 'cover' },
  badge:      { position: 'absolute', top: 10, left: 10, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  content:    { padding: 12 },
  title:      { fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
  titleMobile:{ fontSize: 13, lineHeight: 18 },
  excerpt:    { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 6 },
  excerptMobile: { fontSize: 12, lineHeight: 16 },
  meta:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  date:       { fontSize: 12, color: '#9ca3af' },
  dateMobile: { fontSize: 11 },
  dot:        { fontSize: 12, color: '#d1d5db' },
  author:     { fontSize: 12, color: '#f97316', fontWeight: '600' },
  readMore:   { fontSize: 12, color: '#f97316', fontWeight: '700' },
});

// ─── Know Your Rights Card ────────────────────────────────────────────────────

function KnowYourRightsCard({ isMobile }) {
  return (
    <View style={[kyr.card, isMobile && kyr.cardMobile]}>
      <Text style={[kyr.title, isMobile && kyr.titleMobile]}>Know Your Rights</Text>
      <Text style={[kyr.desc, isMobile && kyr.descMobile]}>
        File an RTI and get a reply from any government office within 30 days.
      </Text>
      <TouchableOpacity style={kyr.btn} activeOpacity={0.85}>
        <Text style={[kyr.btnText, isMobile && kyr.btnTextMobile]}>Learn about RTI →</Text>
      </TouchableOpacity>
    </View>
  );
}

const kyr = StyleSheet.create({
  card:       { backgroundColor: '#f97316', borderRadius: 12, padding: 20 },
  cardMobile: { padding: 14 },
  title:      { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  titleMobile:{ fontSize: 14 },
  desc:       { fontSize: 13, color: '#fff', lineHeight: 20, marginBottom: 16, opacity: 0.9 },
  descMobile: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  btn:        { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start' },
  btnText:    { color: '#f97316', fontWeight: '700', fontSize: 13 },
  btnTextMobile: { fontSize: 11 },
});

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = useMemo(() => {
    const uris = [
      featuredNews?.image,
      ...(topStories  || []).map((item) => item?.image),
      ...(latestNews  || []).map((item) => item?.image),
    ].filter(Boolean);
    return Array.from(new Set(uris));
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const heroImageUri = heroImages[heroIndex] || featuredNews.image;

  const pageContent = (
    <>
      {/* ── Hero ── */}
      <View style={[s.heroContainer, isMobile && s.heroContainerMobile]}>
        <Image source={{ uri: heroImageUri }} style={s.heroImage} />
        <View style={s.heroOverlay} />
        <View style={[s.breakingBadge, isMobile && s.breakingBadgeMobile]}>
          <Text style={[s.breakingText, isMobile && s.breakingTextMobile]}>BREAKING NEWS</Text>
        </View>
        <View style={[s.heroContent, isMobile && s.heroContentMobile]}>
          <View style={[s.categoryBadge, { backgroundColor: '#f97316' }]}>
            <Text style={[s.categoryBadgeText, isMobile && s.categoryBadgeTextMobile]}>
              {featuredNews.category}
            </Text>
          </View>
          <Text style={[s.heroTitle, isMobile && s.heroTitleMobile]}>{featuredNews.title}</Text>
          <Text style={[s.heroExcerpt, isMobile && s.heroExcerptMobile]} numberOfLines={2}>
            {featuredNews.excerpt}
          </Text>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={[s.searchContainer, isMobile && s.searchContainerMobile]}>
        <View style={s.searchBox}>
          <TextInput
            style={[s.searchInput, isMobile && s.searchInputMobile]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search headlines, topics..."
          />
        </View>
      </View>

      <View style={[s.body, isMobile && s.bodyMobile]}>

        {/* ── Top Stories ── */}
        <View style={[s.section, isMobile && s.sectionMobile]}>
          <SectionHeader title="Top Stories" isMobile={isMobile} />
          <View style={isMobile ? s.colStack : s.threeColGrid}>
            {topStories.map((a, i) => (
              <TopStoryCard
                key={a.id}
                article={a}
                isMobile={isMobile}
                isLast={i === topStories.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ── Latest News + Sidebar ── */}
        <View style={isMobile ? s.colStack : s.twoColLayout}>

          {/* Left: Latest News */}
          <View style={isMobile ? s.fullWidth : s.mainCol}>
            <SectionHeader title="Latest News" isMobile={isMobile} />
            <View style={isMobile ? s.colStack : s.threeColGridWrap}>
              {latestNews.map((a, i) => (
                <LatestNewsCard
                  key={a.id}
                  article={a}
                  isMobile={isMobile}
                  isLast={i === latestNews.length - 1}
                  colIndex={i % 3}
                  isLastRow={i >= latestNews.length - 3}
                />
              ))}
            </View>
          </View>

          {/* Right: Sidebar */}
          <View style={isMobile ? s.fullWidth : s.sidebar}>

            {/* Trending */}
            <View style={[s.sidebarCard, isMobile && s.sidebarCardMobile]}>
              <SectionHeader title="Trending Now" isMobile={isMobile} />
              {trendingNews.map((item, i) => (
                <TouchableOpacity key={item.id} style={[s.trendingItem, isMobile && s.trendingItemMobile]}>
                  <Text style={[s.trendingNum, isMobile && s.trendingNumMobile]}>0{i + 1}</Text>
                  <View style={s.trendingContent}>
                    <Text style={[s.trendingTitle, isMobile && s.trendingTitleMobile]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={s.trendingMeta}>
                      <Text style={[s.trendingViews, isMobile && s.trendingMetaMobile]}>Views: {item.views}</Text>
                      <Text style={[s.trendingDot,  isMobile && s.trendingMetaMobile]}> | </Text>
                      <Text style={[s.trendingDate, isMobile && s.trendingMetaMobile]}>Date: {item.date}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            <View style={[s.sidebarCard, s.sidebarCardTop, isMobile && s.sidebarCardMobile]}>
              <SectionHeader title="Browse Categories" isMobile={isMobile} />
              {categories.map((cat) => (
                <TouchableOpacity key={cat.name} style={[s.categoryItem, isMobile && s.categoryItemMobile]}>
                  <View style={[s.categoryDot, { backgroundColor: categoryColorMap[cat.color] }]} />
                  <Text style={[s.categoryName, isMobile && s.categoryNameMobile]}>{cat.name}</Text>
                  <Text style={[s.categoryCount, isMobile && s.categoryCountMobile]}>{cat.count}</Text>
                  <Text style={[s.categoryArrow, isMobile && s.categoryArrowMobile]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Know Your Rights */}
            <View style={s.sidebarCardTop}>
              <KnowYourRightsCard isMobile={isMobile} />
            </View>

          </View>
        </View>

      </View>

      {/* ── Stay Informed Banner ── */}
      {/* FIX: position:'relative' added to container, bannerBg uses absoluteFillObject + resizeMode:'cover' */}
      <View style={[s.bannerContainer, isMobile && s.bannerContainerMobile]}>
        <Image
          source={{ uri: 'https://picsum.photos/1200/300?random=200' }}
          style={s.bannerBg}
          resizeMode="cover"
        />
        <View style={s.bannerOverlay} />
        <View style={s.bannerContent}>
          <Text style={[s.bannerTitle, isMobile && s.bannerTitleMobile]}>
            Stay informed. Stay empowered.
          </Text>
          <Text style={[s.bannerSubtitle, isMobile && s.bannerSubtitleMobile]}>
            Simple questions | Precise answers | By the Constitution
          </Text>
          <TouchableOpacity style={[s.bannerBtn, isMobile && s.bannerBtnMobile]} activeOpacity={0.85}>
            <Text style={[s.bannerBtnText, isMobile && s.bannerBtnTextMobile]}>
              Join the community →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AppFooter navigation={navigation} />
    </>
  );

  const page = (
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <AppHeader navigation={navigation} compact={!isWeb} />
        <AppNavbar navigation={navigation} activeScreen="Home" />
        {pageContent}
      </ScrollView>
    </View>
  );

  return isWeb ? <WebLayout>{page}</WebLayout> : page;
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Hero
  heroContainer:       { width: '100%', height: 300, position: 'relative' },
  heroContainerMobile: { height: 220 },
  heroImage:   { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },

  breakingBadge:       { position: 'absolute', top: 20, left: 16, backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  breakingBadgeMobile: { top: 12, left: 12 },
  breakingText:        { color: '#fff', fontWeight: '700', fontSize: 12 },
  breakingTextMobile:  { fontSize: 10 },

  heroContent:       { position: 'absolute', bottom: 16, left: 16, right: 16 },
  heroContentMobile: { bottom: 12, left: 12, right: 12 },

  categoryBadge:           { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
  categoryBadgeText:       { color: '#fff', fontSize: 12, fontWeight: '600' },
  categoryBadgeTextMobile: { fontSize: 10 },

  heroTitle:       { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4, lineHeight: 28 },
  heroTitleMobile: { fontSize: 16, lineHeight: 20 },

  heroExcerpt:       { color: '#ddd', fontSize: 14, lineHeight: 20 },
  heroExcerptMobile: { fontSize: 12, lineHeight: 16 },

  // Search
  searchContainer:       { paddingHorizontal: 24, paddingVertical: 12 },
  searchContainerMobile: { paddingHorizontal: 12, paddingVertical: 8 },
  searchBox:   { flexDirection: 'row', backgroundColor: '#eee', padding: 10, borderRadius: 20, borderColor: '#ddd', borderWidth: 1 },
  searchInput:       { marginLeft: 10, flex: 1, fontSize: 14, padding: 0 },
  searchInputMobile: { marginLeft: 6, fontSize: 13 },

  // Body
  body:       { paddingHorizontal: 24, paddingVertical: 10 },
  bodyMobile: { paddingHorizontal: 12, paddingVertical: 8 },

  section:       { marginBottom: 28 },
  sectionMobile: { marginBottom: 20 },

  // Layout helpers
  threeColGrid:    { flexDirection: 'row' },
  threeColGridWrap:{ flexDirection: 'row', flexWrap: 'wrap' },
  twoColLayout: { flexDirection: 'row' },
  twoColGrid:   { flexDirection: 'row', flexWrap: 'wrap' },
  colStack:     { flexDirection: 'column' },
  fullWidth:    { width: '100%' },
  mainCol:      { flex: 3, marginRight: 24 },
  sidebar:      { flex: 1, minWidth: 260 },

  sidebarCardTop: { marginTop: 20 },

  // Sidebar card
  sidebarCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  sidebarCardMobile: { padding: 14 },

  // Trending
  trendingItem:       { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  trendingItemMobile: { paddingVertical: 8 },
  trendingNum:        { fontSize: 18, fontWeight: '800', color: '#f97316', width: 36 },
  trendingNumMobile:  { fontSize: 14, width: 28 },
  trendingContent:    { flex: 1 },
  trendingTitle:      { fontSize: 13, fontWeight: '600', color: '#111827', lineHeight: 19, marginBottom: 3 },
  trendingTitleMobile:{ fontSize: 12, lineHeight: 16 },
  trendingMeta:       { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  trendingViews:      { fontSize: 11, color: '#9ca3af' },
  trendingDot:        { fontSize: 11, color: '#d1d5db' },
  trendingDate:       { fontSize: 11, color: '#9ca3af' },
  trendingMetaMobile: { fontSize: 10 },

  // Categories
  categoryItem:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  categoryItemMobile:  { paddingVertical: 8 },
  categoryDot:         { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  categoryName:        { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  categoryNameMobile:  { fontSize: 12 },
  categoryCount:       { fontSize: 12, color: '#9ca3af', marginRight: 6 },
  categoryCountMobile: { fontSize: 10 },
  categoryArrow:       { fontSize: 18, color: '#9ca3af' },
  categoryArrowMobile: { fontSize: 16 },

  // ── Stay Informed Banner ── FIX: position:'relative' + absoluteFillObject for bg image
  bannerContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 14,
    overflow: 'hidden',
    height: 200,
    position: 'relative',        // ← FIX: added
  },
  bannerContainerMobile: {
    marginHorizontal: 12,
    marginBottom: 24,
    height: 140,
    position: 'relative',        // ← FIX: added
  },
  bannerBg: {
    ...StyleSheet.absoluteFillObject,  // ← FIX: replaces width/height/position:'absolute'
    resizeMode: 'cover',               // ← FIX: added
  },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,15,15,0.75)' },
  bannerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  bannerTitle:       { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 6, lineHeight: 30 },
  bannerTitleMobile: { fontSize: 16, lineHeight: 20 },

  bannerSubtitle:       { fontSize: 14, color: '#d1d5db', textAlign: 'center', marginBottom: 20 },
  bannerSubtitleMobile: { fontSize: 11, marginBottom: 12 },

  bannerBtn:       { backgroundColor: '#f97316', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 28 },
  bannerBtnMobile: { paddingVertical: 8, paddingHorizontal: 16 },

  bannerBtnText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
  bannerBtnTextMobile: { fontSize: 12 },
});