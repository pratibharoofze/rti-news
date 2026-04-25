import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import VideoPreview from '../components/VideoPreview';

const isWeb = Platform.OS === 'web';

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLocation({ state, district, taluka }) {
  const parts = [taluka, district, state].map((p) => String(p || '').trim()).filter(Boolean);
  return parts.join(', ');
}

export default function NewsDetailsScreen({ route, navigation }) {
  const article = route?.params?.article || null;

  const title = article?.title || 'News Details';
  const category = article?.category || 'News';
  const date = article?.date || '';
  const author = article?.author_name || article?.author || '';
  const location = buildLocation(article || {});

  const description = useMemo(() => {
    const value =
      article?.description ||
      article?.excerpt ||
      article?.subtitle ||
      '';
    return stripHtml(value);
  }, [article]);

  const images = useMemo(() => {
    const src = Array.isArray(article?.images) ? article.images : [];
    const primary = article?.image ? [article.image] : [];
    const merged = [...primary, ...src].filter(Boolean);
    return Array.from(new Set(merged));
  }, [article]);

  const openFile = useCallback(async () => {
    const uri = article?.file?.uri;
    if (!uri) return;
    try { await Linking.openURL(uri); } catch {}
  }, [article]);

  const pageContent = (
    <>
      <View style={s.topRow}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color="#111827" />
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        {images[0] ? (
          <View style={s.heroImageWrap}>
            <Image source={{ uri: images[0] }} style={s.heroImage} />
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>{category}</Text>
            </View>
          </View>
        ) : null}

        <View style={s.body}>
          <Text style={s.title}>{title}</Text>

          <View style={s.metaRow}>
            {date ? (
              <View style={s.metaPill}>
                <Ionicons name="calendar-outline" size={14} color="#f97316" />
                <Text style={s.metaText}>{date}</Text>
              </View>
            ) : null}

            {author ? (
              <View style={s.metaPill}>
                <Ionicons name="person-outline" size={14} color="#f97316" />
                <Text style={s.metaText}>{author}</Text>
              </View>
            ) : null}

            {location ? (
              <View style={s.metaPill}>
                <Ionicons name="location-outline" size={14} color="#f97316" />
                <Text style={s.metaText}>{location}</Text>
              </View>
            ) : null}

            {article?.mediaType && article.mediaType !== 'None' ? (
              <View style={s.metaPill}>
                <Ionicons name="images-outline" size={14} color="#f97316" />
                <Text style={s.metaText}>{article.mediaType}</Text>
              </View>
            ) : null}
          </View>

          {description ? (
            <Text style={s.description}>{description}</Text>
          ) : (
            <Text style={s.descriptionMuted}>No additional details available.</Text>
          )}

          {images.length > 1 ? (
            <View style={s.gallery}>
              <Text style={s.sectionTitle}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.galleryRow}>
                {images.slice(1).map((uri) => (
                  <Image key={uri} source={{ uri }} style={s.galleryImage} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {article?.video ? (
            <View style={s.videoBox}>
              <Text style={s.sectionTitle}>Video</Text>
              <VideoPreview uri={article.video} style={s.video} contentFit="contain" />
            </View>
          ) : null}

          {article?.file?.uri ? (
            <View style={s.fileBox}>
              <Text style={s.sectionTitle}>Attachment</Text>
              <TouchableOpacity style={s.fileBtn} onPress={openFile} activeOpacity={0.85}>
                <Ionicons name="document-attach-outline" size={18} color="#fff" />
                <Text style={s.fileBtnText}>{article?.file?.name || 'Open file'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>

      <AppFooter navigation={navigation} />
    </>
  );

  const page = (
    <View style={{ flex: 1 }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <AppHeader navigation={navigation} compact={!isWeb} />
        <AppNavbar navigation={navigation} activeScreen={null} />
        <View style={s.wrapper}>
          {pageContent}
        </View>
      </ScrollView>
    </View>
  );

  return isWeb ? <WebLayout>{page}</WebLayout> : page;
}

const s = StyleSheet.create({
  // ── container: full width, no side gaps ──
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // ── wrapper: zero horizontal padding on mobile, small on web ──
  wrapper: {
    paddingHorizontal: isWeb ? 0 : 0,
    paddingTop: 10,
    paddingBottom: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backText: { fontSize: 12, fontWeight: '800', color: '#111827' },

  // ── card: flush edges on mobile, no border-radius clipping ──
  card: {
    backgroundColor: '#fff',
    borderRadius: isWeb ? 16 : 0,
    overflow: 'hidden',
    borderWidth: isWeb ? 1 : 0,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: isWeb ? 2 : 0,
    marginBottom: 0,
  },

  heroImageWrap: { height: 220, position: 'relative', backgroundColor: '#e5e7eb' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(249,115,22,0.95)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '900', color: '#111827', lineHeight: 26, marginBottom: 10 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  metaText: { fontSize: 12, color: '#7c2d12', fontWeight: '700' },

  description: { fontSize: 13, color: '#374151', lineHeight: 21 },
  descriptionMuted: { fontSize: 13, color: '#6b7280', lineHeight: 21 },

  sectionTitle: { marginTop: 16, marginBottom: 10, fontSize: 14, fontWeight: '900', color: '#111827' },

  gallery: { marginTop: 4 },
  galleryRow: { paddingBottom: 4 },
  galleryImage: {
    width: 140,
    height: 96,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#e5e7eb',
  },

  videoBox: { marginTop: 4 },
  video: { width: '100%', height: 240, borderRadius: 14, backgroundColor: '#0b1220' },

  fileBox: { marginTop: 4 },
  fileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  fileBtnText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});