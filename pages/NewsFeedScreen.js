import React, { useCallback, useState, useEffect } from 'react';
import {
  Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Share,
  Text, TextInput, TouchableOpacity, View, Alert, BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ProfileAvatar from '../components/ProfileAvatar';
import VideoPreview from '../components/VideoPreview';
import VerifiedBadge from '../components/VerifiedBadge';
import { useToast } from '../components/ui/ToastProvider';
import styles from '../styles/NewsFeedStyles';
import { UserStore } from '../store/UserStore';
import { INDIAN_STATES } from './locationData';
import { isIdbMediaUri, resolveIdbMediaUriToObjectUrl } from '../utils/webMediaStore';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Filter constants ──────────────────────────────────────────────
const REPORT_TYPES = [
  'All', 'Breaking News', 'Investigation', 'Opinion',
  'Feature', 'Local News', 'National', 'International',
  'Sports', 'Business', 'Technology', 'Health', 'Politics',
];

const ROLE_TYPES = [
  'All', 'Subscriber', 'Premium', 'Reporter', 'Editor',
];

function itemMatchesLanguage(item, selectedLanguage) {
  const activeLanguage = String(selectedLanguage || '').trim().toLowerCase();
  if (!activeLanguage) return true;
  const itemLanguage = String(item?.language || item?.lang || item?.news_language || '').trim().toLowerCase();
  if (!itemLanguage) return true;
  return itemLanguage === activeLanguage;
}

// ─── ResolvedImage ─────────────────────────────────────────────────
function ResolvedImage({ uri, style, resizeMode = 'cover' }) {
  const [resolvedUri, setResolvedUri] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!uri) return;
    if (Platform.OS === 'web' && isIdbMediaUri(uri)) {
      resolveIdbMediaUriToObjectUrl(uri).then((url) => {
        if (alive && url) setResolvedUri(url);
      }).catch(() => {});
    } else {
      setResolvedUri(uri);
    }
    return () => { alive = false; };
  }, [uri]);

  if (!resolvedUri) {
    return <View style={[style, styles.imagePlaceholder]} />;
  }
  return <Image source={{ uri: resolvedUri }} style={style} resizeMode={resizeMode} />;
}

// ─── FilterChip ────────────────────────────────────────────────────
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, active && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── FilterDropdown ────────────────────────────────────────────────
const FilterDropdown = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const isActive = value && value !== 'All';
  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={[styles.dropdownBtn, isActive && styles.dropdownBtnActive]}
        onPress={() => setOpen((p) => !p)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.dropdownBtnText, isActive && styles.dropdownBtnTextActive]}
          numberOfLines={1}
        >
          {value || label}
        </Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={13}
          color={isActive ? '#fff' : '#FF6600'}
        />
      </TouchableOpacity>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>
                  {opt}
                </Text>
                {value === opt ? <Feather name="check" size={12} color="#FF6600" /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

function FeedCommentItem({
  comment,
  currentUser,
  editingCommentId,
  editingCommentText,
  onEditingCommentTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteComment,
  onLikeComment,
  replyingToCommentId,
  replyText,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  expandedReplyThreads,
  onToggleReplies,
  isReply = false,
}) {
  const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
  const ownerMatch =
    (comment.author_email && currentEmail && String(comment.author_email).trim().toLowerCase() === currentEmail)
    || (!comment.author_email && (comment.author === currentEmail || comment.author === currentUser?.name));
  const liked = currentEmail && Array.isArray(comment.liked_by) && comment.liked_by.includes(currentEmail);
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const replyCount = Array.isArray(comment.replies) ? comment.replies.length : 0;
  const hasReplies = replyCount > 0;
  const areRepliesExpanded = Boolean(expandedReplyThreads?.[comment.id]);

  return (
    <View style={[styles.commentItem, isReply && styles.commentReplyItem]}>
      <View style={styles.commentTopRow}>
        <Text style={styles.commentAuthor}>{comment.author || 'User'}</Text>
        <Text style={styles.commentDate}>{comment.date || ''}{comment.edited_at ? ' • Edited' : ''}</Text>
      </View>

      {isEditing ? (
        <TextInput style={styles.commentEditInput} value={editingCommentText} onChangeText={onEditingCommentTextChange} multiline />
      ) : (
        <Text style={styles.commentText}>{comment.text}</Text>
      )}

      <View style={styles.commentActionRow}>
        <TouchableOpacity style={[styles.commentActionBtn, liked && styles.commentActionBtnActive]} onPress={() => onLikeComment(comment.id)}>
          <Feather name="heart" size={12} color={liked ? '#ffffff' : '#FF6600'} />
          <Text style={[styles.commentActionText, liked && styles.commentActionTextActive]}>{liked ? 'Liked' : 'Like'}{comment.likes ? ` (${comment.likes})` : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentMiniBtn} onPress={() => onStartReply(comment.id)}>
          <Feather name="corner-down-right" size={12} color="#FF6600" />
          <Text style={styles.commentMiniBtnText}>Reply</Text>
        </TouchableOpacity>

        {ownerMatch ? (
          isEditing ? (
            <>
              <TouchableOpacity style={styles.commentMiniBtn} onPress={onSaveEdit}>
                <Feather name="check" size={12} color="#FF6600" />
                <Text style={styles.commentMiniBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentMiniBtn} onPress={onCancelEdit}>
                <Feather name="x" size={12} color="#94a3b8" />
                <Text style={styles.commentMiniBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.commentMiniBtn} onPress={() => onStartEdit(comment)}>
                <Feather name="edit-2" size={12} color="#FF6600" />
                <Text style={styles.commentMiniBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.commentMiniBtn} onPress={() => onDeleteComment(comment.id)}>
                <Feather name="trash-2" size={12} color="#ef4444" />
                <Text style={styles.commentMiniBtnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </>
          )
        ) : null}
      </View>

      {isReplying ? (
        <View style={styles.commentReplyForm}>
          <TextInput
            style={styles.commentReplyInput}
            placeholder="Write a reply..."
            placeholderTextColor="#fda4be"
            value={replyText}
            onChangeText={onReplyTextChange}
            multiline
          />
          <View style={styles.commentReplyActions}>
            <TouchableOpacity style={styles.commentMiniBtn} onPress={onSubmitReply}>
              <Feather name="send" size={12} color="#FF6600" />
              <Text style={styles.commentMiniBtnText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commentMiniBtn} onPress={onCancelReply}>
              <Feather name="x" size={12} color="#94a3b8" />
              <Text style={styles.commentMiniBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {hasReplies ? (
        <View style={styles.commentRepliesWrap}>
          <TouchableOpacity style={styles.commentRepliesToggle} onPress={() => onToggleReplies(comment.id)}>
            <View style={styles.commentRepliesLine} />
            <Text style={styles.commentRepliesToggleText}>
              {areRepliesExpanded ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>

          {areRepliesExpanded ? (
            <View style={styles.commentRepliesList}>
              {comment.replies.map((reply) => (
                <FeedCommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  editingCommentId={editingCommentId}
                  editingCommentText={editingCommentText}
                  onEditingCommentTextChange={onEditingCommentTextChange}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  onDeleteComment={onDeleteComment}
                  onLikeComment={onLikeComment}
                  replyingToCommentId={replyingToCommentId}
                  replyText={replyText}
                  onReplyTextChange={onReplyTextChange}
                  onStartReply={onStartReply}
                  onCancelReply={onCancelReply}
                  onSubmitReply={onSubmitReply}
                  expandedReplyThreads={expandedReplyThreads}
                  onToggleReplies={onToggleReplies}
                  isReply={true}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ─── Edit News Modal ───────────────────────────────────────────────
const EditNewsModal = ({ visible, newsItem, onClose, onUpdate, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    state: '',
    district: '',
    taluka: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        subtitle: newsItem.subtitle || '',
        description: newsItem.description || '',
        category: newsItem.category || '',
        state: newsItem.state || '',
        district: newsItem.district || '',
        taluka: newsItem.taluka || '',
      });
    }
  }, [newsItem]);

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setLoading(true);
    const result = await UserStore.updateNewsFeedItem(newsItem.id, formData);
    setLoading(false);
    if (result.ok) {
      showToast('News updated successfully', 'success');
      if (typeof onUpdate === 'function') {
        await onUpdate();
      }
      onClose();
    } else {
      showToast(result.message || 'Update failed', 'error');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.commentOverlay}>
        <View style={styles.editModalSheet}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentTitle}>Edit News</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.editModalScroll} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.editInput}
              placeholder="Title *"
              placeholderTextColor="#94a3b8"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Subtitle"
              placeholderTextColor="#94a3b8"
              value={formData.subtitle}
              onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
            />
            <TextInput
              style={styles.editInputMultiline}
              placeholder="Description"
              placeholderTextColor="#94a3b8"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <TextInput
              style={styles.editInput}
              placeholder="Category"
              placeholderTextColor="#94a3b8"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
            <TextInput
              style={styles.editInput}
              placeholder="State"
              placeholderTextColor="#94a3b8"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
            />
            <TextInput
              style={styles.editInput}
              placeholder="District"
              placeholderTextColor="#94a3b8"
              value={formData.district}
              onChangeText={(text) => setFormData({ ...formData, district: text })}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Taluka"
              placeholderTextColor="#94a3b8"
              value={formData.taluka}
              onChangeText={(text) => setFormData({ ...formData, taluka: text })}
            />
            <TouchableOpacity
              style={[styles.addNewsButton, loading && styles.addNewsButtonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Feather name="check-circle" size={16} color="#ffffff" />
              <Text style={styles.addNewsButtonText}>{loading ? 'Updating...' : 'Update News'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────
export default function NewsFeedScreen({ navigation }) {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const successMessage = '';
  const [loading, setLoading] = useState(true);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeCommentItem, setActiveCommentItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplyThreads, setExpandedReplyThreads] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState(null);

  const [filterState, setFilterState] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterTaluka, setFilterTaluka] = useState('');
  const [filterReportType, setFilterReportType] = useState('All');
  const [filterRoleType, setFilterRoleType] = useState('All');
  const [searchText, setSearchText] = useState('');

  const [newsData, setNewsData] = useState({
    currentUser: null,
    items: [],
    totalViews: 0,
    totalShares: 0,
  });

  const moduleName = 'News Feed';
  const stateOptions = ['All', ...INDIAN_STATES];

  const isLocationState = (value = '') => INDIAN_STATES.includes(value);

  const applyLocationFilter = (items = [], user = null) => {
    if (!user || !UserStore.hasPremiumAccess(user) || !user.location_complete || !user.state) return items;
    return items.filter((item) => {
      if (!isLocationState(item.state)) return true;
      if (item.state && item.state !== user.state) return false;
      if (item.district && user.district && item.district !== user.district) return false;
      if (item.taluka && user.taluka && item.taluka !== user.taluka) return false;
      return true;
    });
  };

  const applyUIFilters = (items = []) => {
    return items.filter((item) => {
      if (filterState && filterState !== 'All') {
        if (item.state !== filterState) return false;
      }
      if (filterDistrict.trim()) {
        const q = filterDistrict.trim().toLowerCase();
        if (!(item.district || '').toLowerCase().includes(q)) return false;
      }
      if (filterTaluka.trim()) {
        const q = filterTaluka.trim().toLowerCase();
        if (!(item.taluka || '').toLowerCase().includes(q)) return false;
      }
      if (filterReportType && filterReportType !== 'All') {
        if ((item.category || '').toLowerCase() !== filterReportType.toLowerCase()) return false;
      }
      if (filterRoleType && filterRoleType !== 'All') {
        const role = filterRoleType.toLowerCase();
        if (role === 'subscriber' && !item.author_is_subscriber) return false;
        if (role === 'premium' && !item.author_is_premium) return false;
        if (role === 'reporter' && item.author_role !== 'reporter') return false;
        if (role === 'editor' && item.author_role !== 'editor') return false;
      }
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const haystack = `${item.title} ${item.subtitle} ${item.description} ${item.author_name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  };

  const activeFilterCount = [
    filterState !== 'All' && filterState,
    filterDistrict.trim(),
    filterTaluka.trim(),
    filterReportType !== 'All' && filterReportType,
    filterRoleType !== 'All' && filterRoleType,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilterState('All');
    setFilterDistrict('');
    setFilterTaluka('');
    setFilterReportType('All');
    setFilterRoleType('All');
    setSearchText('');
  };

  const formatCommentsForView = useCallback((comments = []) => {
    if (!Array.isArray(comments)) return [];
    return comments.map((comment) => ({
      id: String(comment.id || ''),
      text: String(comment.text || ''),
      author: String(comment.author || 'User'),
      author_email: String(comment.author_email || ''),
      date: comment.date || '',
      edited_at: comment.edited_at || null,
      likes: Number(comment.likes || 0),
      liked_by: Array.isArray(comment.liked_by) ? comment.liked_by : [],
      parent_comment_id: comment.parent_comment_id || null,
      replies: formatCommentsForView(Array.isArray(comment.replies) ? comment.replies : []),
    }));
  }, []);

  const syncFeed = useCallback(async (focusItemId = null) => {
    setLoading(true);
    const data = await UserStore.getNewsFeedSummary(focusItemId ? { focusItemId } : undefined);
    setLoading(false);
    if (!data) { navigation.replace('Login'); return null; }
    const filteredItems = applyLocationFilter(data.items, data.currentUser);
    const totalViews = filteredItems.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
    const totalShares = filteredItems.reduce((sum, item) => sum + (Number(item.shares) || 0), 0);
    const payload = { ...data, items: filteredItems, totalViews, totalShares };
    setNewsData(payload);
    if (focusItemId) {
      const target = filteredItems.find((item) => item.id === focusItemId);
      setActiveCommentItem(target || null);
      setLocalComments(formatCommentsForView(target?.comments_list || []));
    }
    return payload;
  }, [formatCommentsForView, navigation]);

  const loadNewsFeed = useCallback(async () => { await syncFeed(); }, [syncFeed]);

  useFocusEffect(useCallback(() => { loadNewsFeed(); }, [loadNewsFeed]));

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (commentModalVisible) {
        setCommentModalVisible(false);
        setLocalComments([]);
        setReplyingToCommentId(null);
        setReplyText('');
        setExpandedReplyThreads({});
        return true;
      }
      if (editModalVisible) {
        setEditModalVisible(false);
        setEditingNewsItem(null);
        return true;
      }
      if (filterPanelVisible) {
        setFilterPanelVisible(false);
        return true;
      }
      handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, [commentModalVisible, editModalVisible, filterPanelVisible, navigation]);

  const handleShare = async (item) => {
    const shareText = `${item.title}\nCategory: ${item.category}\nState: ${item.state}\nDate: ${item.date}\n${item.subtitle || item.description}`;
    const canShareMedia = Platform.OS !== 'web' && (await Sharing.isAvailableAsync());
    const ensureLocalFile = async (uri, fallbackExt = 'bin') => {
      if (!uri) return null;
      if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
      if (uri.startsWith('data:')) {
        const match = uri.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return null;
        const ext = (match[1] || '').includes('/') ? match[1].split('/')[1] : fallbackExt;
        const target = `${FileSystem.cacheDirectory}share-${Date.now()}.${ext}`;
        await FileSystem.writeAsStringAsync(target, match[2], { encoding: FileSystem.EncodingType.Base64 });
        return target;
      }
      return uri;
    };
    const mediaCandidate = item.video || (item.images?.length ? item.images[0] : null) || item.file?.uri;
    try {
      if (canShareMedia && mediaCandidate) {
        const uri = await ensureLocalFile(mediaCandidate, item.video ? 'mp4' : 'jpg');
        if (uri) { await Sharing.shareAsync(uri, { dialogTitle: item.title || 'Share media' }); }
        else { await Share.share({ title: item.title, message: shareText }); }
      } else {
        await Share.share({ title: item.title, message: shareText });
      }
    } catch { showToast('Share failed.', 'error'); return; }
    const result = await UserStore.updateNewsFeedItem(item.id, 'share');
    if (!result.ok) { showToast(result.message, 'error'); return; }
    loadNewsFeed();
  };

  const handleOpenFile = async (file) => {
    if (!file?.uri) return;
    try { await Linking.openURL(file.uri); }
    catch { showToast('Unable to open file.', 'error'); }
  };

  const handleLike = async (item) => {
    const result = await UserStore.updateNewsFeedItem(item.id, 'like');
    if (!result.ok) { showToast(result.message, 'error'); return; }
    loadNewsFeed();
  };

  const handleBookmark = async (item) => {
    const result = await UserStore.updateNewsFeedItem(item.id, 'bookmark');
    if (!result.ok) { showToast(result.message, 'error'); return; }
    loadNewsFeed();
  };

  const handleEdit = (item) => {
    setEditingNewsItem(item);
    setEditModalVisible(true);
  };

  const runDeleteNewsItem = async (item) => {
    const result = await UserStore.deleteNewsFeedItem(item.id);
    if (result.ok) {
      showToast('News deleted successfully', 'success');
      await loadNewsFeed();
      return;
    }
    showToast(result.message || 'Delete failed', 'error');
  };

  const handleDelete = async (item) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('Are you sure you want to delete this news item? This action cannot be undone.')
        : true;
      if (!confirmed) return;
      await runDeleteNewsItem(item);
      return;
    }

    Alert.alert(
      'Delete News',
      'Are you sure you want to delete this news item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await runDeleteNewsItem(item);
          },
        },
      ]
    );
  };

  const openComments = async (item) => {
    setActiveCommentItem(item);
    setLocalComments(formatCommentsForView(item?.comments_list || []));
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setReplyingToCommentId(null);
    setReplyText('');
    setExpandedReplyThreads({});
    setCommentModalVisible(true);
    await syncFeed(item?.id || null);
  };

  const toggleExpanded = (itemId) => setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  const openAuthorProfile = (item) => {
    if (!item) return;
    const authorEmail = String(item.createdBy || '').trim().toLowerCase();
    const fallbackAuthor = {
      name: item.author_name || '',
      author_profile_image: item.author_profile_image || '',
      author_seat_name: item.author_seat_name || '',
      author_role_label: item.author_role_label || '',
      author_has_blue_tick: Boolean(item.author_has_blue_tick || item.has_blue_tick),
      has_blue_tick: Boolean(item.author_has_blue_tick || item.has_blue_tick),
      author_is_premium: Boolean(item.author_is_premium),
      author_is_subscriber: Boolean(item.author_is_subscriber),
    };
    if (!authorEmail && !fallbackAuthor.name && !fallbackAuthor.author_profile_image) {
      showToast('Author profile not available.', 'error');
      return;
    }
    navigation.navigate('UserProfile', { email: authorEmail, author: fallbackAuthor });
  };

  const findParentCommentId = useCallback((comments = [], targetCommentId) => {
    for (const comment of comments) {
      if (comment.id === targetCommentId) return comment.id;
      if (Array.isArray(comment.replies) && comment.replies.some((reply) => reply.id === targetCommentId)) {
        return comment.id;
      }
    }
    return null;
  }, []);

  const updateFeedCommentCount = useCallback((itemId, delta) => {
    if (!itemId || !delta) return;
    setNewsData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item) =>
        item.id === itemId
          ? { ...item, comments: Math.max(0, Number(item.comments || 0) + delta) }
          : item
      ),
    }));
  }, []);

  const handleAddComment = async () => {
    if (!activeCommentItem) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const result = await UserStore.addNewsComment(activeCommentItem.id, trimmed);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    const added = result.comment || {};
    const newComment = {
      id: String(added.id || Date.now().toString()),
      text: String(added.text || trimmed),
      author: String(added.author || currentUser?.name || 'User'),
      author_email: String(added.author_email || currentUser?.email || ''),
      date: added.date || 'Now',
      edited_at: null,
      likes: 0,
      liked_by: [],
      parent_comment_id: null,
      replies: [],
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setActiveCommentItem((prev) => prev ? { ...prev, comments: Number(prev.comments || 0) + 1 } : prev);
    updateFeedCommentCount(activeCommentItem.id, 1);
    setCommentText('');
  };

  const handleLikeComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.likeNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const wasLiked = Array.isArray(comment.liked_by) && currentEmail && comment.liked_by.includes(currentEmail);
          return {
            ...comment,
            likes: Math.max(0, Number(comment.likes || 0) + (wasLiked ? -1 : 1)),
            liked_by: wasLiked
              ? comment.liked_by.filter((email) => email !== currentEmail)
              : [...(comment.liked_by || []), currentEmail],
          };
        }
        if (Array.isArray(comment.replies)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id !== commentId) return reply;
              const wasLiked = Array.isArray(reply.liked_by) && currentEmail && reply.liked_by.includes(currentEmail);
              return {
                ...reply,
                likes: Math.max(0, Number(reply.likes || 0) + (wasLiked ? -1 : 1)),
                liked_by: wasLiked
                  ? reply.liked_by.filter((email) => email !== currentEmail)
                  : [...(reply.liked_by || []), currentEmail],
              };
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleStartEdit = (comment) => {
    setReplyingToCommentId(null);
    setReplyText('');
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || '');
  };
  const handleCancelEdit = () => { setEditingCommentId(null); setEditingCommentText(''); };

  const handleSaveEdit = async () => {
    if (!activeCommentItem || !editingCommentId) return;
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    const result = await UserStore.editNewsComment(activeCommentItem.id, editingCommentId, trimmed);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id === editingCommentId) return { ...comment, text: trimmed, edited_at: new Date().toISOString() };
        if (Array.isArray(comment.replies)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === editingCommentId ? { ...reply, text: trimmed, edited_at: new Date().toISOString() } : reply
            ),
          };
        }
        return comment;
      })
    );
    handleCancelEdit();
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.deleteNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    let removedCount = 0;
    setLocalComments((prev) =>
      prev
        .map((comment) => {
          if (comment.id === commentId) {
            removedCount = 1 + (Array.isArray(comment.replies) ? comment.replies.length : 0);
            return null;
          }
          if (Array.isArray(comment.replies)) {
            const nextReplies = comment.replies.filter((reply) => reply.id !== commentId);
            if (nextReplies.length !== comment.replies.length) {
              removedCount += comment.replies.length - nextReplies.length;
              return { ...comment, replies: nextReplies };
            }
          }
          return comment;
        })
        .filter(Boolean)
    );
    if (removedCount > 0) {
      setActiveCommentItem((prev) => prev ? { ...prev, comments: Math.max(0, Number(prev.comments || 0) - removedCount) } : prev);
      updateFeedCommentCount(activeCommentItem.id, -removedCount);
    }
    if (editingCommentId === commentId) handleCancelEdit();
    if (replyingToCommentId === commentId) {
      setReplyingToCommentId(null);
      setReplyText('');
    }
  };

  const handleToggleReplies = useCallback((commentId) => {
    setExpandedReplyThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const handleStartReply = useCallback((commentId) => {
    const parentCommentId = findParentCommentId(localComments, commentId) || commentId;
    if (replyingToCommentId === commentId) {
      setReplyingToCommentId(null);
      setReplyText('');
      return;
    }
    setEditingCommentId(null);
    setEditingCommentText('');
    setReplyingToCommentId(commentId);
    setReplyText('');
    setExpandedReplyThreads((prev) => ({ ...prev, [parentCommentId]: true }));
  }, [findParentCommentId, localComments, replyingToCommentId]);

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyText('');
  };

  const handleSubmitReply = async () => {
    const trimmed = replyText.trim();
    if (!activeCommentItem || !replyingToCommentId || !trimmed) return;
    const result = await UserStore.replyNewsComment(activeCommentItem.id, replyingToCommentId, trimmed);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    const added = result.comment || {};
    const newReply = {
      id: String(added.id || Date.now().toString()),
      text: String(added.text || trimmed),
      author: String(added.author || currentUser?.name || 'User'),
      author_email: String(added.author_email || currentUser?.email || ''),
      date: added.date || 'Now',
      edited_at: null,
      likes: 0,
      liked_by: [],
      parent_comment_id: added.parent_comment_id || replyingToCommentId,
    };
    const parentCommentId = findParentCommentId(localComments, replyingToCommentId) || replyingToCommentId;
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id === replyingToCommentId || comment.id === parentCommentId) {
          return {
            ...comment,
            replies: Array.isArray(comment.replies) ? [newReply, ...comment.replies] : [newReply],
          };
        }
        return comment;
      })
    );
    setExpandedReplyThreads((prev) => ({ ...prev, [parentCommentId]: true }));
    setActiveCommentItem((prev) => prev ? { ...prev, comments: Number(prev.comments || 0) + 1 } : prev);
    updateFeedCommentCount(activeCommentItem.id, 1);
    setReplyingToCommentId(null);
    setReplyText('');
  };

  const handleAddNews = async () => {
    const user = await UserStore.getCurrentUser();
    if (!user) { navigation.replace('Login'); return; }
    const isAdmin = user.role === 'admin';
    const hasSubscription = UserStore.hasActiveSubscription(user);
    if (!isAdmin && !hasSubscription) { showToast('Premium access required to add news.', 'error'); return; }
    if (!isAdmin && hasSubscription && !user.location_complete) {
      showToast('Select your location to activate premium services.', 'error');
      navigation.navigate('StateSelect', { fromPremium: true }); return;
    }
    navigation.navigate('Add News');
  };

  const displayedItems = applyUIFilters(newsData.items.filter((item) => itemMatchesLanguage(item, language)));
  const currentUser = newsData.currentUser;
  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase();
  const currentUserHasBlueTick = Boolean(currentUser && UserStore.hasBlueTick(currentUser));
  const canEditDelete = (item) => {
    if (!currentUser) return false;
    const isAdmin = currentUser.role === 'admin';
    const isOwner = String(item.createdBy || item.created_by || '').trim().toLowerCase() === currentUserEmail;
    return isAdmin || isOwner;
  };

  return (
    <View style={styles.root}>
      {/* Fixed Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FF6600" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{moduleName}</Text>
        <TouchableOpacity onPress={handleAddNews} style={styles.headerAddButton}>
          <Feather name="plus-circle" size={22} color="#FF6600" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Live News</Text>
          <Text style={styles.heroTitle}>Current News Feed Records</Text>
          <Text style={styles.heroSubtitle}>Manage published updates and create a new article from here.</Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.metricPrimary]}>
            <Text style={styles.metricValue}>{displayedItems.length}</Text>
            <Text style={styles.metricLabel}>Articles</Text>
          </View>
          <View style={[styles.metricCard, styles.metricSecondary]}>
            <Text style={styles.metricValue}>{displayedItems.reduce((s, i) => s + (Number(i.views) || 0), 0)}</Text>
            <Text style={styles.metricLabel}>Views</Text>
          </View>
          <View style={[styles.metricCard, styles.metricAccent]}>
            <Text style={styles.metricValue}>{displayedItems.reduce((s, i) => s + (Number(i.shares) || 0), 0)}</Text>
            <Text style={styles.metricLabel}>Shares</Text>
          </View>
        </View>

        {/* Filter Card */}
        <View style={styles.filterCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={15} color="#fda4be" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search news, author..."
                placeholderTextColor="#fda4be"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Feather name="x" size={14} color="#fda4be" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.filterToggleBtn, filterPanelVisible && styles.filterToggleBtnActive]}
              onPress={() => setFilterPanelVisible((p) => !p)}
              activeOpacity={0.8}
            >
              <Feather name="sliders" size={15} color={filterPanelVisible ? '#fff' : '#FF6600'} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {activeFilterCount > 0 && !filterPanelVisible && (
            <View style={styles.activeChipsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filterState !== 'All' && filterState ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterState('All')}>
                    <Text style={styles.activeChipText}>{filterState}</Text>
                    <Feather name="x" size={11} color="#fff" style={styles.chipIcon} />
                  </TouchableOpacity>
                ) : null}
                {filterDistrict.trim() ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterDistrict('')}>
                    <Text style={styles.activeChipText}>{filterDistrict}</Text>
                    <Feather name="x" size={11} color="#fff" style={styles.chipIcon} />
                  </TouchableOpacity>
                ) : null}
                {filterTaluka.trim() ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterTaluka('')}>
                    <Text style={styles.activeChipText}>{filterTaluka}</Text>
                    <Feather name="x" size={11} color="#fff" style={styles.chipIcon} />
                  </TouchableOpacity>
                ) : null}
                {filterReportType !== 'All' && filterReportType ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterReportType('All')}>
                    <Text style={styles.activeChipText}>{filterReportType}</Text>
                    <Feather name="x" size={11} color="#fff" style={styles.chipIcon} />
                  </TouchableOpacity>
                ) : null}
                {filterRoleType !== 'All' && filterRoleType ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterRoleType('All')}>
                    <Text style={styles.activeChipText}>{filterRoleType}</Text>
                    <Feather name="x" size={11} color="#fff" style={styles.chipIcon} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.clearAllChip} onPress={resetFilters}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {filterPanelVisible ? (
            <View style={styles.filterPanel}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>📍  State</Text>
                <FilterDropdown label="Select State" value={filterState} options={stateOptions} onSelect={setFilterState} />
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🏘  District / City</Text>
                <View style={styles.textFilterBox}>
                  <Feather name="search" size={13} color="#fda4be" />
                  <TextInput style={styles.textFilterInput} placeholder="Type district or city..." placeholderTextColor="#fda4be" value={filterDistrict} onChangeText={setFilterDistrict} />
                  {filterDistrict ? <TouchableOpacity onPress={() => setFilterDistrict('')}><Feather name="x" size={13} color="#fda4be" /></TouchableOpacity> : null}
                </View>
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🗂  Taluka</Text>
                <View style={styles.textFilterBox}>
                  <Feather name="search" size={13} color="#fda4be" />
                  <TextInput style={styles.textFilterInput} placeholder="Type taluka..." placeholderTextColor="#fda4be" value={filterTaluka} onChangeText={setFilterTaluka} />
                  {filterTaluka ? <TouchableOpacity onPress={() => setFilterTaluka('')}><Feather name="x" size={13} color="#fda4be" /></TouchableOpacity> : null}
                </View>
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🏷  Report Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsRow}>
                    {REPORT_TYPES.map((rt) => <FilterChip key={rt} label={rt} active={filterReportType === rt} onPress={() => setFilterReportType(rt)} />)}
                  </View>
                </ScrollView>
              </View>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>👤  Author Role</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsRow}>
                    {ROLE_TYPES.map((rt) => <FilterChip key={rt} label={rt} active={filterRoleType === rt} onPress={() => setFilterRoleType(rt)} />)}
                  </View>
                </ScrollView>
              </View>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Feather name="refresh-ccw" size={13} color="#ef4444" />
                  <Text style={styles.resetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {/* News Feed */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>News Feed</Text>
          <Text style={styles.sectionText}>
            Latest reports in one dedicated feed section.
            {activeFilterCount > 0 ? ` • ${displayedItems.length} result${displayedItems.length !== 1 ? 's' : ''} found` : ''}
          </Text>

          {loading ? (
            <Text style={styles.loadingText}>Loading news feed...</Text>
          ) : displayedItems.length ? (
            displayedItems.map((item) => (
              <View key={item.id} style={styles.newsCard}>
                <View style={styles.newsTopRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>

                {(item.state || item.district || item.taluka) ? (
                  <View style={styles.locationTagRow}>
                    {item.state ? <View style={styles.locationTag}><Feather name="map-pin" size={10} color="#FF2D78" /><Text style={styles.locationTagText}>{item.state}</Text></View> : null}
                    {item.district ? <View style={styles.locationTag}><Feather name="home" size={10} color="#FF2D78" /><Text style={styles.locationTagText}>{item.district}</Text></View> : null}
                    {item.taluka ? <View style={styles.locationTag}><Feather name="layers" size={10} color="#FF2D78" /><Text style={styles.locationTagText}>{item.taluka}</Text></View> : null}
                  </View>
                ) : null}

                <View style={styles.authorRow}>
                  <TouchableOpacity style={styles.authorAvatarBtn} onPress={() => openAuthorProfile(item)} activeOpacity={0.8}>
                    <ProfileAvatar uri={item.author_profile_image} size={24} style={styles.authorAvatar} />
                  </TouchableOpacity>
                  <Text style={styles.authorLabel}>By</Text>
                  <Text style={styles.authorName}>{item.author_name || 'RTI News'}</Text>
                  {Boolean(
                    item.author_has_blue_tick ||
                    item.has_blue_tick ||
                    item.authorHasBlueTick ||
                    item.createdByBlueTick ||
                    (currentUserEmail && String(item.createdBy || item.created_by || '').trim().toLowerCase() === currentUserEmail && currentUserHasBlueTick)
                  ) ? (
                    <VerifiedBadge size={18} iconSize={10} style={styles.authorBadge} />
                  ) : null}
                  {item.author_seat_name ? (
                    <>
                      <Text style={styles.authorMetaDot}>•</Text>
                      <Text style={styles.authorSeat} numberOfLines={1}>{item.author_seat_name}</Text>
                    </>
                  ) : null}
                </View>

                <Text style={styles.newsTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.newsSubtitle}>{item.subtitle}</Text> : null}

                {(() => {
                  const fullText = item.description || item.subtitle || 'No description added.';
                  const shortText = fullText.length > 140 ? `${fullText.slice(0, 140)}...` : fullText;
                  const hasDescription = fullText && fullText !== 'No description added.';
                  const isExpanded = !!expandedItems[item.id];
                  return (
                    <View style={styles.newsDescriptionWrap}>
                      <Text style={styles.newsDescription}>{isExpanded ? fullText : shortText}</Text>
                      {hasDescription ? (
                        <TouchableOpacity style={styles.moreBtn} onPress={() => toggleExpanded(item.id)}>
                          <Text style={styles.moreBtnText}>{isExpanded ? 'Less' : 'More'}</Text>
                        </TouchableOpacity>
                      ) : null}
                      {isExpanded ? (
                        <View style={styles.reportDetailsBox}>
                          <Text style={styles.reportDetailsTitle}>Report Details</Text>
                          <Text style={styles.reportDetailLine}>
                            <Text style={styles.reportDetailLabel}>Title: </Text>
                            <Text style={styles.reportDetailValue}>{item.title || 'N/A'}</Text>
                          </Text>
                          {item.subtitle ? (
                            <Text style={styles.reportDetailLine}>
                              <Text style={styles.reportDetailLabel}>Sub Title: </Text>
                              <Text style={styles.reportDetailValue}>{item.subtitle}</Text>
                            </Text>
                          ) : null}
                          <Text style={styles.reportDetailLine}>
                            <Text style={styles.reportDetailLabel}>Description: </Text>
                            <Text style={styles.reportDetailValue}>{fullText}</Text>
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })()}

                {/* Edit and Delete Buttons */}
                {canEditDelete(item) && (
                  <View style={styles.editDeleteRow}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                      <Feather name="edit-2" size={13} color="#FF6600" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                      <Feather name="trash-2" size={13} color="#FF6600" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Images */}
                {item.images?.length ? (
                  <View style={styles.mediaPreviewWrap}>
                    <Text style={styles.mediaLabel}>Upload Image</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {item.images.map((img, idx) => (
                        <ResolvedImage
                          key={`${item.id}-img-${idx}`}
                          uri={img}
                          style={styles.mediaThumb}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : null}

                {item.video ? (
                  <View style={styles.videoPreviewWrap}>
                    <VideoPreview uri={item.video} style={styles.videoPreview} contentFit="cover" />
                  </View>
                ) : (
                  <View style={styles.mediaInfoBox}>
                    <Text style={styles.mediaLabel}>Upload Video</Text>
                    <Text style={styles.mediaText}>No video uploaded</Text>
                  </View>
                )}

                {item.file ? (
                  <View style={styles.fileInfoBox}>
                    <Text style={styles.mediaLabel}>Upload File</Text>
                    <View style={styles.fileRow}>
                      <Feather name="file-text" size={14} color="#FF6600" />
                      <Text style={styles.fileName} numberOfLines={1}>{item.file.name || 'Attachment'}</Text>
                      <TouchableOpacity style={styles.fileOpenBtn} onPress={() => handleOpenFile(item.file)}>
                        <Feather name="external-link" size={13} color="#FF6600" />
                        <Text style={styles.fileOpenText}>Open</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <View style={styles.mediaInfoBox}>
                  <Text style={styles.mediaLabel}>Media Summary</Text>
                  <Text style={styles.mediaText}>{item.media}</Text>
                </View>

                <View style={styles.actionRow}>
                  {(() => {
                    const liked = newsData.currentUser?.email && Array.isArray(item.liked_by) && item.liked_by.includes(newsData.currentUser.email);
                    return (
                      <TouchableOpacity style={[styles.actionIconButton, liked && styles.actionIconButtonActive]} onPress={() => handleLike(item)}>
                        <Feather name="heart" size={15} color={liked ? '#ffffff' : '#FF6600'} />
                        <Text style={[styles.actionIconText, liked && styles.actionIconTextActive]}>{item.likes || 0}</Text>
                      </TouchableOpacity>
                    );
                  })()}
                  <TouchableOpacity style={styles.actionIconButton} onPress={() => openComments(item)}>
                    <Feather name="message-circle" size={15} color="#FF6600" />
                    <Text style={styles.actionIconText}>{item.comments || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconButton} onPress={() => handleShare(item)}>
                    <Feather name="share-2" size={15} color="#FF6600" />
                    <Text style={styles.actionIconText}>{item.shares}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionIconButton, item.bookmarked && styles.actionIconButtonActive]} onPress={() => handleBookmark(item)}>
                    <Feather name="bookmark" size={15} color={item.bookmarked ? '#ffffff' : '#FF6600'} />
                    <Text style={[styles.actionIconText, item.bookmarked && styles.actionIconTextActive]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={32} color="#fda4be" />
              <Text style={styles.emptyText}>{activeFilterCount > 0 ? 'No news matches your filters.' : 'No news records found.'}</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
                  <Text style={styles.emptyResetText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit News Modal */}
      <EditNewsModal
        visible={editModalVisible}
        newsItem={editingNewsItem}
        onClose={() => {
          setEditModalVisible(false);
          setEditingNewsItem(null);
        }}
        onUpdate={loadNewsFeed}
        showToast={showToast}
      />

      {/* Comments Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCommentModalVisible(false);
          setLocalComments([]);
          setReplyingToCommentId(null);
          setReplyText('');
          setExpandedReplyThreads({});
        }}
      >
        <KeyboardAvoidingView
          style={styles.commentKeyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
        <View style={styles.commentOverlay}>
          <View style={styles.commentSheet}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>Comments</Text>
              <TouchableOpacity onPress={() => {
                setCommentModalVisible(false);
                setLocalComments([]);
                setReplyingToCommentId(null);
                setReplyText('');
                setExpandedReplyThreads({});
              }}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {localComments.length ? (
                localComments.map((c) => (
                  <FeedCommentItem
                    key={c.id}
                    comment={c}
                    currentUser={newsData.currentUser}
                    editingCommentId={editingCommentId}
                    editingCommentText={editingCommentText}
                    onEditingCommentTextChange={setEditingCommentText}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onDeleteComment={handleDeleteComment}
                    onLikeComment={handleLikeComment}
                    replyingToCommentId={replyingToCommentId}
                    replyText={replyText}
                    onReplyTextChange={setReplyText}
                    onStartReply={handleStartReply}
                    onCancelReply={handleCancelReply}
                    onSubmitReply={handleSubmitReply}
                    expandedReplyThreads={expandedReplyThreads}
                    onToggleReplies={handleToggleReplies}
                  />
                ))
              ) : (
                <Text style={styles.commentEmptyText}>No comments yet.</Text>
              )}
            </ScrollView>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#fda4be"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.commentSendBtn} onPress={handleAddComment}>
                <Feather name="send" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
