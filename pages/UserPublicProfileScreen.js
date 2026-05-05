import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../components/ui/ToastProvider';
import PremiumBadge from '../components/PremiumBadge';
import VideoPreview from '../components/VideoPreview';
import { UserStore } from '../store/UserStore';
import styles from '../styles/UserPublicProfileStyles';

const DEFAULT_AVATAR = require('../assets/images/icon.png');

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

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const user = resolvedEmail ? await UserStore.getUser(resolvedEmail) : null;
      if (!active) return;
      setProfile(user || null);
      const fromProfile = Array.isArray(user?.news) ? user.news : [];
      if (fromProfile.length) {
        setPosts(fromProfile);
      } else {
        const summary = resolvedEmail ? await UserStore.getNewsFeedSummary() : null;
        const fromFeed = Array.isArray(summary?.items)
          ? summary.items.filter((it) => String(it?.createdBy || '').trim().toLowerCase() === resolvedEmail)
          : [];
        setPosts(fromFeed);
      }
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
  const hasSubscription = profile ? UserStore.hasActiveSubscription(profile) : Boolean(display?.author_is_subscriber || display?.author_is_premium);
  const isVerified = Boolean(hasSubscription || ['reporter', 'editor', 'admin'].includes(roleId));

  const sortedPosts = useMemo(() => {
    const src = Array.isArray(posts) ? posts : [];
    const sortValue = (it) => {
      const createdAt = new Date(it?.createdAt || it?.date || 0).getTime();
      const idValue = Number(String(it?.id || '').replace(/\D/g, '')) || 0;
      return Number.isFinite(createdAt) && createdAt > 0 ? createdAt + idValue : idValue;
    };
    return [...src].sort((a, b) => sortValue(b) - sortValue(a));
  }, [posts]);

  const openPost = (post) => {
    if (!post) return;
    navigation.navigate('NewsDetails', { article: post });
  };

  const handleShareProfile = async () => {
    const parts = [
      name ? `Name: ${name}` : '',
      resolvedEmail ? `Email: ${resolvedEmail}` : '',
      seatName || seatId ? `Seat: ${seatName || seatId}` : '',
      roleLabel ? `Role: ${roleLabel}` : '',
    ].filter(Boolean);
    const message = `${parts.join('\n')}\n\nShared from RTI News app.`;
    try { await Share.share({ title: 'RTI News Profile', message }); }
    catch { showToast('Unable to share profile.', 'error'); }
  };

  const handleSubscribe = () => {
    navigation.navigate('Subscription Plans');
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={handleShareProfile} activeOpacity={0.8}>
          <Feather name="more-vertical" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrap}>
              <Image source={photoUri ? { uri: photoUri } : DEFAULT_AVATAR} style={styles.avatar} />
              {isVerified ? (
                <View style={styles.verifiedOnAvatar}>
                  <Feather name="check" size={12} color="#ffffff" />
                </View>
              ) : null}
            </View>

            <View style={styles.profileMain}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={2}>{name}</Text>
                {isVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={12} color="#ffffff" />
                  </View>
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
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareProfile} activeOpacity={0.85}>
              <Feather name="share-2" size={16} color="#0f172a" />
              <Text style={styles.shareBtnText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('posts')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'activity' && styles.tabBtnActive]}
            onPress={() => setActiveTab('activity')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>Activity</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'activity' ? (
          <View style={styles.activityCard}>
            <Text style={styles.mutedText}>No activity yet.</Text>
          </View>
        ) : sortedPosts.length ? (
          <View style={{ gap: 12 }}>
            {sortedPosts.map((p) => {
              const postTitle = p.title || 'Untitled';
              const postLocation = [p.taluka, p.district, p.state].filter(Boolean).join(', ');
              const postThumb = Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean)[0] : null;
              const showPending = p.status && String(p.status).toLowerCase() !== 'approved';
              return (
                <TouchableOpacity
                  key={p.id || `${postTitle}-${p.date}`}
                  style={styles.feedCard}
                  onPress={() => openPost(p)}
                  activeOpacity={0.9}
                >
                  <View style={styles.feedHeader}>
                    <Image source={photoUri ? { uri: photoUri } : DEFAULT_AVATAR} style={styles.feedAvatar} />
                    <View style={styles.feedHeaderMain}>
                      <View style={styles.feedNameRow}>
                        {rolePillText ? (
                          <View style={styles.feedRoleMiniPill}>
                            <Text style={styles.feedRoleMiniText}>{rolePillText}</Text>
                          </View>
                        ) : null}
                        <Text style={styles.feedName} numberOfLines={1}>{name}</Text>
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

                  <Text style={styles.feedTitle} numberOfLines={3}>{stripHtml(postTitle)}</Text>
                  {postThumb ? <Image source={{ uri: postThumb }} style={styles.feedImage} /> : null}
                  {p.video && !postThumb ? (
                    <View style={styles.feedVideoBox}>
                      <VideoPreview uri={p.video} style={styles.feedVideo} contentFit="cover" />
                    </View>
                  ) : null}
                  {showPending ? (
                    <View style={styles.feedStatusPill}>
                      <Text style={styles.feedStatusText}>{String(p.status).toUpperCase()}</Text>
                    </View>
                  ) : null}

                  <View style={styles.feedActions}>
                    <View style={styles.feedActionItem}>
                      <Feather name="heart" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.likes || 0)}</Text>
                    </View>
                    <View style={styles.feedActionItem}>
                      <Feather name="message-circle" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.comments || 0)}</Text>
                    </View>
                    <View style={styles.feedActionItem}>
                      <Feather name="share-2" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.shares || 0)}</Text>
                    </View>
                    <View style={[styles.feedActionItem, { marginLeft: 'auto' }]}>
                      <Feather name="eye" size={16} color="#0f172a" />
                      <Text style={styles.feedActionText}>{Number(p.views || 0)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
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