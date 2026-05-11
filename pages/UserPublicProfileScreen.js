import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Clipboard, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Share, StatusBar, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../components/ui/ToastProvider';
import PremiumBadge from '../components/PremiumBadge';
import VideoPreview from '../components/VideoPreview';
import { UserStore } from '../store/UserStore';
import { isValidImageUrl } from '../utils/storyHelpers';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';
import styles from '../styles/UserPublicProfileStyles';

const DEFAULT_AVATAR = require('../assets/images/icon.png');

// ─── idb-media: → blob: resolve karne wala hook ──────────────────
function useResolvedUri(rawUri) {
  const [resolved, setResolved] = useState(() => {
    // Agar already usable URL hai to turant set karo
    if (!rawUri || isIdbMediaUri(rawUri)) return null;
    return rawUri;
  });

  useEffect(() => {
    let alive = true;
    let objectUrl = null;

    if (!rawUri) { setResolved(null); return; }

    if (!isIdbMediaUri(rawUri)) {
      setResolved(rawUri);
      return;
    }

    // idb-media: → blob: resolve karo
    resolveIdbMediaUriToObjectUrl(rawUri).then((url) => {
      if (!alive) return;
      objectUrl = url;
      setResolved(url || null);
    }).catch(() => {
      if (alive) setResolved(null);
    });

    return () => {
      alive = false;
      try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch {}
    };
  }, [rawUri]);

  return resolved;
}

// ─── Post Card Image — idb-media: resolve karta hai ──────────────
function PostCardImage({ rawUri, style, resizeMode = 'cover' }) {
  const resolved = useResolvedUri(rawUri);
  if (!resolved) return null;
  return <Image source={{ uri: resolved }} style={style} resizeMode={resizeMode} />;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAccountAge(joinDate) {
  if (!joinDate) return '';
  const ts = new Date(joinDate).getTime();
  if (!Number.isFinite(ts)) return '';
  const diffDays = Math.max(0, Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)));
  const years = Math.floor(diffDays / 365);
  if (years >= 1) return `${years} Year${years > 1 ? 's' : ''}`;
  const months = Math.floor(diffDays / 30);
  if (months >= 1) return `${months} Month${months > 1 ? 's' : ''}`;
  return `${Math.max(1, diffDays)} Day${diffDays === 1 ? '' : 's'}`;
}

function roleLabelToEnglish(role = '') {
  const v = String(role || '').toLowerCase();
  if (v === 'reporter') return 'Reporter';
  if (v === 'editor') return 'Editor';
  if (v === 'admin') return 'Admin';
  return '';
}

// Instagram jaisa Profile Image Modal
const ProfileImageModal = ({ visible, imageUri, name, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.95)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: 8,
            }}
            activeOpacity={0.8}
          >
            <Feather name="x" size={22} color="#ffffff" />
          </TouchableOpacity>

          {name ? (
            <Text style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 20,
              letterSpacing: 0.3,
            }}>
              {name}
            </Text>
          ) : null}

          <TouchableWithoutFeedback>
            <Image
              source={imageUri ? { uri: imageUri } : DEFAULT_AVATAR}
              style={{
                width: 360,
                height: 360,
                borderRadius: 180,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
              resizeMode="cover"
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Three-dot Menu Bottom Sheet
const ProfileMenuSheet = ({ visible, onClose, onCopyLink, onReport, onBlock }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        }}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            }}>
              <View style={{
                width: 40, height: 4, backgroundColor: '#e2e8f0',
                borderRadius: 2, alignSelf: 'center', marginBottom: 16,
              }} />

              <TouchableOpacity onPress={onCopyLink} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="link" size={18} color="#2563eb" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>Copy Profile Link</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Share this profile with others</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 24 }} />

              <TouchableOpacity onPress={onReport} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="flag" size={18} color="#f97316" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>Report</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Report inappropriate content</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 24 }} />

              <TouchableOpacity onPress={onBlock} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff1f2', justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="slash" size={18} color="#ef4444" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#ef4444' }}>Block</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Block this user from your feed</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 8, backgroundColor: '#f8fafc', marginTop: 8 }} />
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#64748b' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const COLLAPSE_CHAR_LIMIT = 180;

const ExpandableDescription = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const cleaned = String(text || '').trim();
  const isLong = cleaned.length > COLLAPSE_CHAR_LIMIT;
  if (!cleaned) return null;
  const displayText = (!isLong || expanded)
    ? cleaned
    : cleaned.slice(0, COLLAPSE_CHAR_LIMIT).trimEnd();
  return (
    <View style={styles.expandableContainer}>
      <Text style={styles.feedDescription}>
        {displayText}
        {isLong && !expanded ? (
          <Text onPress={() => setExpanded(true)} style={{ color: '#2563eb', fontWeight: '600', fontSize: 13 }}>
            {'... '}
            <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 13 }}>more</Text>
          </Text>
        ) : null}
      </Text>
      {isLong && expanded ? (
        <TouchableOpacity onPress={() => setExpanded(false)} activeOpacity={0.7} style={{ marginTop: 2 }}>
          <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 13 }}>less</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default function UserPublicProfileScreen({ route, navigation }) {
  const { showToast } = useToast();
  const { email, author } = route?.params || {};

  const resolvedEmail = useMemo(
    () => (email ? String(email).trim().toLowerCase() : ''),
    [email]
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalName, setModalName] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewerEmail, setViewerEmail] = useState('');

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await UserStore.getCurrentUser();
        if (!alive) return;
        setViewerEmail(String(user?.email || '').trim().toLowerCase());
      } catch {
        if (!alive) return;
        setViewerEmail('');
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const user = resolvedEmail ? await UserStore.getUser(resolvedEmail) : null;
      if (!active) return;
      setProfile(user || null);

      const fromProfile = [
        ...(Array.isArray(user?.news) ? user.news : []),
        ...(Array.isArray(user?.news_feed) ? user.news_feed : []),
      ];

      const display = user || author || {};
      const authorName = String(display?.name || display?.author_name || '').trim();

      const summary = (resolvedEmail || authorName) ? await UserStore.getNewsFeedSummary() : null;
      const fromFeed = Array.isArray(summary?.items)
        ? summary.items.filter((it) => {
          const createdBy = String(it?.createdBy || '').trim().toLowerCase();
          if (resolvedEmail && createdBy) return createdBy === resolvedEmail;
          if (!resolvedEmail && authorName) {
            const itemAuthor = String(it?.author_name || it?.createdByName || it?.author || '').trim();
            return itemAuthor && itemAuthor.toLowerCase() === authorName.toLowerCase();
          }
          return false;
        })
        : [];

      const merged = [...fromFeed, ...fromProfile]
        .filter(Boolean)
        .filter((it, index, arr) => {
          const id = it?.id;
          if (!id) return arr.findIndex((x) => x === it) === index;
          return arr.findIndex((x) => x?.id === id) === index;
        });

      setPosts(merged);
      setLoading(false);
      if (!user && resolvedEmail) showToast('User profile not found on this device. Showing available info.', 'error');
    })();
    return () => { active = false; };
  }, [resolvedEmail, showToast]);

  const display = profile || author || {};

  const name = String(display?.name || display?.author_name || 'User').trim() || 'User';
  const roleLabel = String(display?.role_label || display?.author_role_label || '').trim();
  const state = String(display?.state || '').trim();
  const district = String(display?.district || '').trim();
  const taluka = String(display?.taluka || '').trim();
  const bio = String(display?.bio || '').trim();
  const seatName = String(display?.state_seat?.seat_name || display?.author_seat_name || '').trim();
  const seatId = String(display?.state_seat?.seat_id || display?.author_seat_id || '').trim();
  const roleId = String(display?.role || display?.author_role || '').trim().toLowerCase();
  const rolePillText = roleLabelToEnglish(roleId) || roleLabel || seatName || '';
  const joinDate = String(display?.join_date || '').trim();
  const networkCount = Number(display?.referral_count || 0);
  const locationLine = [taluka, district, state].filter(Boolean).join(', ');
  const accountAge = formatAccountAge(joinDate);

  const photoUri = display?.profile_image || display?.author_profile_image || '';
  // ✅ idb-media: bhi allow — isValidImageUrl ab sab accept karta hai
  const safePhotoUri = isValidImageUrl(photoUri) ? photoUri : '';
  const hasSubscription = profile ? UserStore.hasActiveSubscription(profile) : Boolean(display?.author_is_subscriber || display?.author_is_premium);
  const isVerified = Boolean(hasSubscription || ['reporter', 'editor', 'admin'].includes(roleId));

  // ✅ Profile avatar resolve karo
  const resolvedProfilePhoto = useResolvedUri(safePhotoUri || null);

  const sortedPosts = useMemo(() => {
    const src = Array.isArray(posts) ? posts : [];
    const sortValue = (it) => {
      const createdAt = new Date(it?.createdAt || it?.date || 0).getTime();
      const idValue = Number(String(it?.id || '').replace(/\D/g, '')) || 0;
      return Number.isFinite(createdAt) && createdAt > 0 ? createdAt + idValue : idValue;
    };
    return [...src].sort((a, b) => sortValue(b) - sortValue(a));
  }, [posts]);

  const patchPostById = (postId, patch) => {
    const pid = String(postId || '');
    if (!pid) return;
    setPosts((prev) => (Array.isArray(prev) ? prev.map((p) => {
      if (String(p?.id || '') !== pid) return p;
      return { ...p, ...patch };
    }) : prev));
  };

  const loadCommentsForPost = async (postId) => {
    const pid = String(postId || '').trim();
    if (!pid) return;
    try {
      const summary = await UserStore.getNewsFeedSummary({ focusItemId: pid });
      const item = Array.isArray(summary?.items) ? summary.items.find((it) => String(it?.id || '') === pid) : null;
      const list = Array.isArray(item?.comments_list) ? item.comments_list : [];
      setActiveComments(list);
      patchPostById(pid, {
        comments: Number(item?.comments || 0),
        likes: Number(item?.likes || 0),
        shares: Number(item?.shares || 0),
        views: Number(item?.views || 0),
        liked_by: Array.isArray(item?.liked_by) ? item.liked_by : [],
      });
    } catch {
      setActiveComments([]);
    }
  };

  const openPost = async (post) => {
    if (!post) return;
    try { if (post.id) await UserStore.updateNewsFeedItem(post.id, 'view'); } catch {}
    navigation.navigate('NewsDetails', { article: post });
  };

  const handleLikePost = async (post) => {
    const pid = String(post?.id || '').trim();
    if (!pid) return;
    const prevLiked = Boolean(viewerEmail && Array.isArray(post?.liked_by) && post.liked_by.includes(viewerEmail));
    patchPostById(pid, {
      likes: Math.max(0, Number(post?.likes || 0) + (prevLiked ? -1 : 1)),
      liked_by: prevLiked ? [] : (viewerEmail ? [viewerEmail] : []),
    });
    const result = await UserStore.updateNewsFeedItem(pid, 'like');
    if (!result?.ok) {
      patchPostById(pid, { likes: Number(post?.likes || 0), liked_by: Array.isArray(post?.liked_by) ? post.liked_by : [] });
      showToast(result?.message || 'Unable to update like.', 'error');
      return;
    }
    if (typeof result.liked === 'boolean') {
      patchPostById(pid, {
        likes: Math.max(0, Number(post?.likes || 0) + (result.liked ? 1 : 0) - (prevLiked ? 1 : 0)),
        liked_by: result.liked && viewerEmail ? [viewerEmail] : [],
      });
    }
  };

  const handleSharePost = async (post) => {
    const pid = String(post?.id || '').trim();
    if (!pid) return;
    const message = `📰 ${stripHtml(post?.title || 'News')}\n\n${stripHtml(post?.subtitle || post?.description || '')}`;
    try {
      await Share.share({ title: stripHtml(post?.title || 'RTI News'), message });
    } catch {
      showToast('Share failed.', 'error');
      return;
    }
    patchPostById(pid, { shares: Number(post?.shares || 0) + 1 });
    const result = await UserStore.updateNewsFeedItem(pid, 'share');
    if (!result?.ok) showToast(result?.message || 'Unable to update share.', 'error');
  };

  const openCommentsForPost = async (post) => {
    const pid = String(post?.id || '').trim();
    if (!pid) return;
    setActiveCommentPostId(pid);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setReplyingToCommentId(null);
    setReplyText('');
    setCommentModalVisible(true);
    await loadCommentsForPost(pid);
  };

  const handleAddComment = async () => {
    if (!activeCommentPostId) return;
    const result = await UserStore.addNewsComment(activeCommentPostId, commentText);
    if (!result?.ok) { showToast(result?.message || 'Unable to add comment.', 'error'); return; }
    setCommentText('');
    await loadCommentsForPost(activeCommentPostId);
  };

  const handleLikeComment = async (commentId) => {
    if (!activeCommentPostId) return;
    const result = await UserStore.likeNewsComment(activeCommentPostId, commentId);
    if (!result?.ok) { showToast(result?.message || 'Unable to update comment.', 'error'); return; }
    await loadCommentsForPost(activeCommentPostId);
  };

  const handleReplyComment = (commentId) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
    setEditingCommentId(null);
    setEditingCommentText('');
  };
  const handleCancelReply = () => { setReplyingToCommentId(null); setReplyText(''); };

  const handleSubmitReply = async () => {
    if (!activeCommentPostId || !replyingToCommentId) return;
    const result = await UserStore.replyNewsComment(activeCommentPostId, replyingToCommentId, replyText);
    if (!result?.ok) { showToast(result?.message || 'Unable to add reply.', 'error'); return; }
    handleCancelReply();
    await loadCommentsForPost(activeCommentPostId);
  };

  const handleStartEdit = (comment) => { setEditingCommentId(comment?.id || null); setEditingCommentText(comment?.text || ''); };
  const handleCancelEdit = () => { setEditingCommentId(null); setEditingCommentText(''); };

  const handleSaveEdit = async () => {
    if (!activeCommentPostId || !editingCommentId) return;
    const result = await UserStore.editNewsComment(activeCommentPostId, editingCommentId, editingCommentText);
    if (!result?.ok) { showToast(result?.message || 'Unable to edit comment.', 'error'); return; }
    handleCancelEdit();
    await loadCommentsForPost(activeCommentPostId);
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeCommentPostId) return;
    const result = await UserStore.deleteNewsComment(activeCommentPostId, commentId);
    if (!result?.ok) { showToast(result?.message || 'Unable to delete comment.', 'error'); return; }
    if (editingCommentId === commentId) handleCancelEdit();
    await loadCommentsForPost(activeCommentPostId);
  };

  const openImageModal = (imageUri, personName) => {
    setModalImage(imageUri || '');
    setModalName(personName || '');
    setModalVisible(true);
  };

  const openAuthorProfile = (p) => {
    const authorEmail = String(p?.createdBy || p?.author_email || '').trim().toLowerCase();
    const authorName = String(p?.author_name || p?.createdByName || p?.author || '').trim();
    if (authorEmail && authorEmail === resolvedEmail) return;
    if (!authorEmail && authorName && authorName.toLowerCase() === name.toLowerCase()) return;
    const authorData = {
      name: authorName || name,
      profile_image: p?.author_profile_image || p?.authorAvatar || safePhotoUri,
      role: p?.author_role || p?.createdByRole || roleId,
      role_label: p?.author_role_label || roleLabel,
      state: p?.state || state,
      district: p?.district || district,
      taluka: p?.taluka || taluka,
      author_seat_name: p?.author_seat_name || seatName,
      author_seat_id: p?.author_seat_id || seatId,
    };
    navigation.push('UserPublicProfile', { email: authorEmail || undefined, author: authorData });
  };

  const handleCopyProfileLink = () => {
    setMenuVisible(false);
    const link = `rtinews://profile?email=${resolvedEmail || ''}&name=${encodeURIComponent(name)}`;
    Clipboard.setString(link);
    showToast('Profile link copied!', 'success');
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report User', `Are you sure you want to report "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report', style: 'destructive',
        onPress: async () => {
          try { await UserStore.reportUser?.(resolvedEmail); } catch {}
          showToast('User reported. We will review shortly.', 'success');
        },
      },
    ]);
  };

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert('Block User', `Are you sure you want to block "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block', style: 'destructive',
        onPress: async () => {
          try { await UserStore.blockUser?.(resolvedEmail); } catch {}
          showToast(`"${name}" has been blocked.`, 'success');
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSubscribe = () => { navigation.navigate('Subscription Plans'); };

  return (
    <View style={styles.root}>
      <ProfileImageModal
        visible={modalVisible}
        imageUri={modalImage}
        name={modalName}
        onClose={() => setModalVisible(false)}
      />

      <ProfileMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCopyLink={handleCopyProfileLink}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      {/* Comments Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCommentModalVisible(false)}>
          <View style={styles.commentOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.commentSheetContainer}
              >
                <View style={styles.commentSheet}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentTitle}>Comments</Text>
                    <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                      <Feather name="x" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.commentList}
                    contentContainerStyle={styles.commentListContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {activeComments?.length ? (
                      activeComments.map((c) => {
                        const ownerMatch =
                          (c.author_email && viewerEmail && String(c.author_email).trim().toLowerCase() === viewerEmail)
                          || (!c.author_email && (c.author === viewerEmail));
                        const liked = viewerEmail && Array.isArray(c.liked_by) && c.liked_by.includes(viewerEmail);
                        return (
                          <View key={c.id} style={styles.commentItem}>
                            <View style={styles.commentTopRow}>
                              <Text style={styles.commentAuthor}>{c.author || 'User'}</Text>
                              <Text style={styles.commentDate}>{c.date || ''}{c.edited_at ? ' • Edited' : ''}</Text>
                            </View>
                            {editingCommentId === c.id ? (
                              <TextInput style={styles.commentEditInput} value={editingCommentText} onChangeText={setEditingCommentText} multiline />
                            ) : (
                              <Text style={styles.commentText}>{c.text}</Text>
                            )}
                            <View style={styles.commentActionRow}>
                              <TouchableOpacity style={[styles.commentActionBtn, liked && styles.commentActionBtnActive]} onPress={() => handleLikeComment(c.id)}>
                                <Feather name="heart" size={13} color={liked ? '#ef4444' : '#e11d48'} />
                                <Text style={[styles.commentActionText, liked && styles.commentActionTextActive]}>{liked ? 'Liked' : 'Like'}{c.likes ? ` (${c.likes})` : ''}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.commentActionBtn} onPress={() => handleReplyComment(c.id)}>
                                <Feather name="message-circle" size={13} color="#64748b" />
                                <Text style={styles.commentActionText}>Reply</Text>
                              </TouchableOpacity>
                              {ownerMatch ? (
                                editingCommentId === c.id ? (
                                  <>
                                    <TouchableOpacity style={styles.commentMiniBtn} onPress={handleSaveEdit}><Feather name="check" size={13} color="#16a34a" /><Text style={[styles.commentMiniBtnText, { color: '#16a34a' }]}>Save</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.commentMiniBtn} onPress={handleCancelEdit}><Feather name="x" size={13} color="#64748b" /><Text style={styles.commentMiniBtnText}>Cancel</Text></TouchableOpacity>
                                  </>
                                ) : (
                                  <>
                                    <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleStartEdit(c)}><Feather name="edit-2" size={13} color="#2563eb" /><Text style={styles.commentMiniBtnText}>Edit</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleDeleteComment(c.id)}><Feather name="trash-2" size={13} color="#ef4444" /><Text style={[styles.commentMiniBtnText, { color: '#ef4444' }]}>Delete</Text></TouchableOpacity>
                                  </>
                                )
                              ) : null}
                            </View>
                            {replyingToCommentId === c.id && (
                              <View style={styles.commentReplyForm}>
                                <TextInput style={styles.commentReplyInput} placeholder="Write a reply..." placeholderTextColor="#94a3b8" value={replyText} onChangeText={setReplyText} multiline />
                                <View style={styles.commentReplyActions}>
                                  <TouchableOpacity style={styles.commentReplyBtn} onPress={handleSubmitReply} disabled={!replyText.trim()}><Text style={styles.commentReplyBtnText}>Reply</Text></TouchableOpacity>
                                  <TouchableOpacity style={[styles.commentReplyBtn, styles.commentCancelBtn]} onPress={handleCancelReply}><Text style={styles.commentCancelBtnText}>Cancel</Text></TouchableOpacity>
                                </View>
                              </View>
                            )}
                            {Array.isArray(c.replies) && c.replies.length > 0 && (
                              <View style={styles.commentReplies}>
                                {c.replies.map((reply) => {
                                  const replyOwnerMatch = (reply.author_email && viewerEmail && String(reply.author_email).trim().toLowerCase() === viewerEmail) || (!reply.author_email && (reply.author === viewerEmail));
                                  const replyLiked = viewerEmail && Array.isArray(reply.liked_by) && reply.liked_by.includes(viewerEmail);
                                  return (
                                    <View key={reply.id} style={styles.commentReplyItem}>
                                      <View style={styles.commentTopRow}>
                                        <Text style={styles.commentAuthor}>{reply.author || 'User'}</Text>
                                        <Text style={styles.commentDate}>{reply.date || ''}{reply.edited_at ? ' • Edited' : ''}</Text>
                                      </View>
                                      {editingCommentId === reply.id ? (
                                        <TextInput style={styles.commentEditInput} value={editingCommentText} onChangeText={setEditingCommentText} multiline />
                                      ) : (
                                        <Text style={styles.commentText}>{reply.text}</Text>
                                      )}
                                      <View style={styles.commentActionRow}>
                                        <TouchableOpacity style={[styles.commentActionBtn, replyLiked && styles.commentActionBtnActive]} onPress={() => handleLikeComment(reply.id)}>
                                          <Feather name="heart" size={13} color={replyLiked ? '#ef4444' : '#e11d48'} />
                                          <Text style={[styles.commentActionText, replyLiked && styles.commentActionTextActive]}>{replyLiked ? 'Liked' : 'Like'}{reply.likes ? ` (${reply.likes})` : ''}</Text>
                                        </TouchableOpacity>
                                        {replyOwnerMatch ? (
                                          editingCommentId === reply.id ? (
                                            <>
                                              <TouchableOpacity style={styles.commentMiniBtn} onPress={handleSaveEdit}><Feather name="check" size={13} color="#16a34a" /><Text style={[styles.commentMiniBtnText, { color: '#16a34a' }]}>Save</Text></TouchableOpacity>
                                              <TouchableOpacity style={styles.commentMiniBtn} onPress={handleCancelEdit}><Feather name="x" size={13} color="#64748b" /><Text style={styles.commentMiniBtnText}>Cancel</Text></TouchableOpacity>
                                            </>
                                          ) : (
                                            <>
                                              <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleStartEdit(reply)}><Feather name="edit-2" size={13} color="#2563eb" /><Text style={styles.commentMiniBtnText}>Edit</Text></TouchableOpacity>
                                              <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleDeleteComment(reply.id)}><Feather name="trash-2" size={13} color="#ef4444" /><Text style={[styles.commentMiniBtnText, { color: '#ef4444' }]}>Delete</Text></TouchableOpacity>
                                            </>
                                          )
                                        ) : null}
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.commentEmptyText}>No comments yet.</Text>
                    )}
                  </ScrollView>

                  <View style={styles.commentInputRow}>
                    <TextInput style={styles.commentInput} placeholder="Write a comment..." placeholderTextColor="#94a3b8" value={commentText} onChangeText={setCommentText} multiline />
                    <TouchableOpacity style={[styles.commentSendBtn, !commentText.trim() && { opacity: 0.6 }]} onPress={handleAddComment} disabled={!commentText.trim()}>
                      <Feather name="send" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <Feather name="more-vertical" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <TouchableOpacity style={styles.avatarWrap} onPress={() => openImageModal(resolvedProfilePhoto || safePhotoUri, name)} activeOpacity={0.85}>
              {/* ✅ Resolved profile photo use karo */}
              <Image
                source={resolvedProfilePhoto ? { uri: resolvedProfilePhoto } : DEFAULT_AVATAR}
                style={styles.avatar}
              />
              {isVerified ? (
                <View style={styles.verifiedOnAvatar}><Feather name="check" size={12} color="#ffffff" /></View>
              ) : null}
            </TouchableOpacity>

            <View style={styles.profileMain}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={2}>{name}</Text>
                {isVerified ? (
                  <View style={styles.verifiedBadge}><Feather name="check" size={12} color="#ffffff" /></View>
                ) : null}
              </View>
              {locationLine ? (
                <View style={styles.locationLine}>
                  <Feather name="map-pin" size={14} color="#0f172a" />
                  <Text style={styles.locationLineText} numberOfLines={2}>{locationLine}</Text>
                </View>
              ) : null}
              {rolePillText ? (
                <View style={styles.rolePill}>
                  <Feather name="star" size={14} color="#0f172a" />
                  <Text style={styles.rolePillText} numberOfLines={1}>{rolePillText}</Text>
                </View>
              ) : null}
              {seatName || seatId ? (
                <View style={styles.seatPill}>
                  <Feather name="award" size={14} color="#0f172a" />
                  <Text style={styles.seatPillText} numberOfLines={1}>{seatName || seatId}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {bio ? <Text style={styles.bioInline}>{bio}</Text> : null}

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{Number.isFinite(networkCount) ? String(networkCount) : '0'}</Text>
              <Text style={styles.metricLabel}>Network</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{accountAge || '—'}</Text>
              <Text style={styles.metricLabel}>Account</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.85}>
              <Feather name="user-plus" size={16} color="#ffffff" />
              <Text style={styles.subscribeBtnText}>Subscribe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.85}>
              <Feather name="share-2" size={16} color="#0f172a" />
              <Text style={styles.shareBtnText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]} onPress={() => setActiveTab('posts')} activeOpacity={0.85}>
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'activity' && styles.tabBtnActive]} onPress={() => setActiveTab('activity')} activeOpacity={0.85}>
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'activity' ? (
          <View style={styles.activityCard}>
            <Text style={styles.mutedText}>No activity yet.</Text>
          </View>
        ) : sortedPosts.length ? (
          <View style={{ gap: 12 }}>
            {sortedPosts.map((p) => {
              const postTitle = p.title || 'Untitled';
              const postDescription = stripHtml(p.description || p.body || p.content || p.summary || p.caption || p.excerpt || '');
              const postLocation = [p.taluka, p.district, p.state].filter(Boolean).join(', ');
              const postVideo = String(p.video || '').trim();

              // ✅ idb-media: URLs bhi include karo — resolve PostCardImage mein hoga
              const imageCandidates = [
                ...(Array.isArray(p.images) ? p.images : []),
                p.image,
              ]
                .map((u) => String(u || '').trim())
                .filter((u) => u && u !== 'null' && u !== 'undefined');
              const postImages = Array.from(new Set(imageCandidates));
              const postThumb = postImages.length ? postImages[0] : null;

              const showPending = p.status && String(p.status).toLowerCase() !== 'approved';

              const postAuthorPhoto = String(p?.author_profile_image || p?.authorAvatar || safePhotoUri || '').trim();
              const postAuthorName = String(p?.author_name || p?.createdByName || p?.author || name).trim();

              return (
                <View key={p.id || `${postTitle}-${p.date}`} style={styles.feedCard}>
                  {/* Header */}
                  <View style={styles.feedHeader}>
                    <TouchableOpacity onPress={() => openImageModal(postAuthorPhoto, postAuthorName)} activeOpacity={0.8}>
                      {/* ✅ PostCardImage: idb-media: resolve karta hai */}
                      {postAuthorPhoto ? (
                        <PostCardImage rawUri={postAuthorPhoto} style={styles.feedAvatar} />
                      ) : (
                        <Image source={DEFAULT_AVATAR} style={styles.feedAvatar} />
                      )}
                    </TouchableOpacity>

                    <View style={styles.feedHeaderMain}>
                      <View style={styles.feedNameRow}>
                        {rolePillText ? (
                          <View style={styles.feedRoleMiniPill}>
                            <Text style={styles.feedRoleMiniText}>{rolePillText}</Text>
                          </View>
                        ) : null}
                        <TouchableOpacity onPress={() => openAuthorProfile(p)} activeOpacity={0.8}>
                          <Text style={styles.feedName} numberOfLines={1}>{postAuthorName}</Text>
                        </TouchableOpacity>
                        {isVerified ? <Feather name="check-circle" size={14} color="#2563eb" /> : null}
                      </View>
                      <View style={styles.feedMetaRow}>
                        <Text style={styles.feedMetaText} numberOfLines={1}>{p.date || ''}</Text>
                        {postLocation ? (
                          <>
                            <Text style={styles.feedMetaDot}>•</Text>
                            <Text style={styles.feedMetaText} numberOfLines={1}>{postLocation}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* Title — clickable to open post */}
                  <TouchableOpacity onPress={() => openPost(p)} activeOpacity={0.85}>
                    <Text style={styles.feedTitle} numberOfLines={3}>{stripHtml(postTitle)}</Text>
                  </TouchableOpacity>

                  {postDescription ? <ExpandableDescription text={postDescription} /> : null}

                  {/* Video */}
                  {postVideo ? (
                    <View style={styles.feedVideoBox}>
                      <VideoPreview uri={postVideo} style={styles.feedVideo} contentFit="cover" />
                    </View>
                  ) : null}

                  {/* ✅ Thumbnail — PostCardImage resolves idb-media: */}
                  {postThumb ? (
                    <TouchableOpacity onPress={() => openPost(p)} activeOpacity={0.9}>
                      <PostCardImage rawUri={postThumb} style={styles.feedImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ) : null}

                  {/* ✅ Extra gallery images */}
                  {postImages.length > 1 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.feedGalleryScroll}>
                      <View style={styles.feedGalleryRow}>
                        {postImages.slice(1).map((uri, index) => (
                          <PostCardImage
                            key={`${uri}-${index}`}
                            rawUri={uri}
                            style={styles.feedGalleryThumb}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    </ScrollView>
                  ) : null}

                  {showPending ? (
                    <View style={styles.feedStatusPill}>
                      <Text style={styles.feedStatusText}>{String(p.status).toUpperCase()}</Text>
                    </View>
                  ) : null}

                  {/* Action bar */}
                  <View style={styles.feedActions}>
                    {(() => {
                      const liked = Boolean(viewerEmail && Array.isArray(p.liked_by) && p.liked_by.includes(viewerEmail));
                      return (
                        <TouchableOpacity style={[styles.feedActionButton, liked && styles.feedActionButtonActive]} onPress={() => handleLikePost(p)} activeOpacity={0.8}>
                          <Feather name="heart" size={16} color={liked ? '#ef4444' : '#0f172a'} />
                          <Text style={styles.feedActionText}>{Number(p.likes || 0)}</Text>
                        </TouchableOpacity>
                      );
                    })()}
                    <TouchableOpacity style={styles.feedActionButton} onPress={() => openCommentsForPost(p)} activeOpacity={0.8}>
                      <Feather name="message-circle" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.comments || 0)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedActionButton} onPress={() => handleSharePost(p)} activeOpacity={0.8}>
                      <Feather name="share-2" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.shares || 0)}</Text>
                    </TouchableOpacity>
                    <View style={[styles.feedActionItem, { marginLeft: 'auto' }]}>
                      <Feather name="eye" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.views || 0)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.activityCard}>
            <Text style={styles.mutedText}>No posts found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}