import React, { useCallback, useState } from 'react';
import {
  Image, Linking, Modal, Platform, ScrollView, Share,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
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

// ─── Filter constants ──────────────────────────────────────────────
const REPORT_TYPES = [
  'All', 'Breaking News', 'Investigation', 'Opinion',
  'Feature', 'Local News', 'National', 'International',
  'Sports', 'Business', 'Technology', 'Health', 'Politics',
];

const ROLE_TYPES = [
  'All', 'Subscriber', 'Premium', 'Reporter', 'Editor',
];

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
          color={isActive ? '#fff' : '#64748b'}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>
                  {opt}
                </Text>
                {value === opt && <Feather name="check" size={12} color="#0f766e" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────
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
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);

  // Filter states
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

  const syncFeed = useCallback(async (focusItemId = null) => {
    setLoading(true);
    const data = await UserStore.getNewsFeedSummary();
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
    }
    return payload;
  }, [navigation]);

  const loadNewsFeed = useCallback(async () => { await syncFeed(); }, [syncFeed]);

  useFocusEffect(useCallback(() => { loadNewsFeed(); }, [loadNewsFeed]));

  const handleShare = async (item) => {
    setSuccessMessage('');
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
    setSuccessMessage('News share count updated.');
    loadNewsFeed();
  };

  const handleOpenFile = async (file) => {
    if (!file?.uri) return;
    try { await Linking.openURL(file.uri); }
    catch { showToast('Unable to open file.', 'error'); }
  };

  const handleLike = async (item) => {
    setSuccessMessage('');
    const result = await UserStore.updateNewsFeedItem(item.id, 'like');
    if (!result.ok) { showToast(result.message, 'error'); return; }
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

  const toggleExpanded = (itemId) => setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  const handleAddComment = async () => {
    if (!activeCommentItem) return;
    const result = await UserStore.addNewsComment(activeCommentItem.id, commentText);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    setSuccessMessage('Comment added.');
    setCommentText('');
    await syncFeed(activeCommentItem.id);
  };

  const handleLikeComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.likeNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    setSuccessMessage(result.liked ? 'You liked this comment.' : 'Comment like removed.');
    await syncFeed(activeCommentItem.id);
  };

  const handleStartEdit = (comment) => { setEditingCommentId(comment.id); setEditingCommentText(comment.text || ''); };
  const handleCancelEdit = () => { setEditingCommentId(null); setEditingCommentText(''); };

  const handleSaveEdit = async () => {
    if (!activeCommentItem || !editingCommentId) return;
    const result = await UserStore.editNewsComment(activeCommentItem.id, editingCommentId, editingCommentText);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    setSuccessMessage('Comment updated.');
    handleCancelEdit();
    await syncFeed(activeCommentItem.id);
  };

  const handleDeleteComment = async (commentId) => {
    if (!activeCommentItem) return;
    const result = await UserStore.deleteNewsComment(activeCommentItem.id, commentId);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    setSuccessMessage('Comment deleted.');
    if (editingCommentId === commentId) handleCancelEdit();
    await syncFeed(activeCommentItem.id);
  };

  const handleLogout = async () => { await UserStore.clearCurrentUser(); navigation.replace('Login'); };

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

  const displayedItems = applyUIFilters(newsData.items);

  return (
    <View style={styles.root}>
      <Header title={moduleName} onMenuPress={() => setSidebarVisible(true)} onLogout={handleLogout} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Live News</Text>
          <Text style={styles.heroTitle}>Current News Feed Records</Text>
          <Text style={styles.heroSubtitle}>Manage published updates and create a new article from here.</Text>
          <TouchableOpacity style={styles.addNewsButton} onPress={handleAddNews}>
            <Feather name="plus-circle" size={16} color="#ffffff" />
            <Text style={styles.addNewsButtonText}>Add News</Text>
          </TouchableOpacity>
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

        {/* ── Filter Card ─────────────────────────────────────── */}
        <View style={styles.filterCard}>

          {/* Search + Toggle */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={15} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search news, author..."
                placeholderTextColor="#94a3b8"
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Feather name="x" size={14} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.filterToggleBtn, filterPanelVisible && styles.filterToggleBtnActive]}
              onPress={() => setFilterPanelVisible((p) => !p)}
              activeOpacity={0.8}
            >
              <Feather name="sliders" size={15} color={filterPanelVisible ? '#fff' : '#0f766e'} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Active chips (collapsed summary) */}
          {activeFilterCount > 0 && !filterPanelVisible && (
            <View style={styles.activeChipsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filterState !== 'All' && filterState ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterState('All')}>
                    <Text style={styles.activeChipText}>{filterState}</Text>
                    <Feather name="x" size={11} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : null}
                {filterDistrict.trim() ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterDistrict('')}>
                    <Text style={styles.activeChipText}>{filterDistrict}</Text>
                    <Feather name="x" size={11} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : null}
                {filterTaluka.trim() ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterTaluka('')}>
                    <Text style={styles.activeChipText}>{filterTaluka}</Text>
                    <Feather name="x" size={11} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : null}
                {filterReportType !== 'All' && filterReportType ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterReportType('All')}>
                    <Text style={styles.activeChipText}>{filterReportType}</Text>
                    <Feather name="x" size={11} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : null}
                {filterRoleType !== 'All' && filterRoleType ? (
                  <TouchableOpacity style={styles.activeChip} onPress={() => setFilterRoleType('All')}>
                    <Text style={styles.activeChipText}>{filterRoleType}</Text>
                    <Feather name="x" size={11} color="#fff" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.clearAllChip} onPress={resetFilters}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Expanded filter panel */}
          {filterPanelVisible && (
            <View style={styles.filterPanel}>

              {/* State */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>📍  State</Text>
                <FilterDropdown
                  label="Select State"
                  value={filterState}
                  options={stateOptions}
                  onSelect={setFilterState}
                />
              </View>

              {/* District / City */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🏘  District / City</Text>
                <View style={styles.textFilterBox}>
                  <Feather name="search" size={13} color="#94a3b8" />
                  <TextInput
                    style={styles.textFilterInput}
                    placeholder="Type district or city..."
                    placeholderTextColor="#94a3b8"
                    value={filterDistrict}
                    onChangeText={setFilterDistrict}
                  />
                  {filterDistrict ? (
                    <TouchableOpacity onPress={() => setFilterDistrict('')}>
                      <Feather name="x" size={13} color="#94a3b8" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Taluka */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🗂  Taluka</Text>
                <View style={styles.textFilterBox}>
                  <Feather name="search" size={13} color="#94a3b8" />
                  <TextInput
                    style={styles.textFilterInput}
                    placeholder="Type taluka..."
                    placeholderTextColor="#94a3b8"
                    value={filterTaluka}
                    onChangeText={setFilterTaluka}
                  />
                  {filterTaluka ? (
                    <TouchableOpacity onPress={() => setFilterTaluka('')}>
                      <Feather name="x" size={13} color="#94a3b8" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Report Type */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>🏷  Report Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsRow}>
                    {REPORT_TYPES.map((rt) => (
                      <FilterChip
                        key={rt}
                        label={rt}
                        active={filterReportType === rt}
                        onPress={() => setFilterReportType(rt)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Role Type */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>👤  Author Role</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsRow}>
                    {ROLE_TYPES.map((rt) => (
                      <FilterChip
                        key={rt}
                        label={rt}
                        active={filterRoleType === rt}
                        onPress={() => setFilterRoleType(rt)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Feather name="refresh-ccw" size={13} color="#ef4444" />
                  <Text style={styles.resetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {/* ── End Filter Card ─────────────────────────────────── */}

        {/* News Feed */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>News Feed</Text>
          <Text style={styles.sectionText}>
            Latest reports in one dedicated feed section.
            {activeFilterCount > 0
              ? ` • ${displayedItems.length} result${displayedItems.length !== 1 ? 's' : ''} found`
              : ''}
          </Text>

          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

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

                {/* Location tags */}
                {(item.state || item.district || item.taluka) ? (
                  <View style={styles.locationTagRow}>
                    {item.state ? (
                      <View style={styles.locationTag}>
                        <Feather name="map-pin" size={10} color="#0f766e" />
                        <Text style={styles.locationTagText}>{item.state}</Text>
                      </View>
                    ) : null}
                    {item.district ? (
                      <View style={styles.locationTag}>
                        <Feather name="home" size={10} color="#0f766e" />
                        <Text style={styles.locationTagText}>{item.district}</Text>
                      </View>
                    ) : null}
                    {item.taluka ? (
                      <View style={styles.locationTag}>
                        <Feather name="layers" size={10} color="#0f766e" />
                        <Text style={styles.locationTagText}>{item.taluka}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.authorRow}>
                  <Text style={styles.authorLabel}>By</Text>
                  <Text style={styles.authorName}>{item.author_name || 'RTI News'}</Text>
                  {(item.author_is_subscriber || item.author_is_premium) ? (
                    <PremiumBadge size={14} style={styles.authorBadge} />
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
                    <Text style={styles.mediaText}>No video uploaded</Text>
                  </View>
                )}

                {item.file ? (
                  <View style={styles.fileInfoBox}>
                    <Text style={styles.mediaLabel}>Upload File</Text>
                    <View style={styles.fileRow}>
                      <Feather name="file-text" size={14} color="#0f766e" />
                      <Text style={styles.fileName} numberOfLines={1}>{item.file.name || 'Attachment'}</Text>
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
            <View style={styles.emptyState}>
              <Feather name="inbox" size={32} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {activeFilterCount > 0 ? 'No news matches your filters.' : 'No news records found.'}
              </Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
                  <Text style={styles.emptyResetText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Footer />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} activeItem={moduleName} />

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
            <ScrollView style={styles.commentList} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
              {activeCommentItem?.comments_list?.length ? (
                activeCommentItem.comments_list.map((c) => {
                  const currentEmail = newsData.currentUser?.email || '';
                  const ownerMatch =
                    (c.author_email && currentEmail && c.author_email === currentEmail)
                    || (!c.author_email && (c.author === currentEmail || c.author === newsData.currentUser?.name));
                  const liked = currentEmail && Array.isArray(c.liked_by) && c.liked_by.includes(currentEmail);
                  return (
                    <View key={c.id} style={styles.commentItem}>
                      <View style={styles.commentTopRow}>
                        <Text style={styles.commentAuthor}>{c.author || 'User'}</Text>
                        <Text style={styles.commentDate}>{c.date || ''}{c.edited_at ? ' • Edited' : ''}</Text>
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
