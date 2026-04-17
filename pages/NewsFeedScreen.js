import React, { useCallback, useState } from 'react';
import { Image, Linking, Modal, Platform, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import VideoPreview from '../components/VideoPreview';
import PremiumBadge from '../components/PremiumBadge';
import { useToast } from '../components/ui/ToastProvider';
import styles from '../styles/NewsFeedStyles';
import { UserStore } from '../store/UserStore';
import { INDIAN_STATES } from './locationData';

export default function NewsFeedScreen({ navigation }) {
  const { showToast } = useToast();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeCommentItem, setActiveCommentItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [newsData, setNewsData] = useState({
    currentUser: null,
    items: [],
    totalViews: 0,
    totalShares: 0,
  });
  const moduleName = 'News Feed';

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

  const syncFeed = useCallback(async (focusItemId = null) => {
    setLoading(true);
    const data = await UserStore.getNewsFeedSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return null;
    }

    const filteredItems = applyLocationFilter(data.items, data.currentUser);
    const totalViews = filteredItems.reduce((sum, item) => sum + (Number(item.views) || 0), 0);
    const totalShares = filteredItems.reduce((sum, item) => sum + (Number(item.shares) || 0), 0);
    const payload = { ...data, items: filteredItems, totalViews, totalShares };
    setNewsData(payload);
    if (focusItemId) {
      const target = filteredItems.find((item) => item.id === focusItemId);
      setActiveCommentItem(target || null);
    }
    return payload;
  }, [navigation]);

  const loadNewsFeed = useCallback(async () => {
    await syncFeed();
  }, [syncFeed]);

  useFocusEffect(
    useCallback(() => {
      loadNewsFeed();
    }, [loadNewsFeed])
  );

  const handleShare = async (item) => {
    setSuccessMessage('');
    const shareText = `${item.title}\nCategory: ${item.category}\nState: ${item.state}\nDate: ${item.date}\n${item.subtitle || item.description}`;
    const canShareMedia = Platform.OS !== 'web' && (await Sharing.isAvailableAsync());

    const ensureLocalFile = async (uri, fallbackExt = 'bin') => {
      if (!uri) return null;
      if (uri.startsWith('file://')) return uri;
      if (uri.startsWith('content://')) return uri;
      if (uri.startsWith('data:')) {
        const match = uri.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return null;
        const mime = match[1] || '';
        const base64 = match[2] || '';
        const ext = mime.includes('/') ? mime.split('/')[1] : fallbackExt;
        const target = `${FileSystem.cacheDirectory}share-${Date.now()}.${ext}`;
        await FileSystem.writeAsStringAsync(target, base64, { encoding: FileSystem.EncodingType.Base64 });
        return target;
      }
      return uri;
    };

    const mediaCandidate = item.video || (item.images?.length ? item.images[0] : null) || item.file?.uri;

    try {
      if (canShareMedia && mediaCandidate) {
        const uri = await ensureLocalFile(mediaCandidate, item.video ? 'mp4' : 'jpg');
        if (uri) {
          await Sharing.shareAsync(uri, { dialogTitle: item.title || 'Share media' });
        } else {
          await Share.share({ title: item.title, message: shareText });
        }
      } else {
        await Share.share({ title: item.title, message: shareText });
      }
    } catch {
      showToast('Share failed.', 'error');
      return;
    }

    const result = await UserStore.updateNewsFeedItem(item.id, 'share');
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }

    setSuccessMessage('News share count updated.');
    loadNewsFeed();
  };


  const handleOpenFile = async (file) => {
    if (!file?.uri) return;
    try {
      await Linking.openURL(file.uri);
    } catch {
      showToast('Unable to open file.', 'error');
    }
  };

  const handleLike = async (item) => {
    setSuccessMessage('');
    const result = await UserStore.updateNewsFeedItem(item.id, 'like');
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setSuccessMessage(result.liked ? 'You liked this post.' : 'Like removed.');
    loadNewsFeed();
  };

  const openComments = (item) => {
    setActiveCommentItem(item);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentModalVisible(true);
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleAddComment = async () => {
    if (!activeCommentItem) return;
    const result = await UserStore.addNewsComment(activeCommentItem.id, commentText);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setSuccessMessage('Comment added.');
    setCommentText('');
    await syncFeed(activeCommentItem.id);
  };

  const handleLikeComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.likeNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setSuccessMessage(result.liked ? 'You liked this comment.' : 'Comment like removed.');
    await syncFeed(activeCommentItem.id);
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || '');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async () => {
    if (!activeCommentItem || !editingCommentId) return;
    const result = await UserStore.editNewsComment(activeCommentItem.id, editingCommentId, editingCommentText);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setSuccessMessage('Comment updated.');
    handleCancelEdit();
    await syncFeed(activeCommentItem.id);
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.deleteNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setSuccessMessage('Comment deleted.');
    if (editingCommentId === commentId) handleCancelEdit();
    await syncFeed(activeCommentItem.id);
  };

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const handleAddNews = async () => {
    const user = await UserStore.getCurrentUser();
    if (!user) {
      navigation.replace('Login');
      return;
    }
    const isAdmin = user.role === 'admin';
    const hasSubscription = UserStore.hasActiveSubscription(user);
    if (!isAdmin && !hasSubscription) {
      showToast('Premium access required to add news.', 'error');
      return;
    }
    if (!isAdmin && hasSubscription && !user.location_complete) {
      showToast('Select your location to activate premium services.', 'error');
      navigation.navigate('StateSelect', { fromPremium: true });
      return;
    }
    navigation.navigate('Add News');
  };

  return (
    <View style={styles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Live News</Text>
          <Text style={styles.heroTitle}>Current News Feed Records</Text>
          <Text style={styles.heroSubtitle}>Manage published updates and create a new article from here.</Text>

          <TouchableOpacity
            style={styles.addNewsButton}
            onPress={handleAddNews}
          >
            <Feather name="plus-circle" size={16} color="#ffffff" />
            <Text style={styles.addNewsButtonText}>Add News</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.metricPrimary]}>
            <Text style={styles.metricValue}>{newsData.items.length}</Text>
            <Text style={styles.metricLabel}>Articles</Text>
          </View>
          <View style={[styles.metricCard, styles.metricSecondary]}>
            <Text style={styles.metricValue}>{newsData.totalViews}</Text>
            <Text style={styles.metricLabel}>Views</Text>
          </View>
          <View style={[styles.metricCard, styles.metricAccent]}>
            <Text style={styles.metricValue}>{newsData.totalShares}</Text>
            <Text style={styles.metricLabel}>Shares</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>News Feed</Text>
          <Text style={styles.sectionText}>Latest reports in one dedicated feed section.</Text>

          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          {loading ? (
            <Text style={styles.loadingText}>Loading news feed...</Text>
          ) : newsData.items.length ? (
            newsData.items.map((item) => (
              <View key={item.id} style={styles.newsCard}>
                <View style={styles.newsTopRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>

                <View style={styles.authorRow}>
                  <Text style={styles.authorLabel}>By</Text>
                  <Text style={styles.authorName}>{item.author_name || 'RTI News'}</Text>
                  {(item.author_is_subscriber || item.author_is_premium) ? (
                    <PremiumBadge size={14} style={styles.authorBadge} />
                  ) : null}
                </View>

                <Text style={styles.newsTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.newsSubtitle}>{item.subtitle}</Text>
                ) : null}
                {(() => {
                  const fullText = item.description || item.subtitle || 'No description added.';
                  const shortText = fullText.length > 140 ? `${fullText.slice(0, 140)}...` : fullText;
                  const hasDescription = fullText && fullText !== 'No description added.';
                  const isExpanded = !!expandedItems[item.id];
                  return (
                    <View style={styles.newsDescriptionWrap}>
                      <Text style={styles.newsDescription}>
                        {isExpanded ? fullText : shortText}
                      </Text>
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

                {item.images?.length ? (
                  <View style={styles.mediaPreviewWrap}>
                    <Text style={styles.mediaLabel}>Upload Image</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {item.images.map((img, idx) => (
                        <Image key={`${item.id}-img-${idx}`} source={{ uri: img }} style={styles.mediaThumb} />
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
                    <Text style={styles.mediaText}>
                      No video uploaded
                    </Text>
                  </View>
                )}

                {item.file ? (
                  <View style={styles.fileInfoBox}>
                    <Text style={styles.mediaLabel}>Upload File</Text>
                    <View style={styles.fileRow}>
                      <Feather name="file-text" size={14} color="#0f766e" />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {item.file.name || 'Attachment'}
                      </Text>
                      <TouchableOpacity style={styles.fileOpenBtn} onPress={() => handleOpenFile(item.file)}>
                        <Feather name="external-link" size={14} color="#0f766e" />
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
                    const liked = newsData.currentUser?.email
                      && Array.isArray(item.liked_by)
                      && item.liked_by.includes(newsData.currentUser.email);
                    return (
                      <TouchableOpacity
                        style={[styles.actionIconButton, liked && styles.actionIconButtonActive]}
                        onPress={() => handleLike(item)}
                      >
                        <Feather name="heart" size={16} color={liked ? '#ef4444' : '#e11d48'} />
                        <Text style={[styles.actionIconText, liked && styles.actionIconTextActive]}>
                          {item.likes || 0}
                        </Text>
                      </TouchableOpacity>
                    );
                  })()}
                  <TouchableOpacity style={styles.actionIconButton} onPress={() => openComments(item)}>
                    <Feather name="message-circle" size={16} color="#0ea5e9" />
                    <Text style={styles.actionIconText}>{item.comments || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconButton} onPress={() => handleShare(item)}>
                    <Feather name="share-2" size={16} color="#2563eb" />
                    <Text style={styles.actionIconText}>{item.shares}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No news records found.</Text>
          )}
        </View>
      </ScrollView>

      <Footer />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />

      {/* Comments Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.commentOverlay}>
          <View style={styles.commentSheet}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.commentList}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              {activeCommentItem?.comments_list?.length ? (
                activeCommentItem.comments_list.map((c) => {
                  const currentEmail = newsData.currentUser?.email || '';
                  const ownerMatch = (c.author_email && currentEmail && c.author_email === currentEmail)
                    || (!c.author_email && (c.author === currentEmail || c.author === newsData.currentUser?.name));
                  const liked = currentEmail && Array.isArray(c.liked_by) && c.liked_by.includes(currentEmail);
                  return (
                  <View key={c.id} style={styles.commentItem}>
                    <View style={styles.commentTopRow}>
                      <Text style={styles.commentAuthor}>{c.author || 'User'}</Text>
                      <Text style={styles.commentDate}>
                        {c.date || ''}{c.edited_at ? ' • Edited' : ''}
                      </Text>
                    </View>
                    {editingCommentId === c.id ? (
                      <TextInput
                        style={styles.commentEditInput}
                        value={editingCommentText}
                        onChangeText={setEditingCommentText}
                        multiline
                      />
                    ) : (
                      <Text style={styles.commentText}>{c.text}</Text>
                    )}

                    <View style={styles.commentActionRow}>
                      <TouchableOpacity
                        style={[styles.commentActionBtn, liked && styles.commentActionBtnActive]}
                        onPress={() => handleLikeComment(c.id)}
                      >
                        <Feather name="heart" size={13} color={liked ? '#ef4444' : '#e11d48'} />
                        <Text style={[styles.commentActionText, liked && styles.commentActionTextActive]}>
                          {liked ? 'Liked' : 'Like'}{c.likes ? ` (${c.likes})` : ''}
                        </Text>
                      </TouchableOpacity>

                      {ownerMatch ? (
                        editingCommentId === c.id ? (
                          <>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={handleSaveEdit}>
                              <Feather name="check" size={13} color="#16a34a" />
                              <Text style={styles.commentMiniBtnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={handleCancelEdit}>
                              <Feather name="x" size={13} color="#64748b" />
                              <Text style={styles.commentMiniBtnText}>Cancel</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleStartEdit(c)}>
                              <Feather name="edit-2" size={13} color="#2563eb" />
                              <Text style={styles.commentMiniBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentMiniBtn} onPress={() => handleDeleteComment(c.id)}>
                              <Feather name="trash-2" size={13} color="#ef4444" />
                              <Text style={[styles.commentMiniBtnText, { color: '#ef4444' }]}>Delete</Text>
                            </TouchableOpacity>
                          </>
                        )
                      ) : null}
                    </View>
                  </View>
                );
              })
              ) : (
                <Text style={styles.commentEmptyText}>No comments yet.</Text>
              )}
            </ScrollView>

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#94a3b8"
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
      </Modal>

    </View>
  );
}

