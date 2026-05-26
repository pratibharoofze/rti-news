import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Platform, Share, TextInput, KeyboardAvoidingView, Alert, Clipboard
} from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import VerifiedBadge from './VerifiedBadge';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { CATEGORY_COLOR_MAP } from '../constants/homeData';
import { isValidImageUrl, buildPlaceholderImage, getLocalizedCategoryLabel, getLocalizedSeatLabel } from '../utils/storyHelpers';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';
import { safePause, safePlay } from '../utils/videoPlayerSafe';
import { UserStore } from '../store/UserStore';

// ── Styles (alag file se import) ──────────────────────────────────────────────
import styles from './NewsFeedCardStyles';

// ─────────────────────────────────────────────
// Like persistence helpers
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
// CommentItem
// ─────────────────────────────────────────────
function CommentItem({
  comment,
  currentUserEmail,
  onEdit,
  onDelete,
  onReply,
  onLike,
  expandedReplyThreads,
  onToggleReplies,
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
  const replyCount = Array.isArray(comment.replies) ? comment.replies.length : 0;
  const hasReplies = replyCount > 0;
  const areRepliesExpanded = Boolean(expandedReplyThreads?.[comment.id]);

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
              autoFocus={true}
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

        {hasReplies ? (
          <View style={styles.commentRepliesWrap}>
            <TouchableOpacity
              style={styles.commentRepliesToggle}
              onPress={() => onToggleReplies(comment.id)}
              activeOpacity={0.8}
            >
              <View style={styles.commentRepliesLine} />
              <Text style={styles.commentRepliesToggleText}>
                {areRepliesExpanded
                  ? 'Hide replies'
                  : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </Text>
            </TouchableOpacity>

            {areRepliesExpanded ? (
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
                    expandedReplyThreads={expandedReplyThreads}
                    onToggleReplies={onToggleReplies}
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
            ) : null}
          </View>
        ) : null}
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

function useCardVisibility(ref, threshold = 0.3) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = ref?.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => { setIsVisible(entry.intersectionRatio >= threshold); },
      { threshold: [0, threshold, 1.0] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return isVisible;
}

// ─────────────────────────────────────────────
// Inline Read More Text Component
// ─────────────────────────────────────────────
const EXCERPT_LINE_LIMIT = 3;

function InlineReadMore({ text, style }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  if (!text) return null;

  return (
    <Text
      style={style}
      numberOfLines={expanded ? undefined : EXCERPT_LINE_LIMIT}
      onTextLayout={(e) => {
        if (!expanded) {
          setIsTruncated(e.nativeEvent.lines.length >= EXCERPT_LINE_LIMIT);
        }
      }}
    >
      {text}
      {!expanded && isTruncated ? (
        <Text style={styles.inlineReadMoreText} onPress={() => setExpanded(true)}>
          {'... '}
          <Text style={styles.inlineReadMoreLink}>read more</Text>
        </Text>
      ) : null}
      {expanded ? (
        <Text style={styles.inlineReadMoreLink} onPress={() => setExpanded(false)}>
          {' see less'}
        </Text>
      ) : null}
    </Text>
  );
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
  const isScreenFocused = useIsFocused();
  const cardRef = useRef(null);
  const isCardVisible = useCardVisibility(cardRef, 0.3);

  const [currentEmail, setCurrentEmail] = useState('');
  const [isLiked, setIsLiked] = useState(false);
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
  const [expandedReplyThreads, setExpandedReplyThreads] = useState({});
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const inputRef = useRef(null);
  const storyAuthorEmail = String(story.createdBy || story.created_by || story.author_email || '').trim().toLowerCase();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowComments(false);
        setEditingCommentId(null);
        setEditingCommentText('');
        setReplyingToCommentId(null);
        setReplyText('');
        setExpandedReplyThreads({});
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      setShowComments(false);
      setEditingCommentId(null);
      setReplyingToCommentId(null);
      setExpandedReplyThreads({});
    };
  }, []);

  const findParentCommentId = useCallback((comments, targetCommentId) => {
    for (const comment of comments) {
      if (comment.id === targetCommentId) return comment.id;
      if (Array.isArray(comment.replies) && comment.replies.some((reply) => reply.id === targetCommentId)) {
        return comment.id;
      }
    }
    return null;
  }, []);

  const handleToggleReplies = useCallback((commentId) => {
    setExpandedReplyThreads((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await UserStore.getCurrentUser();
        if (!alive) return;
        setCurrentEmail(String(user?.email || '').trim().toLowerCase());
      } catch {
        if (!alive) return;
        setCurrentEmail('');
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!currentEmail) return;
    let alive = true;
    (async () => {
      const serverLiked = Boolean(Array.isArray(story.liked_by) && story.liked_by.includes(currentEmail));
      const likedIds = await getLikedIds();
      const localLiked = Boolean(likedIds[story.id]);
      if (!alive) return;
      setIsLiked(serverLiked || localLiked);
    })();
    return () => { alive = false; };
  }, [currentEmail, story.id, story.liked_by]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!storyAuthorEmail || !currentEmail || storyAuthorEmail === currentEmail) {
        if (alive) setIsFollowingAuthor(false);
        return;
      }
      const summary = await UserStore.getFollowSummary?.(storyAuthorEmail);
      if (!alive) return;
      setIsFollowingAuthor(Boolean(summary?.isFollowing));
    })();
    return () => { alive = false; };
  }, [currentEmail, storyAuthorEmail]);

  useEffect(() => {
    setLikesCount(Number(story.likes || 0));
    setCommentsCount(Number(story.comments || 0));
    setSharesCount(Number(story.shares || 0));
  }, [story.comments, story.likes, story.shares]);

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

  const userAvatar = useMemo(() => {
    const avatar = String(currentUser?.profile_image || '').trim();
    return isValidImageUrl(avatar) ? avatar : '';
  }, [currentUser?.profile_image]);

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

  const postLink = useMemo(() => {
    if (story.url) return String(story.url);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/news/${encodeURIComponent(story.id || story.title || 'story')}`;
    }
    return `https://rtinews.in/news/${encodeURIComponent(story.id || story.title || 'story')}`;
  }, [story.id, story.title, story.url]);

  const canPlayVideo = Boolean(effectiveVideoUri) && isPlayableVideoSource(effectiveVideoUri);
  const { thumbnail: videoThumbnail, capturing: thumbnailCapturing } = useVideoThumbnail(
    canPlayVideo ? effectiveVideoUri : null
  );

  const [videoPaused, setVideoPaused] = useState(true);
  const [showVideoPoster, setShowVideoPoster] = useState(true);

  const player = useVideoPlayer(canPlayVideo ? { uri: effectiveVideoUri } : null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!canPlayVideo) return;
    if (!isScreenFocused) {
      safePause(player);
      setVideoPaused(true);
      setShowVideoPoster(true);
    }
  }, [canPlayVideo, isScreenFocused, player]);

  useEffect(() => {
    if (!canPlayVideo) return;
    if (!isCardVisible && !videoPaused) {
      safePause(player);
      setVideoPaused(true);
      setShowVideoPoster(true);
    }
  }, [canPlayVideo, isCardVisible, player, videoPaused]);

  useEffect(() => {
    setVideoPaused(true);
    setShowVideoPoster(true);
    if (canPlayVideo) safePause(player);
  }, [canPlayVideo, effectiveVideoUri, player]);

  useEffect(() => {
    if (!canPlayVideo || !player) return;
    if (videoPaused) {
      safePause(player);
    } else {
      const ok = safePlay(player);
      if (!ok) setVideoPaused(true);
    }
  }, [canPlayVideo, videoPaused, player]);

  useEffect(() => {
    return () => { safePause(player); };
  }, [player]);

  const handleVideoPress = () => {
    if (videoPaused) { setVideoPaused(false); setShowVideoPoster(false); }
    else { setVideoPaused(true); }
  };

  const handleImagePress = () => onOpenDetails(story);

  const handleLike = async () => {
    const prev = isLiked;
    const newLiked = !prev;
    setIsLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));
    await setLikedId(story.id, newLiked);
    try {
      const result = await UserStore.updateNewsFeedItem(story.id, 'like');
      if (!result?.ok) {
        setIsLiked(prev);
        setLikesCount((c) => c + (prev ? 1 : -1));
        await setLikedId(story.id, prev);
        return;
      }
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
        setExpandedReplyThreads({});
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
        setExpandedReplyThreads({});
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

  const handleEditComment = useCallback((commentId, currentText) => {
    setReplyingToCommentId(null);
    setReplyText('');
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  }, []);

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

  const handleReplyComment = useCallback((commentId) => {
    const parentCommentId = findParentCommentId(localComments, commentId) || commentId;
    if (replyingToCommentId === commentId) {
      setReplyingToCommentId(null);
      setReplyText('');
    } else {
      setEditingCommentId(null);
      setEditingCommentText('');
      setReplyingToCommentId(commentId);
      setReplyText('');
      setExpandedReplyThreads((prev) => ({ ...prev, [parentCommentId]: true }));
    }
  }, [findParentCommentId, localComments, replyingToCommentId]);

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
      const parentCommentId = findParentCommentId(localComments, replyingToCommentId);
      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === replyingToCommentId || c.id === parentCommentId) {
            return { ...c, replies: Array.isArray(c.replies) ? [newReply, ...c.replies] : [newReply] };
          }
          return c;
        })
      );
      if (parentCommentId || replyingToCommentId) {
        setExpandedReplyThreads((prev) => ({ ...prev, [parentCommentId || replyingToCommentId]: true }));
      }
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
            return { ...c, likes: Math.max(0, (c.likes || 0) + (wasLiked ? -1 : 1)), liked_by: wasLiked ? c.liked_by.filter((e) => e !== currentEmail) : [...(c.liked_by || []), currentEmail] };
          }
          if (Array.isArray(c.replies)) {
            return {
              ...c,
              replies: c.replies.map((r) => {
                if (r.id === commentId) {
                  const wasLiked = Array.isArray(r.liked_by) && currentEmail && r.liked_by.includes(currentEmail);
                  return { ...r, likes: Math.max(0, (r.likes || 0) + (wasLiked ? -1 : 1)), liked_by: wasLiked ? r.liked_by.filter((e) => e !== currentEmail) : [...(r.liked_by || []), currentEmail] };
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

  const closeActionMenu = () => setShowActionMenu(false);
  const showActionResult = (title, message) => { try { Alert.alert(title, message); } catch {} };

  const handleReport = async () => {
    closeActionMenu();
    await UserStore.recordNewsFeedMenuAction(story.id, 'report', { title: story.title || '', reason: 'Reported from news feed menu' });
    showActionResult('Report submitted', 'Thanks. This post has been reported for review.');
  };

  const handleCopyLink = async () => {
    closeActionMenu();
    let copied = false;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postLink); copied = true;
      } else if (Clipboard?.setString) { Clipboard.setString(postLink); copied = true; }
    } catch { copied = false; }
    await UserStore.recordNewsFeedMenuAction(story.id, 'copy_link', { link: postLink, copied });
    showActionResult(copied ? 'Link copied' : 'Copy link', copied ? 'Post link copied.' : postLink);
  };

  const handleMenuShare = async () => { closeActionMenu(); await handleShare(); await UserStore.recordNewsFeedMenuAction(story.id, 'share', { link: postLink }); };

  const handleToggleFollowAuthor = async (event) => {
    event?.stopPropagation?.();
    if (followLoading) return;
    if (!currentEmail) { showActionResult('Login required', 'Please login to follow this user.'); return; }
    if (!storyAuthorEmail || storyAuthorEmail === currentEmail) return;

    const nextFollowing = !isFollowingAuthor;
    setFollowLoading(true);
    setIsFollowingAuthor(nextFollowing);
    try {
      const result = nextFollowing
        ? await UserStore.followUser(storyAuthorEmail)
        : await UserStore.unfollowUser(storyAuthorEmail);
      if (result?.ok === false) {
        setIsFollowingAuthor(!nextFollowing);
        showActionResult('Follow', result?.message || 'Unable to update follow status.');
        return;
      }
      const summary = await UserStore.getFollowSummary?.(storyAuthorEmail);
      setIsFollowingAuthor(Boolean(summary?.isFollowing ?? nextFollowing));
    } catch {
      setIsFollowingAuthor(!nextFollowing);
      showActionResult('Follow', 'Unable to update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDownload = async () => {
    closeActionMenu();
    const downloadUri = canPlayVideo ? effectiveVideoUri : safeImage;
    if (!downloadUri) { showActionResult('Download failed', 'Media not available for this post.'); return; }
    try {
      if (Platform.OS === 'web') {
        const anchor = document.createElement('a');
        anchor.href = downloadUri;
        anchor.download = `${String(story.title || story.id || 'rti-news').replace(/[^\w-]+/g, '-').slice(0, 48)}.${canPlayVideo ? 'mp4' : 'jpg'}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) { showActionResult('Permission needed', 'Please allow media access to download this post.'); return; }
        let localUri = downloadUri;
        if (/^https?:/i.test(downloadUri)) {
          const extension = canPlayVideo ? 'mp4' : 'jpg';
          const target = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}rti-news-${Date.now()}.${extension}`;
          const result = await FileSystem.downloadAsync(downloadUri, target);
          localUri = result.uri;
        }
        await MediaLibrary.saveToLibraryAsync(localUri);
        if (Sharing.isAvailableAsync && await Sharing.isAvailableAsync()) await Sharing.shareAsync(localUri);
      }
      await UserStore.recordNewsFeedMenuAction(story.id, 'download', { media_type: canPlayVideo ? 'video' : 'image', media_uri: downloadUri });
      showActionResult('Download started', 'Post media download has been started.');
    } catch {
      await UserStore.recordNewsFeedMenuAction(story.id, 'download_failed', { media_type: canPlayVideo ? 'video' : 'image' });
      showActionResult('Download failed', 'Unable to download this media right now.');
    }
  };

  const showPosterOverlay = videoPaused && showVideoPoster;
  const posterReady = videoThumbnail !== null;
  const stillCapturing = thumbnailCapturing && !posterReady;
  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase();
  const currentUserHasBlueTick = Boolean(currentUser && UserStore.hasBlueTick(currentUser));
  const authorHasBlueTick = Boolean(
    story.author_has_blue_tick || story.authorHasBlueTick || story.createdByBlueTick ||
    story.has_blue_tick ||
    (storyAuthorEmail && currentUserEmail === storyAuthorEmail && currentUserHasBlueTick)
  );

  const seatLabel = getLocalizedSeatLabel(story.author_seat_name, commonCopy);
  const authorAvatarUri = isValidImageUrl(story.author_profile_image) ? story.author_profile_image : '';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View ref={cardRef} style={styles.storyCardShell}>

        {/* ── Author Row — three dot bhi yahan ── */}
        <TouchableOpacity style={styles.storyAuthorRow} onPress={() => onOpenAuthorProfile(story)} activeOpacity={0.86}>
          <ProfileAvatar uri={authorAvatarUri} size={44} style={styles.storyAuthorAvatar} />
          <View style={styles.storyAuthorTextWrap}>
            <View style={styles.storyAuthorNameRow}>
              <Text style={styles.storyAuthorName} numberOfLines={1}>{story.author_name}</Text>
              {authorHasBlueTick ? <VerifiedBadge size={18} iconSize={11} /> : null}
            </View>
            {seatLabel ? (
              <View style={styles.storyReporterPill}>
                <Text style={styles.storyReporterPillText}>{seatLabel}</Text>
              </View>
            ) : null}
            <View style={styles.storyAuthorMetaRow}>
              <Ionicons name="eye-outline" size={12} color="#94a3b8" />
              <Text style={styles.storyMetaSmall}>{viewsCount}</Text>
              <Text style={styles.storyMetaDot}>·</Text>
              <Text style={styles.storyMetaSmall}>{story.publishedAgo || story.date}</Text>
              {story.state ? (
                <>
                  <Text style={styles.storyMetaDot}>·</Text>
                  <Ionicons name="location-outline" size={12} color="#94a3b8" />
                  <TouchableOpacity onPress={() => onOpenLocation(story.state)} activeOpacity={0.82}>
                    <Text style={styles.storyMetaSmall}>
                      {story.district ? `${story.district}, ${story.state}` : story.state}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
          {/* ── FIX: Three dot upar author row mein move kiya ── */}
          {storyAuthorEmail && storyAuthorEmail !== currentEmail ? (
            <TouchableOpacity
              style={[styles.storyFollowBtn, isFollowingAuthor && styles.storyFollowBtnActive, followLoading && styles.storyFollowBtnDisabled]}
              onPress={handleToggleFollowAuthor}
              activeOpacity={0.84}
              disabled={followLoading}
            >
              <Ionicons name={isFollowingAuthor ? 'person' : 'person-add-outline'} size={13} color={isFollowingAuthor ? '#f97316' : '#ffffff'} />
              <Text style={[styles.storyFollowBtnText, isFollowingAuthor && styles.storyFollowBtnTextActive]}>
                {followLoading ? '...' : isFollowingAuthor ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.storyMoreBtnTop, showActionMenu && styles.storyMoreBtnTopActive]}
            onPress={(e) => { e.stopPropagation?.(); setShowActionMenu((v) => !v); }}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Headline + Excerpt ── */}
        <View style={styles.storyContentWrap}>
          <TouchableOpacity onPress={() => onOpenDetails(story)} activeOpacity={0.88}>
            <Text style={styles.storyHeadlineText}>{story.title}</Text>
            {story.subtitle ? <Text style={styles.storySubtitleText} numberOfLines={2}>{story.subtitle}</Text> : null}
          </TouchableOpacity>
          {story.excerpt ? <InlineReadMore text={story.excerpt} style={styles.storyExcerptText} /> : null}
          {story.description && story.description !== story.excerpt ? <InlineReadMore text={story.description} style={styles.storyDescriptionText} /> : null}
        </View>

        {/* ── Hero Image / Video ── */}
        <TouchableOpacity style={styles.storyHeroImageWrap} onPress={canPlayVideo ? handleVideoPress : handleImagePress} activeOpacity={0.95}>
          {canPlayVideo ? (
            <>
              <VideoView player={player} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} contentFit="cover" nativeControls={false} fullscreenOptions={{ enabled: false }} playsInline onFirstFrameRender={() => setShowVideoPoster(false)} />
              {showPosterOverlay && (
                posterReady ? (
                  <Image source={{ uri: videoThumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : stillCapturing ? (
                  <View style={styles.videoLoadingOverlay}>
                    <View style={styles.videoLoadingBadge}><Text style={styles.videoLoadingText}>⏳</Text></View>
                  </View>
                ) : (
                  <View style={styles.videoLoadingOverlay} />
                )
              )}
              {videoPaused && (
                <View style={styles.storyVideoPlayOverlay}>
                  <View style={styles.storyVideoPlayBadge}><Ionicons name="play" size={22} color="#ffffff" /></View>
                  <Text style={styles.storyVideoLabel}>{commonCopy?.video || 'VIDEO'}</Text>
                </View>
              )}
              {!videoPaused && (
                <View style={styles.videoPlayingIndicator}><Ionicons name="pause" size={18} color="#ffffff" /></View>
              )}
            </>
          ) : (
            <Image source={{ uri: safeImage }} style={styles.storyHeroImage} resizeMode="cover" />
          )}
          <TouchableOpacity style={[styles.storyCategoryChip, { backgroundColor: `${categoryColor}CC` }]} onPress={() => onOpenCategory(story)} activeOpacity={0.84}>
            <Text style={styles.storyCategoryChipText}>{getLocalizedCategoryLabel(story.category, commonCopy)}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Action Bar ── */}
        <View style={styles.storyActionBar}>
          <View style={styles.storyActionLeft}>
            {/* ── FIX: Like icon — thumb ki jagah heart ── */}
            <TouchableOpacity style={styles.storyActionBtn} onPress={handleLike} activeOpacity={0.82}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={20} color={isLiked ? '#e11d48' : '#374151'} />
              <Text style={[styles.storyActionCount, isLiked && { color: '#e11d48' }]}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storyActionBtn} onPress={handleComment} activeOpacity={0.82}>
              <Ionicons name={showComments ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={20} color={showComments ? '#0ea5e9' : '#374151'} />
              <Text style={[styles.storyActionCount, showComments && { color: '#0ea5e9' }]}>{commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storyActionBtn} onPress={handleShare} activeOpacity={0.82}>
              <Ionicons name="arrow-redo-outline" size={20} color="#374151" />
              <Text style={styles.storyActionCount}>{sharesCount}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.storyActionRight}>
            <TouchableOpacity style={[styles.storyShareCircle, { backgroundColor: '#25D366' }]} onPress={handleShare} activeOpacity={0.82}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.storyShareCircle, { backgroundColor: '#1877F2' }]} onPress={handleShare} activeOpacity={0.82}>
              <Ionicons name="logo-facebook" size={18} color="#fff" />
            </TouchableOpacity>
            {/* Three dot ab action bar mein nahi — author row mein shift ho gaya */}
          </View>
        </View>

        {/* ── FIX: More menu — absolute position, card ke upar overlay hoga ── */}
        {showActionMenu ? (
          <View style={styles.storyMoreMenuWrapper}>
            <View style={styles.storyMoreMenu}>
              <TouchableOpacity style={styles.storyMoreMenuItem} onPress={handleReport} activeOpacity={0.82}>
                <Ionicons name="flag-outline" size={18} color="#ef4444" />
                <Text style={styles.storyMoreMenuText}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.storyMoreMenuItem} onPress={handleCopyLink} activeOpacity={0.82}>
                <Ionicons name="link-outline" size={18} color="#0f172a" />
                <Text style={styles.storyMoreMenuText}>Copy link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.storyMoreMenuItem} onPress={handleMenuShare} activeOpacity={0.82}>
                <Ionicons name="share-social-outline" size={18} color="#0ea5e9" />
                <Text style={styles.storyMoreMenuText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.storyMoreMenuItem} onPress={handleDownload} activeOpacity={0.82}>
                <Ionicons name="download-outline" size={18} color="#16a34a" />
                <Text style={styles.storyMoreMenuText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ── Comment Section ── */}
        {showComments ? (
          <View style={styles.commentSection}>
            <View style={styles.commentInputRow}>
              <ProfileAvatar uri={userAvatar} size={32} style={styles.commentUserAvatar} />
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
                    expandedReplyThreads={expandedReplyThreads}
                    onToggleReplies={handleToggleReplies}
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

      </View>

      {/* ── Thin separator between cards ── */}
      <View style={styles.cardSeparator} />
    </KeyboardAvoidingView>
  );
}
