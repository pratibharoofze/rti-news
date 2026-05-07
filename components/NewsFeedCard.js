import React, { useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Platform, Share, TextInput, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLOR_MAP, EDITORIAL_FONT_FAMILY } from '../constants/homeData';
import { isValidImageUrl, buildPlaceholderImage, getLocalizedCategoryLabel, getLocalizedSeatLabel } from '../utils/storyHelpers';

const DEFAULT_AVATAR_IMAGE = require('../assets/images/icon.png');

export default function NewsFeedCard({
  story,
  isCompactLayout,
  onOpenDetails,
  onOpenLocation,
  onOpenCategory,
  onOpenAuthorProfile,
  commonCopy,
  currentUser,   // ✅ logged-in user — { name, avatar }
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Number(story.likes || 0));
  const [commentsCount, setCommentsCount] = useState(Number(story.comments || 0));
  const [sharesCount, setSharesCount] = useState(Number(story.shares || 0));
  const [viewsCount] = useState(Number(story.views || 0));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const inputRef = useRef(null);

  const safeImage = isValidImageUrl(story.image)
    ? story.image
    : buildPlaceholderImage(story.id || story.title);

  const categoryColor =
    CATEGORY_COLOR_MAP[(story.menuTags || []).find((tag) => tag !== 'latest') || 'latest'] ||
    CATEGORY_COLOR_MAP.latest;

  // User info helpers
  const userName = currentUser?.name || commonCopy?.you || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userAvatar = currentUser?.avatar || null;

  // ✅ LIKE
  const handleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikesCount((c) => c + (next ? 1 : -1));
      return next;
    });
  };

  // ✅ COMMENT — toggle section + auto focus
  const handleComment = () => {
    setShowComments((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  // ✅ COMMENT SUBMIT — user ka naam aur avatar
  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const newComment = {
      id: Date.now().toString(),
      text: trimmed,
      author: userName,
      authorInitial: userInitial,
      authorAvatar: userAvatar,
      time: 'Abhi',
    };

    setLocalComments((prev) => [newComment, ...prev]);
    setCommentsCount((c) => c + 1);
    setCommentText('');
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
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

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

        {/* ── Headline + Excerpt ── */}
        <TouchableOpacity
          style={styles.storyContentWrap}
          onPress={() => onOpenDetails(story)}
          activeOpacity={0.88}
        >
          <Text style={[styles.storyHeadlineText, isCompactLayout && styles.storyHeadlineTextCompact]}>
            {story.title}
          </Text>
          {story.excerpt
            ? <Text style={styles.storyExcerptText} numberOfLines={2}>{story.excerpt}</Text>
            : null}
        </TouchableOpacity>

        {/* ── View More + Category ── */}
        <View style={styles.storyTopActionRow}>
          <TouchableOpacity
            style={styles.storyViewMoreButton}
            onPress={() => onOpenDetails(story)}
            activeOpacity={0.84}
          >
            <Text style={styles.storyViewMoreText}>{commonCopy.viewAll}</Text>
            <Ionicons name="arrow-forward-outline" size={14} color="#e11d48" />
          </TouchableOpacity>
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

        {/* ── Hero Image ── */}
        <TouchableOpacity
          style={[styles.storyHeroImageWrap, isCompactLayout && styles.storyHeroImageWrapCompact]}
          onPress={() => onOpenDetails(story)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: safeImage }} style={styles.storyHeroImage} resizeMode="cover" />
          {(story.mediaType === 'Video' || Boolean(story.video)) ? (
            <View style={styles.storyVideoPlayOverlay}>
              <View style={styles.storyVideoPlayBadge}>
                <Ionicons name="play" size={22} color="#ffffff" />
              </View>
              <Text style={styles.storyVideoLabel}>{commonCopy.video}</Text>
            </View>
          ) : null}
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

            {/* Purane comments dekhne ka link */}
            {commentsCount > localComments.length && (
              <TouchableOpacity
                style={styles.viewAllComments}
                onPress={() => onOpenDetails(story)}
                activeOpacity={0.82}
              >
                <Text style={styles.viewAllCommentsText}>
                  Saare {commentsCount} comments dekhein →
                </Text>
              </TouchableOpacity>
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
  storyExcerptText: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 6 },
  storyTopActionRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  storyViewMoreButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyViewMoreText: { color: '#e11d48', fontSize: 13, fontWeight: '900', textDecorationLine: 'underline' },
  storyCategoryChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  storyCategoryChipText: { fontSize: 11, fontWeight: '800' },
  storyHeroImageWrap: { height: 148, borderRadius: 5, overflow: 'hidden', backgroundColor: '#e2e8f0' },
  storyHeroImageWrapCompact: { height: 136 },
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
  viewAllComments: { marginTop: 10, alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#eef2f7' },
  viewAllCommentsText: { color: '#0ea5e9', fontSize: 12, fontWeight: '700' },

  storyBottomMetaRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eef2f7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  storyBottomMetaText: { color: '#64748b', fontSize: 11, fontWeight: '600' },
});