import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Platform, Share, TextInput, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { CATEGORY_COLOR_MAP, EDITORIAL_FONT_FAMILY } from '../constants/homeData';
import { isValidImageUrl, buildPlaceholderImage, getLocalizedCategoryLabel, getLocalizedSeatLabel } from '../utils/storyHelpers';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';
import { UserStore } from '../store/UserStore';

const DEFAULT_AVATAR_IMAGE = require('../assets/images/icon.png');

function isPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return false;
  if (/(youtube\.com|youtu\.be)/i.test(uri)) return false;

  if (Platform.OS !== 'web') return true;
  if (/^(blob:|data:)/i.test(uri)) return true;

  return /^https?:/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
}

export default function NewsFeedCard({
  story,
  isCompactLayout,
  onOpenDetails,
  onOpenLocation,
  onOpenCategory,
  onOpenAuthorProfile,
  commonCopy,
  currentUser,
}) {
  const isScreenFocused = useIsFocused();
  const [currentEmail, setCurrentEmail] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(story.bookmarked));
  const [likesCount, setLikesCount] = useState(Number(story.likes || 0));
  const [commentsCount, setCommentsCount] = useState(Number(story.comments || 0));
  const [sharesCount, setSharesCount] = useState(Number(story.shares || 0));
  const [viewsCount] = useState(Number(story.views || 0));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await UserStore.getCurrentUser();
        if (!alive) return;
        const email = String(user?.email || '').trim().toLowerCase();
        setCurrentEmail(email);
      } catch {
        if (!alive) return;
        setCurrentEmail('');
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setLikesCount(Number(story.likes || 0));
    setCommentsCount(Number(story.comments || 0));
    setSharesCount(Number(story.shares || 0));
    setIsSaved(Boolean(story.bookmarked));
    const liked = Boolean(
      currentEmail
        && Array.isArray(story.liked_by)
        && story.liked_by.includes(currentEmail)
    );
    setIsLiked(liked);
  }, [currentEmail, story.bookmarked, story.comments, story.likes, story.liked_by, story.shares]);

  const safeImage = isValidImageUrl(story.image)
    ? story.image
    : buildPlaceholderImage(story.id || story.title);

  const categoryColor =
    CATEGORY_COLOR_MAP[(story.menuTags || []).find((tag) => tag !== 'latest') || 'latest'] ||
    CATEGORY_COLOR_MAP.latest;

  // User info helpers
  const userName = currentUser?.name || commonCopy?.you || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userAvatar = useMemo(() => {
    const avatar = String(currentUser?.avatar || '').trim();
    return isValidImageUrl(avatar) ? avatar : '';
  }, [currentUser?.avatar]);

  const videoUri = String(story.video || '').trim();
  const [resolvedVideoUri, setResolvedVideoUri] = useState(null);

  useEffect(() => {
    let alive = true;
    let objectUrl = null;

    (async () => {
      if (Platform.OS !== 'web') { setResolvedVideoUri(null); return; }
      if (!isIdbMediaUri(videoUri)) { setResolvedVideoUri(null); return; }
      const next = await resolveIdbMediaUriToObjectUrl(videoUri);
      if (!alive) return;
      objectUrl = next;
      setResolvedVideoUri(next);
    })();

    return () => {
      alive = false;
      try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch {}
    };
  }, [videoUri]);

  const effectiveVideoUri = useMemo(() => {
    if (Platform.OS === 'web' && isIdbMediaUri(videoUri)) return resolvedVideoUri || '';
    return videoUri;
  }, [resolvedVideoUri, videoUri]);

  const canPlayVideo = Boolean(effectiveVideoUri) && isPlayableVideoSource(effectiveVideoUri);
  const [videoPaused, setVideoPaused] = useState(true);
  const [showVideoPoster, setShowVideoPoster] = useState(true);
  const player = useVideoPlayer(canPlayVideo ? { uri: effectiveVideoUri } : null, (p) => { p.loop = false; });

  // Stop video when screen loses focus
  useEffect(() => {
    if (!isScreenFocused && player) {
      player.pause();
      setVideoPaused(true);
      setShowVideoPoster(true);
    }
  }, [isScreenFocused, player]);

  // Initial setup - video starts paused
  useEffect(() => {
    setVideoPaused(true);
    setShowVideoPoster(true);
    if (player) {
      player.pause();
    }
  }, [effectiveVideoUri, player]);

  // Handle play/pause based on videoPaused state
  useEffect(() => {
    if (!canPlayVideo || !player) return;
    if (videoPaused) {
      player.pause();
    } else {
      Promise.resolve(player.play()).catch(() => { 
        setVideoPaused(true); 
      });
    }
  }, [canPlayVideo, videoPaused, player]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { 
      if (player) {
        player.pause();
      }
    };
  }, [player]);

  // Handle video tap - toggle play/pause
  const handleVideoPress = () => {
    if (videoPaused) {
      setVideoPaused(false);
    } else {
      setVideoPaused(true);
    }
  };

  // Handle image tap - open details
  const handleImagePress = () => {
    onOpenDetails(story);
  };

  // ✅ LIKE
  const handleLike = async () => {
    const prev = isLiked;
    setIsLiked(!prev);
    setLikesCount((c) => c + (!prev ? 1 : -1));

    try {
      const result = await UserStore.updateNewsFeedItem(story.id, 'like');
      if (!result?.ok) {
        setIsLiked(prev);
        setLikesCount((c) => c + (prev ? 1 : -1));
        return;
      }
      if (typeof result.liked === 'boolean') {
        setIsLiked(result.liked);
      }
    } catch {
      setIsLiked(prev);
      setLikesCount((c) => c + (prev ? 1 : -1));
    }
  };

  // ✅ COMMENT — toggle section + auto focus
  const handleComment = async () => {
    setShowComments((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return next;
    });

    if (!showComments) {
      try {
        const summary = await UserStore.getNewsFeedSummary({ focusItemId: story.id });
        const item = Array.isArray(summary?.items) ? summary.items.find((it) => it.id === story.id) : null;
        const list = Array.isArray(item?.comments_list) ? item.comments_list : [];
        setLocalComments(list.map((c) => ({
          id: String(c.id || ''),
          text: String(c.text || ''),
          author: String(c.author || 'User'),
          authorInitial: String(c.author || 'U').charAt(0).toUpperCase(),
          authorAvatar: '',
          time: c.date || '',
        })));
        setCommentsCount(Number(item?.comments || commentsCount || 0));
      } catch {
        // ignore
      }
    }
  };

  // ✅ COMMENT SUBMIT — user ka naam aur avatar
  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const result = await UserStore.addNewsComment(story.id, trimmed);
      if (!result?.ok) return;
      const added = result.comment || {};
      const newComment = {
        id: String(added.id || Date.now().toString()),
        text: String(added.text || trimmed),
        author: String(added.author || userName),
        authorInitial: String(added.author || userName).charAt(0).toUpperCase(),
        authorAvatar: userAvatar,
        time: added.date || 'Now',
      };
      setLocalComments((prev) => [newComment, ...prev]);
      setCommentsCount((c) => c + 1);
      setCommentText('');
    } catch {
      // ignore
    }
  };

  // ✅ SHARE — WhatsApp + sabhi platforms
  const handleShare = async () => {
    try {
      const shareMessage = `📰 ${story.title}\n\n${story.excerpt || ''}\n\n🔗 ${story.url || 'https://rtinews.in'}\n\nRTI News App se padhe`;

      const result = await Share.share(
        {
          title: story.title,
          message: shareMessage,
          url: story.url || 'https://rtinews.in',
        },
        {
          subject: story.title,
          dialogTitle: 'Share karo',
        }
      );

      if (result.action === Share.sharedAction) {
        setSharesCount((c) => c + 1);
        try { await UserStore.updateNewsFeedItem(story.id, 'share'); } catch { /* noop */ }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = async () => {
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const result = await UserStore.updateNewsFeedItem(story.id, 'bookmark');
      if (!result?.ok) { setIsSaved(prev); return; }
      if (typeof result.bookmarked === 'boolean') setIsSaved(result.bookmarked);
    } catch {
      setIsSaved(prev);
    }
  };

  const hasExpandableContent = Boolean(story.excerpt || story.description);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.storyCardShell, isCompactLayout && styles.storyCardShellCompact]}>

        {/* ── Author Row ── */}
        <View style={styles.storyAuthorRow}>
          <TouchableOpacity
            style={styles.storyAuthorIdentity}
            onPress={() => onOpenAuthorProfile(story)}
            activeOpacity={0.86}
          >
            <Image
              source={
                isValidImageUrl(story.author_profile_image)
                  ? { uri: story.author_profile_image }
                  : DEFAULT_AVATAR_IMAGE
              }
              style={styles.storyAuthorAvatar}
            />
            <View style={styles.storyAuthorTextWrap}>
              <View style={styles.storyAuthorNameRow}>
                <Text style={styles.storyAuthorName}>{story.author_name}</Text>
                {story.author_is_premium
                  ? <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
                  : null}
              </View>
              <View style={styles.storyAuthorMetaRow}>
                <View style={styles.storyReporterPill}>
                  <Text style={styles.storyReporterPillText}>
                    {getLocalizedSeatLabel(story.author_seat_name, commonCopy)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => onOpenLocation(story.state)} activeOpacity={0.82}>
                  <Text style={styles.storyLocationText}>
                    {story.district ? `${story.district}, ${story.state}` : story.state}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.storyPublishedText}>{story.publishedAgo || story.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Headline + Excerpt + Full Description ── */}
        <View style={styles.storyContentWrap}>
          <TouchableOpacity onPress={() => onOpenDetails(story)} activeOpacity={0.88}>
            <Text style={[styles.storyHeadlineText, isCompactLayout && styles.storyHeadlineTextCompact]}>
              {story.title}
            </Text>

            {/* Subtitle - if available */}
            {story.subtitle ? (
              <Text style={styles.storySubtitleText} numberOfLines={2}>
                {story.subtitle}
              </Text>
            ) : null}
          </TouchableOpacity>

          {/* Excerpt — always show, clamp when collapsed */}
          {story.excerpt ? (
            <Text
              style={styles.storyExcerptText}
              numberOfLines={isDescExpanded ? undefined : 3}
            >
              {story.excerpt}
            </Text>
          ) : null}

          {/* Description — only show when expanded */}
          {isDescExpanded && story.description && story.description !== story.excerpt ? (
            <Text style={styles.storyDescriptionText}>
              {story.description}
            </Text>
          ) : null}

          {/* More / Less toggle */}
          {hasExpandableContent && (
            <TouchableOpacity
              style={styles.moreLessBtn}
              onPress={() => setIsDescExpanded((prev) => !prev)}
              activeOpacity={0.75}
            >
              <Text style={styles.moreLessBtnText}>
                {isDescExpanded ? (commonCopy?.less || 'Less') : (commonCopy?.more || 'More')}
              </Text>
              <Ionicons
                name={isDescExpanded ? 'chevron-up' : 'chevron-down'}
                size={13}
                color="#e11d48"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category ── */}
        <View style={styles.storyTopActionRow}>
          <TouchableOpacity
            style={[styles.storyCategoryChip, { backgroundColor: `${categoryColor}14`, borderColor: `${categoryColor}40` }]}
            onPress={() => onOpenCategory(story)}
            activeOpacity={0.84}
          >
            <Text style={[styles.storyCategoryChipText, { color: categoryColor }]}>
              {getLocalizedCategoryLabel(story.category, commonCopy)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero Image / Video ── */}
        <TouchableOpacity
          style={[styles.storyHeroImageWrap, isCompactLayout && styles.storyHeroImageWrapCompact]}
          onPress={canPlayVideo ? handleVideoPress : handleImagePress}
          activeOpacity={0.9}
        >
          {canPlayVideo ? (
            <>
              <VideoView
                player={player}
                style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
                playsInline
                onFirstFrameRender={() => setShowVideoPoster(false)}
              />
              {showVideoPoster || videoPaused ? (
                <Image source={{ uri: safeImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : null}
              {videoPaused ? (
                <View style={styles.storyVideoPlayOverlay}>
                  <View style={styles.storyVideoPlayBadge}>
                    <Ionicons name="play" size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.storyVideoLabel}>{commonCopy.video || 'VIDEO'}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Image source={{ uri: safeImage }} style={styles.storyHeroImage} resizeMode="cover" />
          )}
        </TouchableOpacity>

        {/* ── Stats Row ── */}
        <View style={styles.storyStatsRow}>
          <View style={styles.storyStatsLeftGroup}>
            <View style={styles.storyStatItem}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={15}
                color={isLiked ? '#e11d48' : '#111827'}
              />
              <Text style={styles.storyStatText}>{likesCount} {commonCopy.likes}</Text>
            </View>
            <View style={styles.storyStatItem}>
              <Ionicons name="eye-outline" size={15} color="#111827" />
              <Text style={styles.storyStatText}>{viewsCount} {commonCopy.views}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.storyPostLink}
            onPress={() => onOpenDetails(story)}
            activeOpacity={0.82}
          >
            <Ionicons name="open-outline" size={15} color="#111827" />
            <Text style={styles.storyPostLinkText}>{commonCopy.viewPost}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.storyActionButtonsRow}>

          {/* Like */}
          <TouchableOpacity
            style={[styles.storyActionButton, isLiked && styles.storyActionButtonLiked]}
            onPress={handleLike}
            activeOpacity={0.82}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={17}
              color={isLiked ? '#e11d48' : '#64748b'}
            />
            <Text style={[styles.storyActionButtonText, isLiked && styles.storyActionButtonTextLiked]}>
              {commonCopy.like}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity
            style={[styles.storyActionButton, showComments && styles.storyActionButtonActive]}
            onPress={handleComment}
            activeOpacity={0.82}
          >
            <Ionicons
              name={showComments ? 'chatbubble' : 'chatbubble-outline'}
              size={17}
              color={showComments ? '#0ea5e9' : '#64748b'}
            />
            <Text style={[styles.storyActionButtonText, showComments && styles.storyActionButtonTextActive]}>
              {commonCopy.comment}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.storyActionButton}
            onPress={handleShare}
            activeOpacity={0.82}
          >
            <Ionicons name="share-social-outline" size={17} color="#64748b" />
            <Text style={styles.storyActionButtonText}>{commonCopy.share}</Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            style={[styles.storyActionButton, isSaved && styles.storyActionButtonActive]}
            onPress={handleSave}
            activeOpacity={0.82}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={17}
              color={isSaved ? '#0ea5e9' : '#64748b'}
            />
            <Text style={[styles.storyActionButtonText, isSaved && styles.storyActionButtonTextActive]}>
              {commonCopy?.save || 'Save'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* ── Comment Section ── */}
        {showComments && (
          <View style={styles.commentSection}>

            {/* Input Row */}
            <View style={styles.commentInputRow}>

              {/* Logged-in user ka avatar */}
              <View style={styles.commentUserAvatar}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.commentUserAvatarImg} />
                ) : (
                  <Text style={styles.commentUserAvatarText}>{userInitial}</Text>
                )}
              </View>

              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder={commonCopy?.writeComment || 'Comment likhein...'}
                placeholderTextColor="#94a3b8"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={300}
                returnKeyType="send"
                blurOnSubmit={true}
                onSubmitEditing={handleSubmitComment}
              />

              <TouchableOpacity
                style={[
                  styles.commentSendBtn,
                  !commentText.trim() && styles.commentSendBtnDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="send"
                  size={16}
                  color={commentText.trim() ? '#ffffff' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>

            {/* Local Comments */}
            {localComments.length > 0 && (
              <View style={styles.commentsList}>
                {localComments.map((item) => (
                  <View key={item.id} style={styles.commentItem}>

                    {/* Comment karne wale user ka avatar */}
                    <View style={styles.commentAvatar}>
                      {item.authorAvatar ? (
                        <Image
                          source={{ uri: item.authorAvatar }}
                          style={styles.commentAvatarImg}
                        />
                      ) : (
                        <Text style={styles.commentAvatarText}>{item.authorInitial}</Text>
                      )}
                    </View>

                    <View style={styles.commentBubble}>
                      <Text style={styles.commentAuthor}>{item.author}</Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                      <Text style={styles.commentTime}>{item.time}</Text>
                    </View>

                  </View>
                ))}
              </View>
            )}

          </View>
        )}

        {/* ── Bottom Meta ── */}
        <View style={styles.storyBottomMetaRow}>
          <Text style={styles.storyBottomMetaText}>
            {commonCopy.comments} {commentsCount} | {commonCopy.shares} {sharesCount}
          </Text>
          <Text style={styles.storyBottomMetaText}>{story.date}</Text>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  storyCardShell: {
    borderRadius: 5, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ee', padding: 10,
    ...Platform.select({
      web: { boxShadow: '0 8px 20px rgba(15, 23, 42, 0.07)' },
      default: { elevation: 3, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 },
    }),
  },
  storyCardShellCompact: { padding: 10 },
  storyAuthorRow: { marginBottom: 10 },
  storyAuthorIdentity: { flexDirection: 'row', alignItems: 'center' },
  storyAuthorAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#e2e8f0' },
  storyAuthorTextWrap: { flex: 1 },
  storyAuthorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  storyAuthorName: { color: '#334155', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  storyAuthorMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  storyReporterPill: { borderRadius: 999, backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 3 },
  storyReporterPillText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },
  storyLocationText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  storyPublishedText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  storyContentWrap: { marginBottom: 10 },
  storyHeadlineText: { color: '#1e293b', fontSize: 18, lineHeight: 25, fontWeight: '900', fontFamily: EDITORIAL_FONT_FAMILY },
  storyHeadlineTextCompact: { fontSize: 16, lineHeight: 23 },
  storySubtitleText: { color: '#475569', fontSize: 14, fontWeight: '600', lineHeight: 20, marginTop: 4, fontFamily: EDITORIAL_FONT_FAMILY },
  storyExcerptText: { color: '#64748b', fontSize: 13, lineHeight: 19, marginTop: 6 },
  storyDescriptionText: { color: '#334155', fontSize: 13, lineHeight: 19, marginTop: 4 },
  moreLessBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6, alignSelf: 'flex-start' },
  moreLessBtnText: { color: '#e11d48', fontSize: 12, fontWeight: '800' },
  storyTopActionRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  storyCategoryChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  storyCategoryChipText: { fontSize: 11, fontWeight: '800' },
  storyHeroImageWrap: { height: 520, borderRadius: 5, overflow: 'hidden', backgroundColor: '#e2e8f0' },
storyHeroImageWrapCompact: { height: 200 },
  storyHeroImage: { width: '100%', height: '100%' },
  storyVideoPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.38)', gap: 8 },
  storyVideoPlayBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(225, 29, 72, 0.9)', alignItems: 'center', justifyContent: 'center' },
  storyVideoLabel: { color: '#ffffff', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  storyStatsRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  storyStatsLeftGroup: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  storyStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  storyStatText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  storyPostLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyPostLinkText: { color: '#111827', fontSize: 12, fontWeight: '700' },
  storyActionButtonsRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  storyActionButton: { flex: 1, minWidth: 100, borderRadius: 16, borderWidth: 1, borderColor: '#dbe3ee', paddingVertical: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  storyActionButtonLiked: { borderColor: '#fecdd3', backgroundColor: '#fff1f2' },
  storyActionButtonActive: { borderColor: '#bae6fd', backgroundColor: '#f0f9ff' },
  storyActionButtonText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  storyActionButtonTextLiked: { color: '#e11d48' },
  storyActionButtonTextActive: { color: '#0ea5e9' },

  // Comment Section
  commentSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#eef2f7', paddingTop: 12 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  commentUserAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentUserAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  commentUserAvatarText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1e293b', backgroundColor: '#f8fafc', maxHeight: 80, minHeight: 40 },
  commentSendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e11d48', alignItems: 'center', justifyContent: 'center' },
  commentSendBtnDisabled: { backgroundColor: '#e2e8f0' },
  commentsList: { gap: 10 },
  commentItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  commentAvatarText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  commentBubble: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 },
  commentAuthor: { color: '#334155', fontSize: 11, fontWeight: '800', marginBottom: 2 },
  commentText: { color: '#1e293b', fontSize: 13, lineHeight: 18 },
  commentTime: { color: '#94a3b8', fontSize: 10, marginTop: 4 },

  storyBottomMetaRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eef2f7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  storyBottomMetaText: { color: '#64748b', fontSize: 11, fontWeight: '600' },
});