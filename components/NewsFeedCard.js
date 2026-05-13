import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
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
import { safePause, safePlay } from '../utils/videoPlayerSafe';
import { UserStore } from '../store/UserStore';

const DEFAULT_AVATAR_IMAGE = require('../assets/images/icon.png');

// ─────────────────────────────────────────────
// Like persistence helpers  (AsyncStorage-based)
// ─────────────────────────────────────────────
const LIKED_STORAGE_KEY = '@newsfeed_liked_ids';

async function getLikedIds() {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw = await AsyncStorage.getItem(LIKED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function setLikedId(storyId, liked) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const current = await getLikedIds();
    if (liked) {
      current[storyId] = true;
    } else {
      delete current[storyId];
    }
    await AsyncStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

// ─────────────────────────────────────────────
// CommentItem (unchanged)
// ─────────────────────────────────────────────
function CommentItem({
  comment,
  currentUserEmail,
  onEdit,
  onDelete,
  onReply,
  onLike,
  editingCommentId,
  editingCommentText,
  onEditingTextChange,
  onSubmitEdit,
  onCancelEdit,
  replyingToCommentId,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
  isReply = false,
}) {
  const isCurrentUser = currentUserEmail && String(comment.author_email || '').trim().toLowerCase() === currentUserEmail;
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isLiked = Array.isArray(comment.liked_by) && currentUserEmail && comment.liked_by.includes(currentUserEmail);

  return (
    <View style={[styles.commentItem, isReply && styles.commentReplyItem]}>
      <View style={styles.commentAvatar}>
        {comment.authorAvatar ? (
          <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatarImg} />
        ) : (
          <Text style={styles.commentAvatarText}>{comment.authorInitial}</Text>
        )}
      </View>

      <View style={styles.commentContent}>
        {isEditing ? (
          <View style={styles.commentEditContainer}>
            <TextInput
              style={styles.commentEditInput}
              value={editingCommentText}
              onChangeText={onEditingTextChange}
              multiline
              maxLength={300}
              placeholder="Edit comment..."
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.commentEditActions}>
              <TouchableOpacity style={styles.commentEditBtn} onPress={onSubmitEdit} activeOpacity={0.8}>
                <Text style={styles.commentEditBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.commentEditBtn, styles.commentCancelBtn]} onPress={onCancelEdit} activeOpacity={0.8}>
                <Text style={styles.commentCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
            <Text style={styles.commentTime}>{comment.time}</Text>
          </View>
        )}

        {!isEditing && (
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.commentActionBtn} onPress={() => onLike(comment.id)} activeOpacity={0.8}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={14} color={isLiked ? '#e11d48' : '#64748b'} />
              <Text style={[styles.commentActionText, isLiked && styles.commentActionTextLiked]}>
                {comment.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commentActionBtn} onPress={() => onReply(comment.id)} activeOpacity={0.8}>
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
            {isCurrentUser ? (
              <>
                <TouchableOpacity style={styles.commentActionBtn} onPress={() => onEdit(comment.id, comment.text)} activeOpacity={0.8}>
                  <Text style={styles.commentActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentActionBtn} onPress={() => onDelete(comment.id)} activeOpacity={0.8}>
                  <Text style={[styles.commentActionText, styles.commentDeleteText]}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}

        {isReplying ? (
          <View style={styles.commentReplyForm}>
            <TextInput
              style={styles.commentReplyInput}
              value={replyText}
              onChangeText={onReplyTextChange}
              placeholder="Write a reply..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={300}
            />
            <View style={styles.commentReplyActions}>
              <TouchableOpacity style={styles.commentReplyBtn} onPress={onSubmitReply} activeOpacity={0.8}>
                <Text style={styles.commentReplyBtnText}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.commentReplyBtn, styles.commentCancelBtn]} onPress={onCancelReply} activeOpacity={0.8}>
                <Text style={styles.commentCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <View style={styles.commentReplies}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserEmail={currentUserEmail}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                onLike={onLike}
                editingCommentId={editingCommentId}
                editingCommentText={editingCommentText}
                onEditingTextChange={onEditingTextChange}
                onSubmitEdit={onSubmitEdit}
                onCancelEdit={onCancelEdit}
                replyingToCommentId={replyingToCommentId}
                replyText={replyText}
                onReplyTextChange={onReplyTextChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                isReply={true}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function isPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return false;
  if (/(youtube\.com|youtu\.be)/i.test(uri)) return false;
  if (Platform.OS !== 'web') return true;
  if (/^(blob:|data:)/i.test(uri)) return true;
  return /^https?:/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
}

function useVideoThumbnail(videoUri) {
  const [thumbnail, setThumbnail] = useState(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    setThumbnail(null);
    setCapturing(false);

    if (!videoUri || Platform.OS !== 'web') return;
    if (!/^https?:|^blob:|^data:/i.test(videoUri)) return;

    let cancelled = false;
    setCapturing(true);

    const video = document.createElement('video');
    video.src = videoUri;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'metadata';

    const cleanup = () => { video.src = ''; video.load(); };

    video.addEventListener('loadedmetadata', () => {
      if (cancelled) { cleanup(); return; }
      video.currentTime = Math.min(0.1, video.duration * 0.05 || 0.1);
    });

    video.addEventListener('seeked', () => {
      if (cancelled) { cleanup(); return; }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (dataUrl && dataUrl !== 'data:,' && dataUrl.length > 100) {
          if (!cancelled) setThumbnail(dataUrl);
        }
      } catch {}
      if (!cancelled) setCapturing(false);
      cleanup();
    });

    video.addEventListener('error', () => {
      if (!cancelled) { setCapturing(false); setThumbnail(null); }
      cleanup();
    });

    const timeout = setTimeout(() => {
      if (!cancelled) { setCapturing(false); setThumbnail(null); }
      cleanup();
    }, 8000);

    video.load();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanup();
    };
  }, [videoUri]);

  return { thumbnail, capturing };
}

// ─────────────────────────────────────────────
// FIX 2: Web IntersectionObserver hook — card
// visible percentage track karne ke liye.
// Jab card 30% se kam visible ho, video band.
// ─────────────────────────────────────────────
function useCardVisibility(ref, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') return; // Native mein useIsFocused + FlatList handle karta hai

    const element = ref?.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= threshold);
      },
      { threshold: [0, threshold, 1.0] }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}

// ─────────────────────────────────────────────
// Main Card Component
// ─────────────────────────────────────────────
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
  const safeCopy = commonCopy || {};
  const isScreenFocused = useIsFocused();
  const cardRef = useRef(null); // FIX 2: card DOM ref (web only)
  const isCardVisible = useCardVisibility(cardRef, 0.3); // FIX 2: visibility hook

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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const inputRef = useRef(null);

  // ── FIX 2 (Native): scroll se hide/show track karne ke liye
  // Native mein parent FlatList ko onViewableItemsChanged pass karna hoga.
  // Yahan ek prop accept karte hain: isVisible (optional, parent se)
  // Agar parent ne pass nahi kiya to default true maan lo.
  // Aap parent FlatList mein ye add karein:
  //   viewabilityConfig={{ itemVisiblePercentThreshold: 30 }}
  //   onViewableItemsChanged={({ viewableItems }) => { ... setVisibleIds }}
  // Phir har card ko isVisible={visibleIds.includes(story.id)} pass karein.

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

  // ── FIX 1: Like state — server + local storage dono se load karo ──
  useEffect(() => {
    if (!currentEmail) return;
    let alive = true;

    (async () => {
      // Step 1: Server se liked_by array check karo
      const serverLiked = Boolean(
        Array.isArray(story.liked_by) && story.liked_by.includes(currentEmail)
      );

      // Step 2: Local storage se bhi check karo (offline / refresh ke baad)
      const likedIds = await getLikedIds();
      const localLiked = Boolean(likedIds[story.id]);

      if (!alive) return;

      // Dono mein se koi bhi true ho to liked maano
      setIsLiked(serverLiked || localLiked);
    })();

    return () => { alive = false; };
  }, [currentEmail, story.id, story.liked_by]);

  useEffect(() => {
    setLikesCount(Number(story.likes || 0));
    setCommentsCount(Number(story.comments || 0));
    setSharesCount(Number(story.shares || 0));
    setIsSaved(Boolean(story.bookmarked));
  }, [story.bookmarked, story.comments, story.likes, story.shares]);

  // Image URI resolve
  const rawImageUri = useMemo(() => {
    const candidates = [
      String(story.image || '').trim(),
      ...(Array.isArray(story.images) ? story.images.map((uri) => String(uri || '').trim()) : []),
    ].filter((uri) => isValidImageUrl(uri));
    return candidates[0] || '';
  }, [story.image, story.images]);

  const [resolvedImageUri, setResolvedImageUri] = useState(null);

  const categoryColor =
    CATEGORY_COLOR_MAP[(story.menuTags || []).find((tag) => tag !== 'latest') || 'latest'] ||
    CATEGORY_COLOR_MAP.latest;

  const userName = currentUser?.name || commonCopy?.you || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userAvatar = useMemo(() => {
    const avatar = String(currentUser?.avatar || '').trim();
    return isValidImageUrl(avatar) ? avatar : '';
  }, [currentUser?.avatar]);

  const videoUri = String(story.video || '').trim();
  const [resolvedVideoUri, setResolvedVideoUri] = useState(null);

  // Resolve video idb-media URI
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

  // Resolve image idb-media URI
  useEffect(() => {
    let alive = true;
    let objectUrl = null;
    (async () => {
      if (Platform.OS !== 'web') { setResolvedImageUri(null); return; }
      if (!isIdbMediaUri(rawImageUri)) { setResolvedImageUri(null); return; }
      const next = await resolveIdbMediaUriToObjectUrl(rawImageUri);
      if (!alive) return;
      objectUrl = next;
      setResolvedImageUri(next);
    })();
    return () => {
      alive = false;
      try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch {}
    };
  }, [rawImageUri]);

  const effectiveVideoUri = useMemo(() => {
    if (Platform.OS === 'web' && isIdbMediaUri(videoUri)) return resolvedVideoUri || '';
    return videoUri;
  }, [resolvedVideoUri, videoUri]);

  const effectiveImageUri = useMemo(() => {
    if (Platform.OS === 'web' && isIdbMediaUri(rawImageUri)) return resolvedImageUri || '';
    return rawImageUri;
  }, [rawImageUri, resolvedImageUri]);

  const safeImage = isValidImageUrl(effectiveImageUri)
    ? effectiveImageUri
    : buildPlaceholderImage(story.id || story.title);

  const canPlayVideo = Boolean(effectiveVideoUri) && isPlayableVideoSource(effectiveVideoUri);

  const { thumbnail: videoThumbnail, capturing: thumbnailCapturing } = useVideoThumbnail(
    canPlayVideo ? effectiveVideoUri : null
  );

  const [videoPaused, setVideoPaused] = useState(true);
  const [showVideoPoster, setShowVideoPoster] = useState(true);

  const player = useVideoPlayer(canPlayVideo ? { uri: effectiveVideoUri } : null, (p) => {
    p.loop = false;
  });

  // ── FIX 2: Screen focus lost → pause ──
  useEffect(() => {
    if (!canPlayVideo) return;
    if (!isScreenFocused) {
      safePause(player);
      setVideoPaused(true);
      setShowVideoPoster(true);
    }
  }, [canPlayVideo, isScreenFocused, player]);

  // ── FIX 2: Card scroll se bahar gaya → pause ──
  useEffect(() => {
    if (!canPlayVideo) return;
    if (!isCardVisible && !videoPaused) {
      safePause(player);
      setVideoPaused(true);
      // Poster wapas dikhao taaki next time play button mile
      setShowVideoPoster(true);
    }
  }, [canPlayVideo, isCardVisible, player, videoPaused]);

  // Reset when video changes
  useEffect(() => {
    setVideoPaused(true);
    setShowVideoPoster(true);
    if (canPlayVideo) safePause(player);
  }, [canPlayVideo, effectiveVideoUri, player]);

  // Play/pause control
  useEffect(() => {
    if (!canPlayVideo || !player) return;
    if (videoPaused) {
      safePause(player);
    } else {
      const ok = safePlay(player);
      if (!ok) setVideoPaused(true);
    }
  }, [canPlayVideo, videoPaused, player]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { safePause(player); };
  }, [player]);

  const handleVideoPress = () => {
    if (videoPaused) {
      setVideoPaused(false);
      setShowVideoPoster(false);
    } else {
      setVideoPaused(true);
    }
  };

  const handleImagePress = () => onOpenDetails(story);

  // ── FIX 1: handleLike — local storage mein bhi save karo ──
  const handleLike = async () => {
    const prev = isLiked;
    const newLiked = !prev;

    // Optimistic UI update
    setIsLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));

    // Local storage mein turant save karo (refresh-safe)
    await setLikedId(story.id, newLiked);

    try {
      const result = await UserStore.updateNewsFeedItem(story.id, 'like');
      if (!result?.ok) {
        // Server fail — revert both UI and storage
        setIsLiked(prev);
        setLikesCount((c) => c + (prev ? 1 : -1));
        await setLikedId(story.id, prev);
        return;
      }
      // Server se actual liked state sync karo
      if (typeof result.liked === 'boolean') {
        setIsLiked(result.liked);
        await setLikedId(story.id, result.liked);
      }
    } catch {
      setIsLiked(prev);
      setLikesCount((c) => c + (prev ? 1 : -1));
      await setLikedId(story.id, prev);
    }
  };

  const handleComment = async () => {
    setShowComments((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setEditingCommentId(null);
        setEditingCommentText('');
        setReplyingToCommentId(null);
        setReplyText('');
      }
      return next;
    });

    if (!showComments) {
      try {
        const summary = await UserStore.getNewsFeedSummary({ focusItemId: story.id });
        const item = Array.isArray(summary?.items) ? summary.items.find((it) => it.id === story.id) : null;
        const rawComments = Array.isArray(item?.comments_list) ? item.comments_list : [];
        const formattedComments = rawComments.map((c) => ({
          id: String(c.id || ''),
          text: String(c.text || ''),
          author: String(c.author || 'User'),
          authorInitial: String(c.author || 'U').charAt(0).toUpperCase(),
          authorAvatar: '',
          author_email: String(c.author_email || ''),
          time: c.date || '',
          edited_at: c.edited_at || null,
          likes: Number(c.likes || 0),
          liked_by: Array.isArray(c.liked_by) ? c.liked_by : [],
          replies: Array.isArray(c.replies) ? c.replies.map((r) => ({
            id: String(r.id || ''),
            text: String(r.text || ''),
            author: String(r.author || 'User'),
            authorInitial: String(r.author || 'U').charAt(0).toUpperCase(),
            authorAvatar: '',
            author_email: String(r.author_email || ''),
            time: r.date || '',
            edited_at: r.edited_at || null,
            likes: Number(r.likes || 0),
            liked_by: Array.isArray(r.liked_by) ? r.liked_by : [],
          })) : [],
        }));
        setLocalComments(formattedComments);
        setCommentsCount(Number(item?.comments || commentsCount || 0));
      } catch {}
    }
  };

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
        author_email: currentEmail,
        time: added.date || 'Now',
        edited_at: null,
        likes: 0,
        liked_by: [],
        replies: [],
      };
      setLocalComments((prev) => [newComment, ...prev]);
      setCommentsCount((c) => c + 1);
      setCommentText('');
    } catch {}
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
    setReplyingToCommentId(null);
    setReplyText('');
  };

  const handleSubmitEdit = async () => {
    const trimmed = editingCommentText.trim();
    if (!trimmed || !editingCommentId) return;
    try {
      const result = await UserStore.editNewsComment(story.id, editingCommentId, trimmed);
      if (!result?.ok) return;
      setLocalComments((prev) =>
        prev.map((comment) => {
          if (comment.id === editingCommentId) return { ...comment, text: trimmed };
          if (Array.isArray(comment.replies)) {
            return { ...comment, replies: comment.replies.map((r) => r.id === editingCommentId ? { ...r, text: trimmed } : r) };
          }
          return comment;
        })
      );
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch {}
  };

  const handleCancelEdit = () => { setEditingCommentId(null); setEditingCommentText(''); };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await UserStore.deleteNewsComment(story.id, commentId);
      if (!result?.ok) return;
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return null;
          if (Array.isArray(c.replies)) return { ...c, replies: c.replies.filter((r) => r.id !== commentId) };
          return c;
        }).filter(Boolean)
      );
      setCommentsCount((c) => Math.max(0, c - 1));
      if (editingCommentId === commentId) { setEditingCommentId(null); setEditingCommentText(''); }
      if (replyingToCommentId === commentId) { setReplyingToCommentId(null); setReplyText(''); }
    } catch {}
  };

  const handleReplyComment = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSubmitReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || !replyingToCommentId) return;
    try {
      const result = await UserStore.replyNewsComment(story.id, replyingToCommentId, trimmed);
      if (!result?.ok) return;
      const added = result.comment || {};
      const newReply = {
        id: String(added.id || Date.now().toString()),
        text: String(added.text || trimmed),
        author: String(added.author || userName),
        authorInitial: String(added.author || userName).charAt(0).toUpperCase(),
        authorAvatar: userAvatar,
        author_email: currentEmail,
        time: added.date || 'Now',
        edited_at: null,
        likes: 0,
        liked_by: [],
      };
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingToCommentId) {
            return { ...c, replies: Array.isArray(c.replies) ? [newReply, ...c.replies] : [newReply] };
          }
          return c;
        })
      );
      setCommentsCount((c) => c + 1);
      setReplyingToCommentId(null);
      setReplyText('');
    } catch {}
  };

  const handleCancelReply = () => { setReplyingToCommentId(null); setReplyText(''); };

  const handleLikeComment = async (commentId) => {
    try {
      const result = await UserStore.likeNewsComment(story.id, commentId);
      if (!result?.ok) return;
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const wasLiked = Array.isArray(c.liked_by) && currentEmail && c.liked_by.includes(currentEmail);
            return {
              ...c,
              likes: Math.max(0, (c.likes || 0) + (wasLiked ? -1 : 1)),
              liked_by: wasLiked ? c.liked_by.filter((e) => e !== currentEmail) : [...(c.liked_by || []), currentEmail],
            };
          }
          if (Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) => {
                if (r.id === commentId) {
                  const wasLiked = Array.isArray(r.liked_by) && currentEmail && r.liked_by.includes(currentEmail);
                  return {
                    ...r,
                    likes: Math.max(0, (r.likes || 0) + (wasLiked ? -1 : 1)),
                    liked_by: wasLiked ? r.liked_by.filter((e) => e !== currentEmail) : [...(r.liked_by || []), currentEmail],
                  };
                }
                return r;
              }),
            };
          }
          return c;
        })
      );
    } catch {}
  };

  const handleShare = async () => {
    try {
      const shareMessage = `📰 ${story.title}\n\n${story.excerpt || ''}\n\n🔗 ${story.url || 'https://rtinews.in'}\n\nRTI News App se padhe`;
      const result = await Share.share(
        { title: story.title, message: shareMessage, url: story.url || 'https://rtinews.in' },
        { subject: story.title, dialogTitle: 'Share karo' }
      );
      if (result.action === Share.sharedAction) {
        setSharesCount((c) => c + 1);
        try { await UserStore.updateNewsFeedItem(story.id, 'share'); } catch {}
      }
    } catch {}
  };

  const handleSave = async () => {
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const result = await UserStore.updateNewsFeedItem(story.id, 'bookmark');
      if (!result?.ok) { setIsSaved(prev); return; }
      if (typeof result.bookmarked === 'boolean') setIsSaved(result.bookmarked);
    } catch { setIsSaved(prev); }
  };

  const hasExpandableContent = Boolean(story.excerpt || story.description);

  const showPosterOverlay = videoPaused && showVideoPoster;
  const posterReady = videoThumbnail !== null;
  const stillCapturing = thumbnailCapturing && !posterReady;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/*
        FIX 2: ref attach karo card ke outermost View pe.
        Web pe IntersectionObserver isi ref se card visibility track karega.
      */}
      <View
        ref={cardRef}
        style={[styles.storyCardShell, isCompactLayout && styles.storyCardShellCompact]}
      >

        {/* Author Row */}
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
                {story.author_is_premium ? <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" /> : null}
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

        {/* Headline + Excerpt */}
        <View style={styles.storyContentWrap}>
          <TouchableOpacity onPress={() => onOpenDetails(story)} activeOpacity={0.88}>
            <Text style={[styles.storyHeadlineText, isCompactLayout && styles.storyHeadlineTextCompact]}>
              {story.title}
            </Text>
            {story.subtitle ? (
              <Text style={styles.storySubtitleText} numberOfLines={2}>{story.subtitle}</Text>
            ) : null}
          </TouchableOpacity>

          {story.excerpt ? (
            <Text style={styles.storyExcerptText} numberOfLines={isDescExpanded ? undefined : 3}>
              {story.excerpt}
            </Text>
          ) : null}

          {isDescExpanded && story.description && story.description !== story.excerpt ? (
            <Text style={styles.storyDescriptionText}>{story.description}</Text>
          ) : null}

          {hasExpandableContent ? (
            <TouchableOpacity style={styles.moreLessBtn} onPress={() => setIsDescExpanded((p) => !p)} activeOpacity={0.75}>
              <Text style={styles.moreLessBtnText}>
                {isDescExpanded ? (commonCopy?.less || 'Less') : (commonCopy?.more || 'More')}
              </Text>
              <Ionicons name={isDescExpanded ? 'chevron-up' : 'chevron-down'} size={13} color="#e11d48" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category */}
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

        {/* Hero Image / Video */}
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
                fullscreenOptions={{ enabled: false }}
                playsInline
                onFirstFrameRender={() => setShowVideoPoster(false)}
              />

              {showPosterOverlay && (
                posterReady ? (
                  <Image
                    source={{ uri: videoThumbnail }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : stillCapturing ? (
                  <View style={styles.videoLoadingOverlay}>
                    <View style={styles.videoLoadingBadge}>
                      <Text style={styles.videoLoadingText}>⏳</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.videoLoadingOverlay} />
                )
              )}

              {videoPaused && (
                <View style={styles.storyVideoPlayOverlay}>
                  <View style={styles.storyVideoPlayBadge}>
                    <Ionicons name="play" size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.storyVideoLabel}>{commonCopy?.video || 'VIDEO'}</Text>
                </View>
              )}

              {!videoPaused && (
                <View style={styles.videoPlayingIndicator}>
                  <Ionicons name="pause" size={18} color="#ffffff" />
                </View>
              )}
            </>
          ) : (
            <Image source={{ uri: safeImage }} style={styles.storyHeroImage} resizeMode="cover" />
          )}
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.storyStatsRow}>
          <View style={styles.storyStatsLeftGroup}>
            <View style={styles.storyStatItem}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={15} color={isLiked ? '#e11d48' : '#111827'} />
             <Text style={styles.storyStatText}>{likesCount} {String(safeCopy.likes || '')}</Text>
            </View>
            <View style={styles.storyStatItem}>
              <Ionicons name="eye-outline" size={15} color="#111827" />
              <Text style={styles.storyStatText}>{viewsCount} {String(commonCopy.views || '')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.storyPostLink} onPress={() => onOpenDetails(story)} activeOpacity={0.82}>
            <Ionicons name="open-outline" size={15} color="#111827" />
            <Text style={styles.storyPostLinkText}>{commonCopy.viewPost}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.storyActionButtonsRow}>
          <TouchableOpacity
            style={[styles.storyActionButton, isLiked && styles.storyActionButtonLiked]}
            onPress={handleLike}
            activeOpacity={0.82}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={17} color={isLiked ? '#e11d48' : '#64748b'} />
            <Text style={[styles.storyActionButtonText, isLiked && styles.storyActionButtonTextLiked]}>
              {commonCopy.like}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.storyActionButton, showComments && styles.storyActionButtonActive]}
            onPress={handleComment}
            activeOpacity={0.82}
          >
            <Ionicons name={showComments ? 'chatbubble' : 'chatbubble-outline'} size={17} color={showComments ? '#0ea5e9' : '#64748b'} />
            <Text style={[styles.storyActionButtonText, showComments && styles.storyActionButtonTextActive]}>
              {commonCopy.comment}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.storyActionButton} onPress={handleShare} activeOpacity={0.82}>
            <Ionicons name="share-social-outline" size={17} color="#64748b" />
            <Text style={styles.storyActionButtonText}>{commonCopy.share}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.storyActionButton, isSaved && styles.storyActionButtonActive]}
            onPress={handleSave}
            activeOpacity={0.82}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={17} color={isSaved ? '#0ea5e9' : '#64748b'} />
            <Text style={[styles.storyActionButtonText, isSaved && styles.storyActionButtonTextActive]}>
              {commonCopy?.save || 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment Section */}
        {showComments ? (
          <View style={styles.commentSection}>
            <View style={styles.commentInputRow}>
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
                style={[styles.commentSendBtn, !commentText.trim() && styles.commentSendBtnDisabled]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={16} color={commentText.trim() ? '#ffffff' : '#94a3b8'} />
              </TouchableOpacity>
            </View>

            {localComments.length > 0 && (
              <View style={styles.commentsList}>
                {localComments.map((item) => (
                  <CommentItem
                    key={item.id}
                    comment={item}
                    currentUserEmail={currentEmail}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onReply={handleReplyComment}
                    onLike={handleLikeComment}
                    editingCommentId={editingCommentId}
                    editingCommentText={editingCommentText}
                    onEditingTextChange={setEditingCommentText}
                    onSubmitEdit={handleSubmitEdit}
                    onCancelEdit={handleCancelEdit}
                    replyingToCommentId={replyingToCommentId}
                    replyText={replyText}
                    onReplyTextChange={setReplyText}
                    onSubmitReply={handleSubmitReply}
                    onCancelReply={handleCancelReply}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Bottom Meta */}
        <View style={styles.storyBottomMetaRow}>
          <Text style={styles.storyBottomMetaText}>
            {String(safeCopy.comments || '')} {commentsCount} | {String(safeCopy.shares || '')} {sharesCount}
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
  storyHeroImageWrap: { height: 520, borderRadius: 5, overflow: 'hidden', backgroundColor: '#0f172a' },
  storyHeroImageWrapCompact: { height: 200 },
  storyHeroImage: { width: '100%', height: '100%' },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLoadingBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  videoLoadingText: { fontSize: 22 },
  storyVideoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.38)', gap: 8,
  },
  storyVideoPlayBadge: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(225, 29, 72, 0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  storyVideoLabel: { color: '#ffffff', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  videoPlayingIndicator: {
    position: 'absolute', bottom: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
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
  commentSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#eef2f7', paddingTop: 12 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  commentUserAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentUserAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  commentUserAvatarText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1e293b', backgroundColor: '#f8fafc', maxHeight: 80, minHeight: 40 },
  commentSendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e11d48', alignItems: 'center', justifyContent: 'center' },
  commentSendBtnDisabled: { backgroundColor: '#e2e8f0' },
  commentsList: { gap: 10 },
  commentItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 12 },
  commentReplyItem: { marginLeft: 40, marginBottom: 8 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  commentAvatarText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  commentContent: { flex: 1 },
  commentBubble: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 },
  commentAuthor: { color: '#334155', fontSize: 11, fontWeight: '800', marginBottom: 2 },
  commentText: { color: '#1e293b', fontSize: 13, lineHeight: 18 },
  commentTime: { color: '#94a3b8', fontSize: 10, marginTop: 4 },
  commentActions: { flexDirection: 'row', gap: 12, marginTop: 4, marginLeft: 8 },
  commentActionBtn: { paddingVertical: 2, paddingHorizontal: 8 },
  commentActionText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  commentActionTextLiked: { color: '#e11d48' },
  commentDeleteText: { color: '#ef4444' },
  commentEditContainer: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 8 },
  commentEditInput: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1e293b', backgroundColor: '#ffffff', maxHeight: 80, minHeight: 40 },
  commentEditActions: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  commentEditBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#0ea5e9', borderRadius: 6 },
  commentEditBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  commentCancelBtn: { backgroundColor: '#e2e8f0' },
  commentCancelBtnText: { color: '#64748b' },
  commentReplyForm: { marginTop: 8, marginLeft: 8 },
  commentReplyInput: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1e293b', backgroundColor: '#f8fafc', maxHeight: 80, minHeight: 40 },
  commentReplyActions: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  commentReplyBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#0ea5e9', borderRadius: 6 },
  commentReplyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  commentReplies: { marginTop: 8 },
  storyBottomMetaRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eef2f7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  storyBottomMetaText: { color: '#64748b', fontSize: 11, fontWeight: '600' },
});
