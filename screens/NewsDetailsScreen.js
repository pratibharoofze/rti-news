import React, { useCallback, useMemo } from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import VideoPreview from '../components/VideoPreview';

const IS_WEB = Platform.OS === 'web';
const DEFAULT_AVATAR_IMAGE = require('../assets/images/icon.png');

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('blob:')) return false;
  if (url.startsWith('file://')) return false;
  if (url.startsWith('http://localhost')) return false;
  return url !== 'null' && url !== 'undefined';
}

function buildPlaceholderImage(seedKey) {
  return `https://picsum.photos/seed/${encodeURIComponent(seedKey || 'news-details')}/960/680`;
}

function buildLocationLabel(article) {
  const parts = [article?.taluka, article?.district, article?.state]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

function normalizeArticle(rawArticle) {
  const article = rawArticle || {};
  const safeImage =
    (Array.isArray(article.images) ? article.images.find((imageUrl) => isValidImageUrl(imageUrl)) : '') ||
    (isValidImageUrl(article.image) ? article.image : '') ||
    buildPlaceholderImage(article.id || article.title);

  const galleryImages = Array.isArray(article.images)
    ? article.images.filter((imageUrl) => isValidImageUrl(imageUrl))
    : [safeImage];

  return {
    id: article.id || 'news-details-fallback',
    title: article.title || 'News Details',
    excerpt: stripHtml(article.excerpt || article.subtitle || article.description || ''),
    description: stripHtml(article.description || article.excerpt || article.subtitle || ''),
    category: article.category || 'Latest News',
    menuTags: Array.isArray(article.menuTags) ? article.menuTags : ['latest'],
    state: article.state || '',
    district: article.district || '',
    taluka: article.taluka || '',
    author_name: article.author_name || article.author || 'RTI Desk',
    author_profile_image: article.author_profile_image || '',
    author_seat_name: article.author_seat_name || 'Reporter',
    author_role_label: article.author_role_label || '',
    author_is_premium: Boolean(article.author_is_premium),
    image: safeImage,
    images: galleryImages.length ? galleryImages : [safeImage],
    video: article.video || null,
    file: article.file || null,
    mediaType: article.mediaType || (article.video ? 'Video' : 'Image'),
    date: article.date || '05 May 2026',
    publishedAgo: article.publishedAgo || 'Updated recently',
    likes: Number(article.likes || 0),
    comments: Number(article.comments || 0),
    shares: Number(article.shares || 0),
    views: Number(article.views || 0),
  };
}

function buildArticleParagraphs(article) {
  const locationLabel = buildLocationLabel(article) || article.state || 'the local area';
  const excerptText = stripHtml(article.excerpt || '');
  const descriptionText = stripHtml(article.description || '');
  const baseSummary = descriptionText || excerptText || 'Detailed text is not available for this story yet.';

  return [
    excerptText || baseSummary,
    `${baseSummary} The update keeps the focus on ${locationLabel} and the wider ${String(article.category || 'news').toLowerCase()} conversation.`,
    `Readers following ${locationLabel} can use this report as a simple summary of what changed, why it matters, and what to watch next.`,
  ].filter(Boolean);
}

export default function NewsDetailsScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isCompactLayout = !IS_WEB || width < 980;
  const article = useMemo(() => normalizeArticle(route?.params?.article), [route?.params?.article]);
  const locationLabel = useMemo(() => buildLocationLabel(article), [article]);
  const articleParagraphs = useMemo(() => buildArticleParagraphs(article), [article]);
  const activeCategoryTag = useMemo(
    () => (article.menuTags || []).find((tag) => tag !== 'latest') || 'latest',
    [article.menuTags]
  );

  const handleOpenAttachment = useCallback(async () => {
    const fileUri = article?.file?.uri;
    if (!fileUri) return;
    try {
      await Linking.openURL(fileUri);
    } catch {
      // no-op
    }
  }, [article]);

  const handleOpenStateFeed = useCallback(() => {
    if (!article.state) return;
    navigation?.navigate?.('Home', {
      initialView: 'feed',
      initialMenuKey: 'latest',
      initialStateName: article.state,
    });
  }, [article.state, navigation]);

  const handleOpenCategoryFeed = useCallback(() => {
    navigation?.navigate?.('Home', {
      initialView: 'feed',
      initialMenuKey: activeCategoryTag,
      initialStateName: '',
    });
  }, [activeCategoryTag, navigation]);

  const page = (
    <View style={styles.screenShell}>
      {IS_WEB ? <AppNavbar navigation={navigation} activeScreen={null} /> : null}

      <ScrollView
        style={styles.pageScrollView}
        contentContainerStyle={[
          styles.pageScrollContent,
          !IS_WEB && styles.pageScrollContentWithMobileNav,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageBodyShell}>
          <View style={[styles.pageBodyInner, isCompactLayout && styles.pageBodyInnerCompact]}>
            <View style={styles.storyColumn}>
              <View style={[styles.utilityRow, isCompactLayout && styles.utilityRowCompact]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation?.goBack?.()}
                  activeOpacity={0.84}
                >
                  <Ionicons name="arrow-back-outline" size={18} color="#0f172a" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.utilityChipRow}>
                  {article.state ? (
                    <TouchableOpacity
                      style={styles.utilityChip}
                      onPress={handleOpenStateFeed}
                      activeOpacity={0.84}
                    >
                      <Ionicons name="location-outline" size={16} color="#f97316" />
                      <Text style={styles.utilityChipText}>{article.state}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.utilityChip}
                    onPress={handleOpenCategoryFeed}
                    activeOpacity={0.84}
                  >
                    <Ionicons name="albums-outline" size={16} color="#f97316" />
                    <Text style={styles.utilityChipText}>{article.category}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.storyCardShell, isCompactLayout && styles.storyCardShellCompact]}>
                <View style={styles.storyAuthorRow}>
                  <View style={styles.storyAuthorIdentity}>
                    <Image
                      source={
                        isValidImageUrl(article.author_profile_image)
                          ? { uri: article.author_profile_image }
                          : DEFAULT_AVATAR_IMAGE
                      }
                      style={styles.storyAuthorAvatar}
                    />
                    <View style={styles.storyAuthorTextWrap}>
                      <View style={styles.storyAuthorNameRow}>
                        <Text style={styles.storyAuthorName}>{article.author_name}</Text>
                        {article.author_is_premium ? (
                          <Ionicons name="checkmark-circle" size={18} color="#0ea5e9" />
                        ) : null}
                      </View>
                      <Text style={styles.storyAuthorRoleText}>
                        {article.author_seat_name || article.author_role_label || 'Reporter'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.storyHeadlineText, isCompactLayout && styles.storyHeadlineTextCompact]}>
                  {article.title}
                </Text>

                {article.excerpt ? (
                  <Text style={styles.storyExcerptText}>{article.excerpt}</Text>
                ) : null}

                <View style={styles.storyMetaRow}>
                  <View style={styles.storyMetaPill}>
                    <Ionicons name="calendar-outline" size={15} color="#f97316" />
                    <Text style={styles.storyMetaPillText}>{article.date}</Text>
                  </View>
                  <View style={styles.storyMetaPill}>
                    <Ionicons name="time-outline" size={15} color="#f97316" />
                    <Text style={styles.storyMetaPillText}>{article.publishedAgo}</Text>
                  </View>
                  {locationLabel ? (
                    <View style={styles.storyMetaPill}>
                      <Ionicons name="pin-outline" size={15} color="#f97316" />
                      <Text style={styles.storyMetaPillText}>{locationLabel}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.storyHeroImageWrap, isCompactLayout && styles.storyHeroImageWrapCompact]}>
                  <Image source={{ uri: article.image }} style={styles.storyHeroImage} resizeMode="cover" />
                  {article.mediaType === 'Video' ? (
                    <View style={styles.storyVideoPlayOverlay}>
                      <Ionicons name="play-circle" size={58} color="#ffffff" />
                    </View>
                  ) : null}
                </View>

                <View style={styles.storyStatsRow}>
                  <View style={styles.storyStatItem}>
                    <Ionicons name="eye-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>{article.views} Views</Text>
                  </View>
                  <View style={styles.storyStatItem}>
                    <Ionicons name="heart-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>{article.likes} Likes</Text>
                  </View>
                  <View style={styles.storyStatItem}>
                    <Ionicons name="chatbubble-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>{article.comments} Comments</Text>
                  </View>
                  <View style={styles.storyStatItem}>
                    <Ionicons name="share-social-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>{article.shares} Shares</Text>
                  </View>
                </View>

                <View style={styles.articleBodyWrap}>
                  {articleParagraphs.map((paragraph, index) => (
                    <Text
                      key={`${paragraph.slice(0, 20)}-${index}`}
                      style={[
                        styles.articleBodyParagraph,
                        index === articleParagraphs.length - 1 && styles.articleBodyParagraphLast,
                      ]}
                    >
                      {paragraph}
                    </Text>
                  ))}
                </View>

                {article.images.length > 1 ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.galleryRow}>
                        {article.images.slice(1).map((imageUrl, index) => (
                          <Image
                            key={`${imageUrl}-${index}`}
                            source={{ uri: imageUrl }}
                            style={styles.galleryImage}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}

                {article.video ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Video</Text>
                    <VideoPreview uri={article.video} style={styles.videoPreview} contentFit="contain" />
                  </View>
                ) : null}

                {article.file?.uri ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Attachment</Text>
                    <TouchableOpacity
                      style={styles.attachmentButton}
                      onPress={handleOpenAttachment}
                      activeOpacity={0.84}
                    >
                      <Ionicons name="document-attach-outline" size={18} color="#ffffff" />
                      <Text style={styles.attachmentButtonText}>
                        {article.file?.name || 'Open Attachment'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <AppFooter navigation={navigation} />
        </View>
      </ScrollView>

      {!IS_WEB ? <AppNavbar navigation={navigation} activeScreen={null} /> : null}
    </View>
  );

  return IS_WEB ? <WebLayout>{page}</WebLayout> : page;
}

const styles = StyleSheet.create({
  screenShell: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  pageScrollView: {
    flex: 1,
  },
  pageScrollContent: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  pageScrollContentWithMobileNav: {
    paddingBottom: 110,
  },
  pageBodyShell: {
    paddingHorizontal: 16,
    paddingTop: 0,
    marginTop: -1,
    backgroundColor: '#ffffff',
  },
  pageBodyInner: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingTop: 18,
  },
  pageBodyInnerCompact: {
    flexDirection: 'column',
  },
  storyColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  sidebarColumn: {
    width: 320,
    gap: 18,
  },
  sidebarColumnCompact: {
    width: '100%',
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  utilityRowCompact: {
    alignItems: 'stretch',
  },
  utilityChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3ee',
  },
  backButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  utilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  utilityChipText: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '800',
  },
  storyCardShell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: {
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
    }),
  },
  storyCardShellCompact: {
    padding: 0,
  },
  storyAuthorRow: {
    marginBottom: 14,
  },
  storyAuthorIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyAuthorAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  storyAuthorTextWrap: {
    flex: 1,
  },
  storyAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  storyAuthorName: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
  },
  storyAuthorRoleText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  storyHeadlineText: {
    color: '#0f172a',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
    fontFamily: Platform.select({
      web: 'Georgia, "Times New Roman", serif',
      ios: 'Georgia',
      android: 'serif',
      default: undefined,
    }),
  },
  storyHeadlineTextCompact: {
    fontSize: 24,
    lineHeight: 32,
  },
  storyExcerptText: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
  },
  storyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  storyMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  storyMetaPillText: {
    color: '#7c2d12',
    fontSize: 12,
    fontWeight: '700',
  },
  storyHeroImageWrap: {
    marginTop: 18,
    height: 520,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  storyHeroImageWrapCompact: {
    height: 280,
  },
  storyHeroImage: {
    width: '100%',
    height: '100%',
  },
  storyVideoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.14)',
  },
  storyStatsRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  storyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyStatText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  articleBodyWrap: {
    marginTop: 24,
  },
  articleBodyParagraph: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 30,
    marginBottom: 18,
  },
  articleBodyParagraphLast: {
    marginBottom: 0,
  },
  storyBodySection: {
    marginTop: 22,
  },
  storyBodyTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  storyBodyText: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 26,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryImage: {
    width: 190,
    height: 130,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  videoPreview: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    backgroundColor: '#0f172a',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  attachmentButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  sidebarInfoCard: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe3ee',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)' },
      default: {
        elevation: 4,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
    }),
  },
  sidebarInfoEyebrow: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sidebarInfoTitle: {
    color: '#0f172a',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '900',
  },
  sidebarInfoDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  sidebarPrimaryButton: {
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sidebarPrimaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  sidebarSecondaryButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sidebarSecondaryButtonText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '800',
  },
  sidebarDetailList: {
    marginTop: 12,
    gap: 12,
  },
  sidebarDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  sidebarDetailLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  sidebarDetailValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    flexShrink: 1,
  },
});
