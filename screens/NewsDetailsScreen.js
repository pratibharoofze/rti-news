import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
  Alert,
  Share,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import { VideoView, useVideoPlayer } from 'expo-video';
import { UserStore } from '../store/UserStore';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';


const IS_WEB = Platform.OS === 'web';
const DEFAULT_AVATAR_IMAGE = require('../assets/images/icon.png');

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ✅ FIXED: blob:, data:, idb-media: sab valid hain
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url === 'null' || url === 'undefined') return false;
  if (url.startsWith('idb-media:')) return true;   // IndexedDB media
  if (url.startsWith('blob:')) return true;          // resolved object URLs
  if (url.startsWith('data:image')) return true;     // base64 images
  if (url.startsWith('http://localhost')) return false;
  if (url.startsWith('https://') || url.startsWith('http://')) return true;
  return false;
}

function isPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return false;
  if (/(youtube\.com|youtu\.be)/i.test(uri)) return false;

  if (Platform.OS !== 'web') return true;
  if (/^(blob:|data:)/i.test(uri)) return true;
  if (isIdbMediaUri(uri)) return true;

  return /^https?:/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
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

  // ✅ idb-media: URLs ko bhi valid maano — placeholder mat lagao
  const rawImage =
    (Array.isArray(article.images) ? article.images.find((u) => u && String(u).trim()) : '') ||
    article.image ||
    '';

  const safeImage = rawImage && rawImage !== 'null' && rawImage !== 'undefined'
    ? rawImage
    : buildPlaceholderImage(article.id || article.title);

  // ✅ Gallery: idb-media: URIs bhi include karo (resolve baad mein hoga)
  const galleryImages = Array.isArray(article.images)
    ? article.images.filter((u) => u && String(u).trim() && u !== 'null' && u !== 'undefined')
    : [safeImage];

  return {
    id: article.id || 'news-details-fallback',
    title: article.title || 'News Details',
    subtitle: stripHtml(article.subtitle || ''),
    excerpt: stripHtml(article.excerpt || article.subtitle || article.description || ''),
    description: stripHtml(article.description || article.excerpt || article.subtitle || ''),
    category: article.category || 'Latest News',
    menuTags: Array.isArray(article.menuTags) ? article.menuTags : ['latest'],
    state: article.state || '',
    district: article.district || '',
    taluka: article.taluka || '',
    author_name: article.author_name || article.author || 'RTI Desk',
    author_id: article.author_id || article.userId || article.id || 'unknown',
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
  const descriptionText = String(article.description || '').trim();
  const excerptText = String(article.excerpt || '').trim();
  const subtitleText = String(article.subtitle || '').trim();
  const sourceText = descriptionText || excerptText || subtitleText;

  if (!sourceText) return ['Detailed text is not available for this story yet.'];

  const paragraphs = sourceText
    .split(/\n{2,}|\r\n\r\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;

  return [sourceText];
}

function normalizeComment(rawComment) {
  const comment = rawComment || {};
  const author = String(comment.author || comment.user || 'User').trim() || 'User';
  const authorEmail = String(comment.author_email || comment.user_email || '').trim().toLowerCase();
  const authorAvatar = String(comment.authorAvatar || comment.author_avatar || comment.userAvatar || '').trim();

  return {
    id: String(comment.id || ''),
    text: String(comment.text || '').trim(),
    author,
    author_email: authorEmail,
    authorAvatar,
    authorInitial: author.charAt(0).toUpperCase(),
    time: String(comment.date || comment.timestamp || comment.created_at || ''),
    edited_at: comment.edited_at || null,
    likes: Number(comment.likes || 0),
    liked_by: Array.isArray(comment.liked_by) ? comment.liked_by : [],
    replies: Array.isArray(comment.replies) ? comment.replies.map(normalizeComment) : [],
  };
}

function isCommentOwner(comment, currentUserEmail, currentUserName) {
  const ownerEmail = String(comment?.author_email || '').trim().toLowerCase();
  const ownerName = String(comment?.author || '').trim().toLowerCase();
  const safeUserEmail = String(currentUserEmail || '').trim().toLowerCase();
  const safeUserName = String(currentUserName || '').trim().toLowerCase();

  if (ownerEmail && safeUserEmail) return ownerEmail === safeUserEmail;
  if (!ownerEmail && safeUserName) return ownerName === safeUserName;
  return false;
}

// ✅ NEW: idb-media: URI ko blob: URL mein resolve karne wala hook
function useResolvedImageUri(rawUri) {
  const [resolved, setResolved] = useState(null);

  useEffect(() => {
    let alive = true;
    let objectUrl = null;

    (async () => {
      if (!rawUri) { setResolved(null); return; }

      // Already a usable URL
      if (!isIdbMediaUri(rawUri)) {
        setResolved(rawUri);
        return;
      }

      // Resolve idb-media: → blob:
      const next = await resolveIdbMediaUriToObjectUrl(rawUri);
      if (!alive) return;
      objectUrl = next;
      setResolved(next || null);
    })();

    return () => {
      alive = false;
      try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch {}
    };
  }, [rawUri]);

  return resolved;
}

function CommentThreadItem({
  comment,
  currentUserEmail,
  currentUserName,
  editingCommentId,
  editingCommentText,
  onStartEdit,
  onEditingTextChange,
  onSubmitEdit,
  onCancelEdit,
  replyingToCommentId,
  replyText,
  onStartReply,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
  onDelete,
  onLike,
  onOpenProfile,
  formatCommentTime,
  isReply = false,
}) {
  const isOwner = isCommentOwner(comment, currentUserEmail, currentUserName);
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isLiked = Boolean(
    currentUserEmail
      && Array.isArray(comment.liked_by)
      && comment.liked_by.includes(currentUserEmail)
  );

  return (
    <View style={[styles.commentItem, isReply && styles.commentReplyItem]}>
      <TouchableOpacity
        onPress={() => onOpenProfile(comment.author, comment.authorAvatar, comment.author_email || comment.id)}
        activeOpacity={0.7}
      >
        <View style={styles.commentAvatar}>
          {comment.authorAvatar ? (
            <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatarImage} />
          ) : (
            <View style={styles.commentAvatarPlaceholder}>
              <Text style={styles.commentAvatarText}>{comment.authorInitial}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => onOpenProfile(comment.author, comment.authorAvatar, comment.author_email || comment.id)}>
              <Text style={styles.commentUserName}>{comment.author}</Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>
              {formatCommentTime(comment.time)}
              {comment.edited_at ? ' | Edited' : ''}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.commentEditorWrap}>
              <TextInput
                style={styles.commentEditInput}
                placeholder="Edit comment..."
                placeholderTextColor="#94a3b8"
                value={editingCommentText}
                onChangeText={onEditingTextChange}
                multiline
                maxLength={500}
              />
              <View style={styles.commentInlineActions}>
                <TouchableOpacity style={styles.commentPrimaryAction} onPress={onSubmitEdit} activeOpacity={0.82}>
                  <Text style={styles.commentPrimaryActionText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentSecondaryAction} onPress={onCancelEdit} activeOpacity={0.82}>
                  <Text style={styles.commentSecondaryActionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.commentText}>{comment.text}</Text>
          )}
        </View>

        {!isEditing ? (
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => onLike(comment.id)} style={styles.commentActionButton} activeOpacity={0.82}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={16}
                color={isLiked ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.commentActionText, isLiked && styles.commentActionTextLiked]}>
                {comment.likes > 0 ? `${comment.likes} Likes` : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onStartReply(comment.id)} style={styles.commentActionButton} activeOpacity={0.82}>
              <Ionicons name="return-up-forward-outline" size={16} color="#64748b" />
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>

            {isOwner ? (
              <TouchableOpacity onPress={() => onStartEdit(comment.id, comment.text)} style={styles.commentActionButton} activeOpacity={0.82}>
                <Ionicons name="create-outline" size={16} color="#64748b" />
                <Text style={styles.commentActionText}>Edit</Text>
              </TouchableOpacity>
            ) : null}

            {isOwner ? (
              <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.commentActionButton} activeOpacity={0.82}>
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={[styles.commentActionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {isReplying ? (
          <View style={styles.replyComposerWrap}>
            <TextInput
              style={styles.replyInput}
              placeholder={`Reply to ${comment.author}...`}
              placeholderTextColor="#94a3b8"
              value={replyText}
              onChangeText={onReplyTextChange}
              multiline
              maxLength={500}
            />
            <View style={styles.commentInlineActions}>
              <TouchableOpacity style={styles.commentPrimaryAction} onPress={onSubmitReply} activeOpacity={0.82}>
                <Text style={styles.commentPrimaryActionText}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentSecondaryAction} onPress={onCancelReply} activeOpacity={0.82}>
                <Text style={styles.commentSecondaryActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {Array.isArray(comment.replies) && comment.replies.length > 0 ? (
          <View style={styles.commentReplies}>
            {comment.replies.map((reply) => (
              <CommentThreadItem
                key={reply.id}
                comment={reply}
                currentUserEmail={currentUserEmail}
                currentUserName={currentUserName}
                editingCommentId={editingCommentId}
                editingCommentText={editingCommentText}
                onStartEdit={onStartEdit}
                onEditingTextChange={onEditingTextChange}
                onSubmitEdit={onSubmitEdit}
                onCancelEdit={onCancelEdit}
                replyingToCommentId={replyingToCommentId}
                replyText={replyText}
                onStartReply={onStartReply}
                onReplyTextChange={onReplyTextChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                onDelete={onDelete}
                onLike={onLike}
                onOpenProfile={onOpenProfile}
                formatCommentTime={formatCommentTime}
                isReply={true}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function NewsDetailsScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isCompactLayout = !IS_WEB || width < 980;

  const routeArticle = route?.params?.article || null;
  const initialArticle = useMemo(() => normalizeArticle(routeArticle), [routeArticle]);

  const [article, setArticle] = useState(initialArticle);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialArticle.likes);
  const [commentCount, setCommentCount] = useState(initialArticle.comments);
  const [shareCount, setShareCount] = useState(initialArticle.shares);
  const [viewCount, setViewCount] = useState(initialArticle.views);
  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ✅ Resolve hero image URI (handles idb-media: → blob:)
  const resolvedHeroImage = useResolvedImageUri(article.image);
  // ✅ Resolve author profile image
  const resolvedAuthorImage = useResolvedImageUri(article.author_profile_image);

  const currentUserEmail = useMemo(
    () => String(currentUser?.email || '').trim().toLowerCase(),
    [currentUser?.email]
  );
  const currentUserName = useMemo(
    () => String(currentUser?.name || currentUser?.full_name || currentUser?.username || '').trim(),
    [currentUser?.full_name, currentUser?.name, currentUser?.username]
  );
  const articleId = String(routeArticle?.id || initialArticle.id || '').trim();

  const loadArticleDetails = useCallback(async () => {
    const fallbackArticle = normalizeArticle(route?.params?.article);
    setArticle(fallbackArticle);
    setLikeCount(fallbackArticle.likes);
    setCommentCount(fallbackArticle.comments);
    setShareCount(fallbackArticle.shares);
    setViewCount(fallbackArticle.views);

    try {
      const [user, summary] = await Promise.all([
        UserStore.getCurrentUser(),
        articleId ? UserStore.getNewsFeedSummary({ focusItemId: articleId }) : Promise.resolve(null),
      ]);

      setCurrentUser(user || null);

      const matchedItem = articleId && Array.isArray(summary?.items)
        ? summary.items.find((item) => String(item.id || '') === articleId)
        : null;

      if (!matchedItem) {
        const likedFallback = Boolean(
          user?.email
            && Array.isArray(route?.params?.article?.liked_by)
            && route.params.article.liked_by.includes(String(user.email).trim().toLowerCase())
        );
        setIsLiked(likedFallback);
        setComments([]);
        return;
      }

      const mergedArticle = normalizeArticle({
        ...route?.params?.article,
        ...matchedItem,
      });
      const likedByCurrentUser = Boolean(
        user?.email
          && Array.isArray(matchedItem.liked_by)
          && matchedItem.liked_by.includes(String(user.email).trim().toLowerCase())
      );

      setArticle(mergedArticle);
      setIsLiked(likedByCurrentUser);
      setLikeCount(Number(matchedItem.likes || 0));
      setCommentCount(Number(matchedItem.comments || 0));
      setShareCount(Number(matchedItem.shares || 0));
      setViewCount(Number(matchedItem.views || 0));
      setComments(
        Array.isArray(matchedItem.comments_list)
          ? matchedItem.comments_list.map(normalizeComment)
          : []
      );
    } catch {
      setCurrentUser(null);
      setComments([]);
      setIsLiked(false);
    }
  }, [articleId, route?.params?.article]);

  useEffect(() => {
    setArticle(initialArticle);
    setLikeCount(initialArticle.likes);
    setCommentCount(initialArticle.comments);
    setShareCount(initialArticle.shares);
    setViewCount(initialArticle.views);
  }, [initialArticle]);

  useEffect(() => {
    loadArticleDetails();
  }, [loadArticleDetails]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadArticleDetails);
    return unsubscribe;
  }, [loadArticleDetails, navigation]);

  const locationLabel = useMemo(() => buildLocationLabel(article), [article]);
  const articleParagraphs = useMemo(() => buildArticleParagraphs(article), [article]);
  const activeCategoryTag = useMemo(
    () => (article.menuTags || []).find((tag) => tag !== 'latest') || 'latest',
    [article.menuTags]
  );

  const videoUri = String(article.video || '').trim();
  const [resolvedVideoUri, setResolvedVideoUri] = useState(null);
  
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoPoster, setShowVideoPoster] = useState(true);

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
  
  const player = useVideoPlayer(canPlayVideo ? { uri: effectiveVideoUri } : null, (p) => {
    p.loop = false;
    p.play();
    setTimeout(() => { if (p) p.pause(); }, 0);
  });

  const handleVideoPress = useCallback(() => {
    if (!player) return;
    if (isVideoPlaying) {
      player.pause();
      setIsVideoPlaying(false);
    } else {
      player.play();
      setIsVideoPlaying(true);
      setShowVideoPoster(false);
    }
  }, [player, isVideoPlaying]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (player) { player.pause(); setIsVideoPlaying(false); }
    });
    return unsubscribe;
  }, [navigation, player]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      if (player) { player.pause(); setIsVideoPlaying(false); }
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setShowVideoPoster(true);
    });
    return () => { unsubscribeBlur(); unsubscribeFocus(); };
  }, [navigation, player]);

  useEffect(() => {
    return () => { if (player) player.pause(); };
  }, [player]);

  const handleNavigateToUserProfile = useCallback(() => {
    if (!article.author_name) { Alert.alert('Error', 'Author information not available'); return; }
    try {
      navigation?.navigate('UserPublicProfile', {
        userData: {
          name: article.author_name,
          profile_image: article.author_profile_image,
          seat_name: article.author_seat_name,
          role_label: article.author_role_label,
          is_premium: article.author_is_premium,
        },
        userId: article.author_id,
      });
    } catch { Alert.alert('Error', 'Unable to open profile'); }
  }, [navigation, article]);

  const handleNavigateToCommentUserProfile = useCallback((userName, userAvatar, userId) => {
    if (!userName) return;
    try {
      navigation?.navigate('UserPublicProfile', {
        userData: { name: userName, profile_image: userAvatar },
        userId: userId || userName,
      });
    } catch {}
  }, [navigation]);

  const handleLike = useCallback(async () => {
    const result = await UserStore.updateNewsFeedItem(article.id, 'like');
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not update like'); return; }
    await loadArticleDetails();
  }, [article.id, loadArticleDetails]);

  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.excerpt || ''}\n\nShared from RTI News App`,
        url: IS_WEB ? window.location.href : undefined,
      });
      const wasShared = Platform.OS === 'web' || result.action === Share.sharedAction;
      if (wasShared) {
        const shareResult = await UserStore.updateNewsFeedItem(article.id, 'share');
        if (shareResult?.ok) await loadArticleDetails();
      }
    } catch { Alert.alert('Error', 'Could not share this article'); }
  }, [article, loadArticleDetails]);

  const handleAddComment = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed) { Alert.alert('Error', 'Please enter a comment'); return; }
    const result = await UserStore.addNewsComment(article.id, trimmed);
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not add comment'); return; }
    setCommentText('');
    await loadArticleDetails();
  }, [article.id, commentText, loadArticleDetails]);

  const handleStartEditComment = useCallback((commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
    setReplyingToCommentId(null);
    setReplyText('');
  }, []);

  const handleCancelEditComment = useCallback(() => {
    setEditingCommentId(null);
    setEditingCommentText('');
  }, []);

  const handleSubmitEditComment = useCallback(async () => {
    const trimmed = editingCommentText.trim();
    if (!editingCommentId || !trimmed) return;
    const result = await UserStore.editNewsComment(article.id, editingCommentId, trimmed);
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not edit comment'); return; }
    setEditingCommentId(null);
    setEditingCommentText('');
    await loadArticleDetails();
  }, [article.id, editingCommentId, editingCommentText, loadArticleDetails]);

  const handleStartReplyComment = useCallback((commentId) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
    setEditingCommentId(null);
    setEditingCommentText('');
  }, []);

  const handleCancelReplyComment = useCallback(() => {
    setReplyingToCommentId(null);
    setReplyText('');
  }, []);

  const handleSubmitReplyComment = useCallback(async () => {
    const trimmed = replyText.trim();
    if (!replyingToCommentId || !trimmed) return;
    const result = await UserStore.replyNewsComment(article.id, replyingToCommentId, trimmed);
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not add reply'); return; }
    setReplyingToCommentId(null);
    setReplyText('');
    await loadArticleDetails();
  }, [article.id, loadArticleDetails, replyingToCommentId, replyText]);

  const handleLikeComment = useCallback(async (commentId) => {
    const result = await UserStore.likeNewsComment(article.id, commentId);
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not update comment like'); return; }
    await loadArticleDetails();
  }, [article.id, loadArticleDetails]);

  const handleDeleteComment = useCallback(async (commentId) => {
    const confirmed = IS_WEB
      ? window.confirm('Are you sure you want to delete this comment?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    const result = await UserStore.deleteNewsComment(article.id, commentId);
    if (!result?.ok) { Alert.alert('Error', result?.message || 'Could not delete comment'); return; }
    if (editingCommentId === commentId) { setEditingCommentId(null); setEditingCommentText(''); }
    if (replyingToCommentId === commentId) { setReplyingToCommentId(null); setReplyText(''); }
    await loadArticleDetails();
  }, [article.id, editingCommentId, loadArticleDetails, replyingToCommentId]);

  const handleOpenAttachment = useCallback(async () => {
    const fileUri = article?.file?.uri;
    if (!fileUri) return;
    try { await Linking.openURL(fileUri); } catch {}
  }, [article]);

  const handleOpenStateFeed = useCallback(() => {
    if (!article.state) return;
    navigation?.navigate?.('Home', {
      initialView: 'feed', initialMenuKey: 'latest', initialStateName: article.state,
    });
  }, [article.state, navigation]);

  const handleOpenCategoryFeed = useCallback(() => {
    navigation?.navigate?.('Home', {
      initialView: 'feed', initialMenuKey: activeCategoryTag, initialStateName: '',
    });
  }, [activeCategoryTag, navigation]);

  const formatCommentTime = useCallback((timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return String(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  const handleCloseCommentsModal = useCallback(() => {
    setShowCommentsModal(false);
    setEditingCommentId(null);
    setEditingCommentText('');
    setReplyingToCommentId(null);
    setReplyText('');
  }, []);

  // ✅ Determine what source to use for hero image display
  const heroImageSource = useMemo(() => {
    const uri = resolvedHeroImage || article.image;
    if (!uri || uri === 'null' || uri === 'undefined') return null;
    return { uri };
  }, [resolvedHeroImage, article.image]);

  // ✅ Determine author image source
  const authorImageSource = useMemo(() => {
    const uri = resolvedAuthorImage || article.author_profile_image;
    if (uri && isValidImageUrl(uri)) return { uri };
    return DEFAULT_AVATAR_IMAGE;
  }, [resolvedAuthorImage, article.author_profile_image]);

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
                    <TouchableOpacity style={styles.utilityChip} onPress={handleOpenStateFeed} activeOpacity={0.84}>
                      <Ionicons name="location-outline" size={16} color="#f97316" />
                      <Text style={styles.utilityChipText}>{article.state}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.utilityChip} onPress={handleOpenCategoryFeed} activeOpacity={0.84}>
                    <Ionicons name="albums-outline" size={16} color="#f97316" />
                    <Text style={styles.utilityChipText}>{article.category}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.storyCardShell, isCompactLayout && styles.storyCardShellCompact]}>
                {/* Author */}
                <View style={styles.storyAuthorRow}>
                  <TouchableOpacity
                    style={styles.storyAuthorIdentity}
                    onPress={handleNavigateToUserProfile}
                    activeOpacity={0.7}
                  >
                    {/* ✅ Uses resolved author image */}
                    <Image source={authorImageSource} style={styles.storyAuthorAvatar} />
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
                  </TouchableOpacity>
                </View>

                <Text style={[styles.storyHeadlineText, isCompactLayout && styles.storyHeadlineTextCompact]}>
                  {article.title}
                </Text>

                {article.subtitle && article.subtitle !== article.excerpt ? (
                  <Text style={styles.storySubtitleText}>{article.subtitle}</Text>
                ) : null}

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

                {/* ✅ Hero Image / Video — uses resolved URI */}
                <View style={[styles.storyHeroImageWrap, isCompactLayout && styles.storyHeroImageWrapCompact]}>
                  {canPlayVideo ? (
                    <TouchableOpacity style={styles.videoContainer} activeOpacity={1} onPress={handleVideoPress}>
                      <VideoView
                        player={player}
                        style={styles.videoView}
                        contentFit="cover"
                        nativeControls={false}
                        allowsFullscreen={true}
                        playsInline
                        onFirstFrameRender={() => { if (!isVideoPlaying) setShowVideoPoster(false); }}
                      />
                      {showVideoPoster && !isVideoPlaying ? (
                        <>
                          {heroImageSource ? (
                            <Image source={heroImageSource} style={styles.videoPoster} resizeMode="cover" />
                          ) : null}
                          <View style={styles.playButtonOverlay}>
                            <Ionicons name="play-circle" size={68} color="#ffffff" />
                            <Text style={styles.playButtonText}>Tap to Play</Text>
                          </View>
                        </>
                      ) : null}
                      {!isVideoPlaying && !showVideoPoster ? (
                        <View style={styles.playButtonOverlay}>
                          <Ionicons name="play-circle" size={68} color="#ffffff" />
                          <Text style={styles.playButtonText}>Tap to Play</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  ) : heroImageSource ? (
                    // ✅ Resolved URI se image show karo
                    <Image source={heroImageSource} style={styles.storyHeroImage} resizeMode="cover" />
                  ) : (
                    // Fallback: loading placeholder
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={48} color="#94a3b8" />
                      <Text style={styles.imagePlaceholderText}>Loading image...</Text>
                    </View>
                  )}
                </View>

                <View style={styles.storyStatsRow}>
                  <View style={styles.storyStatItem}>
                    <Ionicons name="eye-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>{viewCount.toLocaleString()} Views</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.storyStatItem} onPress={handleLike} activeOpacity={0.7}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#ef4444" : "#0f172a"}
                    />
                    <Text style={[styles.storyStatText, isLiked && styles.likedText]}>
                      {likeCount.toLocaleString()} {likeCount === 1 ? 'Like' : 'Likes'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.storyStatItem}
                    onPress={async () => { setShowCommentsModal(true); await loadArticleDetails(); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>
                      {commentCount.toLocaleString()} {commentCount === 1 ? 'Comment' : 'Comments'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.storyStatItem} onPress={handleShare} activeOpacity={0.7}>
                    <Ionicons name="share-social-outline" size={18} color="#0f172a" />
                    <Text style={styles.storyStatText}>
                      {shareCount.toLocaleString()} {shareCount === 1 ? 'Share' : 'Shares'}
                    </Text>
                  </TouchableOpacity>
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

                {/* ✅ Gallery — resolved URIs */}
                {article.images.length > 1 ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.galleryRow}>
                        {article.images.slice(1).map((imageUrl, index) => (
                          <GalleryImage key={`${imageUrl}-${index}`} rawUri={imageUrl} />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}

                {article.video && !canPlayVideo ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Video</Text>
                    <Text style={styles.storyBodyText}>
                      Video preview is not available for this link. Please try a direct MP4/WebM URL.
                    </Text>
                  </View>
                ) : null}

                {article.file?.uri ? (
                  <View style={styles.storyBodySection}>
                    <Text style={styles.storyBodyTitle}>Attachment</Text>
                    <TouchableOpacity style={styles.attachmentButton} onPress={handleOpenAttachment} activeOpacity={0.84}>
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

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseCommentsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseCommentsModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments ({commentCount})</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitCommentButton, !commentText.trim() && styles.submitCommentButtonDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitCommentText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList}>
            {comments.length === 0 ? (
              <View style={styles.noCommentsContainer}>
                <Ionicons name="chatbubble-outline" size={64} color="#cbd5e1" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment on this article</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentThreadItem
                  key={comment.id}
                  comment={comment}
                  currentUserEmail={currentUserEmail}
                  currentUserName={currentUserName}
                  editingCommentId={editingCommentId}
                  editingCommentText={editingCommentText}
                  onStartEdit={handleStartEditComment}
                  onEditingTextChange={setEditingCommentText}
                  onSubmitEdit={handleSubmitEditComment}
                  onCancelEdit={handleCancelEditComment}
                  replyingToCommentId={replyingToCommentId}
                  replyText={replyText}
                  onStartReply={handleStartReplyComment}
                  onReplyTextChange={setReplyText}
                  onSubmitReply={handleSubmitReplyComment}
                  onCancelReply={handleCancelReplyComment}
                  onDelete={handleDeleteComment}
                  onLike={handleLikeComment}
                  onOpenProfile={handleNavigateToCommentUserProfile}
                  formatCommentTime={formatCommentTime}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );

  return IS_WEB ? <WebLayout>{page}</WebLayout> : page;
}

// ✅ Gallery image component — resolves idb-media: URIs individually
function GalleryImage({ rawUri }) {
  const resolved = useResolvedImageUri(rawUri);
  if (!resolved) return null;
  return (
    <Image
      source={{ uri: resolved }}
      style={styles.galleryImage}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  screenShell: { flex: 1, backgroundColor: '#ffffff' },
  pageScrollView: { flex: 1 },
  pageScrollContent: { paddingTop: 0, paddingBottom: 24 },
  pageScrollContentWithMobileNav: { paddingBottom: 110 },
  pageBodyShell: { paddingHorizontal: 16, paddingTop: 0, marginTop: -1, backgroundColor: '#ffffff' },
  pageBodyInner: {
    maxWidth: 1040, width: '100%', alignSelf: 'center',
    flexDirection: 'column', alignItems: 'stretch', paddingTop: 18,
  },
  pageBodyInnerCompact: { flexDirection: 'column' },
  storyColumn: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
  utilityRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, marginBottom: 18, flexWrap: 'wrap',
  },
  utilityRowCompact: { alignItems: 'stretch' },
  utilityChipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ee',
  },
  backButtonText: { color: '#0f172a', fontSize: 13, fontWeight: '800' },
  utilityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fdba74',
  },
  utilityChipText: { color: '#f97316', fontSize: 11, fontWeight: '800' },
  storyCardShell: {
    backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', borderRadius: 0, padding: 0,
    ...Platform.select({ web: { boxShadow: 'none' }, default: { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 } }),
  },
  storyCardShellCompact: { padding: 0 },
  storyAuthorRow: { marginBottom: 14 },
  storyAuthorIdentity: { flexDirection: 'row', alignItems: 'center', cursor: Platform.OS === 'web' ? 'pointer' : 'default' },
  storyAuthorAvatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#e2e8f0' },
  storyAuthorTextWrap: { flex: 1 },
  storyAuthorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  storyAuthorName: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  storyAuthorRoleText: { color: '#64748b', fontSize: 13, fontWeight: '700', marginTop: 4 },
  storyHeadlineText: {
    color: '#0f172a', fontSize: 34, lineHeight: 44, fontWeight: '900',
    fontFamily: Platform.select({ web: 'Georgia, "Times New Roman", serif', ios: 'Georgia', android: 'serif', default: undefined }),
  },
  storyHeadlineTextCompact: { fontSize: 24, lineHeight: 32 },
  storySubtitleText: { color: '#334155', fontSize: 18, lineHeight: 28, marginTop: 12, fontWeight: '700' },
  storyExcerptText: { color: '#475569', fontSize: 16, lineHeight: 25, marginTop: 12 },
  storyMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16 },
  storyMetaPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fdba74' },
  storyMetaPillText: { color: '#7c2d12', fontSize: 12, fontWeight: '700' },
  storyHeroImageWrap: { marginTop: 18, height: 520, borderRadius: 5, overflow: 'hidden', backgroundColor: '#e2e8f0' },
  storyHeroImageWrapCompact: { height: 280 },
  storyHeroImage: { width: '100%', height: '100%' },
  // ✅ Placeholder when image not yet resolved
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  imagePlaceholderText: { color: '#94a3b8', fontSize: 13, marginTop: 8, fontWeight: '600' },
  videoContainer: { width: '100%', height: '100%', position: 'relative' },
  videoView: { width: '100%', height: '100%' },
  videoPoster: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  playButtonOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.3)' },
  playButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginTop: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  storyStatsRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  storyStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyStatText: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  likedText: { color: '#ef4444' },
  articleBodyWrap: { marginTop: 24 },
  articleBodyParagraph: { color: '#111827', fontSize: 16, lineHeight: 30, marginBottom: 18 },
  articleBodyParagraphLast: { marginBottom: 0 },
  storyBodySection: { marginTop: 22 },
  storyBodyTitle: { color: '#0f172a', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  storyBodyText: { color: '#334155', fontSize: 15, lineHeight: 26 },
  galleryRow: { flexDirection: 'row', gap: 10 },
  galleryImage: { width: 190, height: 130, borderRadius: 16, backgroundColor: '#e2e8f0' },
  attachmentButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, backgroundColor: '#f97316' },
  attachmentButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff' },
  modalCloseButton: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  commentInputContainer: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  commentInput: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 12, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0', maxHeight: 100 },
  submitCommentButton: { backgroundColor: '#f97316', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  submitCommentButtonDisabled: { backgroundColor: '#cbd5e1' },
  submitCommentText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  commentsList: { flex: 1 },
  noCommentsContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  noCommentsText: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginTop: 20 },
  noCommentsSubtext: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  commentItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'flex-start' },
  commentReplyItem: { marginLeft: 20, paddingLeft: 0, paddingRight: 0, paddingBottom: 8, borderBottomWidth: 0 },
  commentAvatar: { marginRight: 12 },
  commentAvatarImage: { width: 40, height: 40, borderRadius: 20 },
  commentAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  commentContent: { flex: 1 },
  commentBubble: { backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  commentUserName: { fontSize: 14, fontWeight: '700', color: '#0f172a', cursor: Platform.OS === 'web' ? 'pointer' : 'default' },
  commentTime: { fontSize: 12, color: '#94a3b8' },
  commentText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 8, paddingLeft: 4 },
  commentActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  commentActionTextLiked: { color: '#ef4444' },
  deleteText: { color: '#ef4444' },
  commentEditorWrap: { gap: 10 },
  commentEditInput: { minHeight: 82, borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 14, backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 10, color: '#0f172a', fontSize: 14, textAlignVertical: 'top' },
  commentInlineActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' },
  commentPrimaryAction: { borderRadius: 999, backgroundColor: '#f97316', paddingHorizontal: 14, paddingVertical: 8 },
  commentPrimaryActionText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  commentSecondaryAction: { borderRadius: 999, backgroundColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 8 },
  commentSecondaryActionText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  replyComposerWrap: { marginTop: 10, paddingLeft: 4, gap: 10 },
  replyInput: { minHeight: 70, borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 14, backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 10, color: '#0f172a', fontSize: 14, textAlignVertical: 'top' },
  commentReplies: { marginTop: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0', paddingLeft: 10 },
});